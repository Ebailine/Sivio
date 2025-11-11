import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { snovClient } from '@/lib/snov/client'

const CREDIT_COST = 1

export async function POST(request: Request) {
  console.log('=== Contact Search API Called ===')

  try {
    const { userId } = await auth()
    console.log('User ID:', userId)

    if (!userId) {
      console.error('No user ID - unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Request body:', body)

    const { company, domain, jobId } = body

    if (!company && !domain) {
      console.error('Missing company and domain')
      return NextResponse.json(
        { error: 'Company name or domain required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    console.log('Supabase client created')

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, credits, email')
      .eq('clerk_id', userId)
      .single()

    console.log('User from DB:', user)
    console.log('User error:', userError)

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
          message: `You need at least ${CREDIT_COST} credit(s). You have ${user.credits}.`,
        },
        { status: 402 }
      )
    }

    // Determine domain to search
    let searchDomain = domain
    if (!searchDomain && company) {
      // Simple domain extraction
      const companyKey = company.toLowerCase().replace(/[^a-z0-9]/g, '')

      // Known company domain mappings (for companies with multiple domains or non-standard domains)
      const domainMappings: Record<string, string[]> = {
        'meta': ['facebook.com', 'meta.com'],
        'facebook': ['facebook.com'],
        'alphabet': ['google.com', 'alphabet.com'],
        'twitter': ['x.com', 'twitter.com'],
        'x': ['x.com', 'twitter.com'],
      }

      // Check if company has known alternative domains
      if (domainMappings[companyKey]) {
        searchDomain = domainMappings[companyKey][0] // Use first alternative
      } else {
        searchDomain = companyKey + '.com'
      }
    }

    console.log('Searching domain:', searchDomain)

    // Check if we have cached results (within 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: cachedContacts } = await supabase
      .from('contacts')
      .select('*')
      .eq('company_domain', searchDomain)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('relevance_score', { ascending: false })
      .limit(10)

    console.log('Cached contacts found:', cachedContacts?.length || 0)

    if (cachedContacts && cachedContacts.length > 0) {
      console.log('Returning cached contacts (no credit charge)')
      return NextResponse.json({
        success: true,
        contacts: cachedContacts,
        creditsRemaining: user.credits,
        cached: true,
        message: 'Using cached results from previous search',
      })
    }

    // No cached results, search Snov.io
    console.log('No cached results, calling Snov.io API...')
    console.log('Snov.io credentials check:', {
      hasUserId: !!process.env.SNOV_USER_ID,
      hasSecret: !!process.env.SNOV_CLIENT_SECRET,
    })

    let snovResults
    try {
      snovResults = await snovClient.searchByDomain(searchDomain, 50)
      console.log('Snov.io raw results:', snovResults?.length || 0)
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
          message: `No contacts found for ${company || searchDomain}.

This can happen when:
• The company doesn't have publicly available contact information
• The company uses strict privacy controls
• Large tech companies often hide employee emails

Try searching for smaller companies or startups that typically have more public contact information available.`,
        },
        { status: 404 }
      )
    }

    // Filter and score contacts
    console.log('Filtering contacts...')
    const relevantContacts = snovResults
      .filter(email => {
        // Filter out generic emails
        const genericPrefixes = ['info', 'support', 'hello', 'contact', 'admin', 'sales']
        const emailPrefix = email.email.split('@')[0].toLowerCase()
        return !genericPrefixes.some(prefix => emailPrefix.includes(prefix))
      })
      .map(email => {
        // Calculate relevance score
        let score = 50 // Base score
        const position = (email.position || '').toLowerCase()

        // High relevance positions
        if (position.includes('recruit') || position.includes('talent') || position.includes('hr')) {
          score += 30
        }
        if (position.includes('head') || position.includes('director') || position.includes('manager')) {
          score += 15
        }
        if (position.includes('senior') || position.includes('lead')) {
          score += 10
        }

        return {
          ...email,
          relevance_score: Math.min(score, 100),
          is_key_decision_maker: score >= 80,
        }
      })
      .sort((a, b) => b.relevance_score - a.relevance_score)
      .slice(0, 10) // Top 10

    console.log('Filtered contacts:', relevantContacts.length)

    // Save to database
    const contactsToSave = relevantContacts.map(contact => ({
      email: contact.email,
      first_name: contact.firstName,
      last_name: contact.lastName,
      full_name: [contact.firstName, contact.lastName].filter(Boolean).join(' ') || 'Unknown',
      position: contact.position,
      company_name: company || searchDomain,
      company_domain: searchDomain,
      email_status: contact.status || 'unverified',
      relevance_score: contact.relevance_score,
      is_key_decision_maker: contact.is_key_decision_maker,
      source: 'snov.io',
    }))

    console.log('Saving contacts to database...')
    const { data: savedContacts, error: saveError } = await supabase
      .from('contacts')
      .insert(contactsToSave)
      .select()

    if (saveError) {
      console.error('Error saving contacts:', saveError)
      // Don't fail the request, just log it
    } else {
      console.log('Contacts saved:', savedContacts?.length)
    }

    // Deduct credit
    console.log('Deducting credit...')
    const { error: creditError } = await supabase
      .from('users')
      .update({ credits: user.credits - CREDIT_COST })
      .eq('id', user.id)

    if (creditError) {
      console.error('Error updating credits:', creditError)
    }

    // Log transaction
    await supabase.from('credit_transactions').insert({
      user_id: user.id,
      amount: -CREDIT_COST,
      type: 'contact_search',
      description: `Contact search for ${company || searchDomain}`,
    })

    console.log('=== Contact Search Success ===')
    return NextResponse.json({
      success: true,
      contacts: savedContacts || relevantContacts,
      creditsRemaining: user.credits - CREDIT_COST,
      cached: false,
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
