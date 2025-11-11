/**
 * AI-Powered Contact Reasoner
 * Uses Claude to intelligently analyze jobs, research companies,
 * and rank contacts to minimize Snov.io credit usage while maximizing quality
 */

import Anthropic from '@anthropic-ai/sdk'

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

interface SearchStrategy {
  approach: 'hr-focused' | 'team-focused' | 'hybrid'
  targetTitles: string[]
  targetDepartments: string[]
  seniorityLevel: 'junior' | 'mid' | 'senior' | 'executive'
  reasoning: string
  confidenceScore: number // 0-100
  companyDomain: string
  searchKeywords: string[]
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
   */
  async analyzeJob(job: JobContext): Promise<SearchStrategy> {
    const prompt = `You are an expert recruiter helping identify the best contacts to reach for job applications.

Job Details:
- Title: ${job.title}
- Company: ${job.company}
- Type: ${job.jobType}
- Location: ${job.location || 'Not specified'}
- Description: ${job.description?.substring(0, 500) || 'Not provided'}

Your task:
1. Determine if this is HR-focused (recruiters/HR) or team-focused (hiring managers/team leads)
2. Identify specific job titles to target (be precise - e.g., "Technical Recruiter" not just "Recruiter")
3. Determine departments to search
4. Assess seniority level needed
5. Extract/guess company domain from company name
6. Rate your confidence (0-100) in this strategy

For internships/entry-level: Usually HR/recruiting contacts
For technical roles: Mix of recruiters + engineering managers
For senior roles: Directors/VPs in the department

Respond in this exact JSON format:
{
  "approach": "hr-focused" | "team-focused" | "hybrid",
  "targetTitles": ["specific", "job", "titles"],
  "targetDepartments": ["department", "names"],
  "seniorityLevel": "junior|mid|senior|executive",
  "reasoning": "why this strategy makes sense",
  "confidenceScore": 85,
  "companyDomain": "company.com",
  "searchKeywords": ["keyword1", "keyword2"]
}

Be specific and actionable. This will directly determine our search.`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
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

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = content.text
    const codeBlockMatch = jsonText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1]
    } else {
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        jsonText = jsonMatch[0]
      }
    }

    const strategy: SearchStrategy = JSON.parse(jsonText)

    console.log('AI Strategy Generated:', {
      approach: strategy.approach,
      confidence: strategy.confidenceScore,
      targetTitles: strategy.targetTitles,
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
    const prompt = `Research this company: ${companyName}
${companyUrl ? `Website: ${companyUrl}` : ''}

Provide:
1. Correct company domain (e.g., google.com, not www.google.com)
2. Company size (startup/small/medium/large/enterprise)
3. Industry
4. Typical hiring structure (centralized HR vs distributed hiring)

Respond in JSON:
{
  "verifiedDomain": "company.com",
  "companySize": "large",
  "industry": "technology",
  "hiringStructure": "centralized HR team"
}`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
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
    let jsonText = content.text
    const codeBlockMatch = jsonText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1]
    } else {
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        jsonText = jsonMatch[0]
      }
    }

    const result = JSON.parse(jsonText)
    console.log('Company research:', result)
    return result
  }

  /**
   * Step 3: Analyze and rank contacts found from Snov.io
   */
  async rankContacts(
    contacts: any[],
    job: JobContext,
    strategy: SearchStrategy
  ): Promise<Array<any & { analysis: ContactAnalysis }>> {
    const prompt = `You are ranking contacts for job applications.

Job: ${job.title} at ${job.company}
Strategy: ${strategy.reasoning}
Target: ${strategy.targetTitles.join(', ')}

Contacts Found (${contacts.length}):
${contacts.map((c, i) => `
${i + 1}. ${c.full_name || 'Unknown'}
   Position: ${c.position || 'Not specified'}
   Email: ${c.email}
   Status: ${c.email_status}
`).join('\n')}

For each contact, rate 0-100 on:
- Position relevance to job
- Likelihood they're involved in hiring
- Contact quality (verified email, etc.)

Return top 4 contacts as JSON array:
[
  {
    "contactIndex": 0,
    "relevanceScore": 95,
    "reasoning": "Senior recruiter in tech team",
    "recommendedAction": "include",
    "keyStrengths": ["verified email", "senior position"]
  }
]

Only include contacts scoring 70+. If fewer than 4 score 70+, return what you have.`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
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

    // Extract JSON array from response
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
