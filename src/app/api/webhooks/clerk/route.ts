import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env.local')
  }

  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing svix headers', { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error: Verification failed', { status: 400 })
  }

  const supabase = createAdminClient()

  // Handle the webhook
  if (evt.type === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data

    // Create user in Supabase
    const { error } = await supabase.from('users').insert({
      clerk_id: id,
      email: email_addresses[0].email_address,
      first_name: first_name || null,
      last_name: last_name || null,
      credits: 100, // Starting credits
      plan: 'free',
    })

    if (error) {
      console.error('Error creating user in Supabase:', error)
      return new Response('Error: Failed to create user', { status: 500 })
    }
  }

  if (evt.type === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data

    // Update user in Supabase
    const { error } = await supabase
      .from('users')
      .update({
        email: email_addresses[0].email_address,
        first_name: first_name || null,
        last_name: last_name || null,
      })
      .eq('clerk_id', id)

    if (error) {
      console.error('Error updating user in Supabase:', error)
      return new Response('Error: Failed to update user', { status: 500 })
    }
  }

  if (evt.type === 'user.deleted') {
    const { id } = evt.data

    // Delete user from Supabase (cascade will handle related data)
    const { error } = await supabase.from('users').delete().eq('clerk_id', id!)

    if (error) {
      console.error('Error deleting user from Supabase:', error)
      return new Response('Error: Failed to delete user', { status: 500 })
    }
  }

  return new Response('Webhook processed', { status: 200 })
}
