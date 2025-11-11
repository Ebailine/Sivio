/**
 * Company Researcher Service
 * Scrapes company websites and LinkedIn to build team structure
 *
 * Purpose:
 * - Deep dive into company websites to find team members
 * - Extract office locations and department structures
 * - Identify key decision makers and hiring managers
 * - Cache results for 30 days to avoid redundant scraping
 */

import Anthropic from '@anthropic-ai/sdk'
import { cacheManager, type CompanyResearchCache } from './cache-manager'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// ============================================================
// TYPE DEFINITIONS
// ============================================================

export interface CompanyResearchResult {
  companyDomain: string
  companyName: string

  // Team structure
  teamMembers: TeamMember[]
  departments: Department[]
  officeLocations: OfficeLocation[]

  // Company details
  companySize: string | null
  industry: string | null
  description: string | null

  // Research metadata
  scrapeQuality: number // 0-100
  sourcePages: string[]
  scrapedAt: string
  reasoning: string
}

export interface TeamMember {
  name: string
  title: string
  department: string | null
  location: string | null
  linkedinUrl: string | null
  email: string | null
  seniority: 'junior' | 'mid' | 'senior' | 'executive'
  isHiringRole: boolean
}

export interface Department {
  name: string
  teamSize: string | null
  location: string | null
  keywords: string[]
}

export interface OfficeLocation {
  city: string
  state: string | null
  country: string
  isPrimary: boolean
  departments: string[]
}

// ============================================================
// COMPANY RESEARCHER CLASS
// ============================================================

export class CompanyResearcher {
  /**
   * Main method: Research a company
   * Checks cache first, then scrapes if needed
   */
  async researchCompany(domain: string, companyName: string): Promise<CompanyResearchResult> {
    console.log(`[CompanyResearcher] Starting research for: ${companyName} (${domain})`)
    const startTime = Date.now()

    try {
      // Step 1: Check cache
      const cached = await cacheManager.getCompanyResearch(domain)

      if (cached) {
        console.log(`[CompanyResearcher] Using cached data`)
        return this.convertCachedToResult(cached)
      }

      // Step 2: Scrape company website
      console.log(`[CompanyResearcher] Cache miss - scraping website...`)
      const scrapedData = await this.scrapeCompanyWebsite(domain, companyName)

      // Step 3: Cache the results
      await cacheManager.setCompanyResearch({
        company_domain: domain,
        company_name: companyName,
        verified_domain: domain,
        team_structure: {
          total_employees: scrapedData.teamMembers.length,
          departments: scrapedData.departments.reduce((acc, dept) => {
            acc[dept.name] = parseInt(dept.teamSize || '0') || 0
            return acc
          }, {} as Record<string, number>),
        },
        office_locations: scrapedData.officeLocations.map(loc => ({
          city: loc.city,
          country: loc.country,
          is_hq: loc.isPrimary,
        })),
        departments: scrapedData.departments.map(d => d.name),
        company_size_category: this.categorizeSizeCategory(scrapedData.companySize),
        industry: scrapedData.industry,
        company_description: scrapedData.description,
      })

      const duration = Math.round((Date.now() - startTime) / 1000)
      console.log(`[CompanyResearcher] Research complete in ${duration}s (quality: ${scrapedData.scrapeQuality}%)`)

      return scrapedData

    } catch (error) {
      console.error('[CompanyResearcher] Error:', error)

      // Return minimal fallback data instead of failing
      return this.createFallbackData(domain, companyName)
    }
  }

  /**
   * Categorize company size
   */
  private categorizeSizeCategory(size: string | null): 'startup' | 'scaleup' | 'enterprise' | undefined {
    if (!size) return undefined
    const sizeNum = parseInt(size.replace(/[^0-9]/g, ''))
    if (isNaN(sizeNum)) return undefined
    if (sizeNum < 50) return 'startup'
    if (sizeNum < 500) return 'scaleup'
    return 'enterprise'
  }

  /**
   * Scrape company website for team information
   */
  private async scrapeCompanyWebsite(
    domain: string,
    companyName: string
  ): Promise<CompanyResearchResult> {
    console.log(`[CompanyResearcher] Scraping: https://${domain}`)

    try {
      // Target pages to scrape
      const targetPages = [
        `https://${domain}/about/team`,
        `https://${domain}/team`,
        `https://${domain}/about`,
        `https://${domain}/company/team`,
        `https://${domain}/leadership`,
        `https://${domain}/about-us`,
      ]

      let bestContent = ''
      let bestUrl = ''

      // Try each page until we get good content
      for (const url of targetPages) {
        try {
          const content = await this.fetchPageContent(url)

          if (content.length > bestContent.length) {
            bestContent = content
            bestUrl = url
          }

          // If we got substantial content, stop trying
          if (content.length > 5000) break

        } catch (error) {
          console.log(`[CompanyResearcher] Failed to fetch ${url}, trying next...`)
          continue
        }
      }

      if (!bestContent) {
        throw new Error('No accessible pages found')
      }

      console.log(`[CompanyResearcher] Best content from: ${bestUrl} (${bestContent.length} chars)`)

      // Use Claude to analyze the content
      const analysis = await this.analyzeWithClaude(bestContent, domain, companyName)

      return {
        ...analysis,
        sourcePages: [bestUrl],
        scrapedAt: new Date().toISOString(),
      }

    } catch (error) {
      console.error('[CompanyResearcher] Scraping failed:', error)
      throw error
    }
  }

