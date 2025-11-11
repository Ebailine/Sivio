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
    const prompt = `You are an expert recruiter. Analyze this job and return ONLY valid JSON (no explanations, no markdown).

Job Details:
- Title: ${job.title}
- Company: ${job.company}
- Type: ${job.jobType}
- Location: ${job.location || 'Not specified'}
- Description: ${job.description?.substring(0, 500) || 'Not provided'}

Return ONLY this JSON structure (no markdown, no code blocks, no explanations):
{
  "approach": "hr-focused",
  "targetTitles": ["Technical Recruiter", "Talent Acquisition Manager"],
  "targetDepartments": ["Human Resources", "Recruiting"],
  "seniorityLevel": "mid",
  "reasoning": "Brief explanation",
  "confidenceScore": 85,
  "companyDomain": "company.com",
  "searchKeywords": ["recruiting", "talent"]
}`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
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

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = content.text.trim()

    // Remove markdown code blocks if present
    const codeBlockMatch = jsonText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1]
    } else {
      // Try to extract JSON object
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        jsonText = jsonMatch[0]
      }
    }

    let strategy: SearchStrategy
    try {
      strategy = JSON.parse(jsonText)
    } catch (error) {
      console.error('Failed to parse AI response as JSON:', jsonText.substring(0, 200))
      throw new Error(`AI returned invalid JSON. Response started with: "${jsonText.substring(0, 50)}"`)
    }

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
    const prompt = `Research this company and return ONLY valid JSON (no explanations, no markdown, no code blocks):

Company: ${companyName}
${companyUrl ? `Website: ${companyUrl}` : ''}

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
   */
  async rankContacts(
    contacts: any[],
    job: JobContext,
    strategy: SearchStrategy
  ): Promise<Array<any & { analysis: ContactAnalysis }>> {
    const prompt = `Rank these contacts and return ONLY valid JSON array (no explanations, no markdown, no code blocks).

Job: ${job.title} at ${job.company}
Target: ${strategy.targetTitles.join(', ')}

Contacts (${contacts.length}):
${contacts.map((c, i) => `${i}. ${c.full_name || 'Unknown'} - ${c.position || 'Not specified'} (${c.email_status})`).join('\n')}

Return ONLY top 4 contacts scoring 70+ as JSON array:
[
  {
    "contactIndex": 0,
    "relevanceScore": 95,
    "reasoning": "Brief reason",
    "recommendedAction": "include",
    "keyStrengths": ["strength1", "strength2"]
  }
]`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
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
