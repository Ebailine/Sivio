import { NextResponse } from 'next/server'
import { adzunaClient } from '@/lib/services/adzuna-client'

export async function GET() {
  try {
    const appId = process.env.ADZUNA_APP_ID
    const apiKey = process.env.ADZUNA_API_KEY

    return NextResponse.json({
      success: true,
      hasCredentials: {
        appId: !!appId,
        apiKey: !!apiKey,
        appIdValue: appId || 'NOT_SET',
        apiKeyValue: apiKey || 'NOT_SET',
      },
      message: 'Credentials check only - not calling API yet',
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    })
  }
}
