/**
 * Application Detail API - Update and Delete Individual Applications
 * PATCH: Update application (stage, status, notes, etc.)
 * DELETE: Remove application from CRM
 */

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'

// PATCH /api/applications/[id] - Update application
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params
    const body = await request.json()

    const supabase = createAdminClient()

    // Get user from Supabase
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

    // Verify ownership
    const { data: existing } = await supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Build update object (only allow specific fields)
    const updateData: any = {}

    if (body.stage) updateData.stage = body.stage
    if (body.status) updateData.status = body.status
    if (body.upcoming_interview !== undefined) updateData.upcoming_interview = body.upcoming_interview
    if (body.offer_date !== undefined) updateData.offer_date = body.offer_date
    if (body.acceptance_date !== undefined) updateData.acceptance_date = body.acceptance_date
    if (body.rejection_date !== undefined) updateData.rejection_date = body.rejection_date
    if (body.notes !== undefined) updateData.notes = body.notes

    // Auto-set status based on stage if not provided
    if (body.stage && !body.status) {
      const statusMap: Record<string, string> = {
        applied: 'Application Submitted',
        interviewing: 'Interview Scheduled',
        offer: 'Offer Received',
        accepted: 'Accepted Offer',
        rejected: 'Not Selected',
      }
      updateData.status = statusMap[body.stage] || existing.status
    }

    // Auto-set dates based on stage
    if (body.stage === 'offer' && !existing.offer_date) {
      updateData.offer_date = new Date().toISOString()
    }
    if (body.stage === 'accepted' && !existing.acceptance_date) {
      updateData.acceptance_date = new Date().toISOString()
    }
    if (body.stage === 'rejected' && !existing.rejection_date) {
      updateData.rejection_date = new Date().toISOString()
    }

    // Update application
    const { data: application, error } = await supabase
      .from('applications')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    // TODO: Send webhook to n8n for automation based on stage change
    // if (body.stage && body.stage !== existing.stage) {
    //   await fetch(process.env.N8N_WEBHOOK_APPLICATION_STAGE_CHANGED!, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       application,
    //       userId,
    //       event: 'application.stage_changed',
    //       previousStage: existing.stage,
    //       newStage: body.stage
    //     })
    //   })
    // }

    return NextResponse.json({ application })

  } catch (error: any) {
    console.error('Update application error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/applications/[id] - Delete application
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params

    const supabase = createAdminClient()

    // Get user from Supabase
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

    // Delete application (only if owned by user)
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    // TODO: Send webhook to n8n for automation
    // await fetch(process.env.N8N_WEBHOOK_APPLICATION_DELETED!, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ applicationId: id, userId, event: 'application.deleted' })
    // })

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Delete application error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// GET /api/applications/[id] - Get single application
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params

    const supabase = createAdminClient()

    // Get user from Supabase
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

    // Fetch application
    const { data: application, error } = await supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) throw error

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ application })

  } catch (error: any) {
    console.error('Fetch application error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
