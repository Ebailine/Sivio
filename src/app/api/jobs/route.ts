/**
 * Jobs API with Advanced Filters
 * Supports: search, job type, remote, location, category, salary range
 * Only returns active (non-archived) jobs
 */

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = (page - 1) * limit

    // Filters
    const search = searchParams.get('search') || ''
    const jobType = searchParams.get('jobType') || ''
    const remote = searchParams.get('remote')
    const location = searchParams.get('location') || ''
    const category = searchParams.get('category') || ''
    const salaryMin = searchParams.get('salaryMin')
    const salaryMax = searchParams.get('salaryMax')

    const supabase = createAdminClient()

    // Build query
    let query = supabase
      .from('jobs')
      .select('*', { count: 'exact' })
      .eq('is_archived', false) // Only active jobs

    // Search filter (title, company, location, description)
    if (search) {
      query = query.or(`title.ilike.%${search}%,company.ilike.%${search}%,location.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Job type filter
    if (jobType) {
      query = query.eq('job_type', jobType)
    }

    // Remote filter
    if (remote !== null && remote !== '') {
      query = query.eq('remote', remote === 'true')
    }

    // Location filter
    if (location) {
      query = query.ilike('location', `%${location}%`)
    }

    // Category filter
    if (category) {
      query = query.ilike('category', `%${category}%`)
    }

    // Salary filters
    if (salaryMin) {
      const minSalary = parseInt(salaryMin)
      if (!isNaN(minSalary)) {
        query = query.gte('salary_min', minSalary)
      }
    }

    if (salaryMax) {
      const maxSalary = parseInt(salaryMax)
      if (!isNaN(maxSalary)) {
        query = query.lte('salary_max', maxSalary)
      }
    }

    // Sort by posted date (newest first)
    query = query.order('posted_date', { ascending: false })

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: jobs, error, count } = await query

    if (error) throw error

    return NextResponse.json({
      jobs: jobs || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })

  } catch (error: any) {
    console.error('Jobs API error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
