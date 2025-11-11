/**
 * AI-Powered Contact Search API
 * Uses Claude AI to minimize Snov.io credit usage while maximizing contact quality
 */

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { snovClient } from '@/lib/snov/client'
import { contactReasoner } from '@/lib/services/contact-reasoner'
import { jobAnalyzer } from '@/lib/services/job-analyzer'
import { companyResearcher } from '@/lib/services/company-researcher'
import { linkedInScraper } from '@/lib/services/linkedin-scraper'
import { creditTracker } from '@/lib/services/credit-tracker'
import { emailPatternGenerator } from '@/lib/services/email-pattern-generator'

const CREDIT_COST_PER_CONTACT = 1
const CREDIT_COST_PER_EMAIL_VALIDATION = 1

export async function POST(request: Request) {
  console.log('=== AI-Powered Contact Search Started ===')

  try {
    const { userId } = await auth()
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
    })

    const { company, domain, jobId, jobTitle, jobType, jobDescription, location } = body

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
      console.log('💰 Cost optimization: Fetching full job details BEFORE using Snov.io credits')

      try {
        // Analyze the full job posting
        console.log('Step 0a: Analyzing full job posting from URL...')
        jobAnalysis = await jobAnalyzer.quickAnalyze({
          title: job.title,
          company: job.company,
          location: job.location,
          description: job.description || '',
          url: fullJobUrl,
        })

        console.log('✅ Job analysis complete:')
        console.log(`   - Company domain: ${jobAnalysis.company.domain}`)
        console.log(`   - Industry: ${jobAnalysis.company.industry || 'Unknown'}`)
        console.log(`   - Department: ${jobAnalysis.department}`)
        console.log(`   - Seniority: ${jobAnalysis.seniority}`)

        // Research the company deeply
        console.log('Step 0b: Deep company research...')
        companyData = await companyResearcher.researchCompany(
          jobAnalysis.company.domain,
          jobAnalysis.company.name
        )

        console.log(`✅ Company research complete:`)
        console.log(`   - ${companyData.teamMembers.length} team members identified`)
        console.log(`   - ${companyData.departments.length} departments mapped`)
        console.log(`   - ${companyData.officeLocations.length} office locations`)

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

    const strategy = await contactReasoner.analyzeJob(jobContext, enhancedContext)
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
      console.log(`Using ${cachedContacts.length} cached contacts (no charge)`)
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

    // STEP 3.5: LinkedIn Research (FREE - no credits used!)
    console.log('=== Step 3.5: FREE LinkedIn Research ===')
    console.log('💰 COST OPTIMIZATION: Identifying contacts via AI analysis BEFORE using Snov.io credits')

    let linkedInContacts: any[] = []
    try {
      linkedInContacts = await linkedInScraper.scrapeCompanyEmployees(
        company,
        searchDomain,
        jobTitle
      )
      console.log(`✅ LinkedIn analysis found ${linkedInContacts.length} likely employees`)
      console.log(`   - ${linkedInContacts.filter(c => c.isHRRole).length} HR/recruiting roles`)
      console.log(`   - ${linkedInContacts.filter(c => c.isTeamRole).length} team/department roles`)

      if (linkedInContacts.length > 0) {
        console.log('Top 3 LinkedIn contacts:')
        linkedInContacts.slice(0, 3).forEach(c => {
          console.log(`   • ${c.name} - ${c.title} (score: ${c.relevanceScore})`)
        })
      }
    } catch (error) {
      console.error('LinkedIn scraper error (non-fatal):', error)
      // Continue without LinkedIn data - not critical
    }

    // STEP 4: Execute optimized Snov.io search (1 credit = 50 emails)
    console.log('=== Step 4: Snov.io Domain Search (1 credit) ===')
    console.log('Domain to search:', searchDomain)
    console.log('AI strategy target titles:', strategy.targetTitles?.slice(0, 3) || [])
    console.log('AI strategy approach:', strategy.approach)
    if (linkedInContacts.length > 0) {
      console.log(`🎯 Will match Snov.io results against ${linkedInContacts.length} LinkedIn-identified contacts`)
    }

    let snovResults
    try {
      // Increased from 50 to 100 to get more contacts including HR
      snovResults = await snovClient.searchByDomain(searchDomain, 100)
      console.log(`✅ Snov.io returned ${snovResults?.length || 0} raw contacts`)

      if (snovResults && snovResults.length > 0) {
        // Log what types of positions were found
        const positions = snovResults.map(c => c.position).filter(Boolean)
        const hrPositions = positions.filter(p =>
          p && (p.toLowerCase().includes('hr') ||
                p.toLowerCase().includes('recruit') ||
                p.toLowerCase().includes('talent') ||
                p.toLowerCase().includes('human resources'))
        )
        console.log(`Found ${hrPositions.length} HR/recruiting contacts out of ${positions.length} total`)
        if (hrPositions.length > 0) {
          console.log('HR contacts found:', hrPositions.slice(0, 5))
        }

        // Log sample of what was found
        const sample = snovResults.slice(0, 3).map(c => ({
          name: `${c.firstName} ${c.lastName}`,
          position: c.position,
          hasEmail: !!c.email
        }))
        console.log('Sample contacts:', JSON.stringify(sample, null, 2))
      }
    } catch (snovError: any) {
      console.error('❌ Snov.io API error:', snovError)
      console.error('Error details:', snovError.message)
      return NextResponse.json(
        {
          error: 'Failed to search Snov.io',
          message: `Unable to search for contacts: ${snovError.message}`,
          details: process.env.NODE_ENV === 'development' ? snovError.toString() : undefined,
        },
        { status: 500 }
      )
    }

    if (!snovResults || snovResults.length === 0) {
      console.log('❌ No contacts found from Snov.io')
      console.log('🔄 Activating multi-tier fallback system...')

      // FALLBACK TIER 1: Email Pattern Generation (costs 1-3 credits per contact)
      if (linkedInContacts && linkedInContacts.length > 0) {
        console.log('=== Fallback Tier 1: Email Pattern Generation ===')
        console.log(`Attempting to generate emails for ${linkedInContacts.length} LinkedIn contacts...`)

        try {
          const contactsWithEmails = await emailPatternGenerator.generateVerifiedEmails(
            linkedInContacts.slice(0, 4), // Only top 4 to control costs
            searchDomain,
            2 // Max 2 verifications per contact to stay under budget
          )

          const validEmails = contactsWithEmails.filter(c => c.generatedEmail?.status === 'valid')

          if (validEmails.length > 0) {
            console.log(`✅ Pattern generation SUCCESS: ${validEmails.length} valid emails found`)

            // Convert to standard contact format
            const patternContacts = validEmails.map(c => ({
              email: c.generatedEmail!.email,
              first_name: c.name.split(' ')[0],
              last_name: c.name.split(' ').slice(1).join(' ') || '',
              full_name: c.name,
              position: c.title,
              company_name: company,
              company_domain: searchDomain,
              linkedin_url: c.profileUrl || `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(company + ' ' + c.title)}`,
              email_status: c.generatedEmail!.status,
              relevance_score: c.relevanceScore,
              is_key_decision_maker: c.relevanceScore >= 85,
              department: c.department,
              source: 'pattern_generated',
              metadata: {
                aiReasoning: c.reasoning,
                emailPattern: c.generatedEmail!.pattern,
                patternConfidence: c.generatedEmail!.confidence,
                fallbackTier: 'pattern_generation',
              }
            }))

            // Save to database
            const { data: savedContacts, error: saveError } = await supabase
              .from('contacts')
              .insert(patternContacts)
              .select()

            if (saveError) {
              console.error('Error saving pattern-generated contacts:', saveError)
            }

            // Calculate cost (pattern generation used ~2 verifications per contact)
            const verificationsUsed = validEmails.length * 2 // Estimate
            const totalCreditCost = verificationsUsed

            if (user.credits < totalCreditCost) {
              return NextResponse.json(
                {
                  error: 'Insufficient credits',
                  message: `Found ${validEmails.length} contacts via pattern generation (${totalCreditCost} credits required). You have ${user.credits} credits.`,
                  contactsFound: validEmails.length,
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
              description: `Pattern-generated emails for ${company} (${validEmails.length} contacts, ${verificationsUsed} verifications)`,
              metadata: {
                fallbackMode: true,
                fallbackTier: 'pattern_generation',
                contactsFound: validEmails.length,
                verificationsUsed,
              },
            })

            console.log(`💰 Pattern generation: ${totalCreditCost} credits for ${validEmails.length} contacts`)
            console.log('=== Pattern Generation Fallback Complete ===')

            return NextResponse.json({
              success: true,
              contacts: savedContacts || patternContacts,
              creditsRemaining: user.credits - totalCreditCost,
              creditsDeducted: totalCreditCost,
              fallback_mode: true,
              fallback_type: 'pattern_generated',
              message: `Found ${validEmails.length} contacts via email pattern generation (verified emails).`,
              strategy: {
                reasoning: strategy.reasoning,
                confidence: strategy.confidenceScore,
                approach: strategy.approach,
              },
            })
          } else {
            console.log('⚠️ Pattern generation found no valid emails - trying LinkedIn-only fallback')
          }
        } catch (error) {
          console.error('Pattern generation failed:', error)
          console.log('🔄 Falling back to LinkedIn-only mode')
        }
      }

      // FALLBACK TIER 2: Use LinkedIn-inferred contacts (NO VERIFIED EMAILS)
      if (linkedInContacts && linkedInContacts.length > 0) {
        console.log(`✅ Using ${linkedInContacts.length} LinkedIn-inferred contacts (FREE)`)

        // Convert LinkedIn contacts to standard format
        const linkedInOnlyContacts = linkedInContacts.slice(0, 4).map((lc, index) => {
          const nameParts = lc.name.split(' ')
          const firstName = nameParts[0] || 'Unknown'
          const lastName = nameParts.slice(1).join(' ') || ''

          return {
            email: null, // No verified email available
            first_name: firstName,
            last_name: lastName,
            full_name: lc.name,
            position: lc.title,
            company_name: company,
            company_domain: searchDomain,
            linkedin_url: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(company + ' ' + lc.title)}`,
            email_status: 'unknown' as const,
            relevance_score: lc.relevanceScore,
            is_key_decision_maker: lc.relevanceScore >= 85,
            department: lc.department,
            source: 'linkedin_inferred',
            metadata: {
              aiReasoning: lc.reasoning,
              contactMethod: 'linkedin',
              searchGuidance: `Search for "${lc.name}" at "${company}" on LinkedIn`,
              isInferredContact: true,
              fallbackMode: true,
            }
          }
        })

        // Save to database
        const { data: savedContacts, error: saveError } = await supabase
          .from('contacts')
          .insert(linkedInOnlyContacts)
          .select()

        if (saveError) {
          console.error('Error saving LinkedIn contacts:', saveError)
        } else {
          console.log(`✅ Saved ${savedContacts?.length} LinkedIn contacts to database`)
        }

        // Charge 1 credit per contact (fair pricing for AI-inferred data)
        const contactsFound = linkedInOnlyContacts.length
        const totalCreditCost = contactsFound * CREDIT_COST_PER_CONTACT

        // Check if user has enough credits
        if (user.credits < totalCreditCost) {
          return NextResponse.json(
            {
              error: 'Insufficient credits',
              message: `Found ${contactsFound} likely contacts (${totalCreditCost} credits required). You have ${user.credits} credits.`,
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
          description: `LinkedIn-inferred contacts for ${company} (${contactsFound} contacts)`,
          metadata: {
            fallbackMode: true,
            contactMethod: 'linkedin',
            contactsFound,
            snovResultsCount: 0,
          },
        })

        // Track credit usage
        const hrContactsFound = linkedInOnlyContacts.filter(c =>
          c.metadata.aiReasoning?.toLowerCase().includes('hr') ||
          c.metadata.aiReasoning?.toLowerCase().includes('recruit')
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
            searchType: 'linkedin_fallback',
            contactsFound,
            hrContactsFound,
            teamContactsFound: contactsFound - hrContactsFound,
          },
        })

        console.log(`💰 LinkedIn fallback: ${totalCreditCost} credits for ${contactsFound} contacts`)
        console.log('=== LinkedIn Fallback Mode Complete ===')

        return NextResponse.json({
          success: true,
          contacts: savedContacts || linkedInOnlyContacts,
          creditsRemaining: user.credits - totalCreditCost,
          remainingCredits: user.credits - totalCreditCost,
          creditsDeducted: totalCreditCost,
          fallback_mode: true,
          fallback_type: 'linkedin_inferred',
          message: `Found ${contactsFound} likely contacts via AI analysis. Verified emails not available - reach out via LinkedIn.`,
          linkedin_search_url: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(company + ' HR recruiter')}`,
          guidance: {
            method: 'linkedin',
            instructions: [
              'Search for these people on LinkedIn',
              'Send personalized connection requests or InMails',
              `Mention the ${jobTitle || 'position'} you're applying for`,
              'Be professional and concise in your message'
            ]
          },
          strategy: {
            reasoning: strategy.reasoning,
            confidence: strategy.confidenceScore,
            approach: strategy.approach,
          },
        })
      }

      // FALLBACK TIER 2: No LinkedIn contacts - return manual guidance
      console.log('⚠️ No LinkedIn contacts available - providing manual guidance')

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

    // Pre-filter obvious bad contacts (but keep contacts without emails)
    const preFiltered = snovResults.filter(contact => {
      const email = contact.email?.toLowerCase() || ''

      // Allow contacts with no email (we'll show their LinkedIn)
      if (!email) return true

      // Filter out generic emails
      const genericPrefixes = [
        'info@', 'support@', 'hello@', 'contact@', 'sales@', 'admin@',
        'service@', 'help@', 'team@', 'office@', 'general@', 'marketing@',
        'press@', 'media@', 'noreply@', 'automated@', 'express@', 'response@',
      ]
      return !genericPrefixes.some(prefix => email.startsWith(prefix))
    })

    const contactsWithEmails = preFiltered.filter(c => c.email).length
    const contactsWithoutEmails = preFiltered.length - contactsWithEmails

    console.log(`Pre-filtered: ${preFiltered.length} total (${contactsWithEmails} with emails, ${contactsWithoutEmails} LinkedIn-only)`)

    if (preFiltered.length === 0) {
      return NextResponse.json(
        {
          error: 'No quality contacts found',
          message: `Found ${snovResults.length} contacts but all were generic emails (info@, support@, etc.). This company may not have individual contact information available.`,
        },
        { status: 404 }
      )
    }

    // Format for AI
    const formattedContacts = preFiltered.map(c => ({
      email: c.email || 'no-email@placeholder.com', // Placeholder for contacts without emails
      first_name: c.firstName,
      last_name: c.lastName,
      full_name: [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Unknown',
      position: c.position,
      email_status: c.email ? (c.status || 'unverified') : 'no_email',
      linkedin_url: c.source || null, // LinkedIn URL from source_page
    }))

    // STEP 5: AI ranks and filters to top 1-4
    // NOW USES ENHANCED DATA to prioritize specific people from org chart
    console.log('Step 5: AI ranking contacts with enhanced matching...')
    const rankedContacts = await contactReasoner.rankContacts(
      formattedContacts,
      jobContext,
      strategy,
      enhancedContext
    )

    if (rankedContacts.length === 0) {
      return NextResponse.json(
        {
          error: 'No relevant contacts found',
          message: `Found ${preFiltered.length} contacts but the AI determined none were highly relevant to this ${jobTitle || 'position'}. They may not have the right roles for this job application.`,
        },
        { status: 404 }
      )
    }

    console.log(`AI selected ${rankedContacts.length} top contacts`)

    // STEP 6: Save to database with AI analysis
    const contactsToSave = rankedContacts.map(contact => ({
      email: contact.email === 'no-email@placeholder.com' ? null : contact.email,
      first_name: contact.first_name,
      last_name: contact.last_name,
      full_name: contact.full_name,
      position: contact.position,
      company_name: company,
      company_domain: searchDomain,
      linkedin_url: contact.linkedin_url || null,
      email_status: contact.email_status === 'no_email' ? 'unknown' : contact.email_status,
      relevance_score: contact.analysis.relevanceScore,
      is_key_decision_maker: contact.analysis.relevanceScore >= 85,
      department: strategy.targetDepartments[0] || null,
      source: 'snov.io',
      metadata: {
        aiReasoning: contact.analysis.reasoning,
        keyStrengths: contact.analysis.keyStrengths,
        strategyReasoning: strategy.reasoning,
        strategyConfidence: strategy.confidenceScore,
        strategyApproach: strategy.approach,
      },
    }))

    console.log('Saving contacts to database...')
    const { data: savedContacts, error: saveError } = await supabase
      .from('contacts')
      .insert(contactsToSave)
      .select()

    if (saveError) {
      console.error('Error saving contacts:', saveError)
      // Continue anyway - we'll return the contacts even if saving failed
    } else {
      console.log('Contacts saved:', savedContacts?.length)
    }

    // STEP 7: Calculate and deduct credits based on contacts found
    const contactsFound = rankedContacts.length
    const totalCreditCost = contactsFound * CREDIT_COST_PER_CONTACT
    console.log(`Credits required: ${contactsFound} contacts × ${CREDIT_COST_PER_CONTACT} = ${totalCreditCost} credits`)

    // Check if user has enough credits
    if (user.credits < totalCreditCost) {
      console.error('Insufficient credits for contacts found:', user.credits, 'needed:', totalCreditCost)
      return NextResponse.json(
        {
          error: 'Insufficient credits',
          message: `Found ${contactsFound} contact${contactsFound !== 1 ? 's' : ''} (${totalCreditCost} credit${totalCreditCost !== 1 ? 's' : ''} required). You have ${user.credits} credit${user.credits !== 1 ? 's' : ''}.`,
          creditsRequired: totalCreditCost,
          creditsAvailable: user.credits,
          contactsFound,
        },
        { status: 402 }
      )
    }

    console.log('Deducting credits...')
    const { error: creditError } = await supabase
      .from('users')
      .update({ credits: user.credits - totalCreditCost })
      .eq('id', user.id)

    if (creditError) {
      console.error('Error updating credits:', creditError)
    }

    await supabase.from('credit_transactions').insert({
      user_id: user.id,
      amount: -totalCreditCost,
      type: 'contact_search',
      description: `AI-powered search for ${company} (${contactsFound} contact${contactsFound !== 1 ? 's' : ''})`,
      metadata: {
        strategy: strategy.reasoning,
        confidence: strategy.confidenceScore,
        approach: strategy.approach,
        contactsFound,
        creditsPerContact: CREDIT_COST_PER_CONTACT,
      },
    })

    // STEP 8: Track credit usage for optimization analysis
    const hrContactsFound = rankedContacts.filter(c =>
      c.analysis?.keyStrengths?.some((s: string) =>
        s.toLowerCase().includes('hr') ||
        s.toLowerCase().includes('recruit') ||
        s.toLowerCase().includes('talent')
      )
    ).length
    const teamContactsFound = contactsFound - hrContactsFound

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
        searchType: strategy.approach,
        contactsFound,
        hrContactsFound,
        teamContactsFound,
      },
    })

    console.log(`📊 Credit Usage Tracked: ${totalCreditCost} credits for ${contactsFound} contacts (${(totalCreditCost / contactsFound).toFixed(2)} per contact)`)

    // COST ANALYSIS: Ensure we're under $0.20 budget
    const SNOV_COST_PER_CREDIT = 0.029 // $29.25 / 1000 credits
    const CLAUDE_COST_ESTIMATE = 0.06 // ~6 cents per search (job analysis + ranking)
    const totalSnovCostUSD = totalCreditCost * SNOV_COST_PER_CREDIT
    const totalCostUSD = totalSnovCostUSD + CLAUDE_COST_ESTIMATE
    const costPerContactUSD = totalCostUSD / contactsFound

    console.log('=== COST BREAKDOWN ===')
    console.log(`💰 Snov.io: ${totalCreditCost} credits × $${SNOV_COST_PER_CREDIT} = $${totalSnovCostUSD.toFixed(4)}`)
    console.log(`🤖 Claude AI: ~$${CLAUDE_COST_ESTIMATE.toFixed(4)}`)
    console.log(`📊 Total Cost: $${totalCostUSD.toFixed(4)}`)
    console.log(`📍 Cost per Contact: $${costPerContactUSD.toFixed(4)}`)
    console.log(`🎯 Budget Target: $0.20`)
    console.log(`${totalCostUSD < 0.20 ? '✅ UNDER BUDGET' : '⚠️  OVER BUDGET'}`)
    console.log('=== AI Contact Search Complete ===')

    return NextResponse.json({
      success: true,
      contacts: savedContacts || contactsToSave,
      creditsRemaining: user.credits - totalCreditCost,
      remainingCredits: user.credits - totalCreditCost,
      creditsDeducted: totalCreditCost,
      creditsPerContact: CREDIT_COST_PER_CONTACT,
      cached: false,
      strategy: {
        reasoning: strategy.reasoning,
        confidence: strategy.confidenceScore,
        approach: strategy.approach,
        targetTitles: strategy.targetTitles,
      },
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
