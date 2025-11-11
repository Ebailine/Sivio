/**
 * Snov.io API Client
 * Handles OAuth authentication, domain search, and email finding
 */

interface SnovAuthResponse {
  access_token: string
  token_type: string
  expires_in: number
}

interface SnovEmail {
  email: string
  firstName?: string
  lastName?: string
  position?: string
  type?: string
  status?: string
  source?: string
}

interface SnovDomainSearchResponse {
  success: boolean
  emails: SnovEmail[]
  companyName?: string
  webmail?: boolean
  result?: number
  lastUpdateDate?: string
}

interface EmailVerificationResponse {
  success: boolean
  email: string
  result: string // 'valid' | 'invalid' | 'catch-all' | 'unknown'
  smtp?: string
}

export interface ProcessedContact {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  fullName: string
  position: string | null
  linkedinUrl: string | null
  emailStatus: 'valid' | 'invalid' | 'catch-all' | 'unknown' | 'unverified'
  relevanceScore: number
  isKeyDecisionMaker: boolean
  department: string | null
}

class SnovClient {
  private userId: string
  private clientSecret: string
  private accessToken: string | null = null
  private tokenExpiry: number | null = null
  private baseUrl = 'https://api.snov.io/v2'

  constructor() {
    this.userId = process.env.SNOV_USER_ID!
    this.clientSecret = process.env.SNOV_CLIENT_SECRET!

    if (!this.userId || !this.clientSecret) {
      throw new Error('Snov.io credentials not configured')
    }
  }

