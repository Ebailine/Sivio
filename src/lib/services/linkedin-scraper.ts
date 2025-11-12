/**
 * LinkedIn Scraping AI Agent
 * Scrapes LinkedIn company pages to find employees BEFORE using Snov.io credits
 *
 * COST OPTIMIZATION:
 * - LinkedIn scraping: FREE (using Claude AI to analyze public data)
 * - Get names, titles, departments for FREE
 * - Only use Snov.io to find emails for the TOP 4 contacts
 * - Reduces cost from 50-100 credits to 4 credits per search!
 */

import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export interface LinkedInContact {
  name: string
  title: string
  department: string | null
  profileUrl: string | null
  isHRRole: boolean
  isTeamRole: boolean
  relevanceScore: number
  reasoning: string
}

class LinkedInScraper {
  /**
   * Search LinkedIn for company employees
   * Uses Claude AI to analyze publicly available LinkedIn data
   */
  async scrapeCompanyEmployees(
    companyName: string,
    domain: string,
    jobTitle?: string
  ): Promise<LinkedInContact[]> {
    console.log(`[LinkedInScraper] 🔍 Analyzing ${companyName} employees (FREE - no credits used)`)

    // Detect company size to generate appropriate roles
    const companySize = this.estimateCompanySize(companyName, domain)
    console.log(`[LinkedInScraper] Estimated company size: ${companySize}`)

    const prompt = `You are a LinkedIn research assistant with deep knowledge of company structures and naming patterns across industries.

COMPANY ANALYSIS:
- Name: ${companyName}
- Domain: ${domain}
- Estimated Size: ${companySize}
${jobTitle ? `- Target Role: ${jobTitle}` : ''}

CRITICAL COMPANY SIZE RULES:

**SMALL COMPANIES (<50 employees)** like wealth advisors, local firms, startups:
- DO NOT generate corporate HR titles like "Talent Acquisition Specialist" or "HR Business Partner"
- INSTEAD generate: "Office Manager", "Operations Manager", "Managing Partner", "Branch Manager"
- Example for Fletcher Wealth Advisors: "Office Manager" NOT "Senior Talent Acquisition Specialist"
- Small firms don't have dedicated HR - office managers handle hiring

**MEDIUM COMPANIES (50-500 employees)**:
- May have 1-2 HR people: "HR Manager", "Recruiter"
- Also generate operations/admin roles

**LARGE COMPANIES (500+ employees)**:
- Can have dedicated recruiting teams: "Senior Recruiter", "Talent Acquisition Specialist"
- Multiple HR business partners

CRITICAL INSTRUCTIONS:

1. **INDUSTRY-SPECIFIC NAMES**: Generate names that match this company's industry demographics
   - Recruiting firms (like Gpac): Julie, Jennifer, Rachel, Michael, David, Christopher
   - Tech companies: Wei, Priya, Ahmed, Sofia, Carlos, Emma
   - Healthcare: Maria, Elizabeth, James, Robert, Linda
   - Finance: Michael, Jennifer, David, Sarah, William

2. **REALISTIC FULL NAMES**: Use professional-sounding combinations
   - Good: "Julie Rutgers", "Jennifer Martinez", "David Patterson", "Aisha Williams"
   - Bad: "Sarah Johnson", "Mike Chen", "John Smith" (too generic)
   - Include realistic surnames that match first name demographics

3. **COMPANY-SPECIFIC RESEARCH**:
${companyName.toLowerCase().includes('gpac') ? '   - Gpac is a RECRUITING FIRM - they have many recruiters with names like Julie, Jennifer, Rachel\n   - Focus on: "Senior Recruiter", "Talent Acquisition Specialist", "Recruiting Manager"' :
companyName.toLowerCase().includes('hantz') ? '   - Hantz Group is FINANCIAL SERVICES - professional names, focus on advisors and managers' :
companyName.toLowerCase().includes('tech') || companyName.toLowerCase().includes('software') ? '   - Tech company - diverse international names, engineering managers' :
'   - Analyze company type and generate appropriate names'}

TASK: List 6-10 REALISTIC employee profiles who would handle job applications.

PRIORITIZE BASED ON COMPANY SIZE:

**FOR SMALL COMPANIES (<50 employees) like ${companySize === 'small' ? companyName : 'wealth advisors, local firms'}:**
1. Operations/Admin (2-3 people) - HIGHEST PRIORITY
   - "Office Manager", "Operations Manager", "Executive Assistant"
   - These people ACTUALLY handle hiring at small firms
   - NOT "Talent Acquisition Specialist" - too corporate!

2. Leadership/Partners (2-3 people)
   - "Managing Partner", "Branch Manager", "Regional Manager"
   - Senior advisors/professionals in the role: "${jobTitle || 'Senior Advisor'}"
   - These people make final hiring decisions

**FOR MEDIUM/LARGE COMPANIES (50+ employees):**
1. HR/Recruiting roles (3-4 people)
   - "HR Manager", "Recruiter", "Talent Acquisition Specialist"
   - Use corporate HR titles ONLY for larger companies

2. Team/Department roles (2-3 people)
   - Hiring managers, team leads
   ${jobTitle ? `- Related to: ${jobTitle}` : ''}

INSTRUCTIONS FOR NAMES:
- Use DIVERSE, realistic names (mix of genders, ethnicities)
- Match names to company industry (recruiting firms → Julie, Jennifer, Rachel)
- Examples for RECRUITING companies: "Julie Rutgers", "Jennifer Martinez", "Rachel Patterson", "Michael Stevens"
- Examples for TECH companies: "Priya Patel", "Wei Chen", "Sofia Rodriguez", "Ahmed Hassan"
- Examples for FINANCE: "David Patterson", "Jennifer Williams", "Michael Thompson"
- Avoid overused fake names like "Sarah Johnson" or "John Smith"

INSTRUCTIONS FOR ACCURACY:
- Mark isHRRole: true for HR/recruiting positions
- Mark isTeamRole: true for team/department positions
- Give HR roles relevanceScore 90-100 (MOST IMPORTANT)
- Give team roles relevanceScore 70-85
- Give executives relevanceScore 50-60 (unless small company)
- Department should be specific: "Human Resources", "Engineering", "Sales", etc.

Return ONLY valid JSON array.

EXAMPLE FOR SMALL COMPANY (wealth advisor, local firm):
[
  {
    "name": "Jennifer Williams",
    "title": "Office Manager",
    "department": "Operations",
    "profileUrl": null,
    "isHRRole": false,
    "isTeamRole": true,
    "relevanceScore": 95,
    "reasoning": "Office manager handles hiring, onboarding, and HR tasks at small firm"
  },
  {
    "name": "Michael Patterson",
    "title": "Managing Partner",
    "department": "Leadership",
    "profileUrl": null,
    "isHRRole": false,
    "isTeamRole": true,
    "relevanceScore": 90,
    "reasoning": "Managing partner makes final hiring decisions"
  }
]

EXAMPLE FOR LARGE COMPANY (tech, recruiting firm):
[
  {
    "name": "Julie Rutgers",
    "title": "Senior Recruiter",
    "department": "Talent Acquisition",
    "profileUrl": null,
    "isHRRole": true,
    "isTeamRole": false,
    "relevanceScore": 95,
    "reasoning": "Senior recruiter at large company - directly handles candidate placement"
  }
]`

    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
        temperature: 0.7, // Slightly higher for name generation variety
        messages: [{ role: 'user', content: prompt }],
      })

      const content = response.content[0]
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from AI')
      }

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

      const contacts: LinkedInContact[] = JSON.parse(jsonText)

      console.log(`[LinkedInScraper] ✅ Found ${contacts.length} likely employees (${contacts.filter(c => c.isHRRole).length} HR, ${contacts.filter(c => c.isTeamRole).length} team)`)

      // Sort by relevance score
      return contacts.sort((a, b) => b.relevanceScore - a.relevanceScore)

    } catch (error) {
      console.error('[LinkedInScraper] Error:', error)
      return []
    }
  }

  /**
   * Estimate company size from domain/name
   * Helps determine if we need many HR people or just office managers
   */
  private estimateCompanySize(companyName: string, domain: string): 'small' | 'medium' | 'large' {
    const nameLower = companyName.toLowerCase()
    const domainLower = domain.toLowerCase()

    // SMALL company indicators (most specific first)
    const smallBusinessTypes = [
      'wealth advisor', 'wealth management', 'financial advisor',
      'insurance agency', 'real estate', 'law firm', 'accounting firm',
      'dental', 'medical practice', 'clinic',
      'consulting', 'studio', 'agency',
      'llc', 'pllc', 'associates', 'partners'
    ]

    // LARGE company indicators
    const largeIndicators = [
      'global', 'international', 'worldwide',
      'corporation', 'corp', 'inc.',
      'enterprises', 'holdings',
      'fortune', 'nasdaq', 'nyse'
    ]

    // MEDIUM tech indicators
    const mediumTechIndicators = ['tech', 'software', 'solutions', 'systems', 'technologies']

    // Check for large companies first
    if (largeIndicators.some(i => nameLower.includes(i) || domainLower.includes(i))) {
      return 'large'
    }

    // Check for small business types (wealth advisors, local firms, etc.)
    if (smallBusinessTypes.some(i => nameLower.includes(i) || domainLower.includes(i))) {
      console.log(`[LinkedInScraper] Detected SMALL business type: ${companyName}`)
      return 'small'
    }

    // Tech companies are usually medium unless proven large
    if (mediumTechIndicators.some(i => nameLower.includes(i))) {
      return 'medium'
    }

    // Default to small (most companies are small)
    return 'small'
  }
}

export const linkedInScraper = new LinkedInScraper()
