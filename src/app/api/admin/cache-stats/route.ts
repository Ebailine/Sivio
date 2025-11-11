/**
 * Cache Statistics and Management API
 * GET: Retrieve cache statistics
 * POST: Perform cache cleanup operations
 */

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { cacheManager } from '@/lib/services/cache-manager'

/**
 * GET /api/admin/cache-stats
 * Returns comprehensive cache statistics
 */
export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const daysBack = parseInt(searchParams.get('days') || '7', 10)

    console.log(`📊 Fetching cache stats for last ${daysBack} days...`)

    // Get cache hit rate statistics
    const hitRateStats = await cacheManager.getCacheStats(daysBack)

    // Get cache table statistics
    const tableStats = await cacheManager.getCacheTableStats()

    if (!hitRateStats || !tableStats) {
      return NextResponse.json(
        { error: 'Failed to retrieve cache statistics' },
        { status: 500 }
      )
    }

    // Calculate additional metrics
    const response = {
      success: true,
      period: {
        days_back: daysBack,
        from_date: new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString(),
        to_date: new Date().toISOString(),
      },
      performance: {
        total_searches: hitRateStats.total_searches,
        cache_hits: hitRateStats.cache_hits,
        cache_misses: hitRateStats.cache_misses,
        hit_rate_percentage: hitRateStats.hit_rate,
        avg_response_time_ms: hitRateStats.avg_response_time_ms,
      },
      savings: {
        total_credits_saved: hitRateStats.total_credits_saved,
        estimated_cost_saved: hitRateStats.total_credits_saved * 0.10, // Assuming $0.10 per credit
      },
      cache_tables: {
        company_research: {
          total_entries: tableStats.company_cache_count,
          expired_entries: tableStats.expired_company_caches,
          active_entries: tableStats.company_cache_count - tableStats.expired_company_caches,
        },
        contact_search_results: {
          total_entries: tableStats.contact_cache_count,
          expired_entries: tableStats.expired_contact_caches,
          active_entries: tableStats.contact_cache_count - tableStats.expired_contact_caches,
        },
        search_logs: {
          total_entries: tableStats.search_logs_count,
        },
      },
      recommendations: generateRecommendations(hitRateStats, tableStats),
    }

    console.log('✅ Cache stats retrieved successfully')
    return NextResponse.json(response)

  } catch (error: any) {
    console.error('Error fetching cache stats:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch cache statistics',
        message: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/cache-stats
 * Perform cache management operations
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, target } = body

    console.log(`🔧 Performing cache operation: ${action}`)

    switch (action) {
      case 'cleanup':
        // Clean up expired cache entries
        const cleanupResult = await cacheManager.cleanupExpiredCaches()
        if (!cleanupResult) {
          return NextResponse.json(
            { error: 'Failed to cleanup caches' },
            { status: 500 }
          )
        }
        return NextResponse.json({
          success: true,
          action: 'cleanup',
          result: {
            company_cache_deleted: cleanupResult.company_cache_deleted,
            contact_cache_deleted: cleanupResult.contact_cache_deleted,
            total_deleted: cleanupResult.company_cache_deleted + cleanupResult.contact_cache_deleted,
          },
        })

      case 'invalidate_company':
        // Invalidate specific company cache
        if (!target || !target.domain) {
          return NextResponse.json(
            { error: 'Missing domain parameter' },
            { status: 400 }
          )
        }
        const companyResult = await cacheManager.invalidateCompanyCache(target.domain)
        if (!companyResult) {
          return NextResponse.json(
            { error: 'Failed to invalidate company cache' },
            { status: 500 }
          )
        }
        return NextResponse.json({
          success: true,
          action: 'invalidate_company',
          domain: target.domain,
        })

      case 'invalidate_contacts':
        // Invalidate contact search cache for a company
        if (!target || !target.domain) {
          return NextResponse.json(
            { error: 'Missing domain parameter' },
            { status: 400 }
          )
        }
        const contactResult = await cacheManager.invalidateContactCache(target.domain)
        if (!contactResult) {
          return NextResponse.json(
            { error: 'Failed to invalidate contact cache' },
            { status: 500 }
          )
        }
        return NextResponse.json({
          success: true,
          action: 'invalidate_contacts',
          domain: target.domain,
        })

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

  } catch (error: any) {
    console.error('Error performing cache operation:', error)
    return NextResponse.json(
      {
        error: 'Cache operation failed',
        message: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * Generate recommendations based on cache statistics
 */
function generateRecommendations(
  hitRateStats: any,
  tableStats: any
): string[] {
  const recommendations: string[] = []

  // Low hit rate warning
  if (hitRateStats.hit_rate < 30) {
    recommendations.push(
      '⚠️ Cache hit rate is low. Consider increasing cache TTL or analyzing search patterns.'
    )
  }

  // High hit rate success
  if (hitRateStats.hit_rate >= 70) {
    recommendations.push(
      '✅ Excellent cache hit rate! The caching system is working effectively.'
    )
  }

  // Too many expired entries
  const totalExpired = tableStats.expired_company_caches + tableStats.expired_contact_caches
  if (totalExpired > 100) {
    recommendations.push(
      `🧹 ${totalExpired} expired cache entries detected. Run cleanup to free up space.`
    )
  }

  // No searches in period
  if (hitRateStats.total_searches === 0) {
    recommendations.push(
      '📭 No searches in this period. Cache statistics may not be representative.'
    )
  }

  // Good performance
  if (hitRateStats.avg_response_time_ms < 500) {
    recommendations.push(
      '⚡ Response times are excellent. Cache is performing optimally.'
    )
  }

  // Slow performance
  if (hitRateStats.avg_response_time_ms > 2000) {
    recommendations.push(
      '🐌 Response times are slow. Consider optimizing queries or database indexes.'
    )
  }

  return recommendations
}
