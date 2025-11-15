/**
 * Webhooks API for n8n Application Automation
 * POST: Receive updates from n8n workflows
 *
 * n8n can call this endpoint to update application status, add notes, etc.
 * Example use cases:
 * - Auto-update stage when email reply is detected
 * - Add notes when calendar event is created
 * - Move to "rejected" if rejection email detected
 */

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    // Verify webhook secret from n8n
    const authHeader = request.headers.get('authorization')
    const webhookSecret = process.env.N8N_WEBHOOK_SECRET

    if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid webhook secret' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      applicationId,
      userId, // clerk_id from n8n
      action, // 'update_stage', 'add_note', 'set_interview', etc.
      data,
    } = body

    if (!applicationId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: applicationId, action' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Handle different actions
    switch (action) {
      case 'update_stage': {
        // Update application stage
        // data: { stage: 'interviewing', status?: 'Interview Scheduled' }
        const { stage, status } = data

        const updateData: any = { stage }
        if (status) updateData.status = status

        // Auto-set dates based on stage
        if (stage === 'offer') {
          updateData.offer_date = new Date().toISOString()
        } else if (stage === 'accepted') {
          updateData.acceptance_date = new Date().toISOString()
        } else if (stage === 'rejected') {
          updateData.rejection_date = new Date().toISOString()
        }

        const { data: application, error } = await supabase
          .from('applications')
          .update(updateData)
          .eq('id', applicationId)
          .select()
          .single()

        if (error) throw error

        return NextResponse.json({
          success: true,
          application,
          message: `Application stage updated to ${stage}`
        })
      }

      case 'add_note': {
        // Add note to application
        // data: { text: 'Recruiter called, interview scheduled for Monday' }
        const { text } = data

        if (!text) {
          return NextResponse.json(
            { error: 'Note text required' },
            { status: 400 }
          )
        }

        // Fetch current application
        const { data: app } = await supabase
          .from('applications')
          .select('notes')
          .eq('id', applicationId)
          .single()

        if (!app) {
          return NextResponse.json(
            { error: 'Application not found' },
            { status: 404 }
          )
        }

        // Add new note to existing notes array
        const notes = Array.isArray(app.notes) ? app.notes : []
        const newNote = {
          id: `n${Date.now()}`,
          text,
          date: new Date().toISOString().split('T')[0],
        }
        notes.push(newNote)

        const { data: application, error } = await supabase
          .from('applications')
          .update({ notes })
          .eq('id', applicationId)
          .select()
          .single()

        if (error) throw error

        return NextResponse.json({
          success: true,
          application,
          note: newNote,
          message: 'Note added successfully'
        })
      }

      case 'set_interview': {
        // Set upcoming interview date/time
        // data: { upcomingInterview: '2025-01-25T14:00:00Z' }
        const { upcomingInterview } = data

        if (!upcomingInterview) {
          return NextResponse.json(
            { error: 'upcomingInterview date required' },
            { status: 400 }
          )
        }

        const { data: application, error } = await supabase
          .from('applications')
          .update({
            upcoming_interview: upcomingInterview,
            stage: 'interviewing',
            status: 'Interview Scheduled',
          })
          .eq('id', applicationId)
          .select()
          .single()

        if (error) throw error

        return NextResponse.json({
          success: true,
          application,
          message: 'Interview scheduled'
        })
      }

      case 'clear_interview': {
        // Clear upcoming interview (interview completed)
        const { data: application, error } = await supabase
          .from('applications')
          .update({
            upcoming_interview: null,
          })
          .eq('id', applicationId)
          .select()
          .single()

        if (error) throw error

        return NextResponse.json({
          success: true,
          application,
          message: 'Interview cleared'
        })
      }

      case 'bulk_update': {
        // Bulk update multiple fields at once
        // data: { stage, status, upcoming_interview, notes, etc. }
        const { data: application, error } = await supabase
          .from('applications')
          .update(data)
          .eq('id', applicationId)
          .select()
          .single()

        if (error) throw error

        return NextResponse.json({
          success: true,
          application,
          message: 'Application updated'
        })
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// GET /api/webhooks/applications - Health check for n8n
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Application webhooks endpoint is active',
    supportedActions: [
      'update_stage',
      'add_note',
      'set_interview',
      'clear_interview',
      'bulk_update',
    ],
  })
}
