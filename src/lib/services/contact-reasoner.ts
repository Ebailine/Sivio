/**
 * AI-Powered Contact Reasoner
 * FULLY AUTONOMOUS agent that uses comprehensive job analysis and company research
 * to intelligently identify the EXACT right contacts for job applications
 */

import Anthropic from '@anthropic-ai/sdk'
import type { JobAnalysisResult } from './job-analyzer'
import type { CompanyResearchResult } from './company-researcher'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

interface JobContext {
  title: string
  company: string
  companyUrl?: string
  description?: string
  jobType: string // 'internship', 'entry-level', 'full-time'
  location?: string
}

interface EnhancedContext {
  jobAnalysis: JobAnalysisResult
  companyResearch: CompanyResearchResult
}

interface SearchStrategy {
  approach: 'hr-focused' | 'team-focused' | 'hybrid'
  targetTitles: string[]
  targetDepartments: string[]
  seniorityLevel: 'junior' | 'mid' | 'senior' | 'executive'
  reasoning: string
  confidenceScore: number // 0-100
  companyDomain: string
  searchKeywords: string[]
  specificPeople?: string[] // Names of specific people to target from company research
}

interface ContactAnalysis {
  contactIndex: number
  relevanceScore: number // 0-100
  reasoning: string
  recommendedAction: 'include' | 'exclude'
  keyStrengths: string[]
}

export class ContactReasoner {
  /**
   * Step 1: Analyze job and create optimal search strategy
   * NOW USES ENHANCED DATA when available for much smarter targeting
   */
  async analyzeJob(
    job: JobContext,
    enhancedContext?: EnhancedContext
  ): Promise<SearchStrategy> {

    // Build comprehensive context for AI
    let contextDescription = `Job Details:
- Title: ${job.title}
- Company: ${job.company}
- Type: ${job.jobType}
- Location: ${job.location || 'Not specified'}
- Description: ${job.description?.substring(0, 500) || 'Not provided'}`

    // Add enhanced job analysis if available
    if (enhancedContext?.jobAnalysis) {
      const ja = enhancedContext.jobAnalysis
      contextDescription += `

ENHANCED JOB ANALYSIS:
- Department: ${ja.department || 'Unknown'}
- Seniority Level: ${ja.seniority}
- Likely Hiring Manager: ${ja.likelyHiringManager || 'Unknown'}
- Target Departments: ${ja.targetDepartments?.join(', ') || 'Unknown'}
- Required Skills: ${ja.requiredSkills?.slice(0, 5).join(', ') || 'Unknown'}
- Team Size: ${ja.teamSize || 'Unknown'}
- Company Industry: ${ja.company.industry || 'Unknown'}
- Company Size: ${ja.company.size || 'Unknown'}`
    }

    // Add company research data if available
    if (enhancedContext?.companyResearch) {
      const cr = enhancedContext.companyResearch
      contextDescription += `

COMPANY RESEARCH (GOLD DATA):
- ${cr.teamMembers.length} team members identified from website/LinkedIn
- ${cr.departments.length} departments mapped
- ${cr.officeLocations.length} office locations

KEY TEAM MEMBERS (from company website/LinkedIn):
${cr.teamMembers.slice(0, 10).map(tm =>
  `  • ${tm.name} - ${tm.title}${tm.department ? ` (${tm.department})` : ''}${tm.isHiringRole ? ' [HIRING ROLE]' : ''}`
).join('\n')}

DEPARTMENTS:
${cr.departments.slice(0, 5).map(d =>
  `  • ${d.name}${d.teamSize ? ` - ${d.teamSize}` : ''}`
).join('\n')}`
    }

    const prompt = `You are an expert at identifying the EXACT right people to contact AFTER submitting a job application.

${contextDescription}

CRITICAL INSTRUCTIONS - FOLLOW EXACTLY:

1. PRIMARY TARGETS (MUST PRIORITIZE): Find 2-3 people from HR/Recruiting/Talent Acquisition
   - Job titles: "Recruiter", "Talent Acquisition", "HR Manager", "People Operations", "Human Resources"
   - These people ACTUALLY review applications and schedule interviews
   - ALWAYS search for these first

2. SECONDARY TARGETS: Find 1-2 people from the team/department for this role
   - Hiring managers, team leads, or department heads related to the position
   - Example: For "Software Engineer" → find "Engineering Manager" or "VP Engineering"
   - Example: For "Real Estate Agent" → find "Broker" or "Sales Manager"

3. PRIORITIZATION RULES:
   - HR/Recruiting contacts are MORE important than team contacts
   - A mid-level recruiter is more valuable than a C-level executive
   - Target people who actually handle applications, not just decision makers

${enhancedContext?.companyResearch ? 'IMPORTANT: We have actual team member names from the company website/LinkedIn above. PRIORITIZE anyone with HR/Recruiting/Talent in their title.' : ''}

Return ONLY valid JSON (no markdown, no explanations):
{
  "approach": "hybrid",
  "targetTitles": ["Recruiter", "Talent Acquisition Manager", "HR Manager", "Engineering Manager"],
  "targetDepartments": ["Human Resources", "Recruiting", "Engineering"],
  "seniorityLevel": "mid",
  "reasoning": "Targeting HR first, then team leads",
  "confidenceScore": 85,
  "companyDomain": "${job.companyUrl || job.company.toLowerCase().replace(/\s+/g, '') + '.com'}",
  "searchKeywords": ["recruiting", "talent", "hr", "hiring"],
  "specificPeople": ["names of HR/recruiting people from org chart"]
}`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      temperature: 0,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from AI')
    }

