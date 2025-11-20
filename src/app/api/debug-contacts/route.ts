import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return NextResponse.json({ error: 'No auth' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Step 1: Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, clerk_id, email')
      .eq('clerk_id', clerkUserId)
      .single()

    if (userError || !user) {
      return NextResponse.json({
        error: 'User not found',
        userError: userError?.message,
        clerkUserId
      }, { status: 404 })
    }

    // Step 2: Count contacts with this user_id
    const { count, error: countError } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // Step 3: Try to fetch contacts WITHOUT ordering
    const { data: contactsNoOrder, error: errorNoOrder } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', user.id)

    // Step 4: Try WITH ordering
    const { data: contactsWithOrder, error: errorWithOrder } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Step 5: Try selecting specific columns only
    const { data: contactsSpecific, error: errorSpecific } = await supabase
      .from('contacts')
      .select('id, name, email, user_id, created_at')
      .eq('user_id', user.id)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        clerk_id: user.clerk_id,
        email: user.email
      },
      tests: {
        count: count || 0,
        countError: countError?.message || null,

        noOrder: {
          count: contactsNoOrder?.length || 0,
          error: errorNoOrder?.message || null,
          data: contactsNoOrder || []
        },

        withOrder: {
          count: contactsWithOrder?.length || 0,
          error: errorWithOrder?.message || null,
          data: contactsWithOrder || []
        },

        specificColumns: {
          count: contactsSpecific?.length || 0,
          error: errorSpecific?.message || null,
          data: contactsSpecific || []
        }
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      error: 'Fatal error',
      message: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
