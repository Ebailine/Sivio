'use client'

import { useState } from 'react'
import { X, Users, Zap, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

interface Application {
  id: string
  job_title: string
  company_name: string
  location?: string | null
  stage: string
}

interface ContactFinderModalProps {
  isOpen: boolean
  onClose: () => void
  selectedApplications: Application[]
  userCredits: number
  onSuccess: () => void
}

export default function ContactFinderModal({
  isOpen,
  onClose,
  selectedApplications,
  userCredits,
  onSuccess
}: ContactFinderModalProps) {
  const [contactsPerJob, setContactsPerJob] = useState(3)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [result, setResult] = useState<any>(null)

  const totalContacts = selectedApplications.length * contactsPerJob
  const creditCost = totalContacts
  const hasEnoughCredits = userCredits >= creditCost

  const handleRun = async () => {
    setIsRunning(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/contact-finder/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationIds: selectedApplications.map(app => app.id),
          contactsPerJob,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to start contact finder')
      }

      setSuccess(true)
      setResult(data)

      // Wait 2 seconds then close and refresh
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 2000)

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setIsRunning(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Users size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Contact Finder</h2>
              <p className="text-sm text-gray-600">Find the best people to reach out to</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isRunning}
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Selected Jobs */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              Selected Jobs ({selectedApplications.length})
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selectedApplications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  <CheckCircle2 size={16} className="text-green-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {app.company_name}
                    </div>
                    <div className="text-sm text-gray-600 truncate">
                      {app.job_title}{app.location ? ` • ${app.location}` : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contacts Per Job Input */}
          <div>
            <label className="block font-semibold text-gray-900 mb-3">
              How many contacts per job?
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={contactsPerJob}
              onChange={(e) => setContactsPerJob(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
              disabled={isRunning}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-lg font-semibold text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
              <Zap size={16} />
              <span className="font-medium">We recommend 3-5 contacts for best results</span>
            </div>
          </div>

          {/* Credit Cost Breakdown */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 space-y-2">
            <h3 className="font-semibold text-gray-900 mb-2">Credit Cost</h3>
            <div className="text-sm text-gray-700 space-y-1">
              <div className="flex justify-between">
                <span>{selectedApplications.length} jobs × {contactsPerJob} contacts</span>
                <span className="font-semibold">{totalContacts} total contacts</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-purple-200/50">
                <span className="font-semibold">Cost:</span>
                <span className="text-2xl font-bold text-purple-600">{creditCost} credits</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span>You have:</span>
                <span className={`font-semibold ${hasEnoughCredits ? 'text-green-600' : 'text-red-600'}`}>
                  {userCredits} credits
                </span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-red-900 mb-1">Error</div>
                <div className="text-sm text-red-700">{error}</div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && result && (
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle2 size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-green-900 mb-1">Contact Finder Started!</div>
                <div className="text-sm text-green-700 space-y-1">
                  <div>Finding contacts for {result.jobsProcessing} jobs...</div>
                  <div>Estimated time: {result.estimatedTime}</div>
                  <div className="font-medium mt-2">You'll see results in your CRM soon!</div>
                </div>
              </div>
            </div>
          )}

          {/* Insufficient Credits Warning */}
          {!hasEnoughCredits && (
            <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl">
              <AlertCircle size={20} className="text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-orange-900 mb-1">Insufficient Credits</div>
                <div className="text-sm text-orange-700">
                  You need {creditCost} credits but only have {userCredits}.
                  Please purchase more credits to continue.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={isRunning}
            className="px-6 py-3 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleRun}
            disabled={isRunning || !hasEnoughCredits || contactsPerJob < 1 || contactsPerJob > 10}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Zap size={20} />
                Run Contact Finder
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
