/**
 * Get Current User Endpoint
 * Returns the current user's profile including credits
 */

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    // Authenticate with Clerk
    const { userId: clerkId } = await auth()

    if (!clerkId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

    // Get user from Supabase by clerk_id
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, credits, created_at, updated_at')
      .eq('clerk_id', clerkId)
      .single()

    if (error || !user) {
      console.error('Error fetching user:', error)
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        credits: user.credits || 0,
        created_at: user.created_at,
        updated_at: user.updated_at,
      }
    })

  } catch (error) {
    console.error('Error in /api/users/me:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
