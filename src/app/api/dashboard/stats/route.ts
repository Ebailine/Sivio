/**
 * Dashboard Stats API
 * Returns real-time statistics for the user's dashboard
 * - Applications submitted (total count)
 * - Interviews scheduled (applications in "interviewing" stage)
 * - Contacts found (total count from contacts table)
 * - Response rate (applications with responses / total)
 * - Average response time (days to hear back)
 */

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

    // Get Supabase user
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Fetch all applications for the user
    const { data: applications, error: appsError } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', user.id)

    if (appsError) throw appsError

    // Fetch all contacts for the user
    const { count: contactsCount, error: contactsError } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (contactsError) throw contactsError

    // Calculate stats
    const totalApplications = applications?.length || 0
    const interviewsScheduled = applications?.filter(
      app => app.stage === 'interviewing' || app.stage === 'offer'
    ).length || 0

    // Response rate: applications that moved past "applied" stage
    const applicationsWithResponse = applications?.filter(
      app => app.stage !== 'applied' && app.stage !== 'saved'
    ).length || 0
    const responseRate = totalApplications > 0
      ? Math.round((applicationsWithResponse / totalApplications) * 100)
      : 0

    // Average response time: days between created_at and first stage change
    let totalResponseDays = 0
    let responseCount = 0

    applications?.forEach(app => {
      if (app.created_at && app.updated_at && app.stage !== 'applied') {
        const createdDate = new Date(app.created_at)
        const updatedDate = new Date(app.updated_at)
        const daysDiff = Math.floor((updatedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))

        if (daysDiff > 0) {
          totalResponseDays += daysDiff
          responseCount++
        }
      }
    })

    const averageResponseTime = responseCount > 0
      ? Math.round(totalResponseDays / responseCount)
      : 0

    // Return stats
    return NextResponse.json({
      stats: {
        applicationsSubmitted: totalApplications,
        interviewsScheduled,
        contactsFound: contactsCount || 0,
        responseRate,
        averageResponseTime,
      }
    })

  } catch (error: any) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
