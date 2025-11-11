#!/usr/bin/env tsx

/**
 * Cache System Testing Script
 * Tests all CacheManager functionality
 */

// Load environment variables
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(__dirname, '../../.env.local') })

import { cacheManager } from '../lib/services/cache-manager'

async function testCache() {
  console.log('🧪 Testing Cache System')
  console.log('=' .repeat(60))
  console.log('')

  let testsPassed = 0
  let testsFailed = 0

  // =====================================================
  // TEST 1: Company Research Cache
  // =====================================================
  console.log('TEST 1: Company Research Cache')
  console.log('-'.repeat(60))

  try {
    // Set company research cache
    const testCompany = {
      company_domain: 'test-company.com',
      company_name: 'Test Company Inc',
      verified_domain: 'test-company.com',
      team_structure: {
        total_employees: 500,
        departments: { engineering: 150, sales: 100, hr: 50 },
      },
      office_locations: [
        { city: 'San Francisco', country: 'US', is_hq: true },
        { city: 'New York', country: 'US', is_hq: false },
      ],
      departments: ['Engineering', 'Sales', 'HR'],
      company_size_category: 'scaleup' as const,
      industry: 'Technology',
      linkedin_url: 'https://linkedin.com/company/test-company',
      company_description: 'A test company for cache testing',
      founded_year: 2020,
    }

    console.log('  → Setting company research cache...')
    const setResult = await cacheManager.setCompanyResearch(testCompany)
    if (setResult) {
      console.log('  ✅ Company cache set successfully')
      testsPassed++
    } else {
      console.log('  ❌ Failed to set company cache')
      testsFailed++
    }

    // Get company research cache
    console.log('  → Getting company research cache...')
    const getResult = await cacheManager.getCompanyResearch('test-company.com')
    if (getResult && getResult.company_name === 'Test Company Inc') {
      console.log('  ✅ Company cache retrieved successfully')
      console.log(`  📊 Cache hit count: ${getResult.cache_hit_count}`)
      testsPassed++
    } else {
      console.log('  ❌ Failed to get company cache')
      testsFailed++
    }

    // Test cache hit increment
    console.log('  → Testing cache hit count increment...')
    const getResult2 = await cacheManager.getCompanyResearch('test-company.com')
    if (getResult2 && getResult2.cache_hit_count > getResult!.cache_hit_count) {
      console.log(`  ✅ Cache hit count incremented: ${getResult2.cache_hit_count}`)
      testsPassed++
    } else {
      console.log('  ❌ Cache hit count did not increment')
      testsFailed++
    }

  } catch (error: any) {
    console.log('  ❌ Company cache test failed:', error.message)
    testsFailed++
  }

  console.log('')

  // =====================================================
  // TEST 2: Contact Search Results Cache
  // =====================================================
  console.log('TEST 2: Contact Search Results Cache')
  console.log('-'.repeat(60))

  try {
    const testSearchCache = {
      company_domain: 'test-company.com',
      job_title: 'Software Engineer',
      job_description: 'Looking for a senior software engineer with React experience',
      search_strategy: {
        targetTitles: ['Engineering Manager', 'VP Engineering', 'CTO'],
        targetDepartments: ['Engineering', 'Technology'],
        approach: 'Target senior engineering leadership',
        reasoning: 'Senior engineers are best contacts for hiring decisions',
      },
      strategy_confidence: 85,
      contacts: [
        {
          email: 'john@test-company.com',
          first_name: 'John',
          last_name: 'Doe',
          position: 'VP Engineering',
          relevance_score: 95,
        },
        {
          email: 'jane@test-company.com',
          first_name: 'Jane',
          last_name: 'Smith',
          position: 'Engineering Manager',
          relevance_score: 88,
        },
      ],
      contact_count: 2,
      avg_relevance_score: 91.5,
      key_decision_maker_count: 2,
    }

    console.log('  → Setting contact search cache...')
    const setResult = await cacheManager.setContactSearchResults(testSearchCache)
    if (setResult) {
      console.log('  ✅ Contact search cache set successfully')
      testsPassed++
    } else {
      console.log('  ❌ Failed to set contact search cache')
      testsFailed++
    }

    // Get contact search cache
    console.log('  → Getting contact search cache...')
    const getResult = await cacheManager.getContactSearchResults(
      'test-company.com',
      'Software Engineer',
      'Looking for a senior software engineer with React experience'
    )
    if (getResult && getResult.contact_count === 2) {
      console.log('  ✅ Contact search cache retrieved successfully')
      console.log(`  📊 Contacts found: ${getResult.contact_count}`)
      console.log(`  📊 Avg relevance: ${getResult.avg_relevance_score}%`)
      testsPassed++
    } else {
      console.log('  ❌ Failed to get contact search cache')
      testsFailed++
    }

    // Test NULL job description matching
    console.log('  → Testing NULL job description handling...')
    const nullDescResult = await cacheManager.getContactSearchResults(
      'test-company.com',
      'Software Engineer',
      undefined
    )
    if (nullDescResult === null) {
      console.log('  ✅ NULL job description handled correctly (no match)')
      testsPassed++
    } else {
      console.log('  ❌ NULL job description matching incorrect')
      testsFailed++
    }

  } catch (error: any) {
    console.log('  ❌ Contact search cache test failed:', error.message)
    testsFailed++
  }

  console.log('')

  // =====================================================
  // TEST 3: Search Logging
  // =====================================================
  console.log('TEST 3: Search Logging')
  console.log('-'.repeat(60))

  try {
    const testLog = {
      user_id: '00000000-0000-0000-0000-000000000000', // Placeholder UUID
      company_name: 'Test Company Inc',
      company_domain: 'test-company.com',
      job_title: 'Software Engineer',
      job_id: undefined,
      cache_hit: true,
      contacts_found: 2,
      contacts_returned: 2,
      strategy_confidence: 85,
      snov_credits_used: 0,
      platform_credits_charged: 0,
      response_time_ms: 150,
      api_calls_made: 0,
      search_strategy: { approach: 'cached' },
    }

    console.log('  → Logging search...')
    const logResult = await cacheManager.logSearch(testLog)
    if (logResult) {
      console.log('  ✅ Search logged successfully')
      testsPassed++
    } else {
      console.log('  ❌ Failed to log search')
      testsFailed++
    }

  } catch (error: any) {
    console.log('  ❌ Search logging test failed:', error.message)
    testsFailed++
  }

  console.log('')

  // =====================================================
  // TEST 4: Cache Statistics
  // =====================================================
  console.log('TEST 4: Cache Statistics')
  console.log('-'.repeat(60))

  try {
    console.log('  → Getting cache stats (7 days)...')
    const stats = await cacheManager.getCacheStats(7)
    if (stats) {
      console.log('  ✅ Cache stats retrieved successfully')
      console.log(`  📊 Total searches: ${stats.total_searches}`)
      console.log(`  📊 Cache hits: ${stats.cache_hits}`)
      console.log(`  📊 Hit rate: ${stats.hit_rate}%`)
      console.log(`  📊 Avg response time: ${stats.avg_response_time_ms}ms`)
      console.log(`  📊 Credits saved: ${stats.total_credits_saved}`)
      testsPassed++
    } else {
      console.log('  ❌ Failed to get cache stats')
      testsFailed++
    }

    console.log('  → Getting table stats...')
    const tableStats = await cacheManager.getCacheTableStats()
    if (tableStats) {
      console.log('  ✅ Table stats retrieved successfully')
      console.log(`  📊 Company cache entries: ${tableStats.company_cache_count}`)
      console.log(`  📊 Contact cache entries: ${tableStats.contact_cache_count}`)
      console.log(`  📊 Search logs: ${tableStats.search_logs_count}`)
      console.log(`  📊 Expired company caches: ${tableStats.expired_company_caches}`)
      console.log(`  📊 Expired contact caches: ${tableStats.expired_contact_caches}`)
      testsPassed++
    } else {
      console.log('  ❌ Failed to get table stats')
      testsFailed++
    }

  } catch (error: any) {
    console.log('  ❌ Cache statistics test failed:', error.message)
    testsFailed++
  }

  console.log('')

  // =====================================================
  // TEST 5: Cache Cleanup
  // =====================================================
  console.log('TEST 5: Cache Cleanup')
  console.log('-'.repeat(60))

  try {
    console.log('  → Running cleanup (should delete 0 expired entries)...')
    const cleanupResult = await cacheManager.cleanupExpiredCaches()
    if (cleanupResult) {
      console.log('  ✅ Cleanup executed successfully')
      console.log(`  🧹 Company caches deleted: ${cleanupResult.company_cache_deleted}`)
      console.log(`  🧹 Contact caches deleted: ${cleanupResult.contact_cache_deleted}`)
      testsPassed++
    } else {
      console.log('  ❌ Failed to run cleanup')
      testsFailed++
    }

  } catch (error: any) {
    console.log('  ❌ Cache cleanup test failed:', error.message)
    testsFailed++
  }

  console.log('')

  // =====================================================
  // TEST 6: Cache Invalidation
  // =====================================================
  console.log('TEST 6: Cache Invalidation')
  console.log('-'.repeat(60))

  try {
    console.log('  → Invalidating company cache...')
    const invalidateCompany = await cacheManager.invalidateCompanyCache('test-company.com')
    if (invalidateCompany) {
      console.log('  ✅ Company cache invalidated')
      testsPassed++
    } else {
      console.log('  ❌ Failed to invalidate company cache')
      testsFailed++
    }

    console.log('  → Invalidating contact search cache...')
    const invalidateContacts = await cacheManager.invalidateContactCache('test-company.com')
    if (invalidateContacts) {
      console.log('  ✅ Contact cache invalidated')
      testsPassed++
    } else {
      console.log('  ❌ Failed to invalidate contact cache')
      testsFailed++
    }

    // Verify caches were deleted
    console.log('  → Verifying caches were deleted...')
    const getCompany = await cacheManager.getCompanyResearch('test-company.com')
    const getContacts = await cacheManager.getContactSearchResults('test-company.com', 'Software Engineer')
    if (getCompany === null && getContacts === null) {
      console.log('  ✅ Caches successfully deleted')
      testsPassed++
    } else {
      console.log('  ❌ Caches still exist after invalidation')
      testsFailed++
    }

  } catch (error: any) {
    console.log('  ❌ Cache invalidation test failed:', error.message)
    testsFailed++
  }

  // =====================================================
  // SUMMARY
  // =====================================================
  console.log('')
  console.log('=' .repeat(60))
  console.log('📊 TEST SUMMARY')
  console.log('=' .repeat(60))
  console.log(`✅ Tests passed: ${testsPassed}`)
  console.log(`❌ Tests failed: ${testsFailed}`)
  console.log(`📈 Success rate: ${Math.round((testsPassed / (testsPassed + testsFailed)) * 100)}%`)
  console.log('')

  if (testsFailed === 0) {
    console.log('🎉 ALL TESTS PASSED! Cache system is working correctly.')
    process.exit(0)
  } else {
    console.log('⚠️  Some tests failed. Please review the errors above.')
    process.exit(1)
  }
}

// Run tests
testCache().catch((error) => {
  console.error('❌ Fatal error running tests:', error)
  process.exit(1)
})
