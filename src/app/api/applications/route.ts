/**
 * Applications API - Create and List Applications
 * POST: Mark job as applied (creates application)
 * GET: Fetch all user's applications for CRM
 */

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'

// POST /api/applications - Create new application (Mark as Applied)
export async function POST(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      jobId,
      jobTitle,
      companyName,
      companyLogoUrl,
      location,
      employmentType,
      seniorityLevel,
      salaryRange,
    } = body

    // Validate required fields
    if (!jobId || !jobTitle || !companyName) {
      return NextResponse.json(
        { error: 'Missing required fields: jobId, jobTitle, companyName' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Get user from Supabase
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if already applied to this job
    const { data: existing } = await supabase
      .from('applications')
      .select('id')
      .eq('user_id', user.id)
      .eq('job_id', jobId)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Already applied to this job', applicationId: existing.id },
        { status: 409 }
      )
    }

    // Create new application
    const { data: application, error } = await supabase
      .from('applications')
      .insert({
        user_id: user.id,
        job_id: jobId,
        job_title: jobTitle,
        company_name: companyName,
        company_logo_url: companyLogoUrl || null,
        location: location || null,
        employment_type: employmentType || null,
        seniority_level: seniorityLevel || null,
        salary_range: salaryRange || null,
        stage: 'applied',
        status: 'Application Submitted',
        applied_date: new Date().toISOString(),
        notes: [],
      })
      .select()
      .single()

    if (error) throw error

    // TODO: Send webhook to n8n for automation (email sequence, etc.)
    // await fetch(process.env.N8N_WEBHOOK_APPLICATION_CREATED!, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ application, userId, event: 'application.created' })
    // })

    return NextResponse.json({ application }, { status: 201 })

  } catch (error: any) {
    console.error('Create application error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// GET /api/applications - Fetch all user's applications
export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

    // Get user from Supabase
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Fetch all applications for this user
    const { data: applications, error } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Calculate stats
    const stats = {
      total: applications?.length || 0,
      applied: applications?.filter(a => a.stage === 'applied').length || 0,
      interviewing: applications?.filter(a => a.stage === 'interviewing').length || 0,
      offer: applications?.filter(a => a.stage === 'offer').length || 0,
      accepted: applications?.filter(a => a.stage === 'accepted').length || 0,
      rejected: applications?.filter(a => a.stage === 'rejected').length || 0,
    }

    return NextResponse.json({
      applications: applications || [],
      stats,
    })

  } catch (error: any) {
    console.error('Fetch applications error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
