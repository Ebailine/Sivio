export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          clerk_id: string
          email: string
          first_name: string | null
          last_name: string | null
          credits: number
          plan: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clerk_id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          credits?: number
          plan?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clerk_id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          credits?: number
          plan?: string
          created_at?: string
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          title: string
          company: string
          location: string | null
          description: string | null
          url: string | null
          salary_min: number | null
          salary_max: number | null
          job_type: string | null
          remote: boolean
          posted_date: string | null
          source: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          company: string
          location?: string | null
          description?: string | null
          url?: string | null
          salary_min?: number | null
          salary_max?: number | null
          job_type?: string | null
          remote?: boolean
          posted_date?: string | null
          source?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          company?: string
          location?: string | null
          description?: string | null
          url?: string | null
          salary_min?: number | null
          salary_max?: number | null
          job_type?: string | null
          remote?: boolean
          posted_date?: string | null
          source?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      saved_jobs: {
        Row: {
          id: string
          user_id: string
          job_id: string
          notes: string | null
          status: string
          created_at: string
        }
      }
      contacts: {
        Row: {
          id: string
          job_id: string
          company: string
          first_name: string | null
          last_name: string | null
          title: string | null
          email: string | null
          linkedin_url: string | null
          phone: string | null
          source: string
          verified: boolean
          created_at: string
        }
      }
      outreach_campaigns: {
        Row: {
          id: string
          user_id: string
          job_id: string
          name: string
          status: string
          created_at: string
          updated_at: string
        }
      }
      outreach_emails: {
        Row: {
          id: string
          campaign_id: string
          contact_id: string
          subject: string
          body: string
          status: string
          sent_at: string | null
          opened_at: string | null
          replied_at: string | null
          created_at: string
        }
      }
      credit_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          type: string
          description: string | null
          created_at: string
        }
      }
      applications: {
        Row: {
          id: string
          user_id: string
          job_id: string
          job_title: string
          company_name: string
          company_logo_url: string | null
          location: string | null
          employment_type: string | null
          seniority_level: string | null
          salary_range: string | null
          stage: string
          status: string
          applied_date: string
          upcoming_interview: string | null
          offer_date: string | null
          acceptance_date: string | null
          rejection_date: string | null
          notes: any // JSONB array of {id: string, text: string, date: string}
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          job_id: string
          job_title: string
          company_name: string
          company_logo_url?: string | null
          location?: string | null
          employment_type?: string | null
          seniority_level?: string | null
          salary_range?: string | null
          stage?: string
          status?: string
          applied_date?: string
          upcoming_interview?: string | null
          offer_date?: string | null
          acceptance_date?: string | null
          rejection_date?: string | null
          notes?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          job_id?: string
          job_title?: string
          company_name?: string
          company_logo_url?: string | null
          location?: string | null
          employment_type?: string | null
          seniority_level?: string | null
          salary_range?: string | null
          stage?: string
          status?: string
          applied_date?: string
          upcoming_interview?: string | null
          offer_date?: string | null
          acceptance_date?: string | null
          rejection_date?: string | null
          notes?: any
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
