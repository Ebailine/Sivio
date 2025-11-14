/**
 * Jobs API with Advanced Filters - Apify/LinkedIn Schema
 * Supports: search, employment type, seniority, location, easy apply
 */

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { JobFilters, PaginatedJobsResponse } from '@/types/job'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = (page - 1) * limit

    // Filters
    const search = searchParams.get('search') || ''
    const employmentType = searchParams.get('employment_type') || searchParams.get('employmentType') || ''
    const seniorityLevel = searchParams.get('seniority_level') || searchParams.get('seniorityLevel') || ''
    const location = searchParams.get('location') || ''
    const jobFunction = searchParams.get('job_function') || searchParams.get('jobFunction') || ''
    const easyApply = searchParams.get('easy_apply') || searchParams.get('easyApply')
    const timePostedAfter = searchParams.get('time_posted_after') || searchParams.get('timePostedAfter')

    const supabase = createAdminClient()

    // Build query - select all jobs
    let query = supabase
      .from('jobs')
      .select('*', { count: 'exact' })

    // Search filter (job_title, company_name, location, job_description)
    if (search) {
      query = query.or(
        `job_title.ilike.%${search}%,company_name.ilike.%${search}%,location.ilike.%${search}%,job_description.ilike.%${search}%`
      )
    }

    // Employment type filter (Full-time, Part-time, Contract, Internship, etc.)
    if (employmentType) {
      query = query.eq('employment_type', employmentType)
    }

    // Seniority level filter (Entry level, Mid-Senior level, etc.)
    if (seniorityLevel) {
      query = query.eq('seniority_level', seniorityLevel)
    }

    // Location filter
    if (location) {
      query = query.ilike('location', `%${location}%`)
    }

    // Job function filter (Engineering, Sales, Marketing, etc.)
    if (jobFunction) {
      query = query.eq('job_function', jobFunction)
    }

    // Easy Apply filter
    if (easyApply !== null && easyApply !== '') {
      query = query.eq('easy_apply', easyApply === 'true')
    }

    // Note: time_posted is now TEXT from LinkedIn (e.g., "2 days ago")
    // For date filtering and sorting, use created_at instead
    if (timePostedAfter) {
      query = query.gte('created_at', timePostedAfter)
    }

    // Sort by created_at (when imported to DB) since time_posted is text
    query = query.order('created_at', { ascending: false })

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: jobs, error, count } = await query

    if (error) throw error

    const response: PaginatedJobsResponse = {
      jobs: jobs || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    }

    return NextResponse.json(response)

  } catch (error: any) {
    console.error('Jobs API error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST - Create new job (for n8n webhook)
 * Body should match ApifyJobInput interface
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = ['job_id', 'job_title', 'job_url', 'apply_url', 'job_description', 'company_name', 'location']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    const supabase = createAdminClient()

    // Insert or update job (upsert based on job_id)
    const { data: job, error } = await supabase
      .from('jobs')
      .upsert({
        job_id: body.job_id,
        job_title: body.job_title,
        job_url: body.job_url,
        apply_url: body.apply_url,
        job_description: body.job_description,
        job_description_raw_html: body.job_description_raw_html || null,
        company_name: body.company_name,
        company_url: body.company_url || null,
        company_logo_url: body.company_logo_url || null,
        location: body.location,
        employment_type: body.employment_type || null,
        seniority_level: body.seniority_level || null,
        job_function: body.job_function || null,
        industries: body.industries || [],
        salary_range: body.salary_range || null,
        num_applicants: body.num_applicants || null, // Text format from LinkedIn
        easy_apply: body.easy_apply || false,
        time_posted: body.time_posted || null, // Text format: "2 days ago"
      }, {
        onConflict: 'job_id',
        ignoreDuplicates: false, // Update if exists
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      job,
      message: 'Job created/updated successfully'
    }, { status: 201 })

  } catch (error: any) {
    console.error('Create job error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
