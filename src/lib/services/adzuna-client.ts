/**
 * Adzuna API Client
 * Integration with Adzuna job search API for real job listings
 * Free tier: 5000 API calls/month
 */

const ADZUNA_BASE_URL = 'https://api.adzuna.com/v1/api'
const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID!
const ADZUNA_API_KEY = process.env.ADZUNA_API_KEY!

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

    const searchParams = new URLSearchParams({
      app_id: ADZUNA_APP_ID,
      app_key: ADZUNA_API_KEY,
      results_per_page: results_per_page.toString(),
      content_type: 'application/json',
    })

    // Only add optional parameters if they have values
    if (what) searchParams.append('what', what)
    if (where) searchParams.append('where', where)
    if (salary_min) searchParams.append('salary_min', salary_min.toString())
    if (salary_max) searchParams.append('salary_max', salary_max.toString())
    if (max_days_old) searchParams.append('max_days_old', max_days_old.toString())
    if (category) searchParams.append('category', category)

    const url = `${ADZUNA_BASE_URL}/jobs/${this.country}/search/${page}?${searchParams.toString()}`

    console.log('Adzuna API call:', { category, what, results_per_page })

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
