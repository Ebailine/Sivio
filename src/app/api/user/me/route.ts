/**
 * User Me API - Get current user's Supabase ID
 * This is needed because client-side code cannot query users table due to RLS
 */

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const { userId: clerkId } = await auth()

    if (!clerkId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

    // Get Supabase user from Clerk ID using admin client (bypasses RLS)
    const { data: user, error } = await supabase
      .from('users')
      .select('id, clerk_id, email, credits, created_at')
      .eq('clerk_id', clerkId)
      .single()

    if (error || !user) {
      console.error('User not found:', error)
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        clerkId: user.clerk_id,
        email: user.email,
        credits: user.credits,
        createdAt: user.created_at,
      }
    })

  } catch (error: any) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
