/**
 * Contact Finder Trigger API
 * Receives application IDs from frontend, fetches job data, triggers n8n webhook
 *
 * POST /api/contact-finder/trigger
 * Body: { applicationIds: string[], contactsPerJob: number }
 */

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    // 1. Authenticate user
    const { userId: clerkId } = await auth()

    if (!clerkId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Parse request body
    const body = await request.json()
    const { applicationIds, contactsPerJob } = body

    // 3. Validate input
    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return NextResponse.json(
        { error: 'applicationIds array is required' },
        { status: 400 }
      )
    }

    if (!contactsPerJob || contactsPerJob < 1 || contactsPerJob > 10) {
      return NextResponse.json(
        { error: 'contactsPerJob must be between 1 and 10' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // 4. Get Supabase user from Clerk ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, credits, email')
      .eq('clerk_id', clerkId)
      .single()

    if (userError || !user) {
      console.error('User not found:', userError)
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      )
    }

    // 5. Calculate total credit cost
    const totalCreditCost = applicationIds.length * contactsPerJob

    // 6. Check if user has enough credits
    if (user.credits < totalCreditCost) {
      return NextResponse.json(
        {
          error: 'Insufficient credits',
          required: totalCreditCost,
          available: user.credits,
          message: `You need ${totalCreditCost} credits but only have ${user.credits}. Each contact costs 1 credit.`
        },
        { status: 402 }
      )
    }

    // 7. Fetch applications with job data
    const { data: applications, error: appsError } = await supabase
      .from('applications')
      .select('id, job_id, job_title, company_name, location, stage')
      .in('id', applicationIds)
      .eq('user_id', user.id)

    if (appsError) {
      console.error('Error fetching applications:', appsError)
      throw appsError
    }

    if (!applications || applications.length === 0) {
      return NextResponse.json(
        { error: 'No applications found with the provided IDs' },
        { status: 404 }
      )
    }

    // 8. Fetch full job details from jobs table
    const jobIds = applications.map(app => app.job_id)
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('job_id, job_title, company_name, company_url, location, job_description, job_url, apply_url')
      .in('job_id', jobIds)

    if (jobsError) {
      console.error('Error fetching jobs:', jobsError)
      throw jobsError
    }

    // 9. Create a map of job_id -> job data for easy lookup
    const jobsMap = new Map(jobs?.map(job => [job.job_id, job]) || [])

    // 10. Format data for n8n webhook
    const n8nPayload = {
      userId: user.id,
      userEmail: user.email,
      contactsPerJob,
      jobs: applications.map(app => {
        const jobData = jobsMap.get(app.job_id)

        // Extract domain from company_url
        let domain = ''
        if (jobData?.company_url) {
          try {
            const url = new URL(jobData.company_url.startsWith('http')
              ? jobData.company_url
              : `https://${jobData.company_url}`)
            domain = url.hostname.replace('www.', '')
          } catch (e) {
            // If URL parsing fails, try to extract domain from company name
            domain = app.company_name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com'
          }
        } else {
          // Fallback: generate domain from company name
          domain = app.company_name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com'
        }

        // Extract LinkedIn company URL from company_url if available
        let linkedinCompanyUrl = '';
        if (jobData?.company_url && jobData.company_url.includes('linkedin.com/company/')) {
          linkedinCompanyUrl = jobData.company_url;
        } else {
          // Fallback: construct from company name
          const companySlug = app.company_name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          linkedinCompanyUrl = `https://www.linkedin.com/company/${companySlug}`;
        }

        return {
          applicationId: app.id,
          jobId: app.job_id,
          company: app.company_name,
          position: app.job_title,
          location: app.location,
          description: jobData?.job_description || '',
          url: linkedinCompanyUrl,  // Changed: now sends LinkedIn company URL instead of job URL
          applyUrl: jobData?.apply_url || '',
          domain: domain,
        }
      })
    }

    console.log('📤 Triggering n8n webhook with payload:', {
      userId: n8nPayload.userId,
      jobCount: n8nPayload.jobs.length,
      contactsPerJob: n8nPayload.contactsPerJob,
      totalCredits: totalCreditCost
    })

    // 11. Call n8n webhook
    const n8nWebhookUrl = process.env.N8N_CONTACT_FINDER_WEBHOOK_URL

    if (!n8nWebhookUrl) {
      console.error('N8N_CONTACT_FINDER_WEBHOOK_URL not configured')
      return NextResponse.json(
        { error: 'Contact finder service not configured. Please contact support.' },
        { status: 500 }
      )
    }

    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(n8nPayload)
    })

    if (!n8nResponse.ok) {
      console.error('n8n webhook failed:', n8nResponse.status, n8nResponse.statusText)
      const errorText = await n8nResponse.text()
      console.error('n8n error response:', errorText)

      return NextResponse.json(
        { error: 'Failed to start contact finder. Please try again.' },
        { status: 500 }
      )
    }

    console.log('✅ n8n webhook triggered successfully')

    // 12. Reserve credits (create pending transaction)
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: user.id,
        amount: -totalCreditCost,
        type: 'contact_finder',
        status: 'pending',
        description: `Contact finder for ${applications.length} job${applications.length > 1 ? 's' : ''} (${contactsPerJob} contacts each)`,
        metadata: {
          applicationIds,
          contactsPerJob,
          jobCount: applications.length,
          totalContacts: totalCreditCost,
          timestamp: new Date().toISOString()
        }
      })

    if (transactionError) {
      console.error('Error creating credit transaction:', transactionError)
      // Don't fail the request - webhook already triggered
    }

    // 13. Deduct credits immediately (optimistic)
    const { error: creditError } = await supabase
      .from('users')
      .update({ credits: user.credits - totalCreditCost })
      .eq('id', user.id)

    if (creditError) {
      console.error('Error updating credits:', creditError)
      // Don't fail - transaction is recorded
    }

    // 14. Return success response
    return NextResponse.json({
      success: true,
      message: `Contact finder started for ${applications.length} job${applications.length > 1 ? 's' : ''}`,
      jobsProcessing: applications.length,
      contactsPerJob,
      totalContacts: totalCreditCost,
      creditsDeducted: totalCreditCost,
      creditsRemaining: user.credits - totalCreditCost,
      estimatedTime: `${Math.ceil(applications.length * 2)}-${Math.ceil(applications.length * 3)} minutes`,
      jobs: applications.map(app => ({
        company: app.company_name,
        position: app.job_title,
        location: app.location
      }))
    })

  } catch (error: any) {
    console.error('Contact finder trigger error:', error)
    return NextResponse.json(
      {
        error: 'Failed to start contact finder',
        message: error.message || 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
