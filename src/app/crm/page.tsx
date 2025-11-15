/**
 * CRM Page - Saved Jobs & Application Tracking
 * Track your saved jobs and manage your application pipeline
 */

'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import MainNav from '@/components/MainNav'
import { Button } from '@/components/ui/Button'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { TiltCard } from '@/components/ui/TiltCard'
import { CountUpNumber } from '@/components/ui/CountUpNumber'
import JobCard from '@/components/JobCard'
import JobDetailModal from '@/components/JobDetailModal'
import {
  Briefcase,
  Send,
  Mail,
  Calendar,
  Sparkles,
  TrendingUp,
  Target,
  Users,
} from 'lucide-react'

interface SavedJob {
  job_id: string
  job_title: string
  company_name: string
  company_logo_url?: string | null
  location: string
  employment_type?: string | null
  seniority_level?: string | null
  salary_range?: string | null
  time_posted: string
  easy_apply?: boolean
  saved_date: string
}

export default function CRMPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const router = useRouter()
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Mock stats - replace with real data from API
  const [stats, setStats] = useState({
    savedJobs: 0,
    applicationsSent: 0,
    outreachSent: 0,
    interviews: 0,
  })

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      router.push('/sign-in')
      return
    }

    fetchSavedJobs()
  }, [isLoaded, isSignedIn, router])

  const fetchSavedJobs = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/jobs/saved')
      const data = await response.json()

      if (data.jobs) {
        setSavedJobs(data.jobs)
        setStats(prev => ({ ...prev, savedJobs: data.jobs.length }))
      }
    } catch (error) {
      console.error('Error fetching saved jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleJobClick = (jobId: string) => {
    setSelectedJobId(jobId)
    setIsModalOpen(true)
  }

  const handleSaveJob = async (jobId: string) => {
    try {
      const response = await fetch('/api/jobs/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      })

      if (response.ok) {
        // Refresh saved jobs list
        await fetchSavedJobs()
      }
    } catch (error) {
      console.error('Error toggling save:', error)
    }
  }

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <MainNav />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-2">
                Your Application CRM
              </h1>
              <p className="text-xl text-gray-600">
                Track your saved jobs and manage your application pipeline
              </p>
            </div>
            <Button variant="gradient" size="lg" href="/jobs">
              <Sparkles className="w-5 h-5" />
              Find More Jobs
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <ScrollReveal delay={0}>
              <TiltCard className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <Briefcase className="w-8 h-8" />
                  <div className="text-sm opacity-90">Saved Jobs</div>
                </div>
                <div className="text-4xl font-black">
                  <CountUpNumber end={stats.savedJobs} />
                </div>
              </TiltCard>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <TiltCard className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <Send className="w-8 h-8" />
                  <div className="text-sm opacity-90">Applications Sent</div>
                </div>
                <div className="text-4xl font-black">
                  <CountUpNumber end={stats.applicationsSent} />
                </div>
              </TiltCard>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <TiltCard className="bg-gradient-to-br from-pink-500 to-pink-600 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <Mail className="w-8 h-8" />
                  <div className="text-sm opacity-90">Outreach Sent</div>
                </div>
                <div className="text-4xl font-black">
                  <CountUpNumber end={stats.outreachSent} />
                </div>
              </TiltCard>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <TiltCard className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-8 h-8" />
                  <div className="text-sm opacity-90">Interviews</div>
                </div>
                <div className="text-4xl font-black">
                  <CountUpNumber end={stats.interviews} />
                </div>
              </TiltCard>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* Saved Jobs Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your saved jobs...</p>
          </div>
        ) : savedJobs.length > 0 ? (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Your Saved Jobs ({savedJobs.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedJobs.map((job, index) => (
                <ScrollReveal key={job.job_id} delay={index * 50}>
                  <JobCard
                    job={job}
                    isSaved={true}
                    onSave={handleSaveJob}
                    onClick={() => handleJobClick(job.job_id)}
                  />
                </ScrollReveal>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-24">
            <ScrollReveal>
              <div className="bg-white rounded-3xl p-12 max-w-2xl mx-auto border border-gray-200">
                <Briefcase className="w-20 h-20 mx-auto text-gray-300 mb-6" />
                <h2 className="text-3xl font-black text-gray-900 mb-4">
                  No Saved Jobs Yet
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  Start building your dream job pipeline by saving positions you're interested in
                </p>
                <Button variant="gradient" size="lg" href="/jobs">
                  <Target className="w-5 h-5" />
                  Browse Jobs
                </Button>
              </div>
            </ScrollReveal>
          </div>
        )}
      </div>

      {/* Job Detail Modal */}
      <JobDetailModal
        jobId={selectedJobId}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedJobId(null)
        }}
        isSaved={true}
        onSave={handleSaveJob}
      />
    </div>
  )
}
