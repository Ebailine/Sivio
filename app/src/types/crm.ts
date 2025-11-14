/**
 * CRM Types for Sivio Application Tracking & Outreach Management
 * Inspired by Linear, Apollo.io, and Outreach.io
 */

export type ApplicationStatus =
  | 'saved'
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'accepted'

export type OutreachStatus =
  | 'not_started'
  | 'researching'
  | 'contacted'
  | 'responded'
  | 'meeting_scheduled'
  | 'follow_up'
  | 'converted'
  | 'closed'

export type ApplicationMethod = 'auto_apply' | 'manual' | 'referral' | 'direct'

export interface Contact {
  id: string
  name: string
  title: string
  email?: string
  linkedin_url?: string
  company: string
  relevance_score?: number
  added_date: string
  last_contacted?: string
  outreach_status: OutreachStatus
  notes?: string
  response_count: number
}

export interface OutreachActivity {
  id: string
  contact_id: string
  type: 'email' | 'linkedin' | 'phone' | 'meeting' | 'note'
  subject?: string
  message?: string
  sent_date: string
  response_date?: string
  outcome?: 'no_response' | 'positive' | 'negative' | 'scheduled_meeting'
  automated: boolean
}

export interface Application {
  id: string
  job_id: string
  job_title: string
  company_name: string
  company_logo_url?: string
  location: string
  employment_type?: string
  salary_range?: string

  // Application tracking
  status: ApplicationStatus
  application_method: ApplicationMethod
  applied_date: string
  last_updated: string

  // Outreach tracking
  contacts: Contact[]
  outreach_activities: OutreachActivity[]

  // Metadata
  notes?: string
  interview_dates?: string[]
  offer_details?: string
  priority: 'low' | 'medium' | 'high'
  tags?: string[]

  // From job listing
  job_url: string
  apply_url?: string
  easy_apply: boolean
}

export interface CRMStats {
  total_applications: number
  active_applications: number
  interviews_scheduled: number
  offers_received: number
  total_contacts: number
  active_outreach: number
  response_rate: number
  avg_response_time: number
}
