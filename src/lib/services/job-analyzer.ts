/**
 * Job Analyzer Service
 * Uses Claude AI to extract comprehensive job details from posting URLs
 *
 * Purpose:
 * - Read job application links and extract ALL relevant details
 * - Identify job location, position, department, seniority
 * - Determine company information and domain
 * - Extract requirements and keywords for contact matching
 */

import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// ============================================================
// TYPE DEFINITIONS
// ============================================================

export interface JobAnalysisResult {
  // Core job information
  jobTitle: string
  department: string | null
  seniority: 'intern' | 'entry' | 'mid' | 'senior' | 'lead' | 'executive'

  // Location details
  location: {
    city: string | null
    state: string | null
    country: string
    remote: boolean
    hybrid: boolean
    officeRequired: boolean
  }

  // Company information
  company: {
    name: string
    domain: string
    industry: string | null
    size: string | null
  }

  // Job details for matching
  keywords: string[]
  requiredSkills: string[]
  preferredSkills: string[]

  // Contact targeting hints
  likelyHiringManager: string | null // e.g., "Engineering Manager"
  targetDepartments: string[]
  teamSize: string | null

  // Metadata
  confidenceScore: number // 0-100
  analysisReasoning: string
  warnings: string[]
}

// ============================================================
// JOB ANALYZER CLASS
// ============================================================

