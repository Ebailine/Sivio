/**
 * User Settings Page
 * Manage account, credits, and preferences
 */

import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  User,
  CreditCard,
  Bell,
  Shield,
  Mail,
  Zap,
  ArrowLeft,
  CheckCircle2,
  XCircle,
} from 'lucide-react'

export default async function SettingsPage() {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  // Fetch user data from Supabase
  const supabase = createAdminClient()
  const { data: supabaseUser } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', user.id)
    .single()

  const credits = supabaseUser?.credits || 0
  const planTier = supabaseUser?.plan_tier || 'free'

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
                className="font-semibold text-gray-600 hover:text-gray-900 transition-colors"
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
      <div className="max-w-4xl mx-auto px-8 py-8">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-semibold">Back to Dashboard</span>
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-3">Settings</h1>
          <p className="text-xl text-gray-600">
            Manage your account, credits, and preferences
          </p>
        </div>

        {/* Account Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <User size={24} className="text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Account</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <div className="text-sm font-semibold text-gray-500 mb-1">Email</div>
                <div className="text-lg font-medium text-gray-900">
                  {user.emailAddresses[0]?.emailAddress}
                </div>
              </div>
              <CheckCircle2 size={20} className="text-green-600" />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <div className="text-sm font-semibold text-gray-500 mb-1">Full Name</div>
                <div className="text-lg font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <div className="text-sm font-semibold text-gray-500 mb-1">Member Since</div>
                <div className="text-lg font-medium text-gray-900">
                  {new Date(user.createdAt!).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Credits & Billing */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard size={24} className="text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Credits & Billing</h2>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-purple-100 font-medium mb-2">Available Credits</div>
                <div className="text-5xl font-black">{credits}</div>
              </div>
              <Zap size={48} className="opacity-50" />
            </div>
            <div className="mt-4 pt-4 border-t border-purple-400/30">
              <div className="text-sm text-purple-100">
                Current Plan: <span className="font-bold capitalize">{planTier}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-3">How Credits Work</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <span>1 credit = 1 contact found</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Contact search returns 1-4 high-quality contacts per search</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Cached results are free (valid for 30 days)</span>
              </li>
            </ul>
          </div>

          <button className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
            Buy More Credits →
          </button>
        </section>

        {/* Notifications */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell size={24} className="text-orange-600" />
            <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Mail size={20} className="text-gray-600" />
                <div>
                  <div className="font-semibold text-gray-900">Email Notifications</div>
                  <div className="text-sm text-gray-600">
                    Get notified about new job matches and application updates
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Zap size={20} className="text-gray-600" />
                <div>
                  <div className="font-semibold text-gray-900">Application Reminders</div>
                  <div className="text-sm text-gray-600">
                    Remind me to follow up on applications
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Privacy & Security */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Shield size={24} className="text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Privacy & Security</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-green-600 mt-0.5" />
                <div>
                  <div className="font-semibold text-green-900 mb-1">Account Secure</div>
                  <div className="text-sm text-green-700">
                    Your account is protected with Clerk authentication
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="font-semibold text-gray-900 mb-2">Data Privacy</div>
              <div className="text-sm text-gray-600 mb-3">
                We store your application data securely and never share it with third parties.
                Your contact searches are private and encrypted.
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
                Read Privacy Policy →
              </button>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-white rounded-2xl shadow-sm border border-red-200/50 p-8 mt-6">
          <div className="flex items-center gap-3 mb-6">
            <XCircle size={24} className="text-red-600" />
            <h2 className="text-2xl font-bold text-gray-900">Danger Zone</h2>
          </div>

          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="font-semibold text-red-900 mb-2">Delete Account</div>
            <div className="text-sm text-red-700 mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </div>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-red-700 transition-colors">
              Delete Account
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
