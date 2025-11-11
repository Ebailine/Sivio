/**
 * Job Sync Service
 * Syncs jobs from Adzuna API to Supabase database
 * Handles deduplication, updates, and archiving
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { adzunaClient } from './adzuna-client'

interface SyncStats {
  total: number
  new: number
  updated: number
  skipped: number
  archived: number
  errors: number
}

export class JobSyncService {
  private supabase = createAdminClient()

  /**
   * Main sync function - imports jobs from Adzuna
   */
  async syncJobs(options: {
    categories?: string[]
    maxJobs?: number
    archiveOldJobs?: boolean
  } = {}): Promise<SyncStats> {
    const {
      categories = adzunaClient.getBusinessCategories(),
      maxJobs = 1000,
      archiveOldJobs = true,
    } = options

    console.log('=== Starting Job Sync ===')
    console.log('Categories:', categories.length)
    console.log('Max jobs target:', maxJobs)

    const stats: SyncStats = {
      total: 0,
      new: 0,
      updated: 0,
      skipped: 0,
      archived: 0,
      errors: 0,
    }

    // Archive old jobs first (30+ days old)
    if (archiveOldJobs) {
      stats.archived = await this.archiveOldJobs()
    }

    // Search for entry-level jobs in each category
    const entryLevelKeywords = adzunaClient.getEntryLevelKeywords()
    const jobsPerCategory = Math.ceil(maxJobs / categories.length)

    for (const category of categories) {
      try {
        console.log(`\nSyncing category: ${category}`)

        // Search with entry-level focus and salary range
        const searchResults = await adzunaClient.searchJobs({
          category,
          salary_min: 30000,
          salary_max: 90000,
          max_days_old: 30,
          results_per_page: Math.min(jobsPerCategory, 50), // API limit
          page: 1,
        })

        console.log(`Found ${searchResults.jobs.length} jobs in ${category}`)

        // Process all jobs - salary range already filters for entry-level
        // Keyword filtering was too aggressive and rejected most valid jobs
        for (const job of searchResults.jobs) {
          try {
            await this.processJob(job, stats)
          } catch (error) {
            console.error(`Error processing job ${job.id}:`, error)
            stats.errors++
          }
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500))

      } catch (error: any) {
        console.error(`Error syncing category ${category}:`, error)
        console.error(`Error message: ${error?.message}`)
        console.error(`Error stack: ${error?.stack}`)
        stats.errors++
      }
    }

    console.log('\n=== Sync Complete ===')
    console.log('Stats:', stats)

    return stats
  }

  /**
   * Process individual job from Adzuna
   */
  private async processJob(job: any, stats: SyncStats): Promise<void> {
    stats.total++

    // Check if job already exists
    const { data: existing } = await this.supabase
      .from('jobs')
      .select('id, adzuna_id')
      .eq('adzuna_id', job.id)
      .single()

    const jobData = {
      adzuna_id: job.id,
      title: job.title,
      company: job.company?.display_name || 'Unknown',
      location: job.location?.display_name || null,
      description: this.cleanDescription(job.description),
      url: job.redirect_url,
      salary_min: job.salary_min || null,
      salary_max: job.salary_max || null,
      salary_predicted: job.salary_is_predicted || false,
      job_type: this.mapContractType(job.contract_type),
      contract_type: job.contract_type || null,
      category: job.category?.label || null,
      remote: this.isRemote(job),
      posted_date: new Date(job.created).toISOString(),
      source: 'adzuna',
      last_synced_at: new Date().toISOString(),
      is_archived: false,
    }

    if (existing) {
      // Update existing job
      const { error } = await this.supabase
        .from('jobs')
        .update(jobData)
        .eq('id', existing.id)

      if (error) throw error
      stats.updated++
      console.log(`Updated: ${job.title}`)
    } else {
      // Insert new job
      const { error } = await this.supabase
        .from('jobs')
        .insert(jobData)

      if (error) {
        // Might be duplicate (race condition), skip
        if (error.code === '23505') {
          stats.skipped++
          return
        }
        throw error
      }
      stats.new++
      console.log(`New: ${job.title}`)
    }
  }

  /**
   * Archive jobs older than 30 days
   */
  private async archiveOldJobs(): Promise<number> {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data, error } = await this.supabase
      .from('jobs')
      .update({
        is_archived: true,
        archived_at: new Date().toISOString(),
      })
      .eq('is_archived', false)
      .lt('posted_date', thirtyDaysAgo.toISOString())
      .select('id')

    if (error) {
      console.error('Error archiving jobs:', error)
      return 0
    }

    const count = data?.length || 0
    console.log(`Archived ${count} old jobs`)
    return count
  }

  /**
   * Clean HTML from description
   */
  private cleanDescription(html: string): string {
    if (!html) return ''

    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .substring(0, 5000) // Limit length
  }

  /**
   * Map Adzuna contract type to our job_type
   */
  private mapContractType(contractType?: string): string | null {
    if (!contractType) return 'full-time' // Default

    const lower = contractType.toLowerCase()
    if (lower.includes('intern')) return 'internship'
    if (lower.includes('full')) return 'full-time'
    if (lower.includes('part')) return 'part-time'
    if (lower.includes('contract')) return 'contract'
    if (lower.includes('temporary')) return 'contract'

    return 'full-time' // Default
  }

  /**
   * Detect if job is remote
   */
  private isRemote(job: any): boolean {
    const title = job.title?.toLowerCase() || ''
    const desc = job.description?.toLowerCase() || ''
    const location = job.location?.display_name?.toLowerCase() || ''

    const remoteKeywords = ['remote', 'work from home', 'wfh', 'anywhere', 'virtual']

    return remoteKeywords.some(keyword =>
      title.includes(keyword) || desc.includes(keyword) || location.includes(keyword)
    )
  }

  /**
   * Get sync statistics
   */
  async getSyncStats(): Promise<{
    totalActiveJobs: number
    totalArchivedJobs: number
    lastSyncDate: string | null
    jobsByCategory: Record<string, number>
  }> {
    // Count active jobs
    const { count: activeCount } = await this.supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('is_archived', false)

    // Count archived jobs
    const { count: archivedCount } = await this.supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('is_archived', true)

    // Get last sync date
    const { data: lastJob } = await this.supabase
      .from('jobs')
      .select('last_synced_at')
      .order('last_synced_at', { ascending: false })
      .limit(1)
      .single()

    // Count by category
    const { data: categories } = await this.supabase
      .from('jobs')
      .select('category')
      .eq('is_archived', false)

    const jobsByCategory: Record<string, number> = {}
    categories?.forEach(job => {
      const cat = job.category || 'Other'
      jobsByCategory[cat] = (jobsByCategory[cat] || 0) + 1
    })

    return {
      totalActiveJobs: activeCount || 0,
      totalArchivedJobs: archivedCount || 0,
      lastSyncDate: lastJob?.last_synced_at || null,
      jobsByCategory,
    }
  }
}

export const jobSyncService = new JobSyncService()
