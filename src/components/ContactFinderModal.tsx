'use client'

import { useState, useEffect } from 'react'
import { X, Search, Coins, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import ContactCard from './ContactCard'

interface Contact {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  full_name: string
  position: string | null
  company_name: string | null
  company_domain: string
  linkedin_url: string | null
  email_status: 'valid' | 'invalid' | 'catch-all' | 'unknown' | 'unverified'
  relevance_score: number
  is_key_decision_maker: boolean
  department: string | null
}

interface ContactFinderModalProps {
  isOpen: boolean
  onClose: () => void
  jobId?: string
  companyName: string
  companyDomain?: string
  jobTitle?: string
  jobDescription?: string
  jobType?: string
  location?: string
  userCredits: number
  onCreditsUpdate?: (newCredits: number) => void
}

export default function ContactFinderModal({
  isOpen,
  onClose,
  jobId,
  companyName,
  companyDomain,
  jobTitle,
  jobDescription,
  jobType,
  location,
  userCredits,
  onCreditsUpdate
}: ContactFinderModalProps) {
  const [loading, setLoading] = useState(false)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [searchComplete, setSearchComplete] = useState(false)
  const [cached, setCached] = useState(false)
  const [creditsDeducted, setCreditsDeducted] = useState(0)
  const [strategy, setStrategy] = useState<any>(null)
  const [bypassCache, setBypassCache] = useState(false)

  // Editable search parameters
  const [searchCompany, setSearchCompany] = useState(companyName)
  const [searchDomain, setSearchDomain] = useState(companyDomain || '')
  const [searchPosition, setSearchPosition] = useState(jobTitle || '')
  const [searchLocation, setSearchLocation] = useState(location || '')

  const CREDIT_COST_PER_CONTACT = 1

  // Auto-fill when modal opens or props change
  useEffect(() => {
    if (isOpen) {
      setSearchCompany(companyName)
      setSearchDomain(companyDomain || '')
      setSearchPosition(jobTitle || '')
      setSearchLocation(location || '')
    }
  }, [isOpen, companyName, companyDomain, jobTitle, location])

  useEffect(() => {
    if (isOpen && companyDomain) {
      // Check if we already have contacts for this domain
      checkExistingContacts()
    }
  }, [isOpen, companyDomain])

  const checkExistingContacts = async () => {
    if (!companyDomain) return

    try {
      const response = await fetch(`/api/contacts?domain=${encodeURIComponent(companyDomain)}`)
      const data = await response.json()

      if (data.success && data.contacts.length > 0) {
        setContacts(data.contacts)
        setSearchComplete(true)
        setCached(true)
      }
    } catch (error) {
      console.error('Failed to check existing contacts:', error)
    }
  }

  const handleSearch = async () => {
    // Validate required fields
    if (!searchCompany.trim()) {
      setError('Company name is required')
      return
    }

    // Note: Credits are now charged per contact found, not upfront
    if (userCredits < CREDIT_COST_PER_CONTACT) {
      setError(`Insufficient credits. You need at least ${CREDIT_COST_PER_CONTACT} credit per contact. You have ${userCredits}.`)
      return
    }

    setLoading(true)
    setError(null)
    setSearchComplete(false)

    try {
      const response = await fetch('/api/contacts/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: searchDomain.trim() || undefined,
          company: searchCompany.trim(),
          jobId,
          jobTitle: searchPosition.trim() || undefined,
          jobDescription,
          jobType,
          location: searchLocation.trim() || undefined,
          bypassCache: bypassCache
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 402) {
          setError(data.message || `Insufficient credits. You need ${data.creditsRequired} credit but only have ${data.creditsAvailable}.`)
        } else if (response.status === 404) {
          setError(data.message || 'No contacts found for this company. Try another company or check the domain.')
        } else {
          // Use message field first, then error field, then default
          const errorMsg = data.message || data.error || 'Failed to search for contacts'
          const details = data.details ? `\n\nDetails: ${data.details}` : ''
          setError(errorMsg + details)
        }
        return
      }

      setContacts(data.contacts)
      setCached(data.cached || false)
      setCreditsDeducted(data.creditsDeducted || 0)
      setStrategy(data.strategy || null)
      setSearchComplete(true)

      // Update user credits
      if (onCreditsUpdate && !data.cached) {
        onCreditsUpdate(data.remainingCredits)
      }

    } catch (error: any) {
      console.error('Contact search error:', error)
      setError('Failed to search for contacts. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const toggleContactSelection = (contact: Contact) => {
    setSelectedContacts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(contact.id)) {
        newSet.delete(contact.id)
      } else {
        newSet.add(contact.id)
      }
      return newSet
    })
  }

  const handleClose = () => {
    setContacts([])
    setSelectedContacts(new Set())
    setError(null)
    setSearchComplete(false)
    setCached(false)
    setCreditsDeducted(0)
    setStrategy(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start z-10">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Find Contacts</h2>
              <p className="text-gray-600">{companyName}</p>
              {companyDomain && (
                <p className="text-sm text-gray-500 mt-1">{companyDomain}</p>
              )}
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Search Section */}
            {!searchComplete && (
              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <Coins className="text-blue-600 mt-0.5" size={20} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">
                        Pay-per-contact: {CREDIT_COST_PER_CONTACT} credit per contact found
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Your balance: {userCredits} credits · Only charged for results
                      </p>
                    </div>
                  </div>
                </div>

                {/* Editable Search Parameters */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Search Parameters (AI will use these to find contacts)</h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        value={searchCompany}
                        onChange={(e) => setSearchCompany(e.target.value)}
                        placeholder="e.g., Stripe, Meta, Acme Inc"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Company Website Domain
                      </label>
                      <input
                        type="text"
                        value={searchDomain}
                        onChange={(e) => setSearchDomain(e.target.value)}
                        placeholder="e.g., stripe.com, meta.com (AI will guess if empty)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        ⚠️ If search fails, manually enter the correct website domain here
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Position Title
                      </label>
                      <input
                        type="text"
                        value={searchPosition}
                        onChange={(e) => setSearchPosition(e.target.value)}
                        placeholder="e.g., Software Engineer, Product Manager"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                        placeholder="e.g., San Francisco, CA or Remote"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-3">
                    💡 The AI uses these details to identify the best contacts (HR, recruiters, hiring managers)
                  </p>
                </div>

                {/* Bypass Cache Checkbox */}
                <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bypassCache}
                      onChange={(e) => setBypassCache(e.target.checked)}
                      className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">Force fresh search (bypass cache)</span>
                      <p className="text-xs text-gray-600 mt-1">
                        Check this to ignore cached results and run a brand new search. Uses 4 credits.
                      </p>
                    </div>
                  </label>
                </div>

                <button
                  onClick={handleSearch}
                  disabled={loading || userCredits < CREDIT_COST_PER_CONTACT || !searchCompany.trim()}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Searching for contacts...
                    </>
                  ) : (
                    <>
                      <Search size={20} />
                      Search for Contacts
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={24} />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900 mb-1">
                      Search Failed
                    </h3>
                    <p className="text-sm text-red-800 whitespace-pre-wrap">{error}</p>
                    <button
                      onClick={() => setError(null)}
                      className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message with AI Insights */}
            {searchComplete && !error && (
              <div className={`border rounded-lg p-4 mb-6 ${cached ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className={cached ? 'text-green-600 flex-shrink-0' : 'text-blue-600 flex-shrink-0'} size={24} />
                  <div className="flex-1">
                    <h3 className={`text-sm font-semibold ${cached ? 'text-green-900' : 'text-blue-900'} mb-1`}>
                      {cached ? 'Using Cached Results' : `AI Found ${contacts.length} High-Quality Contact${contacts.length !== 1 ? 's' : ''}!`}
                    </h3>
                    <p className={`text-xs ${cached ? 'text-green-800' : 'text-blue-800'}`}>
                      {cached
                        ? 'These contacts were found recently (no credits charged)'
                        : strategy?.reasoning || `AI analyzed the job and identified the best contacts at ${companyName}.`}
                    </p>
                    {!cached && strategy && (
                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        <span className="bg-white/50 px-2 py-1 rounded">
                          Confidence: {strategy.confidence}%
                        </span>
                        <span className="bg-white/50 px-2 py-1 rounded capitalize">
                          {strategy.approach?.replace('-', ' ')}
                        </span>
                        {creditsDeducted > 0 && (
                          <span className="bg-white/50 px-2 py-1 rounded">
                            {creditsDeducted} credit deducted
                          </span>
                        )}
                      </div>
                    )}
                    {cached && (
                      <p className="text-xs text-green-700 mt-1">
                        No credits charged
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Contacts Grid */}
            {contacts.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {contacts.length} Contact{contacts.length !== 1 ? 's' : ''} Found
                  </h3>
                  {selectedContacts.size > 0 && (
                    <span className="text-sm text-gray-600">
                      {selectedContacts.size} selected
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contacts.map((contact) => (
                    <ContactCard
                      key={contact.id}
                      contact={contact}
                      onSelect={toggleContactSelection}
                      isSelected={selectedContacts.has(contact.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {searchComplete && contacts.length === 0 && !error && (
              <div className="text-center py-12">
                <p className="text-gray-600">No contacts found for this company.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {contacts.length > 0 && (
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  {selectedContacts.size > 0
                    ? `${selectedContacts.size} contact${selectedContacts.size !== 1 ? 's' : ''} selected`
                    : 'Select contacts to reach out to'}
                </p>
                <button
                  onClick={handleClose}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
