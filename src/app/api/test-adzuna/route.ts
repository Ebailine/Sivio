import { NextResponse } from 'next/server'
import { adzunaClient } from '@/lib/services/adzuna-client'

export async function GET() {
  try {
    const appId = process.env.ADZUNA_APP_ID
    const apiKey = process.env.ADZUNA_API_KEY

    // Test a simple API call
    const results = await adzunaClient.searchJobs({
      results_per_page: 1,
    })

    return NextResponse.json({
      success: true,
      hasCredentials: {
        appId: !!appId,
        apiKey: !!apiKey,
        appIdLength: appId?.length || 0,
        apiKeyLength: apiKey?.length || 0,
      },
      apiTest: {
        jobCount: results.count,
        resultsReturned: results.jobs.length,
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