export class JobAnalyzer {
  /**
   * Main method: Analyze a job posting URL
   */
  async analyzeJobUrl(jobUrl: string, jobId?: string): Promise<JobAnalysisResult> {
    console.log(`[JobAnalyzer] Starting analysis for: ${jobUrl}`)
    const startTime = Date.now()

    try {
      // Step 1: Fetch the job posting HTML
      const jobContent = await this.fetchJobContent(jobUrl)

      if (!jobContent) {
        throw new Error('Failed to fetch job posting content')
      }

      // Step 2: Use Claude to analyze the job posting
      const analysis = await this.analyzeWithClaude(jobContent, jobUrl)

      const duration = Math.round((Date.now() - startTime) / 1000)
      console.log(`[JobAnalyzer] Analysis complete in ${duration}s (confidence: ${analysis.confidenceScore}%)`)

      return analysis

    } catch (error) {
      console.error('[JobAnalyzer] Error:', error)
      throw new Error(`Job analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Fetch job posting content from URL
   */
  private async fetchJobContent(url: string): Promise<string> {
    try {
      console.log(`[JobAnalyzer] Fetching content from: ${url}`)

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const html = await response.text()

      // Extract text content from HTML (remove scripts, styles, etc.)
      const cleanText = this.extractTextFromHtml(html)

      // Limit to 50,000 characters to stay within token limits
      const truncated = cleanText.slice(0, 50000)

      console.log(`[JobAnalyzer] Fetched ${html.length} chars, cleaned to ${cleanText.length} chars`)

      return truncated

    } catch (error) {
      console.error('[JobAnalyzer] Fetch error:', error)
      throw new Error(`Failed to fetch job posting: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Extract clean text from HTML
   */
  private extractTextFromHtml(html: string): string {
    // Remove script and style tags
    let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')

    // Remove HTML tags
    text = text.replace(/<[^>]+>/g, ' ')

    // Decode HTML entities
    text = text.replace(/&nbsp;/g, ' ')
    text = text.replace(/&amp;/g, '&')
    text = text.replace(/&lt;/g, '<')
    text = text.replace(/&gt;/g, '>')
    text = text.replace(/&quot;/g, '"')

    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').trim()

    return text
  }

  /**
   * Use Claude AI to analyze job posting
   */
  private async analyzeWithClaude(jobContent: string, jobUrl: string): Promise<JobAnalysisResult> {
    console.log(`[JobAnalyzer] Analyzing with Claude AI...`)

    const prompt = `You are an expert job posting analyzer. Analyze the following job posting and extract ALL relevant details in a structured format.

JOB POSTING URL: ${jobUrl}

JOB POSTING CONTENT:
${jobContent}

ANALYSIS INSTRUCTIONS:

1. Extract the job title, department, and seniority level
2. Identify the exact location (city, state, country)
3. Determine if it's remote, hybrid, or office-required
4. Extract company name and guess the company domain (e.g., "Stripe" → "stripe.com")
5. Identify the industry and company size if mentioned
6. List key skills required and preferred
7. Extract important keywords for contact matching
8. Determine likely hiring manager role (e.g., "Engineering Manager" for a Software Engineer role)
9. Identify target departments (where this role sits)
10. Assess your confidence in this analysis (0-100)

IMPORTANT:
- Be precise with location details
- If remote, still identify headquarters location if mentioned
- Guess company domain intelligently (e.g., "Meta" → "meta.com", "Alphabet" → "google.com")
- For seniority, use: intern, entry, mid, senior, lead, or executive
- Provide clear reasoning for your analysis
- Flag any warnings or uncertainties

OUTPUT FORMAT (JSON only, no markdown):
{
  "jobTitle": "string",
  "department": "string or null",
  "seniority": "intern|entry|mid|senior|lead|executive",
  "location": {
    "city": "string or null",
    "state": "string or null",
    "country": "string",
    "remote": boolean,
    "hybrid": boolean,
    "officeRequired": boolean
  },
  "company": {
    "name": "string",
    "domain": "string (e.g., company.com)",
    "industry": "string or null",
    "size": "string or null (e.g., '100-500', '5000+')"
  },
  "keywords": ["array", "of", "relevant", "keywords"],
  "requiredSkills": ["array", "of", "required", "skills"],
  "preferredSkills": ["array", "of", "preferred", "skills"],
  "likelyHiringManager": "string or null (e.g., 'Engineering Manager')",
  "targetDepartments": ["array", "of", "departments"],
  "teamSize": "string or null",
  "confidenceScore": number (0-100),
  "analysisReasoning": "string explaining your analysis",
  "warnings": ["array", "of", "any", "concerns", "or", "uncertainties"]
}`

    try {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        temperature: 0.3,
        messages: [{
          role: 'user',
          content: prompt,
        }],
      })

      const responseText = message.content[0].type === 'text'
        ? message.content[0].text
        : ''

      // Parse JSON response
      const cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()

      const analysis = JSON.parse(cleanedResponse) as JobAnalysisResult

      // Validate required fields
      if (!analysis.jobTitle || !analysis.company?.name || !analysis.company?.domain) {
        throw new Error('Claude response missing required fields')
      }

      // Ensure confidence score is valid
      if (analysis.confidenceScore < 0 || analysis.confidenceScore > 100) {
        analysis.confidenceScore = 50
        analysis.warnings.push('Confidence score was invalid, defaulted to 50')
      }

      return analysis

    } catch (error) {
      console.error('[JobAnalyzer] Claude analysis error:', error)
      throw new Error(`AI analysis failed: ${error instanceof Error ? error.message : 'Parse error'}`)
    }
  }

  /**
   * Quick analysis from job data (when we already have job details from database)
   */
  async quickAnalyze(job: {
    title: string
    company: string
    location: string | null
    description: string
    url: string
  }): Promise<JobAnalysisResult> {
    console.log(`[JobAnalyzer] Quick analysis for: ${job.title} at ${job.company}`)

    const prompt = `Analyze this job posting and provide structured details.

JOB TITLE: ${job.title}
COMPANY: ${job.company}
LOCATION: ${job.location || 'Not specified'}
DESCRIPTION: ${job.description.slice(0, 5000)}
URL: ${job.url}

Provide the same JSON structure as before, but work with this limited information.`

    try {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
        temperature: 0.3,
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

      return JSON.parse(cleanedResponse) as JobAnalysisResult

    } catch (error) {
      console.error('[JobAnalyzer] Quick analysis error:', error)

      // Return fallback analysis
      return this.createFallbackAnalysis(job)
    }
  }

  /**
   * Create fallback analysis when AI fails
   */
  private createFallbackAnalysis(job: {
    title: string
    company: string
    location: string | null
    url: string
  }): JobAnalysisResult {
    // Extract domain from URL
    let domain = ''
    try {
      const url = new URL(job.url)
      domain = url.hostname.replace('www.', '')
    } catch {
      // Guess domain from company name
      domain = job.company.toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 20) + '.com'
    }

    // Guess seniority from title
    const titleLower = job.title.toLowerCase()
    let seniority: JobAnalysisResult['seniority'] = 'entry'
    if (titleLower.includes('intern')) seniority = 'intern'
    else if (titleLower.includes('senior') || titleLower.includes('sr')) seniority = 'senior'
    else if (titleLower.includes('lead') || titleLower.includes('staff')) seniority = 'lead'
    else if (titleLower.includes('principal') || titleLower.includes('director')) seniority = 'executive'
    else if (titleLower.includes('junior') || titleLower.includes('jr')) seniority = 'entry'
    else seniority = 'mid'

    // Parse location
    const locationParts = (job.location || '').split(',').map(s => s.trim())

    return {
      jobTitle: job.title,
      department: null,
      seniority,
      location: {
        city: locationParts[0] || null,
        state: locationParts[1] || null,
        country: locationParts[2] || 'United States',
        remote: job.location?.toLowerCase().includes('remote') || false,
        hybrid: job.location?.toLowerCase().includes('hybrid') || false,
        officeRequired: true,
      },
      company: {
        name: job.company,
        domain,
        industry: null,
        size: null,
      },
      keywords: [],
      requiredSkills: [],
      preferredSkills: [],
      likelyHiringManager: null,
      targetDepartments: [],
      teamSize: null,
      confidenceScore: 30,
      analysisReasoning: 'Fallback analysis used due to AI error',
      warnings: ['AI analysis failed, using fallback data'],
    }
  }
}

// Export singleton instance
export const jobAnalyzer = new JobAnalyzer()
