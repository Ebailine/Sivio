/**
 * Job Sync API
 * Manually trigger job sync from Adzuna or check sync status
 * Also used by Vercel cron for daily auto-sync
 */

import { NextResponse } from 'next/server'
import { jobSyncService } from '@/lib/services/job-sync-service'

export const maxDuration = 300 // 5 minutes for Vercel serverless function

/**
 * POST /api/jobs/sync
 * Trigger manual job sync from Adzuna
 */
export async function POST(request: Request) {
  try {
    console.log('=== Manual Job Sync Triggered ===')

    // Parse request body (optional parameters)
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

/**
 * GET /api/jobs/sync
 * Check sync status and statistics
 */
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
