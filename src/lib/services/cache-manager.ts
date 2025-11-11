/**
 * Cache Manager Service
 * Handles all caching operations for AI contact discovery
 * Reduces API costs by caching company research and contact searches
 */

import { createAdminClient } from '@/lib/supabase/admin'

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface CompanyResearchCache {
  id: string
  company_domain: string
  company_name: string
  verified_domain: string
  team_structure?: {
    total_employees?: number
    departments?: Record<string, number>
  }
  office_locations?: Array<{
    city: string
    country: string
    is_hq?: boolean
  }>
  departments?: string[]
  company_size_category?: 'startup' | 'scaleup' | 'enterprise'
  industry?: string
  linkedin_url?: string
  company_description?: string
  founded_year?: number
  cache_hit_count: number
  last_accessed_at: string
  created_at: string
  expires_at: string
}

export interface ContactSearchCache {
  id: string
  company_domain: string
  job_title: string
  job_description?: string
  search_strategy: {
    targetTitles: string[]
    targetDepartments: string[]
    approach: string
    reasoning: string
  }
  strategy_confidence: number
  contacts: any[] // Array of contact objects with AI reasoning
  contact_count: number
  avg_relevance_score?: number
  key_decision_maker_count: number
  cache_hit_count: number
  last_accessed_at: string
  created_at: string
  expires_at: string
}

export interface SearchLog {
  user_id: string
  company_name: string
  company_domain: string
  job_title?: string
  job_id?: string
  cache_hit: boolean
  contacts_found: number
  contacts_returned: number
  strategy_confidence?: number
  snov_credits_used: number
  platform_credits_charged: number
  response_time_ms?: number
  api_calls_made: number
  search_strategy?: any
}

export interface CacheStats {
  total_searches: number
  cache_hits: number
  cache_misses: number
  hit_rate: number
  avg_response_time_ms: number
  total_credits_saved: number
}

// =====================================================
// CACHE MANAGER CLASS
// =====================================================

class CacheManager {
  private _supabase: ReturnType<typeof createAdminClient> | null = null

  private get supabase() {
    if (!this._supabase) {
      this._supabase = createAdminClient()
    }
    return this._supabase
  }

  // =====================================================
  // COMPANY RESEARCH CACHE
  // =====================================================

  /**
   * Get cached company research data
   * Returns null if not found or expired
   */
  async getCompanyResearch(domain: string): Promise<CompanyResearchCache | null> {
    try {
      const { data, error } = await this.supabase
        .from('company_research_cache')
        .select('*')
        .eq('company_domain', domain)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (error || !data) {
        return null
      }

      // Update cache hit count and last accessed time
      await this.supabase
        .from('company_research_cache')
        .update({
          cache_hit_count: data.cache_hit_count + 1,
          last_accessed_at: new Date().toISOString(),
        })
        .eq('id', data.id)

      return data as CompanyResearchCache
    } catch (error) {
      console.error('Error getting company research cache:', error)
      return null
    }
  }

  /**
   * Set company research cache data
   * Upserts (insert or update) based on domain
   */
  async setCompanyResearch(data: Omit<CompanyResearchCache, 'id' | 'cache_hit_count' | 'last_accessed_at' | 'created_at' | 'expires_at'>): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('company_research_cache')
        .upsert(
          {
            ...data,
            cache_hit_count: 0,
            last_accessed_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          },
          {
            onConflict: 'company_domain',
          }
        )

