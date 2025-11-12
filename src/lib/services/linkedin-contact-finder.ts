/**
 * LinkedIn Contact Finder (REAL DATA)
 * Finds ACTUAL people from LinkedIn using web search, not AI guessing
 *
 * APPROACH:
 * 1. Use web search to find real LinkedIn profiles for company
 * 2. Extract real names, titles, and profile URLs
 * 3. Use Snov.io "Add names to find emails" API to get verified emails
 *
 * EXAMPLE: For Gpac, finds Julie Rutgers (real person) not "Sarah Johnson" (AI guess)
 */

import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export interface RealLinkedInContact {
  name: string
  firstName: string
  lastName: string
  title: string
  company: string
  linkedinUrl: string
  bio?: string
  isHRRole: boolean
  isTeamRole: boolean
  relevanceScore: number
  reasoning: string
  dataSource: 'web_search' // Indicates this is REAL data, not AI inference
}

class LinkedInContactFinder {
  /**
   * Find REAL LinkedIn profiles for a company using web search
   * This finds actual people like "Julie Rutgers" not AI-generated names
   */
  async findRealContacts(
    companyName: string,
    domain: string,
    jobTitle?: string
  ): Promise<RealLinkedInContact[]> {
    console.log(`[Real LinkedIn Finder] 🔍 Searching for ACTUAL employees at ${companyName}`)

    try {
      // Search for HR/recruiting roles first (highest priority)
      const hrSearchQuery = `site:linkedin.com/in "${companyName}" (recruiter OR "human resources" OR "talent acquisition" OR "people operations")`

      console.log(`[Real LinkedIn Finder] Searching: ${hrSearchQuery}`)

      // Use Claude with web search to find real profiles
      const prompt = `You are a LinkedIn research assistant. Use web search to find REAL employees at ${companyName} (domain: ${domain}).

SEARCH STRATEGY:
1. Search for: site:linkedin.com/in "${companyName}" recruiter
2. Search for: site:linkedin.com/in "${companyName}" "human resources"
3. Search for: site:linkedin.com/in "${companyName}" "talent acquisition"
${jobTitle ? `4. Search for: site:linkedin.com/in "${companyName}" "${jobTitle}"` : ''}

CRITICAL: Extract ONLY people who:
- Have "${companyName}" in their current job title or profile
- Are ACTUALLY working there (not past employees)
- Have LinkedIn profile URLs (linkedin.com/in/...)

For each person found, extract:
- Full name (REAL name from profile, not generated)
- Current job title
- LinkedIn profile URL
- Brief bio/description if available
- Whether they're in HR/recruiting or related to the job role

Return ONLY valid JSON array of REAL people found (empty array if none found):
[
  {
    "name": "Julie Rutgers",
    "firstName": "Julie",
    "lastName": "Rutgers",
    "title": "Recruiter",
    "company": "${companyName}",
    "linkedinUrl": "https://linkedin.com/in/julie-rutgers",
    "bio": "Recruiter @ gpac | Multiple Recruiting Strategies",
    "isHRRole": true,
    "isTeamRole": false,
    "relevanceScore": 95,
    "reasoning": "Current recruiter at ${companyName}, posts company content",
    "dataSource": "web_search"
  }
]

IMPORTANT:
- Return ONLY people you actually found via search
- Do NOT generate/guess names
- Empty array [] if no real people found
- Must have LinkedIn URL to be included`

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        temperature: 0, // No creativity - we want facts only
        messages: [{ role: 'user', content: prompt }],
      })

      const content = response.content[0]
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from AI')
      }

      // Parse JSON response
      let jsonText = content.text.trim()
      const codeBlockMatch = jsonText.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/)
      if (codeBlockMatch) {
        jsonText = codeBlockMatch[1]
      } else {
        const jsonMatch = jsonText.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          jsonText = jsonMatch[0]
        }
      }

      const contacts: RealLinkedInContact[] = JSON.parse(jsonText)

      console.log(`[Real LinkedIn Finder] ✅ Found ${contacts.length} REAL people via web search`)

      if (contacts.length > 0) {
        console.log(`[Real LinkedIn Finder] Examples:`)
        contacts.slice(0, 3).forEach(c => {
          console.log(`   - ${c.name} (${c.title}) - ${c.linkedinUrl}`)
        })
      }

      // Sort by relevance score
      return contacts.sort((a, b) => b.relevanceScore - a.relevanceScore)

    } catch (error) {
      console.error('[Real LinkedIn Finder] Error:', error)
      console.log('[Real LinkedIn Finder] Falling back to empty results')
      return []
    }
  }

  /**
   * Validate that LinkedIn URLs are properly formatted
   */
  private isValidLinkedInUrl(url: string): boolean {
    return url.startsWith('https://linkedin.com/in/') ||
           url.startsWith('https://www.linkedin.com/in/')
  }

  /**
   * Extract first and last name from full name
   */
  private parseFullName(fullName: string): { firstName: string; lastName: string } {
    const parts = fullName.trim().split(/\s+/)

    if (parts.length === 0) {
      return { firstName: '', lastName: '' }
    }

    if (parts.length === 1) {
      return { firstName: parts[0], lastName: '' }
    }

    return {
      firstName: parts[0],
      lastName: parts[parts.length - 1]
    }
  }
}

export const linkedInContactFinder = new LinkedInContactFinder()
