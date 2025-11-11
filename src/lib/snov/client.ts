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
  private baseUrl = 'https://api.snov.io/v1'

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
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    try {
      const response = await fetch(`${this.baseUrl}/oauth/access_token`, {
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
   * Search for emails by company domain
   */
  async searchByDomain(domain: string, limit: number = 50): Promise<SnovEmail[]> {
    try {
      const token = await this.getAccessToken()

      const response = await fetch(`${this.baseUrl}/domain-emails-with-info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          domain,
          type: 'all',
          limit,
        }),
      })

      if (!response.ok) {
        throw new Error(`Domain search failed: ${response.status} ${response.statusText}`)
      }

      const data: SnovDomainSearchResponse = await response.json()

      if (!data.success) {
        throw new Error('Domain search was not successful')
      }

      return data.emails || []
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
      'marketing', 'press', 'media', 'noreply', 'no-reply'
    ]

    const emailPrefix = email.split('@')[0].toLowerCase()
    return genericPrefixes.some(prefix => emailPrefix === prefix || emailPrefix.startsWith(prefix))
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
