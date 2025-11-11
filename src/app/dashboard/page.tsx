import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function DashboardPage() {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  // Fetch user stats from Supabase
  const supabase = createAdminClient()

  // Get Supabase user
  const { data: supabaseUser } = await supabase
    .from('users')
    .select('id, credits')
    .eq('clerk_id', user.id)
    .single()

  let savedJobsCount = 0
  let credits = 100

  if (supabaseUser) {
    credits = supabaseUser.credits

    // Get saved jobs count
    const { count } = await supabase
      .from('saved_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', supabaseUser.id)

    savedJobsCount = count || 0
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-8 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-blue-600">Sivio</h2>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-4">
          Welcome, {user.firstName || 'there'}! 👋
        </h1>
        <p className="text-gray-600 mb-8">
          You're signed in as {user.emailAddresses[0].emailAddress}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-2">Credits</h3>
            <p className="text-3xl font-bold text-blue-600">{credits}</p>
            <p className="text-sm text-gray-500 mt-2">Available for contact searches</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-2">Saved Jobs</h3>
            <p className="text-3xl font-bold text-green-600">{savedJobsCount}</p>
            <p className="text-sm text-gray-500 mt-2">Jobs you're tracking</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-2">Outreach Sent</h3>
            <p className="text-3xl font-bold text-purple-600">0</p>
            <p className="text-sm text-gray-500 mt-2">Emails to contacts</p>
          </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/jobs" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition text-center">
              Browse Jobs
            </Link>
            <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition">
              Find Contacts
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
