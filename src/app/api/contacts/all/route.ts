/**
 * Get All Contacts API
 * Simple endpoint to fetch all contacts for the authenticated user
 */

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    console.log('[Contacts API] Starting request...')

    const { userId } = await auth()
    console.log('[Contacts API] Clerk userId:', userId)

    if (!userId) {
      console.log('[Contacts API] No userId - returning 401')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[Contacts API] Creating Supabase client...')
    const supabase = createAdminClient()
    console.log('[Contacts API] Supabase client created')

    // Get user from Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (userError || !user) {
      console.error('User not found:', userError)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Fetch all contacts for this user
    console.log('[Contacts API] Fetching contacts for user_id:', user.id)

    const { data: contacts, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    console.log('[Contacts API] Query result:', {
      contactsCount: contacts?.length || 0,
      error: error?.message || null
    })

    if (error) {
      console.error('Failed to fetch contacts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch contacts', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      contacts: contacts || []
    })

  } catch (error: any) {
    console.error('[Contacts API] FATAL ERROR:', error)
    console.error('[Contacts API] Error stack:', error.stack)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message, stack: error.stack },
      { status: 500 }
    )
  }
}
