/**
 * Adzuna API Client
 * DEPRECATED - Migrating to Apify for job data
 * This file is commented out and kept for reference only
 *
 * Integration with Adzuna job search API for real job listings
 * Free tier: 5000 API calls/month
 */

/*
const ADZUNA_BASE_URL = 'https://api.adzuna.com/v1/api'
const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID?.trim()!
const ADZUNA_API_KEY = process.env.ADZUNA_API_KEY?.trim()!

interface AdzunaJob {
  id: string
  title: string
  company: {
    display_name: string
  }
  location: {
    display_name: string
    area: string[]
  }
  description: string
  created: string
  salary_min?: number
  salary_max?: number
  salary_is_predicted?: boolean
  contract_type?: string
  category: {
    label: string
    tag: string
  }
  redirect_url: string
}

interface AdzunaSearchParams {
  what?: string // Job title/keywords
  where?: string // Location
  salary_min?: number
  salary_max?: number
  max_days_old?: number
  results_per_page?: number
  page?: number
  category?: string
}

export class AdzunaClient {
  private country = 'us' // United States

  async searchJobs(params: AdzunaSearchParams = {}): Promise<{
    jobs: AdzunaJob[]
    count: number
  }> {
    if (!ADZUNA_APP_ID || !ADZUNA_API_KEY) {
      throw new Error('Adzuna API credentials not configured. Please add ADZUNA_APP_ID and ADZUNA_API_KEY to environment variables.')
    }

    const {
      what = '',
      where = '',
      salary_min,
      salary_max,
      max_days_old = 30,
      results_per_page = 50,
      page = 1,
      category,
    } = params

    const queryParams: string[] = [
      `app_id=${ADZUNA_APP_ID}`,
      `app_key=${ADZUNA_API_KEY}`,
      `results_per_page=${results_per_page}`,
    ]

    if (what) queryParams.push(`what=${encodeURIComponent(what)}`)
    if (where) queryParams.push(`where=${encodeURIComponent(where)}`)
    if (salary_min) queryParams.push(`salary_min=${salary_min}`)
    if (salary_max) queryParams.push(`salary_max=${salary_max}`)
    if (max_days_old) queryParams.push(`max_days_old=${max_days_old}`)
    if (category) queryParams.push(`category=${category}`)

    const url = `${ADZUNA_BASE_URL}/jobs/${this.country}/search/${page}?${queryParams.join('&')}`

    console.log('Adzuna API call:', { category, what, results_per_page })
    console.log('Full URL:', url)

    const response = await fetch(url)

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Adzuna API error: ${response.status} - ${error}`)
    }

    const data = await response.json()

    return {
      jobs: data.results || [],
      count: data.count || 0,
    }
  }

  getBusinessCategories(): string[] {
    return [
      'accounting-finance-jobs',
      'sales-jobs',
      'consultancy-jobs',
      'graduate-jobs',
    ]
  }

  getEntryLevelKeywords(): string[] {
    return [
      'entry level',
      'junior',
      'associate',
      'coordinator',
      'assistant',
      'intern',
      'internship',
      'graduate',
      'trainee',
      'recent graduate',
      '0-2 years',
      'early career',
    ]
  }
}

export const adzunaClient = new AdzunaClient()
*/

// Stub export to prevent build errors
export class AdzunaClient {
  async searchJobs(): Promise<{ jobs: any[]; count: number }> {
    throw new Error('Adzuna client deprecated - migrating to Apify')
  }
  getBusinessCategories(): string[] {
    return []
  }
  getEntryLevelKeywords(): string[] {
    return []
  }
}

export const adzunaClient = new AdzunaClient()
