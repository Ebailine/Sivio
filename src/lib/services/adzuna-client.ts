/**
 * Adzuna API Client
 * Integration with Adzuna job search API for real job listings
 * Free tier: 5000 API calls/month
 */

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

  /**
   * Search for jobs with filters
   */
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

    // Build query string manually to avoid URLSearchParams encoding issues
    const params: string[] = [
      `app_id=${ADZUNA_APP_ID}`,
      `app_key=${ADZUNA_API_KEY}`,
      `results_per_page=${results_per_page}`,
    ]

    // Add optional parameters
    if (what) params.push(`what=${encodeURIComponent(what)}`)
    if (where) params.push(`where=${encodeURIComponent(where)}`)
    if (salary_min) params.push(`salary_min=${salary_min}`)
    if (salary_max) params.push(`salary_max=${salary_max}`)
    if (max_days_old) params.push(`max_days_old=${max_days_old}`)
    if (category) params.push(`category=${category}`)

    const url = `${ADZUNA_BASE_URL}/jobs/${this.country}/search/${page}?${params.join('&')}`

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

  /**
   * Get job categories for business roles
   */
  getBusinessCategories(): string[] {
    return [
      'accounting-finance-jobs',
      'hr-recruitment-jobs',
      'marketing-advertising-pr-jobs',
      'sales-jobs',
      'admin-secretarial-jobs',
      'consultancy-jobs',
      'business-management-jobs',
      'graduate-jobs',
    ]
  }

  /**
   * Get entry-level keywords for filtering
   */
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
