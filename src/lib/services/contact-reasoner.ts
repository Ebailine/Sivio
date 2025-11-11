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

1. HR/RECRUITING CONTACTS GET HIGHEST SCORES (90-100):
   - Titles containing: "Recruiter", "Talent Acquisition", "HR", "Human Resources", "People Operations"
   - These people ACTUALLY review applications and schedule interviews
   - ALWAYS rank these highest, even if they're junior level

2. TEAM/DEPARTMENT CONTACTS GET MEDIUM SCORES (70-85):
   - Hiring managers, team leads, VPs related to the role
   - Examples: "Engineering Manager", "Sales Director", "Broker"
   - Only rank high if they match the job department

3. AUTOMATIC EXCLUSIONS (score below 60):
   - Generic roles: "CEO", "CFO", "President" (unless small company)
   - Unrelated departments
   - Administrative staff not involved in hiring

4. SCORING EXAMPLES:
   - "HR Manager" = 95-100 (reviews all applications)
   - "Recruiter" = 90-95 (schedules interviews)
   - "Engineering Manager" for engineer role = 80-85 (hiring decision)
   - "Broker" for sales role = 75-80 (team lead)
   - "CEO" of large company = 50 (too senior, skip)

Return top 4 contacts. MUST include at least 2 HR/recruiting if available.

Return ONLY valid JSON array (no markdown, no explanations):
[
  {
    "contactIndex": 0,
    "relevanceScore": 95,
    "reasoning": "HR Manager - directly reviews applications and schedules interviews",
    "recommendedAction": "include",
    "keyStrengths": ["Reviews applications", "Schedules interviews"]
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

    // Map rankings back to contacts
    const rankedContacts = rankings
      .filter(r => r.recommendedAction === 'include')
      .map(r => ({
        ...contacts[r.contactIndex],
        analysis: r,
      }))
      .sort((a, b) => b.analysis.relevanceScore - a.analysis.relevanceScore)
      .slice(0, 4) // Top 4 only

    console.log(`AI ranked ${rankedContacts.length} top contacts from ${contacts.length} candidates`)
    return rankedContacts
  }
}

export const contactReasoner = new ContactReasoner()