  /**
   * Fetch page content
   */
  private async fetchPageContent(url: string): Promise<string> {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      // Add timeout
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()

    // Clean HTML to text
    let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    text = text.replace(/<[^>]+>/g, ' ')
    text = text.replace(/&nbsp;/g, ' ')
    text = text.replace(/&amp;/g, '&')
    text = text.replace(/\s+/g, ' ').trim()

    return text.slice(0, 30000) // Limit to 30k chars
  }

  /**
   * Use Claude to analyze scraped content
   */
  private async analyzeWithClaude(
    content: string,
    domain: string,
    companyName: string
  ): Promise<CompanyResearchResult> {
    console.log(`[CompanyResearcher] Analyzing with Claude AI...`)

    const prompt = `You are a company research expert. Analyze this company website content and extract team structure information.

COMPANY: ${companyName}
DOMAIN: ${domain}

WEBSITE CONTENT:
${content}

EXTRACTION INSTRUCTIONS:

1. Find ALL team members mentioned (name, title, department)
2. Identify office locations and which departments are in each location
3. List all departments/teams you can identify
4. Estimate company size if mentioned
5. Identify the industry
6. For each person, assess if they have hiring/recruiting responsibilities
7. Categorize each person's seniority level
8. Rate the quality of information found (0-100)

IMPORTANT:
- Extract LinkedIn URLs if present
- Guess email format if not present (e.g., firstname@company.com)
- Identify hiring managers, recruiters, HR staff
- Focus on decision-makers and senior employees
- If location-specific teams mentioned, note which departments are where

OUTPUT FORMAT (JSON only, no markdown):
{
  "companyDomain": "${domain}",
  "companyName": "${companyName}",
  "teamMembers": [
    {
      "name": "string",
      "title": "string",
      "department": "string or null",
      "location": "string or null (e.g., 'San Francisco, CA')",
      "linkedinUrl": "string or null",
      "email": "string or null (guess format)",
      "seniority": "junior|mid|senior|executive",
      "isHiringRole": boolean
    }
  ],
  "departments": [
    {
      "name": "string",
      "teamSize": "string or null",
      "location": "string or null",
      "keywords": ["array", "of", "relevant", "keywords"]
    }
  ],
  "officeLocations": [
    {
      "city": "string",
      "state": "string or null",
      "country": "string",
      "isPrimary": boolean,
      "departments": ["array", "of", "departments", "at", "this", "location"]
    }
  ],
  "companySize": "string or null (e.g., '50-200', '1000+')",
  "industry": "string or null",
  "description": "string or null (brief company description)",
  "scrapeQuality": number (0-100, your confidence in this data),
  "reasoning": "string explaining what you found and any limitations"
}`

    try {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        temperature: 0.2,
        messages: [{
          role: 'user',
          content: prompt,
        }],
      })

      const responseText = message.content[0].type === 'text'
        ? message.content[0].text
        : ''

      const cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()

      const result = JSON.parse(cleanedResponse) as CompanyResearchResult

      // Validate
      if (!result.teamMembers || !Array.isArray(result.teamMembers)) {
        result.teamMembers = []
      }
      if (!result.departments || !Array.isArray(result.departments)) {
        result.departments = []
      }
      if (!result.officeLocations || !Array.isArray(result.officeLocations)) {
        result.officeLocations = []
      }

      console.log(`[CompanyResearcher] Found ${result.teamMembers.length} team members, ${result.departments.length} departments`)

      return result

    } catch (error) {
      console.error('[CompanyResearcher] Claude analysis error:', error)
      throw error
    }
  }

  /**
   * Convert cached data to result format
   */
  private convertCachedToResult(cached: CompanyResearchCache): CompanyResearchResult {
    return {
      companyDomain: cached.company_domain,
      companyName: cached.company_name,
      teamMembers: [],
      departments: cached.departments?.map(name => ({
        name,
        teamSize: null,
        location: null,
        keywords: [],
      })) || [],
      officeLocations: (cached.office_locations || []).map(loc => ({
        city: loc.city,
        state: null,
        country: loc.country,
        isPrimary: loc.is_hq || false,
        departments: [],
      })),
      companySize: cached.team_structure?.total_employees?.toString() || null,
      industry: cached.industry || null,
      description: cached.company_description || null,
      scrapeQuality: 70,
      sourcePages: [],
      scrapedAt: cached.created_at,
      reasoning: 'Loaded from cache',
    }
  }

  /**
   * Create fallback data when scraping fails
   */
  private createFallbackData(domain: string, companyName: string): CompanyResearchResult {
    console.log(`[CompanyResearcher] Creating fallback data for ${companyName}`)

    return {
      companyDomain: domain,
      companyName: companyName,
      teamMembers: [],
      departments: [],
      officeLocations: [],
      companySize: null,
      industry: null,
      description: null,
      scrapeQuality: 20,
      sourcePages: [],
      scrapedAt: new Date().toISOString(),
      reasoning: 'Fallback data - website scraping failed',
    }
  }
}

// Export singleton instance
export const companyResearcher = new CompanyResearcher()
