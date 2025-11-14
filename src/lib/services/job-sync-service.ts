/**
 * Job Sync Service
 * DEPRECATED - Migrating to Apify for job data
 * This file is commented out and kept for reference only
 *
 * Syncs jobs from Adzuna API to Supabase database
 * Handles deduplication, updates, and archiving
 */

/*
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

    if (archiveOldJobs) {
      stats.archived = await this.archiveOldJobs()
    }

    const entryLevelKeywords = adzunaClient.getEntryLevelKeywords()
    const jobsPerCategory = Math.ceil(maxJobs / categories.length)

    for (const category of categories) {
      try {
        console.log(`\nSyncing category: ${category}`)

        const pagesPerCategory = Math.ceil(jobsPerCategory / 50)
        let categoryJobCount = 0

        for (let page = 1; page <= pagesPerCategory && categoryJobCount < jobsPerCategory; page++) {
          try {
            console.log(`Fetching page ${page} of ${category}...`)

            const searchResults = await adzunaClient.searchJobs({
              category,
              salary_min: 30000,
              salary_max: 90000,
              max_days_old: 30,
              results_per_page: 50,
              page,
            })

            console.log(`Found ${searchResults.jobs.length} jobs on page ${page}`)

            if (searchResults.jobs.length === 0) {
              console.log(`No more jobs available for ${category}`)
              break
            }

            for (const job of searchResults.jobs) {
              try {
                await this.processJob(job, stats)
                categoryJobCount++
              } catch (error) {
                console.error(`Error processing job ${job.id}:`, error)
                stats.errors++
              }
            }

            await new Promise(resolve => setTimeout(resolve, 500))

          } catch (error: any) {
            console.error(`Error fetching page ${page} of ${category}:`, error)
            stats.errors++
            break
          }
        }

        console.log(`Synced ${categoryJobCount} jobs from ${category}`)

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

  private async processJob(job: any, stats: SyncStats): Promise<void> {
    stats.total++

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
      const { error } = await this.supabase
        .from('jobs')
        .update(jobData)
        .eq('id', existing.id)

      if (error) throw error
      stats.updated++
      console.log(`Updated: ${job.title}`)
    } else {
      const { error } = await this.supabase
        .from('jobs')
        .insert(jobData)

      if (error) {
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

  private cleanDescription(html: string): string {
    if (!html) return ''

    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 5000)
  }

  private mapContractType(contractType?: string): string | null {
    if (!contractType) return 'full-time'

    const lower = contractType.toLowerCase()
    if (lower.includes('intern')) return 'internship'
    if (lower.includes('full')) return 'full-time'
    if (lower.includes('part')) return 'part-time'
    if (lower.includes('contract')) return 'contract'
    if (lower.includes('temporary')) return 'contract'

    return 'full-time'
  }

  private isRemote(job: any): boolean {
    const title = job.title?.toLowerCase() || ''
    const desc = job.description?.toLowerCase() || ''
    const location = job.location?.display_name?.toLowerCase() || ''

    const remoteKeywords = ['remote', 'work from home', 'wfh', 'anywhere', 'virtual']

    return remoteKeywords.some(keyword =>
      title.includes(keyword) || desc.includes(keyword) || location.includes(keyword)
    )
  }

  async getSyncStats(): Promise<{
    totalActiveJobs: number
    totalArchivedJobs: number
    lastSyncDate: string | null
    jobsByCategory: Record<string, number>
  }> {
    const { count: activeCount } = await this.supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('is_archived', false)

    const { count: archivedCount } = await this.supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('is_archived', true)

    const { data: lastJob } = await this.supabase
      .from('jobs')
      .select('last_synced_at')
      .order('last_synced_at', { ascending: false })
      .limit(1)
      .single()

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
*/

// Stub export to prevent build errors
import { createAdminClient } from '@/lib/supabase/admin'

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

  async syncJobs(): Promise<SyncStats> {
    throw new Error('Job sync service deprecated - migrating to Apify')
  }

  async getSyncStats(): Promise<{
    totalActiveJobs: number
    totalArchivedJobs: number
    lastSyncDate: string | null
    jobsByCategory: Record<string, number>
  }> {
    // Return actual database stats for existing jobs
    const { count: activeCount } = await this.supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('is_archived', false)

    const { count: archivedCount } = await this.supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('is_archived', true)

    const { data: lastJob } = await this.supabase
      .from('jobs')
      .select('last_synced_at')
      .order('last_synced_at', { ascending: false })
      .limit(1)
      .single()

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
