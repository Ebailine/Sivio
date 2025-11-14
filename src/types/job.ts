/**
 * Job Type Definitions - Apify/LinkedIn Schema
 * Matches the Supabase jobs table schema from migrate_to_apify_schema.sql
 */

/**
 * Complete job record from Supabase database
 */
export interface Job {
  // Primary identifier
  job_id: string

  // Core job information
  job_title: string
  job_url: string
  apply_url: string
  job_description: string
  job_description_raw_html: string | null

  // Company information
  company_name: string
  company_url: string | null
  company_logo_url: string | null

  // Job details
  location: string
  employment_type: string | null
  seniority_level: string | null
  job_function: string | null
  industries: string[] // JSONB array in database

  // Salary and applicants
  salary_range: string | null
  num_applicants: string | null // LinkedIn returns text like "Over 200 applicants"

  // Application metadata
  easy_apply: boolean

  // Timestamps
  time_posted: string // LinkedIn text format: "2 days ago", "1 week ago"
  created_at: string  // ISO 8601 timestamp
  updated_at: string  // ISO 8601 timestamp
}

/**
 * Job data coming from n8n/Apify (before database insertion)
 * Used for POST requests to create new jobs
 */
export interface ApifyJobInput {
  job_id: string
  job_title: string
  job_url: string
  apply_url: string
  job_description: string
  job_description_raw_html?: string | null
  company_name: string
  company_url?: string | null
  company_logo_url?: string | null
  location: string
  employment_type?: string | null
  seniority_level?: string | null
  job_function?: string | null
  industries?: string[]
  salary_range?: string | null
  num_applicants?: string | null // LinkedIn text format
  easy_apply?: boolean
  time_posted?: string // LinkedIn text format: "2 days ago"
}

/**
 * Minimal job card data for UI lists
 * Used in job browsing/search results
 */
export interface JobCardData {
  job_id: string
  job_title: string
  company_name: string
  company_logo_url: string | null
  location: string
  employment_type: string | null
  seniority_level: string | null
  salary_range: string | null
  time_posted: string
  easy_apply: boolean
}

/**
 * Job filters for search/browse API
 */
export interface JobFilters {
  search?: string
  location?: string
  employment_type?: string
  seniority_level?: string
  job_function?: string
  industries?: string[]
  easy_apply?: boolean
  time_posted_after?: string // ISO date
  page?: number
  limit?: number
}

/**
 * Paginated job response
 */
export interface PaginatedJobsResponse {
  jobs: Job[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * Employment type enum (common values)
 */
export enum EmploymentType {
  FullTime = 'Full-time',
  PartTime = 'Part-time',
  Contract = 'Contract',
  Internship = 'Internship',
  Temporary = 'Temporary',
  Volunteer = 'Volunteer',
  Other = 'Other'
}

/**
 * Seniority level enum (LinkedIn standard values)
 */
export enum SeniorityLevel {
  Internship = 'Internship',
  EntryLevel = 'Entry level',
  Associate = 'Associate',
  MidSenior = 'Mid-Senior level',
  Director = 'Director',
  Executive = 'Executive',
  NotApplicable = 'Not Applicable'
}

/**
 * Job statistics from database view
 */
export interface JobStatistics {
  total_jobs: number
  total_companies: number
  total_locations: number
  easy_apply_jobs: number
  fulltime_jobs: number
  internship_jobs: number
  jobs_last_week: number
  jobs_last_month: number
}
