import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    // Step 1: Get Clerk userId
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return NextResponse.json({
        error: 'No Clerk user ID',
        step: 'auth()'
      }, { status: 401 })
    }

    // Step 2: Log the exact userId
    const userIdInfo = {
      value: clerkUserId,
      length: clerkUserId.length,
      bytes: Buffer.from(clerkUserId).toString('hex'),
      trimmed: clerkUserId.trim(),
      toLowerCase: clerkUserId.toLowerCase()
    }

    // Step 3: Create Supabase client
    const supabase = createAdminClient()

    // Step 4: Query ALL users to see what's in the table
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('id, clerk_id, email')
      .limit(10)

    if (allUsersError) {
      return NextResponse.json({
        error: 'Failed to fetch all users',
        details: allUsersError.message,
        step: 'query_all_users'
      }, { status: 500 })
    }

    // Step 5: Try to find user by clerk_id
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, clerk_id, email')
      .eq('clerk_id', clerkUserId)
      .maybeSingle()

    // Step 6: Try to find user by email (if we know it)
    const { data: userByEmail, error: emailError } = await supabase
      .from('users')
      .select('id, clerk_id, email')
      .eq('email', 'ebailine527@gmail.com')
      .maybeSingle()

    // Step 7: Compare clerk_id from database with what Clerk sent
    const comparison = userByEmail ? {
      clerkSent: clerkUserId,
      dbStored: userByEmail.clerk_id,
      exactMatch: clerkUserId === userByEmail.clerk_id,
      lengthMatch: clerkUserId.length === (userByEmail.clerk_id?.length || 0),
      trimmedMatch: clerkUserId.trim() === userByEmail.clerk_id?.trim(),
      clerkBytes: Buffer.from(clerkUserId).toString('hex'),
      dbBytes: userByEmail.clerk_id ? Buffer.from(userByEmail.clerk_id).toString('hex') : null
    } : null

    return NextResponse.json({
      success: true,
      clerkUserId: userIdInfo,
      allUsers: allUsers || [],
      userFoundByClerkId: user || null,
      userFoundByEmail: userByEmail || null,
      comparison,
      errors: {
        userError: userError?.message || null,
        emailError: emailError?.message || null
      },
      environmentCheck: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
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
