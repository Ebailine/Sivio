'use client'

import { Mail, Linkedin, CheckCircle2, XCircle, AlertCircle, TrendingUp, Briefcase, Sparkles } from 'lucide-react'

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
  metadata?: {
    aiReasoning?: string
    keyStrengths?: string[]
    strategyReasoning?: string
  }
}

interface ContactCardProps {
  contact: Contact
  onSelect?: (contact: Contact) => void
  onGenerateEmail?: (contact: Contact) => void
  isSelected?: boolean
}

export default function ContactCard({ contact, onSelect, onGenerateEmail, isSelected = false }: ContactCardProps) {
  const getEmailStatusInfo = (status: string) => {
    switch (status) {
      case 'valid':
        return { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', label: 'Verified' }
      case 'invalid':
        return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Invalid' }
      case 'catch-all':
        return { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Catch-All' }
      case 'unknown':
      case 'unverified':
      default:
        return { icon: AlertCircle, color: 'text-gray-600', bg: 'bg-gray-50', label: 'Unverified' }
    }
  }

  const getRelevanceColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-50'
    if (score >= 70) return 'text-blue-600 bg-blue-50'
    if (score >= 50) return 'text-yellow-600 bg-yellow-50'
    return 'text-gray-600 bg-gray-50'
  }

  const emailStatus = getEmailStatusInfo(contact.email_status)
  const StatusIcon = emailStatus.icon

  return (
    <div
      onClick={() => onSelect?.(contact)}
      className={`bg-white rounded-lg border-2 transition-all cursor-pointer p-4 hover:shadow-md ${
        isSelected
          ? 'border-blue-500 shadow-md'
          : 'border-gray-200 hover:border-blue-300'
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{contact.full_name}</h3>
          {contact.position && (
            <p className="text-sm text-gray-600 mt-0.5">{contact.position}</p>
          )}
        </div>
        {contact.is_key_decision_maker && (
          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
            Key Decision Maker
          </span>
        )}
      </div>

      {/* Email */}
      <div className="flex items-center gap-2 mb-2">
        <Mail size={16} className="text-gray-400" />
        {contact.email ? (
          <a
            href={`mailto:${contact.email}`}
            onClick={(e) => e.stopPropagation()}
            className="text-sm text-blue-600 hover:underline"
          >
            {contact.email}
          </a>
        ) : (
          <span className="text-sm text-gray-500 italic">
            No email available - LinkedIn only
          </span>
        )}
      </div>

      {/* Email Status */}
      <div className="flex items-center gap-2 mb-3">
        <StatusIcon size={16} className={emailStatus.color} />
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${emailStatus.bg} ${emailStatus.color}`}>
          {emailStatus.label}
        </span>
      </div>

      {/* Department & Relevance Score */}
      <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
        {contact.department && (
          <div className="flex items-center gap-1.5">
            <Briefcase size={14} className="text-gray-400" />
            <span className="text-xs text-gray-600">{contact.department}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 ml-auto">
          <TrendingUp size={14} className="text-gray-400" />
          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${getRelevanceColor(contact.relevance_score)}`}>
            {contact.relevance_score}% match
          </span>
        </div>
      </div>

      {/* LinkedIn */}
      {contact.linkedin_url && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <a
            href={contact.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
          >
            <Linkedin size={14} />
            <span>View LinkedIn</span>
          </a>
        </div>
      )}

      {/* AI Reasoning */}
      {contact.metadata?.aiReasoning && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-700 mb-1.5">Why this contact:</p>
          <p className="text-xs text-gray-600 leading-relaxed">{contact.metadata.aiReasoning}</p>
          {contact.metadata?.keyStrengths && contact.metadata.keyStrengths.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {contact.metadata.keyStrengths.map((strength: string, i: number) => (
                <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium">
                  {strength}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Generate Email Button */}
      {onGenerateEmail && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onGenerateEmail(contact)
            }}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all shadow-sm hover:shadow-md"
          >
            <Sparkles size={16} />
            Generate AI Email
          </button>
        </div>
      )}
    </div>
  )
}
