/**
 * Dashboard - Your Internship Command Center
 * Professional dashboard matching the new Sivio design system
 */

import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  Briefcase,
  Users,
  Mail,
  TrendingUp,
  Target,
  Zap,
  Award,
  Calendar,
  DollarSign,
  Star,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react'

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

  // Fetch real stats from database
  let stats = {
    applicationsSubmitted: 0,
    interviewsScheduled: 0,
    contactsFound: 0,
    responseRate: 0,
    averageResponseTime: 0,
  }

  if (supabaseUser) {
    // Fetch all applications for the user
    const { data: applications } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', supabaseUser.id)

    // Fetch contacts count
    const { count: contactsCount } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('userId', supabaseUser.id)

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

    stats = {
      applicationsSubmitted: totalApplications,
      interviewsScheduled,
      contactsFound: contactsCount || 0,
      responseRate,
      averageResponseTime,
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="text-3xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Sivio
            </div>
          </Link>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className="font-semibold text-blue-600 border-b-2 border-blue-600 pb-1"
              >
                Dashboard
              </Link>
              <Link
                href="/jobs"
                className="font-semibold text-gray-600 hover:text-gray-900 transition-colors"
              >
                Browse Jobs
              </Link>
              <Link
                href="/crm"
                className="font-semibold text-gray-600 hover:text-gray-900 transition-colors"
              >
                CRM
              </Link>
            </nav>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-3">
            Welcome back, {user.firstName || 'there'}! 👋
          </h1>
          <p className="text-xl text-gray-600">
            Your internship search command center. Let's land that dream role!
          </p>
        </div>

        {/* Primary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Briefcase size={28} />
              </div>
              <TrendingUp size={24} className="opacity-60" />
            </div>
            <div className="text-4xl font-black mb-2">{savedJobsCount}</div>
            <div className="text-blue-100 font-medium">Saved Jobs</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Users size={28} />
              </div>
              <Star size={24} className="opacity-60" />
            </div>
            <div className="text-4xl font-black mb-2">{stats.contactsFound}</div>
            <div className="text-green-100 font-medium">Contacts Found</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Zap size={28} />
              </div>
              <CheckCircle2 size={24} className="opacity-60" />
            </div>
            <div className="text-4xl font-black mb-2">{credits}</div>
            <div className="text-purple-100 font-medium">Credits Available</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Calendar size={28} />
              </div>
              <Award size={24} className="opacity-60" />
            </div>
            <div className="text-4xl font-black mb-2">{stats.interviewsScheduled}</div>
            <div className="text-orange-100 font-medium">Interviews Lined Up</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles size={24} className="text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/jobs"
              className="group flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              <Target size={24} />
              <div className="flex-1">
                <div className="font-bold text-lg">Find Jobs</div>
                <div className="text-blue-100 text-sm">Browse 50,000+ listings</div>
              </div>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/crm"
              className="group flex items-center gap-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-5 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              <BarChart3 size={24} />
              <div className="flex-1">
                <div className="font-bold text-lg">Open CRM</div>
                <div className="text-purple-100 text-sm">Track applications</div>
              </div>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <button className="group flex items-center gap-3 bg-gradient-to-r from-green-600 to-green-700 text-white p-5 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200">
              <Users size={24} />
              <div className="flex-1">
                <div className="font-bold text-lg">Find Contacts</div>
                <div className="text-green-100 text-sm">Connect with recruiters</div>
              </div>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <button className="group flex items-center gap-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white p-5 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200">
              <Mail size={24} />
              <div className="flex-1">
                <div className="font-bold text-lg">Start Outreach</div>
                <div className="text-orange-100 text-sm">Automated emails</div>
              </div>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Clock size={20} className="text-blue-600" />
              Recent Activity
            </h3>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-gray-600 mb-4">No recent activity yet</p>
              <p className="text-sm text-gray-500">
                Start applying to jobs and tracking applications to see your activity here
              </p>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp size={20} className="text-green-600" />
              Performance Insights
            </h3>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Response Rate</span>
                  <span className="text-2xl font-black text-blue-600">{stats.responseRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${stats.responseRate}%` }}></div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Avg Response Time</span>
                  <span className="text-2xl font-black text-green-600">{stats.averageResponseTime || '-'}</span>
                </div>
                <p className="text-xs text-gray-600">Days to hear back from companies</p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Interview Rate</span>
                  <span className="text-2xl font-black text-purple-600">0%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upgrade CTA */}
        <div className="mt-8 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">🚀 Supercharge Your Job Search</h3>
              <p className="text-blue-100 text-lg">
                Upgrade to Pro for unlimited auto-apply, priority contact finding, and AI interview prep
              </p>
            </div>
            <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-200 whitespace-nowrap">
              Upgrade to Pro →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
