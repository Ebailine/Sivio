/**
 * Single Job API - Apify/LinkedIn Schema
 * Get job by job_id
 */

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Job } from '@/types/job'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createAdminClient()

    // Query by job_id (primary key in new schema)
    const { data: job, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('job_id', id)
      .single()

    if (error) {
      // If not found by job_id, return 404
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        )
      }
      throw error
    }

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ job: job as Job })
  } catch (error: any) {
    console.error('Get job error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Delete job by job_id (admin only)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('job_id', id)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Job deleted successfully'
    })
  } catch (error: any) {
    console.error('Delete job error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
