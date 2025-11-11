import { NextResponse } from 'next/server'
import { snovClient } from '@/lib/snov/client'

export async function GET() {
  try {
    console.log('Testing Snov.io credentials...')
    console.log('User ID exists:', !!process.env.SNOV_USER_ID)
    console.log('Secret exists:', !!process.env.SNOV_CLIENT_SECRET)

    // Try to get access token
    const token = await snovClient.getAccessToken()
    console.log('Access token obtained:', !!token)

    // Try a simple search
    const results = await snovClient.searchByDomain('google.com', 5)
    console.log('Search results:', results?.length || 0)

    return NextResponse.json({
      success: true,
      message: 'Snov.io credentials are working',
      resultsCount: results?.length || 0,
      sampleResult: results?.[0] || null,
    })
  } catch (error: any) {
    console.error('Snov.io test failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    )
  }
}
