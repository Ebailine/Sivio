import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { snovClient } from '@/lib/snov/client'

const CREDIT_COST = 1

export async function POST(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { domain, companyName, jobId } = await request.json()

    if (!domain) {
      return NextResponse.json(
        { error: 'Company domain required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Get user from Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, credits')
      .eq('clerk_id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has enough credits
    if (user.credits < CREDIT_COST) {
      return NextResponse.json(
        { error: 'Insufficient credits', creditsRequired: CREDIT_COST, creditsAvailable: user.credits },
        { status: 402 }
      )
    }

    // Check if we already have contacts for this domain (within last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: existingContacts } = await supabase
      .from('contacts')
      .select('*')
      .eq('company_domain', domain)
      .gte('created_at', thirtyDaysAgo.toISOString())

    // If we have recent contacts, return them without charging
    if (existingContacts && existingContacts.length > 0) {
      return NextResponse.json({
        success: true,
        contacts: existingContacts,
        cached: true,
        creditsDeducted: 0,
        remainingCredits: user.credits
      })
    }

    // Search for contacts using Snov.io
    let contacts
    try {
      contacts = await snovClient.findRelevantContacts(domain, companyName)
    } catch (error: any) {
      return NextResponse.json(
        { error: 'Failed to search contacts', details: error.message },
        { status: 500 }
      )
    }

    if (contacts.length === 0) {
      return NextResponse.json(
        { error: 'No contacts found for this domain', contacts: [] },
        { status: 404 }
      )
    }

    // Deduct credits from user
    const { error: creditError } = await supabase
      .from('users')
      .update({ credits: user.credits - CREDIT_COST })
      .eq('id', user.id)

    if (creditError) {
      console.error('Failed to deduct credits:', creditError)
      return NextResponse.json(
        { error: 'Failed to process credit transaction' },
        { status: 500 }
      )
    }

    // Log the transaction
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: user.id,
        amount: -CREDIT_COST,
        type: 'contact_search',
        description: `Contact search for ${domain}`,
        metadata: {
          domain,
          companyName,
          jobId,
          contactsFound: contacts.length
        }
      })

    if (transactionError) {
      console.error('Failed to log transaction:', transactionError)
      // Don't fail the request if logging fails
    }

    // Store contacts in database
    const contactsToInsert = contacts.map(contact => ({
      email: contact.email,
      first_name: contact.firstName,
      last_name: contact.lastName,
      full_name: contact.fullName,
      position: contact.position,
      company_name: companyName || domain,
      company_domain: domain,
      linkedin_url: contact.linkedinUrl,
      email_status: contact.emailStatus,
      relevance_score: contact.relevanceScore,
      is_key_decision_maker: contact.isKeyDecisionMaker,
      department: contact.department,
      source: 'snov.io',
      metadata: {
        job_id: jobId
      }
    }))

    const { data: insertedContacts, error: insertError } = await supabase
      .from('contacts')
      .insert(contactsToInsert)
      .select()

    if (insertError) {
      console.error('Failed to store contacts:', insertError)
      // Return the contacts even if storage fails
      return NextResponse.json({
        success: true,
        contacts: contactsToInsert,
        cached: false,
        creditsDeducted: CREDIT_COST,
        remainingCredits: user.credits - CREDIT_COST,
        warning: 'Contacts found but not stored in database'
      })
    }

    return NextResponse.json({
      success: true,
      contacts: insertedContacts,
      cached: false,
      creditsDeducted: CREDIT_COST,
      remainingCredits: user.credits - CREDIT_COST
    })

  } catch (error: any) {
    console.error('Contact search error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
