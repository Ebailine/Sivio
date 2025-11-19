/**
 * AI-Powered Contact Search API
 * Uses Claude AI with Apify + Apollo for contact discovery
 *
 * GET: Fetch all contacts for the authenticated user
 * POST: Find new contacts for a job posting
 */

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { contactReasoner } from '@/lib/services/contact-reasoner'
import { jobAnalyzer } from '@/lib/services/job-analyzer'
import { companyResearcher } from '@/lib/services/company-researcher'
import { linkedInContactFinder } from '@/lib/services/linkedin-contact-finder'
import { creditTracker } from '@/lib/services/credit-tracker'
import { emailPatternGenerator } from '@/lib/services/email-pattern-generator'

// GET /api/contacts/search - Fetch all contacts for the user
export async function GET(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Get user from Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Fetch all contacts for this user
    const { data: contacts, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch contacts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch contacts' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      contacts: contacts || []
    })

  } catch (error: any) {
    console.error('Get contacts error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

const CREDIT_COST_PER_CONTACT = 1
const CREDIT_COST_PER_EMAIL_VALIDATION = 1

// In-memory cache for job analysis and company research
// Saves ~5-7 seconds on repeat searches within 24 hours
interface CachedData {
  jobAnalysis: any
  companyData: any
  timestamp: number
}

const analysisCache = new Map<string, CachedData>()
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

function getCachedAnalysis(jobUrl: string): CachedData | null {
  const cached = analysisCache.get(jobUrl)
  if (!cached) return null

  // Check if cache is still valid (within 24 hours)
  if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
    analysisCache.delete(jobUrl)
    return null
  }

  return cached
}

function setCachedAnalysis(jobUrl: string, jobAnalysis: any, companyData: any) {
  analysisCache.set(jobUrl, {
    jobAnalysis,
    companyData,
    timestamp: Date.now(),
  })

  // Cleanup old cache entries (keep cache size manageable)
  if (analysisCache.size > 100) {
    const oldestKey = analysisCache.keys().next().value
    if (oldestKey) {
      analysisCache.delete(oldestKey)
    }
  }
}

export async function POST(request: Request) {
  const startTime = Date.now()
  const timings: Record<string, number> = {}

  const measureStep = (stepName: string, startTime: number) => {
    const duration = Date.now() - startTime
    timings[stepName] = duration
    console.log(`⏱️  ${stepName}: ${duration}ms`)
    return duration
  }

  console.log('=== AI-Powered Contact Search Started ===')

  try {
    const stepStart = Date.now()
    const { userId } = await auth()
    measureStep('Authentication', stepStart)
    if (!userId) {
      console.error('No user ID - unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Request body:', {
      company: body.company,
      jobTitle: body.jobTitle,
      jobType: body.jobType,
      hasDescription: !!body.jobDescription,
      bypassCache: body.bypassCache,
    })

    const { company, domain, jobId, jobTitle, jobType, jobDescription, location, bypassCache } = body

    if (!company) {
      return NextResponse.json(
        { error: 'Company name required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, credits, email')
      .eq('clerk_id', userId)
      .single()

    if (userError || !user) {
      console.error('User not found in database:', userError)
      return NextResponse.json(
        { error: 'User not found in database. Please try signing out and back in.' },
        { status: 404 }
      )
    }

    // Note: We'll check credits after finding contacts, charging per contact found

    // STEP 0: MANDATORY - Analyze full job posting URL
    console.log('=== Step 0: Fetching Full Job Details ===')
    let jobAnalysis = null
    let companyData = null
    let fullJobUrl = null

    // First, get the job from database
    if (jobId) {
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single()

      if (jobError || !job) {
        console.error('Job not found in database:', jobError)
        return NextResponse.json(
          { error: 'Job not found. Please refresh and try again.' },
          { status: 404 }
        )
      }

      fullJobUrl = job.url

      if (!fullJobUrl) {
        console.error('⚠️  Job has no URL - cannot fetch full details')
        return NextResponse.json(
          {
            error: 'Job posting URL missing',
            message: 'This job does not have a valid application URL. Cannot find contacts without full job details.',
          },
          { status: 400 }
        )
      }

      console.log('📄 Job URL:', fullJobUrl)
      console.log('💰 Cost optimization: Fetching full job details BEFORE contact search')

      try {
        // Check cache first to avoid expensive AI calls
        const cached = getCachedAnalysis(fullJobUrl)
        if (cached) {
          console.log('✨ CACHE HIT: Using cached job analysis (< 24 hours old)')
          console.log('⚡ Saved ~5-7 seconds by skipping AI analysis!')
          jobAnalysis = cached.jobAnalysis
          companyData = cached.companyData

          console.log('✅ Cached job analysis:')
          console.log(`   - Company domain: ${jobAnalysis.company.domain}`)
          console.log(`   - Industry: ${jobAnalysis.company.industry || 'Unknown'}`)
          console.log(`   - Department: ${jobAnalysis.department}`)
          console.log(`   - Team members: ${companyData.teamMembers.length}`)
          console.log(`   - Departments: ${companyData.departments.length}`)
        } else {
          console.log('🔍 CACHE MISS: Running fresh job analysis...')

          // Analyze the full job posting
          console.log('Step 0a: Analyzing full job posting from URL...')
          let step0aStart = Date.now()
          jobAnalysis = await jobAnalyzer.quickAnalyze({
            title: job.title,
            company: job.company,
            location: job.location,
            description: job.description || '',
            url: fullJobUrl,
          })
          measureStep('Job Analysis', step0aStart)

          console.log('✅ Job analysis complete:')
          console.log(`   - Company domain: ${jobAnalysis.company.domain}`)
          console.log(`   - Industry: ${jobAnalysis.company.industry || 'Unknown'}`)
          console.log(`   - Department: ${jobAnalysis.department}`)
          console.log(`   - Seniority: ${jobAnalysis.seniority}`)

          // Research the company deeply
          console.log('Step 0b: Deep company research...')
          let step0bStart = Date.now()
          companyData = await companyResearcher.researchCompany(
            jobAnalysis.company.domain,
            jobAnalysis.company.name
          )
          measureStep('Company Research', step0bStart)

          console.log(`✅ Company research complete:`)
          console.log(`   - ${companyData.teamMembers.length} team members identified`)
          console.log(`   - ${companyData.departments.length} departments mapped`)
          console.log(`   - ${companyData.officeLocations.length} office locations`)

          // Cache the results for 24 hours
          setCachedAnalysis(fullJobUrl, jobAnalysis, companyData)
          console.log('💾 Cached job analysis for future searches')
        }

      } catch (error: any) {
        console.error('⚠️ Job analysis failed:', error.message)
        console.log('🔄 Continuing without full job analysis - will use basic info only')

        // DON'T fail the entire request - just continue without enhanced data
        // The LinkedIn scraper and contact reasoner can still work with basic info
        jobAnalysis = null
        companyData = null
      }
    } else {
      // No jobId provided - user is doing manual search
      console.log('⚠️  No jobId provided - using manual company/domain input')
      console.log('⚠️  Results may be less accurate without full job posting analysis')
    }

    // STEP 1: AI analyzes job and creates strategy
    // NOW USES ENHANCED DATA for much better targeting!
    console.log('Step 1: AI analyzing job with enhanced context...')
    const jobContext = {
      title: jobTitle || 'Position',
      company,
      companyUrl: domain,
      description: jobDescription,
      jobType: jobType || 'full-time',
      location,
    }

    // Build enhanced context if we have the data
    const enhancedContext = (jobAnalysis && companyData) ? {
      jobAnalysis,
      companyResearch: companyData,
    } : undefined

    if (enhancedContext && companyData) {
      console.log(`✅ Using enhanced context: ${companyData.teamMembers.length} team members, ${companyData.departments.length} depts`)
    } else {
      console.log('⚠️  No enhanced context - using basic job info only')
    }

    let step1Start = Date.now()
    const strategy = await contactReasoner.analyzeJob(jobContext, enhancedContext)
    measureStep('AI Strategy Generation', step1Start)
    console.log('Strategy confidence:', strategy.confidenceScore)
    if (strategy.specificPeople && strategy.specificPeople.length > 0) {
      console.log('🎯 Targeting specific people:', strategy.specificPeople?.slice(0, 3).join(', ') || 'None')
    }

    // Lower threshold since we have better data now
    // Only reject if confidence is VERY low (< 40)
    if (strategy.confidenceScore < 40) {
      return NextResponse.json(
        {
          error: 'Need more information',
          message: 'Unable to identify good contacts with the available information. Try providing more job details or checking the company domain.',
          needsMoreInfo: true,
        },
        { status: 400 }
      )
    }

    // STEP 2: Determine search domain
    console.log('=== Step 2: Determining Search Domain ===')
    let searchDomain = domain

    if (jobAnalysis && jobAnalysis.company.domain) {
      // Use the domain from deep job analysis (most accurate)
      searchDomain = jobAnalysis.company.domain
      console.log(`✅ Using domain from job analysis: ${searchDomain}`)
    } else if (domain) {
      // Use manually provided domain
      console.log(`⚠️  Using manually provided domain: ${searchDomain}`)
    } else {
      // Last resort: AI guesses domain
      console.log('⚠️  No domain available - asking AI to guess...')
      const companyInfo = await contactReasoner.researchCompany(company, undefined)
      searchDomain = companyInfo.verifiedDomain
      console.log(`⚠️  AI guessed domain: ${searchDomain}`)
    }

    // STEP 3: Check cache first (high-quality contacts only)
    // Skip cache if user requested fresh search
    if (!bypassCache) {
      console.log('Step 3: Checking cache...')
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: cachedContacts } = await supabase
        .from('contacts')
        .select('*')
        .eq('company_domain', searchDomain)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .gte('relevance_score', 70) // Only high-quality cached contacts
        .order('relevance_score', { ascending: false })
        .limit(4)

      if (cachedContacts && cachedContacts.length >= 2) {
        console.log(`✅ Using ${cachedContacts.length} cached contacts (no charge)`)
        return NextResponse.json({
          success: true,
          contacts: cachedContacts,
          creditsRemaining: user.credits,
          remainingCredits: user.credits,
          cached: true,
          creditsDeducted: 0,
          strategy: {
            reasoning: strategy.reasoning,
            confidence: strategy.confidenceScore,
            approach: strategy.approach,
          },
        })
      }

      console.log('⚠️  No high-quality cached contacts found, running fresh search...')
    } else {
      console.log('⚡ BYPASS CACHE: User requested fresh search, skipping cache check...')
    }

    // STEP 3.5: LinkedIn Contact Search (Primary Method)
    console.log('=== Step 3.5: LinkedIn Contact Search ===')
    console.log('Domain to search:', searchDomain)
    console.log('AI strategy:', strategy.approach, '- targeting:', strategy.targetTitles?.slice(0, 3).join(', ') || 'HR/recruiters')

    let linkedInContacts: any[] = []
    let searchStart = Date.now()

    try {
      // LinkedIn REAL CONTACT SEARCH (uses web search to find actual people)
      console.log('  🔍 [LinkedIn] Searching for REAL employees via web search...')
      linkedInContacts = await linkedInContactFinder.findRealContacts(
        company,
        searchDomain,
        jobTitle
      )
      console.log(`  ✅ [LinkedIn] Found ${linkedInContacts.length} REAL people (${linkedInContacts.filter(c => c.isHRRole).length} HR roles)`)

      // Add company website team members as additional data source
      if (companyData && companyData.teamMembers.length > 0) {
        console.log(`  🏢 [Company Website] Found ${companyData.teamMembers.length} team members from website`)

        // Convert team members to contact format
        const websiteContacts = companyData.teamMembers.map((tm: any) => ({
          name: tm.name,
          firstName: tm.name.split(' ')[0],
          lastName: tm.name.split(' ').slice(1).join(' ') || '',
          title: tm.title,
          company: company,
          linkedinUrl: tm.linkedinUrl || null,
          email: tm.email || null,
          isHRRole: tm.isHiringRole,
          isTeamRole: !tm.isHiringRole,
          relevanceScore: tm.isHiringRole ? 95 : 70,
          reasoning: `Found on company website - ${tm.title}`,
          dataSource: 'company_website' as const
        }))

        // Merge website contacts with LinkedIn contacts (dedupe by name)
        const existingNames = new Set(linkedInContacts.map((c: any) => c.name.toLowerCase()))
        const newWebsiteContacts = websiteContacts.filter((c: any) => !existingNames.has(c.name.toLowerCase()))

        linkedInContacts = [...linkedInContacts, ...newWebsiteContacts]
        console.log(`  ✅ [Company Website] Added ${newWebsiteContacts.length} unique contacts (${newWebsiteContacts.filter((c: any) => c.isHRRole).length} HR roles)`)
      }

      measureStep('LinkedIn Contact Search', searchStart)
      console.log(`✅ Contact search complete in ${Date.now() - searchStart}ms`)
      console.log(`   📊 Total contacts found: ${linkedInContacts.length}`)

      if (linkedInContacts.length > 0) {
        console.log('   Top 3 contacts:')
        linkedInContacts.slice(0, 3).forEach(c => {
          console.log(`      • ${c.name} - ${c.title} (score: ${c.relevanceScore})`)
        })
      }
    } catch (error) {
      console.error('❌ Contact search failed:', error)
      // Continue with empty results - fallback will handle it
    }

    // If no contacts found, proceed to fallback
    if (!linkedInContacts || linkedInContacts.length === 0) {
      console.log('\n=== ⚠️ NO CONTACTS FOUND ===')
      console.log(`Company: ${company}`)
      console.log(`Domain searched: ${searchDomain}`)
      console.log('🔄 Activating fallback guidance...')
      console.log('=== END NO RESULTS DEBUG ===\n')

      // FALLBACK: Provide manual guidance when no contacts found
      const altDomains = [
        searchDomain.replace(/inc\.com$/, '.com'),
        searchDomain.replace(/llc\.com$/, '.com'),
        searchDomain.replace(/ltd\.com$/, '.com'),
        company.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '') + '.com',
      ].filter(d => d !== searchDomain)

      return NextResponse.json(
        {
          success: false,
          error: 'No automated contacts found',
          message: `Unable to find contacts for ${company} automatically. Use the manual research strategies below.`,
          manual_guidance: {
            linkedin_search_url: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(company + ' HR')}`,
            google_search_url: `https://www.google.com/search?q=${encodeURIComponent(`"${company}" email format`)}`,
            company_website: `https://${searchDomain}/about`,
            search_tips: [
              `Search LinkedIn for: "${company} recruiter"`,
              `Search LinkedIn for: "${company} talent acquisition"`,
              `Visit ${searchDomain}/about or ${searchDomain}/team`,
              `Call company main number and ask for HR department`,
              `Try common email patterns: firstname@${searchDomain}`
            ],
            suggested_domains: altDomains.length > 0 ? altDomains : undefined,
          },
          strategy: {
            reasoning: strategy.reasoning,
            confidence: strategy.confidenceScore,
            approach: strategy.approach,
          },
        },
        { status: 200 } // 200 not 404 - we're providing valuable guidance
      )
    }

    // Process LinkedIn contacts - try email pattern generation first
    console.log('=== Step 4: Email Pattern Generation ===')
    let contactsWithVerifiedEmails: any[] = []

    try {
      const topContacts = linkedInContacts.slice(0, 4) // Only top 4 to control costs
      console.log(`Attempting to generate emails for ${topContacts.length} LinkedIn contacts...`)

      const contactsWithEmails = await emailPatternGenerator.generateVerifiedEmails(
        topContacts,
        searchDomain,
        2 // Max 2 verifications per contact to stay under budget
      )

      contactsWithVerifiedEmails = contactsWithEmails.filter(c => c.generatedEmail?.status === 'valid')

      if (contactsWithVerifiedEmails.length > 0) {
        console.log(`✅ Pattern generation SUCCESS: ${contactsWithVerifiedEmails.length} valid emails found`)
      } else {
        console.log('⚠️ Pattern generation found no valid emails - will use LinkedIn-only contacts')
      }
    } catch (error) {
      console.error('Pattern generation failed:', error)
      console.log('🔄 Continuing with LinkedIn-only mode')
    }

    // Prepare final contacts list
    let finalContacts: any[] = []

    // Add pattern-generated contacts if we have them
    if (contactsWithVerifiedEmails.length > 0) {
      finalContacts = contactsWithVerifiedEmails.map(c => ({
        name: c.name,
        firstName: c.name.split(' ')[0],
        lastName: c.name.split(' ').slice(1).join(' ') || '',
        title: c.title,
        email: c.generatedEmail!.email,
        emailStatus: c.generatedEmail!.status,
        linkedinUrl: c.profileUrl || `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(company + ' ' + c.title)}`,
        relevanceScore: c.relevanceScore,
        reasoning: c.reasoning,
        department: c.department,
        dataSource: 'pattern_generated' as const
      }))
    }

    // Add remaining LinkedIn contacts (without verified emails)
    const usedNames = new Set(finalContacts.map(c => c.name.toLowerCase()))
    const remainingLinkedInContacts = linkedInContacts
      .filter(c => !usedNames.has(c.name.toLowerCase()))
      .slice(0, 4 - finalContacts.length) // Fill up to 4 total

    remainingLinkedInContacts.forEach(lc => {
      finalContacts.push({
        name: lc.name,
        firstName: lc.name.split(' ')[0],
        lastName: lc.name.split(' ').slice(1).join(' ') || '',
        title: lc.title,
        email: null,
        emailStatus: 'unknown' as const,
        linkedinUrl: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(company + ' ' + lc.title)}`,
        relevanceScore: lc.relevanceScore,
        reasoning: lc.reasoning,
        department: lc.department,
        dataSource: 'linkedin_inferred' as const
      })
    })

    console.log(`📊 Final contacts: ${finalContacts.length} total (${finalContacts.filter(c => c.email).length} with emails)`)

    // Convert final contacts to database format
    const contactsToSave = finalContacts.map(c => ({
      email: c.email,
      first_name: c.firstName,
      last_name: c.lastName,
      full_name: c.name,
      position: c.title,
      company_name: company,
      company_domain: searchDomain,
      linkedin_url: c.linkedinUrl,
      email_status: c.emailStatus,
      relevance_score: c.relevanceScore,
      is_key_decision_maker: c.relevanceScore >= 85,
      department: c.department,
      source: c.dataSource,
      metadata: {
        aiReasoning: c.reasoning,
        contactMethod: c.email ? 'email' : 'linkedin',
        searchGuidance: !c.email ? `Search for "${c.name}" at "${company}" on LinkedIn` : undefined,
      }
    }))

    // Save to database
    const { data: savedContacts, error: saveError} = await supabase
      .from('contacts')
      .insert(contactsToSave)
      .select()

    if (saveError) {
      console.error('Error saving contacts:', saveError)
    } else {
      console.log(`✅ Saved ${savedContacts?.length} contacts to database`)
    }

    // Calculate cost - 1 credit per contact
    const contactsFound = finalContacts.length
    const totalCreditCost = contactsFound * CREDIT_COST_PER_CONTACT

    // Check if user has enough credits
    if (user.credits < totalCreditCost) {
      return NextResponse.json(
        {
          error: 'Insufficient credits',
          message: `Found ${contactsFound} contacts (${totalCreditCost} credits required). You have ${user.credits} credits.`,
          contactsFound,
          creditsRequired: totalCreditCost,
        },
        { status: 402 }
      )
    }

    // Deduct credits
    await supabase
      .from('users')
      .update({ credits: user.credits - totalCreditCost })
      .eq('id', user.id)

    await supabase.from('credit_transactions').insert({
      user_id: user.id,
      amount: -totalCreditCost,
      type: 'contact_search',
      description: `LinkedIn-based contact search for ${company} (${contactsFound} contacts)`,
      metadata: {
        contactsFound,
        withEmails: finalContacts.filter(c => c.email).length,
        linkedinOnly: finalContacts.filter(c => !c.email).length,
      },
    })

    // Track credit usage
    const hrContactsFound = finalContacts.filter(c =>
      c.reasoning?.toLowerCase().includes('hr') ||
      c.reasoning?.toLowerCase().includes('recruit')
    ).length

    await creditTracker.logUsage({
      userId: user.id,
      action: 'domain_search',
      creditsUsed: totalCreditCost,
      creditsEstimated: totalCreditCost,
      creditsActual: totalCreditCost,
      results: contactsFound,
      costPerContact: totalCreditCost / contactsFound,
      efficiency: (contactsFound / totalCreditCost) * 100,
      metadata: {
        company,
        domain: searchDomain,
        searchType: 'linkedin_apify',
        contactsFound,
        hrContactsFound,
        teamContactsFound: contactsFound - hrContactsFound,
      },
    })

    const totalTime = Date.now() - startTime
    console.log(`💰 Contact search: ${totalCreditCost} credits for ${contactsFound} contacts`)
    console.log(`⏱️  Total time: ${totalTime}ms`)
    console.log('=== Contact Search Complete ===')

    return NextResponse.json({
      success: true,
      contacts: savedContacts || contactsToSave,
      creditsRemaining: user.credits - totalCreditCost,
      remainingCredits: user.credits - totalCreditCost,
      creditsDeducted: totalCreditCost,
      message: `Found ${contactsFound} contacts via LinkedIn and AI analysis.${finalContacts.filter(c => !c.email).length > 0 ? ' Some contacts available via LinkedIn only.' : ''}`,
      linkedin_search_url: finalContacts.filter(c => !c.email).length > 0 ? `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(company + ' HR recruiter')}` : undefined,
      strategy: {
        reasoning: strategy.reasoning,
        confidence: strategy.confidenceScore,
        approach: strategy.approach,
      },
      performance: {
        totalTimeMs: totalTime,
        breakdown: timings
      }
    })


  } catch (error: any) {
    console.error('=== Contact Search Error ===')
    console.error('Error type:', error.constructor.name)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)

    return NextResponse.json(
      {
        error: 'Contact search failed',
        message: error.message || 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? error.toString() : undefined,
      },
      { status: 500 }
    )
  }
}
