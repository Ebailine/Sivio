import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain')
    const jobId = searchParams.get('jobId')

    if (!domain && !jobId) {
      return NextResponse.json(
        { error: 'Either domain or jobId required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Get user from Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Build query based on parameters
    let query = supabase
      .from('contacts')
      .select('*')
      .order('relevance_score', { ascending: false })

    if (domain) {
      query = query.eq('company_domain', domain)
    }

    if (jobId) {
      query = query.contains('metadata', { job_id: jobId })
    }

    const { data: contacts, error } = await query

    if (error) {
      console.error('Failed to fetch contacts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch contacts' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      contacts: contacts || []
    })

  } catch (error: any) {
    console.error('Get contacts error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
