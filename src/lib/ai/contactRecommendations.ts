import Anthropic from '@anthropic-ai/sdk';

interface Contact {
  id: string;
  name: string;
  position?: string;
  company_name?: string;
  email?: string;
  linkedin_url?: string;
  role_type?: string;
  relevance_score: number;
  reasoning?: string;
  created_at: string;
}

interface ContactRecommendation {
  contactId: string;
  priority: 'high' | 'medium' | 'low';
  reasoning: string;
  suggestedApproach: string;
  bestTimeToContact: string;
  talkingPoints: string[];
}

export async function analyzeContacts(
  contacts: Contact[],
  applicationContext?: {
    jobTitle: string;
    companyName: string;
    stage: string;
  }
): Promise<ContactRecommendation[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const anthropic = new Anthropic({ apiKey });

  const prompt = `You are an AI career coach helping a job seeker prioritize and strategize their networking outreach.

${
  applicationContext
    ? `The user is applying for: ${applicationContext.jobTitle} at ${applicationContext.companyName}
Current application stage: ${applicationContext.stage}`
    : 'The user is conducting general networking for their job search.'
}

Here are their discovered contacts:
${contacts
  .map(
    (c, i) =>
      `${i + 1}. ${c.name}
   Position: ${c.position || 'Unknown'}
   Company: ${c.company_name || 'Unknown'}
   Role Type: ${c.role_type || 'Unknown'}
   Relevance Score: ${c.relevance_score}
   Has Email: ${c.email ? 'Yes' : 'No'}
   Has LinkedIn: ${c.linkedin_url ? 'Yes' : 'No'}
   AI Reasoning: ${c.reasoning || 'N/A'}`
  )
  .join('\n\n')}

For EACH contact, provide:
1. Priority level (high/medium/low) - Who should they contact first?
2. Specific reasoning for the priority
3. Personalized outreach strategy
4. Best time/day to reach out
5. 3 specific talking points or questions to ask

Format your response as a JSON array with this structure:
[
  {
    "contactId": "1",
    "priority": "high",
    "reasoning": "...",
    "suggestedApproach": "...",
    "bestTimeToContact": "...",
    "talkingPoints": ["...", "...", "..."]
  }
]

Be strategic, specific, and actionable. Consider:
- Their role and influence in hiring
- Likelihood of response
- Value of the connection
- Current application stage
- Professional relationship potential`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Extract JSON from response
    const jsonMatch = content.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from Claude response');
    }

    const recommendations = JSON.parse(jsonMatch[0]) as ContactRecommendation[];

    // Map contactId back to actual contact IDs
    return recommendations.map((rec, index) => ({
      ...rec,
      contactId: contacts[index]?.id || rec.contactId,
    }));
  } catch (error) {
    console.error('Error getting AI recommendations:', error);
    throw error;
  }
}

export async function generateOutreachMessage(
  contact: Contact,
  recommendation: ContactRecommendation,
  applicationContext?: {
    jobTitle: string;
    companyName: string;
  }
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const anthropic = new Anthropic({ apiKey });

  const prompt = `Write a personalized, professional outreach message for this contact:

Contact: ${contact.name}
Position: ${contact.position || 'Unknown'}
Company: ${contact.company_name || 'Unknown'}

${
  applicationContext
    ? `Context: Reaching out about ${applicationContext.jobTitle} position at ${applicationContext.companyName}`
    : 'Context: General networking'
}

Recommended approach: ${recommendation.suggestedApproach}

Key talking points:
${recommendation.talkingPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Write a concise, engaging message (3-4 short paragraphs) that:
1. Opens with a relevant connection or observation
2. Mentions specific talking points naturally
3. Has a clear, low-pressure ask
4. Sounds authentic and human (not overly formal)

Do NOT include:
- Subject line
- Salutation/greeting (just the body)
- Signature/sign-off

Keep it under 150 words.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    return content.text.trim();
  } catch (error) {
    console.error('Error generating outreach message:', error);
    throw error;
  }
}
