/**
 * Test Adzuna API
 * DEPRECATED - Migrating to Apify for job data
 * This file is commented out and kept for reference only
 */

import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'Adzuna integration deprecated - migrating to Apify',
  }, { status: 410 })
}

/*
import { NextResponse } from 'next/server'
import { adzunaClient } from '@/lib/services/adzuna-client'

export async function GET() {
  try {
    // Test a simple API call to verify credentials work
    const results = await adzunaClient.searchJobs({
      results_per_page: 1,
    })

    return NextResponse.json({
      success: true,
      message: 'API call successful!',
      data: {
        totalJobs: results.count,
        jobsReturned: results.jobs.length,
      },
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    })
  }
}
*/
