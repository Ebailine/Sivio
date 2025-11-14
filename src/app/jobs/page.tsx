'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import JobCard from '@/components/JobCard'
import JobDetailModal from '@/components/JobDetailModal'
import {
  Search, Filter, Briefcase, Grid3x3, List, ChevronDown, ChevronUp,
  X, TrendingUp, Building2, MapPin, DollarSign, Clock, Zap, Users,
  Sparkles
} from 'lucide-react'
import type { Job } from '@/types/job'

export default function JobsPage() {
  const { user, isLoaded } = useUser()

  // Jobs data
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [totalJobs, setTotalJobs] = useState(0)

  // Filter states
  const [search, setSearch] = useState('')
  const [employmentType, setEmploymentType] = useState('')
  const [seniorityLevel, setSeniorityLevel] = useState('')
  const [location, setLocation] = useState('')
  const [jobFunction, setJobFunction] = useState('')
  const [easyApply, setEasyApply] = useState<boolean | null>(null)
  const [companySearch, setCompanySearch] = useState('')
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])

  // Pagination
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(24)

  // UI states
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set())
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    if (isLoaded && user) {
      fetchSavedJobs()
    }
  }, [isLoaded, user])

  useEffect(() => {
    fetchJobs()
  }, [search, employmentType, seniorityLevel, location, jobFunction, easyApply, companySearch, page, perPage])

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: perPage.toString(),
        ...(search && { search }),
        ...(employmentType && { employment_type: employmentType }),
        ...(seniorityLevel && { seniority_level: seniorityLevel }),
        ...(location && { location }),
        ...(jobFunction && { job_function: jobFunction }),
        ...(easyApply !== null && { easy_apply: easyApply.toString() }),
      })

      const response = await fetch(`/api/jobs?${params}`)
      const data = await response.json()

      setJobs(data.jobs || [])
      setTotalPages(data.pagination?.totalPages || 1)
      setTotalJobs(data.pagination?.total || 0)
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/jobs/sync')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
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

  const openJobDetail = (jobId: string) => {
    setSelectedJobId(jobId)
    setIsModalOpen(true)
  }

  const clearAllFilters = () => {
    setSearch('')
    setEmploymentType('')
    setSeniorityLevel('')
    setLocation('')
    setJobFunction('')
    setEasyApply(null)
    setCompanySearch('')
    setSelectedIndustries([])
    setPage(1)
  }

  const activeFiltersCount = [
    search,
    employmentType,
    seniorityLevel,
    location,
    jobFunction,
    easyApply !== null,
    companySearch,
    selectedIndustries.length > 0
  ].filter(Boolean).length

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries(prev =>
      prev.includes(industry)
        ? prev.filter(i => i !== industry)
        : [...prev, industry]
    )
  }

  // Popular industries from LinkedIn
  const popularIndustries = [
    'Technology',
    'Financial Services',
    'Healthcare',
    'Retail',
    'Education',
    'Manufacturing',
    'Consulting',
    'Marketing',
    'Real Estate',
    'Media'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-lg shadow-md">
                  <Briefcase className="text-white" size={24} />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Sivio
                </span>
              </Link>
              <nav className="hidden md:flex gap-6">
                <Link
                  href="/jobs"
                  className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-1"
                >
                  Browse Jobs
                </Link>
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Dashboard
                </Link>
              </nav>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Banner */}
        {stats && (
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl shadow-xl p-8 mb-8 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="text-yellow-300" size={24} />
                    <h2 className="text-3xl font-bold">
                      {stats.totalActiveJobs?.toLocaleString() || 0} Live Jobs
                    </h2>
                  </div>
                  <p className="text-blue-100 text-lg">
                    Powered by LinkedIn · Updated automatically via Apify
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-100 mb-1">Total Companies</p>
                  <p className="text-2xl font-bold">{stats.totalCompanies?.toLocaleString() || 0}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="text-yellow-300" size={18} />
                    <p className="text-sm text-blue-100">Easy Apply</p>
                  </div>
                  <p className="text-2xl font-bold">{stats.easy_apply_jobs?.toLocaleString() || 0}</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="text-green-300" size={18} />
                    <p className="text-sm text-blue-100">Full-Time</p>
                  </div>
                  <p className="text-2xl font-bold">{stats.fulltime_jobs?.toLocaleString() || 0}</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="text-purple-300" size={18} />
                    <p className="text-sm text-blue-100">Internships</p>
                  </div>
                  <p className="text-2xl font-bold">{stats.internship_jobs?.toLocaleString() || 0}</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="text-orange-300" size={18} />
                    <p className="text-sm text-blue-100">Last 7 Days</p>
                  </div>
                  <p className="text-2xl font-bold">{stats.jobs_last_week?.toLocaleString() || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          {/* Main Search */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-4 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by job title, keywords, or description..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg transition-all"
              />
            </div>
          </div>

          {/* Quick Filters Row */}
          <div className="flex flex-wrap gap-3 mb-4">
            {/* Employment Type */}
            <select
              value={employmentType}
              onChange={(e) => {
                setEmploymentType(e.target.value)
                setPage(1)
              }}
              className="px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-sm transition-all hover:border-gray-300"
            >
              <option value="">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
              <option value="Temporary">Temporary</option>
            </select>

            {/* Seniority Level */}
            <select
              value={seniorityLevel}
              onChange={(e) => {
                setSeniorityLevel(e.target.value)
                setPage(1)
              }}
              className="px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-sm transition-all hover:border-gray-300"
            >
              <option value="">All Levels</option>
              <option value="Internship">Internship</option>
              <option value="Entry level">Entry Level</option>
              <option value="Associate">Associate</option>
              <option value="Mid-Senior level">Mid-Senior</option>
              <option value="Director">Director</option>
              <option value="Executive">Executive</option>
            </select>

            {/* Location */}
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value)
                  setPage(1)
                }}
                className="pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-sm w-48 transition-all hover:border-gray-300"
              />
            </div>

            {/* Easy Apply Toggle */}
            <button
              onClick={() => {
                setEasyApply(easyApply === true ? null : true)
                setPage(1)
              }}
              className={`px-4 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all ${
                easyApply === true
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Zap size={16} />
              Easy Apply
            </button>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold text-sm flex items-center gap-2 hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
            >
              <Filter size={16} />
              Advanced Filters
              {activeFiltersCount > 0 && (
                <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold">
                  {activeFiltersCount}
                </span>
              )}
              {showAdvancedFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {/* Clear All */}
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="px-4 py-2.5 text-gray-600 hover:text-gray-900 font-medium text-sm flex items-center gap-1 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X size={16} />
                Clear All
              </button>
            )}
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="border-t-2 border-gray-100 pt-6 mt-4 space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Job Function */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Job Function
                </label>
                <select
                  value={jobFunction}
                  onChange={(e) => {
                    setJobFunction(e.target.value)
                    setPage(1)
                  }}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">All Functions</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Product Management">Product Management</option>
                  <option value="Operations">Operations</option>
                  <option value="Finance">Finance</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Business Development">Business Development</option>
                  <option value="Design">Design</option>
                  <option value="Data Science">Data Science</option>
                </select>
              </div>

              {/* Company Search */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search by company (e.g., Google, Microsoft)"
                    value={companySearch}
                    onChange={(e) => {
                      setCompanySearch(e.target.value)
                      setPage(1)
                    }}
                    className="w-full pl-11 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Industries (Multi-select) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Industries {selectedIndustries.length > 0 && (
                    <span className="text-blue-600">({selectedIndustries.length} selected)</span>
                  )}
                </label>
                <div className="flex flex-wrap gap-2">
                  {popularIndustries.map(industry => (
                    <button
                      key={industry}
                      onClick={() => toggleIndustry(industry)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedIndustries.includes(industry)
                          ? 'bg-blue-600 text-white shadow-md scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {industry}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Active Filter Chips */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {search && (
              <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium">
                <span>Search: "{search}"</span>
                <button onClick={() => setSearch('')} className="hover:bg-blue-200 rounded-full p-0.5">
                  <X size={14} />
                </button>
              </div>
            )}
            {employmentType && (
              <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium">
                <span>{employmentType}</span>
                <button onClick={() => setEmploymentType('')} className="hover:bg-green-200 rounded-full p-0.5">
                  <X size={14} />
                </button>
              </div>
            )}
            {seniorityLevel && (
              <div className="flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full text-sm font-medium">
                <span>{seniorityLevel}</span>
                <button onClick={() => setSeniorityLevel('')} className="hover:bg-purple-200 rounded-full p-0.5">
                  <X size={14} />
                </button>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-2 bg-orange-100 text-orange-800 px-3 py-1.5 rounded-full text-sm font-medium">
                <MapPin size={14} />
                <span>{location}</span>
                <button onClick={() => setLocation('')} className="hover:bg-orange-200 rounded-full p-0.5">
                  <X size={14} />
                </button>
              </div>
            )}
            {easyApply && (
              <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium">
                <Zap size={14} />
                <span>Easy Apply</span>
                <button onClick={() => setEasyApply(null)} className="hover:bg-green-200 rounded-full p-0.5">
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* View Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <p className="text-gray-700 font-semibold text-lg">
              {loading ? (
                'Loading...'
              ) : (
                <>
                  {totalJobs.toLocaleString()} {totalJobs === 1 ? 'Job' : 'Jobs'} Found
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Per Page */}
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value))
                setPage(1)
              }}
              className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500"
            >
              <option value="12">12 per page</option>
              <option value="24">24 per page</option>
              <option value="48">48 per page</option>
              <option value="96">96 per page</option>
            </select>

            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid3x3 size={16} />
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List size={16} />
                List
              </button>
            </div>
          </div>
        </div>

        {/* Jobs Display */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading amazing opportunities...</p>
          </div>
        ) : jobs.length > 0 ? (
          <>
            {/* Grid View */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {jobs.map((job) => (
                  <JobCard
                    key={job.job_id}
                    job={job}
                    isSaved={savedJobIds.has(job.job_id)}
                    onSave={user ? handleSave : undefined}
                    onClick={() => openJobDetail(job.job_id)}
                  />
                ))}
              </div>
            ) : (
              /* List View */
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div
                    key={job.job_id}
                    onClick={() => openJobDetail(job.job_id)}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 cursor-pointer border border-gray-100 hover:border-blue-300"
                  >
                    <div className="flex gap-4">
                      {job.company_logo_url && (
                        <img
                          src={job.company_logo_url}
                          alt={job.company_name}
                          className="w-16 h-16 rounded-lg object-contain bg-gray-50 flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 mb-1 truncate">
                          {job.job_title}
                        </h3>
                        <p className="text-blue-600 font-semibold mb-2">{job.company_name}</p>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <MapPin size={14} />
                            {job.location}
                          </span>
                          {job.employment_type && (
                            <span className="flex items-center gap-1">
                              <Briefcase size={14} />
                              {job.employment_type}
                            </span>
                          )}
                          {job.salary_range && (
                            <span className="flex items-center gap-1">
                              <DollarSign size={14} />
                              {job.salary_range}
                            </span>
                          )}
                          {job.easy_apply && (
                            <span className="flex items-center gap-1 text-green-600 font-medium">
                              <Zap size={14} />
                              Easy Apply
                            </span>
                          )}
                        </div>
                      </div>
                      {job.time_posted && (
                        <div className="text-sm text-gray-500 flex-shrink-0">
                          {job.time_posted}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-5 py-2.5 border-2 border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 font-semibold transition-all"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {page > 2 && (
                    <>
                      <button
                        onClick={() => setPage(1)}
                        className="px-4 py-2.5 border-2 border-gray-200 rounded-lg hover:bg-gray-50 font-medium"
                      >
                        1
                      </button>
                      {page > 3 && <span className="px-2 text-gray-500">...</span>}
                    </>
                  )}
                  {page > 1 && (
                    <button
                      onClick={() => setPage(page - 1)}
                      className="px-4 py-2.5 border-2 border-gray-200 rounded-lg hover:bg-gray-50 font-medium"
                    >
                      {page - 1}
                    </button>
                  )}
                  <button className="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-bold shadow-md">
                    {page}
                  </button>
                  {page < totalPages && (
                    <button
                      onClick={() => setPage(page + 1)}
                      className="px-4 py-2.5 border-2 border-gray-200 rounded-lg hover:bg-gray-50 font-medium"
                    >
                      {page + 1}
                    </button>
                  )}
                  {page < totalPages - 1 && (
                    <>
                      {page < totalPages - 2 && <span className="px-2 text-gray-500">...</span>}
                      <button
                        onClick={() => setPage(totalPages)}
                        className="px-4 py-2.5 border-2 border-gray-200 rounded-lg hover:bg-gray-50 font-medium"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-5 py-2.5 border-2 border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 font-semibold transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Jobs Found</h3>
            <p className="text-gray-600 text-lg mb-6">
              We couldn't find any jobs matching your criteria
            </p>
            <button
              onClick={clearAllFilters}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md"
            >
              Clear All Filters
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
