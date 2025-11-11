import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search') || ''
    const jobType = searchParams.get('jobType') || ''
    const remote = searchParams.get('remote')

    const offset = (page - 1) * limit

    const supabase = createAdminClient()

    // Build query
    let query = supabase
      .from('jobs')
      .select('*', { count: 'exact' })

    // Apply search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,company.ilike.%${search}%,location.ilike.%${search}%`)
    }

    // Apply job type filter
    if (jobType) {
      query = query.eq('job_type', jobType)
    }

    // Apply remote filter
    if (remote !== null && remote !== '') {
      query = query.eq('remote', remote === 'true')
    }

    // Order by posted date (newest first)
    query = query.order('posted_date', { ascending: false })

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: jobs, error, count } = await query

    if (error) throw error

    return NextResponse.json({
      jobs,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
