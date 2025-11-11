/**
 * AI-Powered Contact Search API
 * Uses Claude AI to minimize Snov.io credit usage while maximizing contact quality
 */

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { snovClient } from '@/lib/snov/client'
import { contactReasoner } from '@/lib/services/contact-reasoner'

const CREDIT_COST = 1

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

    // Check credits
    if (user.credits < CREDIT_COST) {
      console.error('Insufficient credits:', user.credits)
      return NextResponse.json(
        {
          error: 'Insufficient credits',
          message: `You need ${CREDIT_COST} credit. You have ${user.credits}.`,
          creditsRequired: CREDIT_COST,
          creditsAvailable: user.credits,
        },
        { status: 402 }
      )
    }

    // STEP 1: AI analyzes job and creates strategy
    console.log('Step 1: AI analyzing job...')
    const jobContext = {
      title: jobTitle || 'Position',
      company,
      companyUrl: domain,
      description: jobDescription,
      jobType: jobType || 'full-time',
      location,
    }

    const strategy = await contactReasoner.analyzeJob(jobContext)
    console.log('Strategy confidence:', strategy.confidenceScore)

    // If confidence too low, ask user for more info
    if (strategy.confidenceScore < 60) {
      return NextResponse.json(
        {
          error: 'Need more information',
          message: 'The AI needs more details about this job to find the right contacts. Please provide a job description or try a different company.',
          needsMoreInfo: true,
        },
        { status: 400 }
      )
    }

    // STEP 2: Research company
    console.log('Step 2: Researching company...')
    const companyInfo = await contactReasoner.researchCompany(company, domain)
    const searchDomain = companyInfo.verifiedDomain

    console.log('Verified domain:', searchDomain)

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

    // STEP 4: Execute optimized Snov.io search
    console.log('Step 4: Searching Snov.io with AI strategy...')
    console.log('Target titles:', strategy.targetTitles)

    let snovResults
    try {
      snovResults = await snovClient.searchByDomain(searchDomain, 50)
      console.log(`Snov.io returned ${snovResults?.length || 0} raw contacts`)
    } catch (snovError: any) {
      console.error('Snov.io API error:', snovError)
      return NextResponse.json(
        {
          error: 'Failed to search Snov.io',
          message: snovError.message || 'Snov.io API is not responding. Please try again later.',
          details: process.env.NODE_ENV === 'development' ? snovError.toString() : undefined,
        },
        { status: 500 }
      )
    }

    if (!snovResults || snovResults.length === 0) {
      console.log('No contacts found from Snov.io')
      return NextResponse.json(
        {
          error: 'No contacts found',
          message: `No contacts found for ${company}.

This can happen when:
• The company doesn't have publicly available contact information
• The company uses strict privacy controls
• Large tech companies often hide employee emails

Try searching for smaller companies or startups that typically have more public contact information available.`,
        },
        { status: 404 }
      )
    }

    // Pre-filter obvious bad contacts
    const preFiltered = snovResults.filter(contact => {
      const email = contact.email?.toLowerCase() || ''
      const genericPrefixes = [
        'info@', 'support@', 'hello@', 'contact@', 'sales@', 'admin@',
        'service@', 'help@', 'team@', 'office@', 'general@', 'marketing@',
        'press@', 'media@', 'noreply@', 'automated@', 'express@', 'response@',
      ]
      return !genericPrefixes.some(prefix => email.startsWith(prefix))
    })

    console.log(`Pre-filtered from ${snovResults.length} to ${preFiltered.length} contacts`)

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
      email: c.email,
      first_name: c.firstName,
      last_name: c.lastName,
      full_name: [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Unknown',
      position: c.position,
      email_status: c.status || 'unverified',
    }))

    // STEP 5: AI ranks and filters to top 1-4
    console.log('Step 5: AI ranking contacts...')
    const rankedContacts = await contactReasoner.rankContacts(
      formattedContacts,
      jobContext,
      strategy
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
      email: contact.email,
      first_name: contact.first_name,
      last_name: contact.last_name,
      full_name: contact.full_name,
      position: contact.position,
      company_name: company,
      company_domain: searchDomain,
      email_status: contact.email_status,
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

    // STEP 7: Deduct credit and log
    console.log('Deducting credit...')
    const { error: creditError } = await supabase
      .from('users')
      .update({ credits: user.credits - CREDIT_COST })
      .eq('id', user.id)

    if (creditError) {
      console.error('Error updating credits:', creditError)
    }

    await supabase.from('credit_transactions').insert({
      user_id: user.id,
      amount: -CREDIT_COST,
      type: 'contact_search',
      description: `AI-powered search for ${company}`,
      metadata: {
        strategy: strategy.reasoning,
        confidence: strategy.confidenceScore,
        approach: strategy.approach,
        contactsFound: rankedContacts.length,
      },
    })

    console.log('=== AI Contact Search Complete ===')
    return NextResponse.json({
      success: true,
      contacts: savedContacts || contactsToSave,
      creditsRemaining: user.credits - CREDIT_COST,
      remainingCredits: user.credits - CREDIT_COST,
      creditsDeducted: CREDIT_COST,
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
