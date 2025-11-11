'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import JobCard from '@/components/JobCard'
import JobDataGrid from '@/components/JobDataGrid'
import JobDetailModal from '@/components/JobDetailModal'
import { Search, Filter, Briefcase, Grid3x3, List, ChevronDown } from 'lucide-react'

interface Job {
  id: string
  title: string
  company: string
  location: string | null
  description: string | null
  url: string | null
  salary_min: number | null
  salary_max: number | null
  job_type: string | null
  remote: boolean
  posted_date: string | null
  source: string | null
  category: string | null
}

export default function JobsPage() {
  const { user, isLoaded } = useUser()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [jobType, setJobType] = useState('')
  const [remote, setRemote] = useState('')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('')
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalJobs, setTotalJobs] = useState(0)
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set())
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [syncStatus, setSyncStatus] = useState<any>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table')
  const [perPage, setPerPage] = useState(50)

  useEffect(() => {
    if (isLoaded && user) {
      fetchSavedJobs()
    }
  }, [isLoaded, user])

  useEffect(() => {
    fetchJobs()
  }, [search, jobType, remote, location, category, salaryMin, salaryMax, page, perPage])

  useEffect(() => {
    fetchSyncStatus()
  }, [])

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: perPage.toString(),
        ...(search && { search }),
        ...(jobType && { jobType }),
        ...(remote && { remote }),
        ...(location && { location }),
        ...(category && { category }),
        ...(salaryMin && { salaryMin }),
        ...(salaryMax && { salaryMax }),
      })

      const response = await fetch(`/api/jobs?${params}`)
      const data = await response.json()

      setJobs(data.jobs || [])
      setTotalPages(data.pagination.totalPages)
      setTotalJobs(data.pagination.total || 0)
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSyncStatus = async () => {
    try {
      const response = await fetch('/api/jobs/sync')
      const data = await response.json()
      setSyncStatus(data)
    } catch (error) {
      console.error('Error fetching sync status:', error)
    }
  }

  const handleManualSync = async () => {
    if (confirm('Manually sync jobs now? This imports new jobs from Adzuna and may take a few minutes.')) {
      try {
        const res = await fetch('/api/jobs/sync', { method: 'POST' })
        const data = await res.json()
        alert(data.message || 'Sync complete!')
        fetchSyncStatus()
        fetchJobs()
      } catch (error) {
        alert('Sync failed. Please try again.')
      }
    }
  }

  const fetchSavedJobs = async () => {
    try {
      const response = await fetch('/api/jobs/saved')
      const data = await response.json()
      setSavedJobIds(new Set(data.savedJobIds || []))
    } catch (error) {
      console.error('Error fetching saved jobs:', error)
    }
  }

  const handleSave = async (jobId: string) => {
    try {
      const response = await fetch('/api/jobs/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId })
      })

      const data = await response.json()

      setSavedJobIds(prev => {
        const newSet = new Set(prev)
        if (data.saved) {
          newSet.add(jobId)
        } else {
          newSet.delete(jobId)
        }
        return newSet
      })
    } catch (error) {
      console.error('Error saving job:', error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
  }

  const openJobDetail = (jobId: string) => {
    setSelectedJobId(jobId)
    setIsModalOpen(true)
  }

  const handleSelectJob = (jobId: string) => {
    setSelectedJobIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(jobId)) {
        newSet.delete(jobId)
      } else {
        newSet.add(jobId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    setSelectedJobIds(new Set(jobs.map(job => job.id)))
  }

  const handleClearSelection = () => {
    setSelectedJobIds(new Set())
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2">
                <Briefcase className="text-blue-600" size={28} />
                <span className="text-2xl font-bold text-gray-900">Sivio</span>
              </Link>
              <nav className="hidden md:flex gap-6">
                <Link href="/jobs" className="text-blue-600 font-medium">
                  Browse Jobs
                </Link>
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
              </nav>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search jobs by title, company, or location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Filter size={20} className="text-gray-400" />
                <select
                  value={jobType}
                  onChange={(e) => {
                    setJobType(e.target.value)
                    setPage(1)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="internship">Internship</option>
                  <option value="entry-level">Entry Level</option>
                  <option value="full-time">Full Time</option>
                </select>
              </div>

              <select
                value={remote}
                onChange={(e) => {
                  setRemote(e.target.value)
                  setPage(1)
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Locations</option>
                <option value="true">Remote Only</option>
                <option value="false">On-Site Only</option>
              </select>

              <input
                type="text"
                placeholder="City or State"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value)
                  setPage(1)
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-40"
              />

              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value)
                  setPage(1)
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Finance">Finance & Accounting</option>
                <option value="HR">HR & Recruiting</option>
                <option value="Operations">Operations</option>
                <option value="Business">Business Management</option>
                <option value="Consulting">Consulting</option>
                <option value="Graduate">Graduate Programs</option>
              </select>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min $"
                  value={salaryMin}
                  onChange={(e) => {
                    setSalaryMin(e.target.value)
                    setPage(1)
                  }}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max $"
                  value={salaryMax}
                  onChange={(e) => {
                    setSalaryMax(e.target.value)
                    setPage(1)
                  }}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {(search || jobType || remote || location || category || salaryMin || salaryMax) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    setJobType('')
                    setRemote('')
                    setLocation('')
                    setCategory('')
                    setSalaryMin('')
                    setSalaryMax('')
                    setPage(1)
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 underline"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Sync Status Banner */}
        {syncStatus && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold text-blue-900 mb-1">
                  📊 {syncStatus.totalActiveJobs?.toLocaleString() || 0} Active Jobs from Real Companies
                </p>
                <p className="text-sm text-blue-700">
                  Powered by Adzuna · {syncStatus.totalArchivedJobs?.toLocaleString() || 0} archived · Auto-syncs daily at 2 AM UTC
                </p>
                {syncStatus.lastSyncDate && (
                  <p className="text-xs text-blue-600 mt-1">
                    Last synced: {new Date(syncStatus.lastSyncDate).toLocaleString()}
                  </p>
                )}
              </div>
              <button
                onClick={handleManualSync}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Manual Sync
              </button>
            </div>
          </div>
        )}

        {/* View Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <p className="text-gray-700 font-medium">
              {loading ? 'Loading...' : (
                <>
                  Showing {((page - 1) * perPage) + 1}-{Math.min(page * perPage, totalJobs)} of {totalJobs.toLocaleString()} jobs
                </>
              )}
            </p>
            {selectedJobIds.size > 0 && (
              <span className="text-sm text-blue-600 font-medium">
                ({selectedJobIds.size} selected)
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Per Page Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Show:</label>
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value))
                  setPage(1)
                }}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="200">200</option>
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List size={16} />
                Table
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid3x3 size={16} />
                Grid
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading jobs...</p>
          </div>
        ) : jobs.length > 0 ? (
          <>
            {/* Table View */}
            {viewMode === 'table' ? (
              <JobDataGrid
                jobs={jobs}
                selectedJobs={selectedJobIds}
                onSelectJob={handleSelectJob}
                onSelectAll={handleSelectAll}
                onClearSelection={handleClearSelection}
                onJobClick={openJobDetail}
                onSaveJob={user ? handleSave : undefined}
                savedJobIds={savedJobIds}
              />
            ) : (
              /* Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isSaved={savedJobIds.has(job.id)}
                    onSave={user ? handleSave : undefined}
                    onClick={() => openJobDetail(job.id)}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm font-medium"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {page > 2 && (
                    <>
                      <button
                        onClick={() => setPage(1)}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                      >
                        1
                      </button>
                      {page > 3 && <span className="px-2 text-gray-500">...</span>}
                    </>
                  )}
                  {page > 1 && (
                    <button
                      onClick={() => setPage(page - 1)}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      {page - 1}
                    </button>
                  )}
                  <button className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                    {page}
                  </button>
                  {page < totalPages && (
                    <button
                      onClick={() => setPage(page + 1)}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      {page + 1}
                    </button>
                  )}
                  {page < totalPages - 1 && (
                    <>
                      {page < totalPages - 2 && <span className="px-2 text-gray-500">...</span>}
                      <button
                        onClick={() => setPage(totalPages)}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm font-medium"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">No jobs found matching your criteria</p>
            <button
              onClick={() => {
                setSearch('')
                setJobType('')
                setRemote('')
                setLocation('')
                setCategory('')
                setSalaryMin('')
                setSalaryMax('')
                setPage(1)
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </main>

      {/* Job Detail Modal */}
      <JobDetailModal
        jobId={selectedJobId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isSaved={selectedJobId ? savedJobIds.has(selectedJobId) : false}
        onSave={user ? handleSave : undefined}
      />
    </div>
  )
}
