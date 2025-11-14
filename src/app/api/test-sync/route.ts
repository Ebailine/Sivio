/**
 * Test Sync with Adzuna
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
  const categories = [
    'accounting-finance-jobs',
    'hr-recruitment-jobs',
    'marketing-advertising-pr-jobs',
    'sales-jobs',
  ]

  const results = []

  for (const category of categories) {
    try {
      console.log(`Testing category: ${category}`)

      const searchResults = await adzunaClient.searchJobs({
        category,
        salary_min: 30000,
        salary_max: 90000,
        max_days_old: 30,
        results_per_page: 5,
        page: 1,
      })

      results.push({
        category,
        success: true,
        count: searchResults.count,
        jobsReturned: searchResults.jobs.length,
        firstJobTitle: searchResults.jobs[0]?.title || 'N/A',
        note: 'Check Vercel logs for URL',
      })
    } catch (error: any) {
      results.push({
        category,
        success: false,
        error: error.message,
        stack: error.stack?.substring(0, 500),
      })
    }
  }

  return NextResponse.json({
    success: true,
    results,
    summary: {
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
    },
  })
}
*/
