/**
 * Admin API - Add Credits to User Account
 *
 * This is a temporary admin endpoint for testing.
 * In production, you should:
 * 1. Add proper admin authentication
 * 2. Use a secure admin dashboard
 * 3. Or integrate with a payment provider (Stripe)
 *
 * Usage:
 * POST /api/admin/add-credits
 * Body: { "email": "user@example.com", "credits": 1000 }
 * Headers: { "x-admin-secret": process.env.CRON_SECRET }
 */

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    // Simple admin authentication using CRON_SECRET
    // TODO: Replace with proper admin auth in production
    const adminSecret = request.headers.get('x-admin-secret')
    if (!adminSecret || adminSecret !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid admin secret' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { email, credits } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    if (typeof credits !== 'number' || credits < 0) {
      return NextResponse.json(
        { error: 'Credits must be a positive number' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Get the user
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, email, credits')
      .eq('email', email)
      .single()

    if (fetchError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update credits
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ credits })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating credits:', updateError)
      return NextResponse.json(
        { error: 'Failed to update credits' },
        { status: 500 }
      )
    }

    // Log the credit addition
    await supabase.from('credit_transactions').insert({
      user_id: user.id,
      amount: credits - user.credits,
      type: 'admin_adjustment',
      status: 'completed',
      description: `Admin credit adjustment from ${user.credits} to ${credits}`,
      metadata: {
        previous_balance: user.credits,
        new_balance: credits,
        adjusted_at: new Date().toISOString(),
      }
    })

    return NextResponse.json({
      success: true,
      user: {
        email: updatedUser.email,
        previous_credits: user.credits,
        new_credits: updatedUser.credits,
        credits_added: credits - user.credits,
      }
    })

  } catch (error) {
    console.error('Error in add-credits endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
