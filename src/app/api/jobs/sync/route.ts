/**
 * Job Sync API
 * DEPRECATED - Migrating to Apify for job data
 *
 * This endpoint is temporarily disabled while migrating from Adzuna to Apify.
 * The GET endpoint still works to show current database stats.
 */

import { NextResponse } from 'next/server'
import { jobSyncService } from '@/lib/services/job-sync-service'

export const maxDuration = 300 // 5 minutes for Vercel serverless function

/**
 * POST /api/jobs/sync
 * DISABLED - Migrating to Apify
 */
export async function POST(request: Request) {
  return NextResponse.json({
    success: false,
    error: 'Job sync temporarily disabled - migrating from Adzuna to Apify',
    message: 'This endpoint will be re-enabled once Apify integration is complete',
  }, { status: 503 }) // Service Unavailable
}

/**
 * GET /api/jobs/sync
 * Check sync status and statistics (still works with existing data)
 */
export async function GET() {
  try {
    const stats = await jobSyncService.getSyncStats()

    return NextResponse.json({
      success: true,
      ...stats,
      notice: 'Job sync temporarily disabled - migrating from Adzuna to Apify',
    })

  } catch (error: any) {
    console.error('Get sync stats error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}

/*
=== ORIGINAL IMPLEMENTATION (ADZUNA) ===

import { NextResponse } from 'next/server'
import { jobSyncService } from '@/lib/services/job-sync-service'

export const maxDuration = 300

export async function POST(request: Request) {
  try {
    console.log('=== Manual Job Sync Triggered ===')

    const body = await request.json().catch(() => ({}))
    const { maxJobs = 1000 } = body

    console.log('Starting job sync with maxJobs:', maxJobs)

    const stats = await jobSyncService.syncJobs({
      maxJobs,
      archiveOldJobs: true,
    })

    console.log('Sync completed successfully')

    return NextResponse.json({
      success: true,
      stats,
      message: `Synced ${stats.new} new jobs, updated ${stats.updated}, archived ${stats.archived}`,
    })

  } catch (error: any) {
    console.error('Sync error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const stats = await jobSyncService.getSyncStats()

    return NextResponse.json({
      success: true,
      ...stats,
    })

  } catch (error: any) {
    console.error('Get sync stats error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}
*/
