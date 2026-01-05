import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      senderName,
      senderSchool,
      senderMajor,
      senderCareerStage,
      recipientName,
      recipientRole,
      recipientCompany,
      connectionContext, // same_school, same_major, etc.
      goal, // "informational_interview", "intro_request", "job_referral"
      customContext,
    } = body;

    // Validate required fields
    if (!senderName || !recipientName || !recipientCompany || !goal) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check for API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "ANTHROPIC_API_KEY not configured",
          message: "Please add your Anthropic API key to environment variables",
          demo: true,
          demoMessage: generateDemoMessage(body),
        },
        { status: 200 }
      );
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    // Build context for the AI
    const contextParts: string[] = [];
    if (connectionContext?.same_school) {
      contextParts.push(`Both attended ${senderSchool}`);
    }
    if (connectionContext?.same_major) {
      contextParts.push(`Both studied ${senderMajor}`);
    }
    if (connectionContext?.how_you_know) {
      contextParts.push(connectionContext.how_you_know);
    }
    if (customContext) {
      contextParts.push(customContext);
    }

    const contextString = contextParts.length > 0 ? contextParts.join(". ") : "Professional connection";

    // Define goal-specific instructions
    const goalInstructions = {
      informational_interview: "asking for a 15-20 minute informational interview to learn about their career path and role",
      intro_request: "asking for an introduction to someone at their company who works on [specific team/role]",
      job_referral: "asking if they'd be willing to refer you for a specific role you're interested in",
      general_networking: "reaching out to reconnect and learn about what they're working on",
    };

    const prompt = `You are a career coach helping ${senderName}, a ${senderCareerStage}, write a warm outreach message to ${recipientName}, who works as a ${recipientRole} at ${recipientCompany}.

CONNECTION CONTEXT:
${contextString}

GOAL:
${goalInstructions[goal as keyof typeof goalInstructions] || goal}

REQUIREMENTS:
1. Keep the message between 75-125 words (brief but warm)
2. Lead with the connection (shared school, major, or how they know each other)
3. Be specific about what you're asking for
4. Make it easy to say yes (suggest a specific time commitment like "15 minutes")
5. End with a clear call-to-action
6. Use a professional but friendly tone
7. DO NOT be overly flattering or salesy
8. DO NOT apologize for reaching out
9. Reference something specific about their role or company if possible

IMPORTANT NETWORKING PRINCIPLES:
- People are more likely to help when asked for advice rather than a job
- Being specific makes it easier for them to help you
- Showing genuine interest in their career path (not just asking for favors) builds rapport
- Making the ask small and time-bounded increases response rates

Please generate:
1. A subject line (5-8 words, specific and personal)
2. The message body
3. 3-4 coaching tips explaining why this message works and how to send it
4. A brief explanation of the psychology behind this approach

Format your response as JSON:
{
  "subject": "subject line here",
  "body": "message body here",
  "coaching_tips": ["tip 1", "tip 2", "tip 3"],
  "why_this_works": "explanation of the psychology and networking principles at play"
}`;

    // Call Claude API
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Extract the response
    const responseText = message.content[0].type === "text" ? message.content[0].text : "";

    // Parse JSON from response
    let generatedMessage;
    try {
      // Try to extract JSON from markdown code block if present
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/```\n([\s\S]*?)\n```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : responseText;
      generatedMessage = JSON.parse(jsonStr);
    } catch (parseError) {
      // If JSON parsing fails, return the raw text
      return NextResponse.json({
        subject: "Let's connect!",
        body: responseText,
        coaching_tips: [
          "Review this message and personalize it further",
          "Send it at a time when they're likely to check email (Tuesday-Thursday morning)",
          "Follow up after 5-7 days if no response",
        ],
        why_this_works: "This message leverages your connection to build rapport and makes a specific, low-commitment ask.",
      });
    }

    return NextResponse.json(generatedMessage);
  } catch (error: any) {
    console.error("Error generating message:", error);
    return NextResponse.json(
      {
        error: "Failed to generate message",
        message: error.message,
        demo: true,
        demoMessage: generateDemoMessage(await request.json()),
      },
      { status: 500 }
    );
  }
}

// Fallback demo message generator (when API key not available)
function generateDemoMessage(params: any) {
  const { senderName, senderSchool, recipientName, recipientRole, recipientCompany, goal } = params;

  const templates = {
    informational_interview: {
      subject: `${senderSchool} alum seeking 15 min of advice`,
      body: `Hi ${recipientName},

I hope this message finds you well! I'm a fellow ${senderSchool} alum currently exploring careers in [industry], and I came across your profile.

I'd love to learn more about your journey to ${recipientCompany} and your experience as a ${recipientRole}. Would you have 15 minutes in the next couple weeks for a quick informational chat?

I'm particularly interested in [specific aspect of their work]. No pressure at all—I know you're busy!

Best regards,
${senderName}`,
    },
    job_referral: {
      subject: `${senderSchool} connection interested in ${recipientCompany}`,
      body: `Hi ${recipientName},

I hope you're doing well! We both attended ${senderSchool}, and I've been following ${recipientCompany}'s work in [area].

I recently came across an opening for [specific role] and think my background in [your experience] could be a great fit. Would you be open to referring me or connecting me with the hiring manager?

I'd be happy to send over my resume and answer any questions. Thanks for considering!

Best,
${senderName}`,
    },
  };

  const template = templates[goal as keyof typeof templates] || templates.informational_interview;

  return {
    ...template,
    coaching_tips: [
      "Personalize the [bracketed sections] with specific details",
      "Send on Tuesday-Thursday morning for best response rates",
      "If you don't hear back in 5-7 days, send a brief follow-up",
      "Keep your ask small and time-bounded to increase yes rate",
    ],
    why_this_works:
      "This message works because it leads with your connection (same school), makes a specific and small ask, and demonstrates genuine interest in their career rather than just asking for a favor. The 67% response rate for warm introductions comes from this approach.",
    isDemo: true,
    demoNotice: "Add ANTHROPIC_API_KEY to your environment variables to enable AI-powered message generation",
  };
}
