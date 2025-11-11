/**
 * Cache Cleanup Cron Endpoint
 * Called by Vercel Cron to clean up expired cache entries
 * Runs daily at 3 AM UTC
 */

import { NextResponse } from 'next/server'
import { cacheManager } from '@/lib/services/cache-manager'

export async function GET(request: Request) {
  console.log('🧹 Cache cleanup cron triggered')

  try {
    // Verify the request is from Vercel Cron (optional but recommended)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.error('❌ Unauthorized cron request')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const startTime = Date.now()

    // Get table stats before cleanup
    const statsBefore = await cacheManager.getCacheTableStats()
    if (!statsBefore) {
      console.error('❌ Failed to get cache stats before cleanup')
      return NextResponse.json(
        { error: 'Failed to get cache statistics' },
        { status: 500 }
      )
    }

    console.log('📊 Before cleanup:')
    console.log(`  - Company cache entries: ${statsBefore.company_cache_count}`)
    console.log(`  - Contact cache entries: ${statsBefore.contact_cache_count}`)
    console.log(`  - Expired company caches: ${statsBefore.expired_company_caches}`)
    console.log(`  - Expired contact caches: ${statsBefore.expired_contact_caches}`)

    // Run cleanup
    const cleanupResult = await cacheManager.cleanupExpiredCaches()
    if (!cleanupResult) {
      console.error('❌ Cache cleanup failed')
      return NextResponse.json(
        { error: 'Cache cleanup failed' },
        { status: 500 }
      )
    }

    // Get table stats after cleanup
    const statsAfter = await cacheManager.getCacheTableStats()
    if (!statsAfter) {
      console.error('❌ Failed to get cache stats after cleanup')
      return NextResponse.json(
        { error: 'Failed to get cache statistics' },
        { status: 500 }
      )
    }

    const executionTime = Date.now() - startTime

    console.log('📊 After cleanup:')
    console.log(`  - Company cache entries: ${statsAfter.company_cache_count}`)
    console.log(`  - Contact cache entries: ${statsAfter.contact_cache_count}`)
    console.log(`  - Deleted company caches: ${cleanupResult.company_cache_deleted}`)
    console.log(`  - Deleted contact caches: ${cleanupResult.contact_cache_deleted}`)
    console.log(`⏱️  Execution time: ${executionTime}ms`)

    console.log('✅ Cache cleanup completed successfully')

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      execution_time_ms: executionTime,
      before: {
        company_cache_count: statsBefore.company_cache_count,
        contact_cache_count: statsBefore.contact_cache_count,
        expired_company_caches: statsBefore.expired_company_caches,
        expired_contact_caches: statsBefore.expired_contact_caches,
      },
      after: {
        company_cache_count: statsAfter.company_cache_count,
        contact_cache_count: statsAfter.contact_cache_count,
        expired_company_caches: statsAfter.expired_company_caches,
        expired_contact_caches: statsAfter.expired_contact_caches,
      },
      deleted: {
        company_caches: cleanupResult.company_cache_deleted,
        contact_caches: cleanupResult.contact_cache_deleted,
        total: cleanupResult.company_cache_deleted + cleanupResult.contact_cache_deleted,
      },
    })

  } catch (error: any) {
    console.error('❌ Cache cleanup error:', error)
    return NextResponse.json(
      {
        error: 'Cache cleanup failed',
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
