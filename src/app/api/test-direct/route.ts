/**
 * Test Direct Adzuna API
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

export async function GET() {
  const appId = process.env.ADZUNA_APP_ID?.trim() || ''
  const apiKey = process.env.ADZUNA_API_KEY?.trim() || ''

  // Test 1: No parameters at all (like successful curl earlier)
  const url1 = `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${appId}&app_key=${apiKey}&results_per_page=1`

  // Test 2: With category parameter
  const url2 = `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${appId}&app_key=${apiKey}&results_per_page=1&category=accounting-finance-jobs`

  const results = []

  try {
    console.log('Test 1 URL:', url1)
    const res1 = await fetch(url1)
    const data1 = await res1.json()
    results.push({
      test: 'No category',
      success: res1.ok,
      status: res1.status,
      count: data1.count || 0,
    })
  } catch (error: any) {
    results.push({
      test: 'No category',
      success: false,
      error: error.message,
    })
  }

  try {
    console.log('Test 2 URL:', url2)
    const res2 = await fetch(url2)
    const text2 = await res2.text()
    const data2 = text2.startsWith('{') ? JSON.parse(text2) : { error: text2.substring(0, 200) }
    results.push({
      test: 'With category',
      success: res2.ok,
      status: res2.status,
      count: data2.count || 0,
      error: data2.error,
    })
  } catch (error: any) {
    results.push({
      test: 'With category',
      success: false,
      error: error.message,
    })
  }

  return NextResponse.json({
    appIdLength: appId.length,
    apiKeyLength: apiKey.length,
    results,
  })
}
*/