      if (error) {
        console.error('Error setting company research cache:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error setting company research cache:', error)
      return false
    }
  }

  // =====================================================
  // CONTACT SEARCH RESULTS CACHE
  // =====================================================

  /**
   * Get cached contact search results
   * Returns null if not found or expired
   */
  async getContactSearchResults(
    companyDomain: string,
    jobTitle: string,
    jobDescription?: string
  ): Promise<ContactSearchCache | null> {
    try {
      let query = this.supabase
        .from('contact_search_results_cache')
        .select('*')
        .eq('company_domain', companyDomain)
        .eq('job_title', jobTitle)
        .gt('expires_at', new Date().toISOString())

      // Handle job description matching (NULL or exact match)
      if (jobDescription) {
        query = query.eq('job_description', jobDescription)
      } else {
        query = query.is('job_description', null)
      }

      const { data, error } = await query.single()

      if (error || !data) {
        return null
      }

      // Update cache hit count and last accessed time
      await this.supabase
        .from('contact_search_results_cache')
        .update({
          cache_hit_count: data.cache_hit_count + 1,
          last_accessed_at: new Date().toISOString(),
        })
        .eq('id', data.id)

      return data as ContactSearchCache
    } catch (error) {
      console.error('Error getting contact search cache:', error)
      return null
    }
  }

  /**
   * Set contact search results cache
   */
  async setContactSearchResults(
    data: Omit<ContactSearchCache, 'id' | 'cache_hit_count' | 'last_accessed_at' | 'created_at' | 'expires_at'>
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('contact_search_results_cache')
        .insert({
          ...data,
          cache_hit_count: 0,
          last_accessed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        })

      if (error) {
        console.error('Error setting contact search cache:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error setting contact search cache:', error)
      return false
    }
  }

  // =====================================================
  // SEARCH LOGGING
  // =====================================================

  /**
   * Log a contact search attempt (cache hit or miss)
   */
  async logSearch(log: SearchLog): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('contact_search_logs')
        .insert({
          ...log,
          created_at: new Date().toISOString(),
        })

      if (error) {
        console.error('Error logging search:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error logging search:', error)
      return false
    }
  }

  // =====================================================
  // CACHE STATISTICS
  // =====================================================

  /**
   * Get cache statistics for the last N days
   */
  async getCacheStats(daysBack: number = 7): Promise<CacheStats | null> {
    try {
      const { data, error } = await this.supabase.rpc('get_cache_hit_rate', {
        days_back: daysBack,
      })

      if (error || !data || data.length === 0) {
        console.error('Error getting cache stats:', error)
        return null
      }

      return data[0] as CacheStats
    } catch (error) {
      console.error('Error getting cache stats:', error)
      return null
    }
  }

  /**
   * Get detailed cache table sizes and counts
   */
  async getCacheTableStats(): Promise<{
    company_cache_count: number
    contact_cache_count: number
    search_logs_count: number
    expired_company_caches: number
    expired_contact_caches: number
  } | null> {
    try {
      const now = new Date().toISOString()

      // Get counts for each table
      const [companyResult, contactResult, logsResult, expiredCompanyResult, expiredContactResult] = await Promise.all([
        this.supabase.from('company_research_cache').select('id', { count: 'exact', head: true }),
        this.supabase.from('contact_search_results_cache').select('id', { count: 'exact', head: true }),
        this.supabase.from('contact_search_logs').select('id', { count: 'exact', head: true }),
        this.supabase.from('company_research_cache').select('id', { count: 'exact', head: true }).lt('expires_at', now),
        this.supabase.from('contact_search_results_cache').select('id', { count: 'exact', head: true }).lt('expires_at', now),
      ])

      return {
        company_cache_count: companyResult.count || 0,
        contact_cache_count: contactResult.count || 0,
        search_logs_count: logsResult.count || 0,
        expired_company_caches: expiredCompanyResult.count || 0,
        expired_contact_caches: expiredContactResult.count || 0,
      }
    } catch (error) {
      console.error('Error getting cache table stats:', error)
      return null
    }
  }

  // =====================================================
  // CACHE CLEANUP
  // =====================================================

  /**
   * Clean up expired cache entries
   * Returns count of deleted records
   */
  async cleanupExpiredCaches(): Promise<{
    company_cache_deleted: number
    contact_cache_deleted: number
  } | null> {
    try {
      const { data, error } = await this.supabase.rpc('cleanup_expired_caches')

      if (error) {
        console.error('Error cleaning up caches:', error)
        return null
      }

      return data[0] as { company_cache_deleted: number; contact_cache_deleted: number }
    } catch (error) {
      console.error('Error cleaning up caches:', error)
      return null
    }
  }

  /**
   * Manually invalidate a company cache entry
   */
  async invalidateCompanyCache(domain: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('company_research_cache')
        .delete()
        .eq('company_domain', domain)

      if (error) {
        console.error('Error invalidating company cache:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error invalidating company cache:', error)
      return false
    }
  }

  /**
   * Manually invalidate contact search cache for a company
   */
  async invalidateContactCache(companyDomain: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('contact_search_results_cache')
        .delete()
        .eq('company_domain', companyDomain)

      if (error) {
        console.error('Error invalidating contact cache:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error invalidating contact cache:', error)
      return false
    }
  }
}

// Export singleton instance
export const cacheManager = new CacheManager()
