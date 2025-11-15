/**
 * n8n Contact Webhook Endpoint
 * Receives contact data from Ethan's n8n workflow
 *
 * Expected payload from n8n:
 * {
 *   user_id: string (Supabase user ID),
 *   contacts: [
 *     {
 *       email: string,
 *       name: string,
 *       position: string,
 *       company: string,
 *       linkedin_url?: string,
 *       verified: boolean,  // from Apollo verification
 *       relevance_score?: number,
 *       source: string,  // e.g., "linkedin_apify"
 *     }
 *   ]
 * }
 */

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    // Verify the request is from n8n (using cron secret for now)
    const authHeader = request.headers.get('authorization')
    const expectedSecret = process.env.CRON_SECRET

    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid webhook secret' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { user_id, contacts } = body

    if (!user_id || !contacts || !Array.isArray(contacts)) {
      return NextResponse.json(
        { error: 'Invalid payload - user_id and contacts array required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user_id)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Insert contacts (with conflict handling)
    const contactsToInsert = contacts.map((contact: any) => ({
      user_id,
      email: contact.email,
      name: contact.name,
      position: contact.position,
      company: contact.company,
      linkedin_url: contact.linkedin_url || null,
      verified: contact.verified || false,
      relevance_score: contact.relevance_score || 0,
      source: contact.source || 'n8n_webhook',
      metadata: {
        imported_at: new Date().toISOString(),
        apollo_verified: contact.verified || false,
      }
    }))

    // Upsert contacts (update if exists, insert if new)
    const { data: insertedContacts, error: insertError } = await supabase
      .from('contacts')
      .upsert(contactsToInsert, {
        onConflict: 'user_id,email', // Prevent duplicate emails per user
        ignoreDuplicates: false, // Update if exists
      })
      .select()

    if (insertError) {
      console.error('Contact insertion error:', insertError)
      throw insertError
    }

    // Log the webhook event
    console.log(`[n8n Webhook] Received ${contacts.length} contacts for user ${user_id}`)
    console.log(`[n8n Webhook] Inserted/updated ${insertedContacts?.length || 0} contacts`)

    return NextResponse.json({
      success: true,
      message: `Processed ${contacts.length} contacts`,
      inserted: insertedContacts?.length || 0,
    })

  } catch (error: any) {
    console.error('Contact webhook error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint for testing
 * Returns webhook configuration info
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/contacts/webhook',
    method: 'POST',
    authentication: 'Bearer token (same as CRON_SECRET)',
    payload: {
      user_id: 'string (Supabase user ID)',
      contacts: [
        {
          email: 'string (required)',
          name: 'string (required)',
          position: 'string (required)',
          company: 'string (required)',
          linkedin_url: 'string (optional)',
          verified: 'boolean (from Apollo)',
          relevance_score: 'number (0-100, optional)',
          source: 'string (e.g., "linkedin_apify")',
        }
      ]
    },
    example_curl: `curl -X POST https://sivio.vercel.app/api/contacts/webhook \\
  -H "Authorization: Bearer YOUR_SECRET" \\
  -H "Content-Type: application/json" \\
  -d '{
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "contacts": [
      {
        "email": "recruiter@company.com",
        "name": "Jane Smith",
        "position": "Senior Recruiter",
        "company": "TechCorp",
        "verified": true,
        "relevance_score": 85
      }
    ]
  }'`
  })
}