  /**
   * Get OAuth access token (cached with expiry)
   */
  async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    try {
      // Auth endpoint is still on v1
      const response = await fetch('https://api.snov.io/v1/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'client_credentials',
          client_id: this.userId,
          client_secret: this.clientSecret,
        }),
      })

      if (!response.ok) {
        throw new Error(`Snov.io auth failed: ${response.status} ${response.statusText}`)
      }

      const data: SnovAuthResponse = await response.json()

      this.accessToken = data.access_token
      // Set expiry 5 minutes before actual expiry for safety
      this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000

      return this.accessToken
    } catch (error: any) {
      throw new Error(`Failed to authenticate with Snov.io: ${error.message}`)
    }
  }

  /**
   * Search for prospects by company domain (v2 API - two-step process)
   * Returns people with names, positions, and emails
   */
  async searchByDomain(domain: string, limit: number = 50): Promise<SnovEmail[]> {
    console.log(`[Snov.io] Searching domain: ${domain} (limit: ${limit})`)

    try {
      const token = await this.getAccessToken()
      console.log('[Snov.io] Auth token obtained')

      // Step 1: Start the domain prospects search
      const startUrl = `${this.baseUrl}/domain-search/prospects/start?domain=${encodeURIComponent(domain)}&limit=${limit}`
      console.log(`[Snov.io] Starting search: ${startUrl}`)

      const startResponse = await fetch(startUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!startResponse.ok) {
        const errorText = await startResponse.text()
        console.error(`[Snov.io] Start failed: ${startResponse.status}`, errorText)
        throw new Error(`Domain search start failed: ${startResponse.status} - ${errorText}`)
      }

      const startData = await startResponse.json()
      console.log('[Snov.io] Start response:', JSON.stringify(startData, null, 2))

      const taskHash = startData.meta?.task_hash

      if (!taskHash) {
        console.error('[Snov.io] No task hash in response')
        throw new Error('No task hash returned from domain search')
      }

      console.log(`[Snov.io] Task hash: ${taskHash}`)

      // Step 2: Wait for processing (3 seconds is recommended by Snov.io)
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Step 3: Poll for results (with retries)
      let attempts = 0
      const maxAttempts = 5
      let resultData: any = null

      console.log('[Snov.io] Polling for results...')

      while (attempts < maxAttempts) {
        const resultResponse = await fetch(
          `${this.baseUrl}/domain-search/prospects/result/${taskHash}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        )

        if (!resultResponse.ok) {
          console.error(`[Snov.io] Result fetch failed: ${resultResponse.status}`)
          throw new Error(`Domain search result failed: ${resultResponse.status}`)
        }

        resultData = await resultResponse.json()
        console.log(`[Snov.io] Poll attempt ${attempts + 1}: status = ${resultData.status}`)

        // Check if processing is complete
        if (resultData.status === 'completed') {
          console.log('[Snov.io] ✅ Search completed!')
          break
        }

        // If still processing, wait and retry
        if (resultData.status === 'in_progress') {
          console.log('[Snov.io] Still processing, waiting 2s...')
          await new Promise(resolve => setTimeout(resolve, 2000))
          attempts++
          continue
        }

        // If failed or unknown status
        console.error(`[Snov.io] Failed with status: ${resultData.status}`)
        throw new Error(`Domain search failed with status: ${resultData.status}`)
      }

      if (!resultData || resultData.status !== 'completed') {
        console.error('[Snov.io] ❌ Search timed out or failed')
        throw new Error('Domain search timed out or failed to complete')
      }

      // Map v2 API response to expected SnovEmail format
      const prospects = resultData.data || []

      console.log(`[Snov.io] Processing ${prospects.length} prospects from Snov.io`)

      if (prospects.length === 0) {
        console.log('[Snov.io] ⚠️  No prospects found for this domain')
        return []
      }

      // Extract emails from prospects - v2 API includes emails in the main response
      const allEmails: SnovEmail[] = []

      for (const prospect of prospects) {
        // Check if prospect has emails
        const emailsData = prospect.emails?.emails || []

        if (emailsData.length > 0) {
          // Prospect has emails - add them
          for (const emailData of emailsData) {
            allEmails.push({
              email: emailData.email || '',
              firstName: prospect.first_name || null,
              lastName: prospect.last_name || null,
              position: prospect.position || null,
              type: 'personal',
              status: emailData.smtp_status || 'unverified',
              source: prospect.source_page || null,
            })
          }
        } else {
          // Prospect has no email - still include them with empty email
          // This allows showing LinkedIn profiles even without emails
          allEmails.push({
            email: '', // Empty email to mark as no email available
            firstName: prospect.first_name || null,
            lastName: prospect.last_name || null,
            position: prospect.position || null,
            type: 'personal',
            status: 'unknown',
            source: prospect.source_page || null,
          })
        }
      }

      console.log(`Extracted ${allEmails.length} contacts (${allEmails.filter(e => e.email).length} with emails)`)

      return allEmails

    } catch (error: any) {
      throw new Error(`Failed to search domain: ${error.message}`)
    }
  }

  /**
   * Verify email address validity
   */
  async verifyEmail(email: string): Promise<EmailVerificationResponse> {
    try {
      const token = await this.getAccessToken()

      const response = await fetch(`${this.baseUrl}/email-verifier/verify-single`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        throw new Error(`Email verification failed: ${response.status}`)
      }

      const data = await response.json()
      return {
        success: true,
        email: data.email || email,
        result: data.result || 'unknown',
        smtp: data.smtp,
      }
    } catch (error: any) {
      // Return unverified status on error
      return {
        success: false,
        email,
        result: 'unknown',
      }
    }
  }

  /**
   * Calculate relevance score for a contact based on position
   */
  private calculateRelevanceScore(position: string | null): number {
    if (!position) return 30

    const positionLower = position.toLowerCase()

    // Highest priority: C-level, VPs, Directors (90-100)
    const cLevel = ['ceo', 'cto', 'cfo', 'coo', 'chief', 'founder', 'co-founder', 'president']
    const vpLevel = ['vice president', 'vp of', 'v.p.']
    const directorLevel = ['director of', 'head of']

    if (cLevel.some(term => positionLower.includes(term))) return 95
    if (vpLevel.some(term => positionLower.includes(term))) return 90
    if (directorLevel.some(term => positionLower.includes(term))) return 85

    // High priority: HR, Recruiting, Talent (70-85)
    const hrKeywords = [
      'human resources', 'hr manager', 'hr director', 'hr business partner',
      'people operations', 'people ops', 'talent acquisition', 'talent',
      'recruiter', 'recruiting', 'recruitment', 'hiring manager',
      'staffing', 'employee relations'
    ]

    if (hrKeywords.some(keyword => positionLower.includes(keyword))) {
      if (positionLower.includes('director') || positionLower.includes('head')) return 85
      if (positionLower.includes('manager') || positionLower.includes('lead')) return 80
      if (positionLower.includes('senior')) return 75
      return 70
    }

    // Medium priority: Managers (50-65)
    const managerKeywords = ['manager', 'lead', 'supervisor', 'team lead']
    if (managerKeywords.some(keyword => positionLower.includes(keyword))) return 60

    // Lower priority: Other roles (30-50)
    return 40
  }

  /**
   * Determine if contact is a key decision maker
   */
  private isKeyDecisionMaker(position: string | null): boolean {
    if (!position) return false

    const positionLower = position.toLowerCase()

    const keyTerms = [
      'ceo', 'cto', 'cfo', 'coo', 'chief', 'founder', 'co-founder',
      'president', 'vice president', 'vp', 'director', 'head of',
      'human resources', 'hr director', 'hr manager', 'talent acquisition',
      'recruiting', 'recruiter', 'hiring manager'
    ]

    return keyTerms.some(term => positionLower.includes(term))
  }

  /**
   * Extract department from position title
   */
  private extractDepartment(position: string | null): string | null {
    if (!position) return null

    const positionLower = position.toLowerCase()

    const departments = [
      { keywords: ['human resources', 'hr', 'people', 'talent', 'recruiting', 'recruitment'], name: 'Human Resources' },
      { keywords: ['engineering', 'software', 'technical', 'developer', 'engineer'], name: 'Engineering' },
      { keywords: ['sales', 'business development', 'account'], name: 'Sales' },
      { keywords: ['marketing', 'brand', 'content'], name: 'Marketing' },
      { keywords: ['product', 'pm'], name: 'Product' },
      { keywords: ['operations', 'ops'], name: 'Operations' },
      { keywords: ['finance', 'accounting'], name: 'Finance' },
      { keywords: ['legal', 'compliance'], name: 'Legal' },
    ]

    for (const dept of departments) {
      if (dept.keywords.some(keyword => positionLower.includes(keyword))) {
        return dept.name
      }
    }

    return 'Other'
  }

  /**
   * Filter and score contacts from domain search
   */
  async findRelevantContacts(
    domain: string,
    companyName?: string
  ): Promise<ProcessedContact[]> {
    try {
      // Search for emails by domain
      const emails = await this.searchByDomain(domain)

      if (emails.length === 0) {
        return []
      }

      // Process and filter contacts
      const processedContacts: ProcessedContact[] = []

      for (const email of emails) {
        // Skip generic emails
        if (this.isGenericEmail(email.email)) {
          continue
        }

        // Calculate relevance score
        const relevanceScore = this.calculateRelevanceScore(email.position || null)

        // Only include contacts with reasonable relevance (50+)
        if (relevanceScore < 50) {
          continue
        }

        const isKeyDM = this.isKeyDecisionMaker(email.position || null)
        const department = this.extractDepartment(email.position || null)

        // Build full name
        const firstName = email.firstName || null
        const lastName = email.lastName || null
        const fullName = [firstName, lastName].filter(Boolean).join(' ') || email.email.split('@')[0]

        processedContacts.push({
          id: `${domain}-${email.email}`,
          email: email.email,
          firstName,
          lastName,
          fullName,
          position: email.position || null,
          linkedinUrl: null, // Will be enriched later if needed
          emailStatus: email.status as any || 'unverified',
          relevanceScore,
          isKeyDecisionMaker: isKeyDM,
          department,
        })
      }

      // Sort by relevance score (highest first)
      processedContacts.sort((a, b) => b.relevanceScore - a.relevanceScore)

      // Return top contacts (limit to 20 for performance)
      return processedContacts.slice(0, 20)

    } catch (error: any) {
      console.error('Failed to find contacts:', error)
      throw new Error(`Contact search failed: ${error.message}`)
    }
  }

  /**
   * Check if email is generic/non-personal
   */
  private isGenericEmail(email: string): boolean {
    const genericPrefixes = [
      'info', 'contact', 'support', 'hello', 'hi', 'sales', 'admin',
      'service', 'help', 'team', 'office', 'general', 'inquiries',
      'marketing', 'press', 'media', 'noreply', 'no-reply', 'automated',
      'express', 'response', 'discover', 'open', 'invitation', 'invite',
      'welcome', 'feedback', 'careers', 'jobs', 'apply', 'applications',
      'billing', 'payment', 'accounts', 'legal', 'privacy', 'security'
    ]

    const emailPrefix = email.split('@')[0].toLowerCase()

    // Check if it matches generic prefixes
    if (genericPrefixes.some(prefix => emailPrefix === prefix || emailPrefix.startsWith(prefix))) {
      return true
    }

    // Check if it's a very short email (like "le@")
    if (emailPrefix.length <= 2) {
      return true
    }

    return false
  }

  /**
   * Verify multiple emails in batch
   */
  async verifyEmails(emails: string[]): Promise<Map<string, string>> {
    const results = new Map<string, string>()

    // Verify in parallel with rate limiting
    const batchSize = 5
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize)
      const promises = batch.map(async (email) => {
        try {
          const result = await this.verifyEmail(email)
          return { email, status: result.result }
        } catch (error) {
          return { email, status: 'unknown' }
        }
      })

      const batchResults = await Promise.all(promises)
      batchResults.forEach(({ email, status }) => {
        results.set(email, status)
      })

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < emails.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    return results
  }
}

// Export singleton instance
export const snovClient = new SnovClient()
