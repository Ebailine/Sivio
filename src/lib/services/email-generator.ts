/**
 * AI-Powered Email Generator
 * Creates personalized outreach emails using Claude AI
 */

import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface EmailGenerationContext {
  // Contact information
  contactName: string
  contactPosition: string | null
  contactCompany: string
  contactLinkedIn?: string | null

  // Job information
  jobTitle: string
  jobDescription?: string
  jobCompany: string
  jobLocation?: string
  jobType?: string

  // Sender information (user)
  senderName?: string
  senderBackground?: string
}

interface GeneratedEmail {
  subject: string
  body: string
  reasoning: string
  tone: string
  keyPoints: string[]
}

export class EmailGenerator {
  /**
   * Generate a personalized cold outreach email
   */
  async generateOutreachEmail(context: EmailGenerationContext): Promise<GeneratedEmail> {
    const prompt = this.buildPrompt(context)

    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })

      const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
      return this.parseResponse(responseText)

    } catch (error: any) {
      console.error('Email generation failed:', error)
      throw new Error(`Failed to generate email: ${error.message}`)
    }
  }

  /**
   * Build the AI prompt for email generation
   */
  private buildPrompt(context: EmailGenerationContext): string {
    return `You are an expert at writing professional, personalized job application cold emails that get responses.

Create a cold outreach email for the following job application:

**Job Details:**
- Position: ${context.jobTitle}
- Company: ${context.jobCompany}
${context.jobDescription ? `- Description: ${context.jobDescription.substring(0, 500)}` : ''}
${context.jobLocation ? `- Location: ${context.jobLocation}` : ''}
${context.jobType ? `- Type: ${context.jobType}` : ''}

**Contact Person (Recipient):**
- Name: ${context.contactName}
- Position: ${context.contactPosition || 'Unknown'}
- Company: ${context.contactCompany}
${context.contactLinkedIn ? `- LinkedIn: ${context.contactLinkedIn}` : ''}

${context.senderName ? `**Sender:** ${context.senderName}` : ''}
${context.senderBackground ? `**Sender Background:** ${context.senderBackground}` : ''}

**Requirements:**
1. Write a compelling subject line (under 50 characters)
2. Keep the email body concise (150-200 words maximum)
3. Personalize based on the recipient's role and company
4. Show genuine interest in the role and company
5. Highlight relevant skills or experience (keep it brief)
6. Include a clear call-to-action
7. Use a professional yet warm tone
8. DO NOT use generic phrases like "I hope this email finds you well"
9. DO NOT be overly formal or robotic
10. Start with something specific about their role or the company

**Format your response as JSON:**
\`\`\`json
{
  "subject": "Subject line here",
  "body": "Email body here with \\n\\n for paragraphs",
  "reasoning": "Brief explanation of your approach",
  "tone": "professional-warm|enthusiastic|direct",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"]
}
\`\`\`

Generate the email now.`
  }

  /**
   * Parse AI response into structured email
   */
  private parseResponse(response: string): GeneratedEmail {
    try {
      // Extract JSON from response (may be wrapped in ```json blocks)
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/\{[\s\S]*\}/)

      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      const jsonStr = jsonMatch[1] || jsonMatch[0]
      const parsed = JSON.parse(jsonStr)

      return {
        subject: parsed.subject || 'Following up on opportunity',
        body: parsed.body || '',
        reasoning: parsed.reasoning || '',
        tone: parsed.tone || 'professional-warm',
        keyPoints: parsed.keyPoints || [],
      }
    } catch (error: any) {
      console.error('Failed to parse email response:', error)

      // Fallback: return a basic email
      return {
        subject: 'Interest in your open position',
        body: response,
        reasoning: 'Fallback email due to parsing error',
        tone: 'professional',
        keyPoints: [],
      }
    }
  }

  /**
   * Generate multiple email variations
   */
  async generateVariations(
    context: EmailGenerationContext,
    count: number = 3
  ): Promise<GeneratedEmail[]> {
    const promises = Array(count).fill(null).map(() =>
      this.generateOutreachEmail(context)
    )

    try {
      return await Promise.all(promises)
    } catch (error) {
      console.error('Failed to generate variations:', error)
      throw error
    }
  }

  /**
   * Generate follow-up email
   */
  async generateFollowUp(
    originalEmail: string,
    context: EmailGenerationContext,
    daysSinceOriginal: number = 3
  ): Promise<GeneratedEmail> {
    const prompt = `Generate a professional follow-up email for a job application.

**Original Email:**
${originalEmail}

**Days Since Original:** ${daysSinceOriginal}

**Context:**
- Position: ${context.jobTitle}
- Company: ${context.jobCompany}
- Recipient: ${context.contactName} (${context.contactPosition || 'Unknown'})

**Requirements:**
1. Reference the original email subtly
2. Add new value or information
3. Keep it even shorter than the original (100-150 words)
4. Maintain professional persistence without being pushy
5. Include a specific question or call-to-action

Format as JSON with subject, body, reasoning, tone, and keyPoints.`

    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      })

      const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
      return this.parseResponse(responseText)

    } catch (error: any) {
      console.error('Follow-up generation failed:', error)
      throw new Error(`Failed to generate follow-up: ${error.message}`)
    }
  }
}

export const emailGenerator = new EmailGenerator()