    let jsonText = content.text.trim()
    const codeBlockMatch = jsonText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1]
    } else {
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        jsonText = jsonMatch[0]
      }
    }

    let strategy: SearchStrategy
    try {
      strategy = JSON.parse(jsonText)

      // Ensure arrays are never undefined
      strategy.targetTitles = strategy.targetTitles || []
      strategy.targetDepartments = strategy.targetDepartments || []
      strategy.searchKeywords = strategy.searchKeywords || []
      strategy.specificPeople = strategy.specificPeople || []

    } catch (error) {
      console.error('Failed to parse AI response as JSON:', jsonText.substring(0, 200))
      throw new Error(`AI returned invalid JSON. Response started with: "${jsonText.substring(0, 50)}"`)
    }

    console.log('AI Strategy Generated:', {
      approach: strategy.approach,
      confidence: strategy.confidenceScore,
      targetTitles: strategy.targetTitles,
      specificPeople: strategy.specificPeople?.length || 0,
    })

    return strategy
  }

  /**
   * Step 2: Research company to improve search accuracy
   */
  async researchCompany(
    companyName: string,
    companyUrl?: string
  ): Promise<{
    verifiedDomain: string
    companySize?: string
    industry?: string
    hiringStructure?: string
  }> {
    // First try to extract domain from URL if provided
    if (companyUrl) {
      try {
        const url = new URL(companyUrl.startsWith('http') ? companyUrl : `https://${companyUrl}`)
        const hostname = url.hostname.replace(/^www\./, '')

        // If it looks like a company domain (not a job board), use it directly
        const jobBoards = ['indeed.com', 'linkedin.com', 'glassdoor.com', 'adzuna.com', 'monster.com', 'ziprecruiter.com']
        if (!jobBoards.some(jb => hostname.includes(jb))) {
          console.log(`✅ Extracted domain from URL: ${hostname}`)
          return {
            verifiedDomain: hostname,
            companySize: 'unknown',
            industry: 'unknown',
            hiringStructure: 'unknown'
          }
        }
      } catch (error) {
        console.log('Failed to extract domain from URL:', error)
      }
    }

    // Fall back to AI guess
    console.log(`⚠️  No domain provided - asking AI to guess for: ${companyName}`)

    const prompt = `Research this company and return ONLY valid JSON (no explanations, no markdown, no code blocks):

Company: ${companyName}
${companyUrl ? `Website: ${companyUrl}` : ''}

IMPORTANT: If you don't know the exact domain, make your best guess. Common patterns:
- Remove spaces and special characters: "ABC Company Inc" -> "abccompany.com"
- Remove legal suffixes: .inc, .llc, .ltd
- Use acronyms if company name is long

Return ONLY this JSON structure:
{
  "verifiedDomain": "company.com",
  "companySize": "large",
  "industry": "technology",
  "hiringStructure": "centralized HR team"
}`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      temperature: 0,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from AI')
    }

    // Extract JSON from response
    let jsonText = content.text.trim()
    const codeBlockMatch = jsonText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1]
    } else {
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        jsonText = jsonMatch[0]
      }
    }

    try {
      const result = JSON.parse(jsonText)
      console.log('Company research:', result)
      return result
    } catch (error) {
      console.error('Failed to parse company research as JSON:', jsonText.substring(0, 200))
      // Return fallback
      return {
        verifiedDomain: companyUrl || `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        companySize: 'unknown',
        industry: 'unknown',
        hiringStructure: 'unknown'
      }
    }
  }

  /**
   * Step 3: Analyze and rank contacts found from Snov.io
   * NOW PRIORITIZES specific people identified from company research
   */
  async rankContacts(
    contacts: any[],
    job: JobContext,
    strategy: SearchStrategy,
    enhancedContext?: EnhancedContext
  ): Promise<Array<any & { analysis: ContactAnalysis }>> {

    // Build contact list for AI with enhanced matching
    let contactList = contacts.map((c, i) => {
      let contactStr = `${i}. ${c.full_name || 'Unknown'} - ${c.position || 'Not specified'} (${c.email_status})`

      // Check if this contact matches any specific people we identified
      if (strategy.specificPeople && strategy.specificPeople.length > 0) {
        const matchesSpecificPerson = strategy.specificPeople.some(name =>
          c.full_name?.toLowerCase().includes(name.toLowerCase()) ||
          name.toLowerCase().includes(c.full_name?.toLowerCase() || '')
        )
        if (matchesSpecificPerson) {
          contactStr += ' [MATCHES ORG CHART - PRIORITY]'
        }
      }

      return contactStr
    }).join('\n')

    let contextInfo = `Job: ${job.title} at ${job.company}
Target: ${strategy.targetTitles?.join(', ') || 'Any relevant contacts'}
Approach: ${strategy.approach}
${strategy.specificPeople && strategy.specificPeople.length > 0 ? `\nPRIORITY TARGETS from org chart: ${strategy.specificPeople.join(', ')}` : ''}`

    const prompt = `You are ranking contacts for reaching out AFTER submitting a job application.

${contextInfo}

Contacts found (${contacts.length}):
${contactList}

CRITICAL RANKING RULES - FOLLOW EXACTLY:

IMPORTANT: NEVER return zero contacts. It's better to return SOME contacts than NONE.

1. HR/RECRUITING CONTACTS GET HIGHEST SCORES (85-100):
   - Titles containing: "Recruiter", "Talent Acquisition", "HR", "Human Resources", "People Operations"
   - These people ACTUALLY review applications and schedule interviews
   - ALWAYS rank these highest, even if they're junior level
   - Examples: "HR Manager" = 95, "Recruiter" = 90, "People Ops" = 85

2. TEAM/DEPARTMENT CONTACTS GET GOOD SCORES (60-85):
   - People in the SAME ROLE as the job (e.g., "Financial Advisor" for Financial Advisor role)
   - Hiring managers, team leads, managers related to the role
   - Branch managers, office managers, department heads
   - Examples:
     * "Financial Advisor" for Financial Advisor role = 75-80
     * "Engineering Manager" for engineer role = 70-75
     * "Sales Manager" for sales role = 70-75
     * "Branch Manager" = 65-70

3. ACCEPTABLE CONTACTS (50-65):
   - Directors, VPs in related departments
   - Senior team members who might know about hiring
   - Office administrators at smaller companies
   - Anyone who works at the company and might help

4. ONLY EXCLUDE IF CLEARLY IRRELEVANT (below 50):
   - CEO of large company (500+ employees) = 45
   - Completely unrelated department (e.g., "Chef" for tech role) = 40
   - Generic/support emails = 30

PRAGMATIC APPROACH:
- If you find HR/recruiting contacts → prioritize them
- If NO HR contacts → accept team members in the same role
- If ONLY executives → include them anyway (better than nothing)
- NEVER return an empty list if contacts exist

Return ALL contacts ranked by relevance. Mark ALL as "include" unless clearly irrelevant (score < 50).

Return ONLY valid JSON array (no markdown, no explanations):
[
  {
    "contactIndex": 0,
    "relevanceScore": 75,
    "reasoning": "Financial Advisor - same role, can provide insights on hiring process",
    "recommendedAction": "include",
    "keyStrengths": ["Same role", "Knows hiring process"]
  }
]`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      temperature: 0,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from AI')
    }

    let jsonText = content.text
    const codeBlockMatch = jsonText.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/)
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1]
    } else {
      const jsonMatch = jsonText.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        jsonText = jsonMatch[0]
      }
    }

    const rankings: ContactAnalysis[] = JSON.parse(jsonText)

    // Map rankings back to contacts and boost verified contacts
    let rankedContacts = rankings
      .filter(r => r.recommendedAction === 'include')
      .map(r => {
        const contact = contacts[r.contactIndex]

        // Calculate boosted score based on verification status
        let boostedScore = r.relevanceScore

        // Boost HIGH confidence (verified email) contacts by +15 points
        if (contact.confidence_level === 'high' || contact.confidence_score >= 80) {
          boostedScore += 15
          console.log(`  ✅ Boosted "${contact.full_name}" from ${r.relevanceScore} → ${boostedScore} (HIGH confidence, verified email)`)
        }
        // Boost MEDIUM confidence contacts by +8 points
        else if (contact.confidence_level === 'medium' || contact.confidence_score >= 60) {
          boostedScore += 8
          console.log(`  ⚠️  Boosted "${contact.full_name}" from ${r.relevanceScore} → ${boostedScore} (MEDIUM confidence)`)
        }
        // No boost for LOW confidence (AI-generated names)

        return {
          ...contact,
          analysis: {
            ...r,
            // Store both original and boosted scores
            originalRelevanceScore: r.relevanceScore,
            relevanceScore: boostedScore,
          },
        }
      })
      .sort((a, b) => b.analysis.relevanceScore - a.analysis.relevanceScore) // Sort by BOOSTED score
      .slice(0, 4) // Top 4 only

    // FALLBACK: If AI returned 0 contacts but we have contacts, use them anyway
    if (rankedContacts.length === 0 && contacts.length > 0) {
      console.warn('⚠️  AI returned 0 contacts - using fallback to include all available contacts')

      // Use ALL contacts with a default analysis
      rankedContacts = contacts.slice(0, 4).map((contact, index) => ({
        ...contact,
        analysis: {
          contactIndex: index,
          relevanceScore: 60, // Acceptable score
          reasoning: `Contact at ${job.company} - better to reach out than skip`,
          recommendedAction: 'include' as const,
          keyStrengths: ['Works at target company', 'May have hiring insights'],
        },
      }))

      console.log(`✅ Fallback: Returning ${rankedContacts.length} contacts with default analysis`)
    }

    console.log(`AI ranked ${rankedContacts.length} top contacts from ${contacts.length} candidates`)
    return rankedContacts
  }
}

export const contactReasoner = new ContactReasoner()
