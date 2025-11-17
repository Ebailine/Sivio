'use client';

import { X, ExternalLink, Mail, MapPin, Briefcase, TrendingUp, AlertCircle, CheckCircle2, Building2 } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  position?: string;
  email?: string;
  company_name?: string;
  linkedin_url?: string;
  verified: boolean;
  relevance_score: number;
  reasoning?: string;
  role_type?: string;
  contact_location?: string;
  created_at: string;
}

interface ContactDetailModalProps {
  contact: Contact;
  isOpen: boolean;
  onClose: () => void;
}

export function ContactDetailModal({ contact, isOpen, onClose }: ContactDetailModalProps) {
  if (!isOpen) return null;

  const getRelevanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getRoleTypeColor = (roleType?: string) => {
    const colors = {
      hr: 'bg-blue-100 text-blue-700',
      team: 'bg-purple-100 text-purple-700',
      manager: 'bg-green-100 text-green-700',
      recruiter: 'bg-orange-100 text-orange-700',
      executive: 'bg-red-100 text-red-700',
      other: 'bg-gray-100 text-gray-700',
    };
    return colors[roleType as keyof typeof colors] || colors.other;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-2xl">
              {contact.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{contact.name}</h2>
              {contact.position && (
                <p className="text-sm text-gray-600">{contact.position}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Relevance Score & Verification */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Relevance Score</span>
                <TrendingUp className="h-4 w-4 text-gray-400" />
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-3xl font-bold ${getRelevanceColor(contact.relevance_score)}`}>
                  {contact.relevance_score}%
                </span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Verification</span>
                {contact.verified ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-gray-400" />
                )}
              </div>
              <span className={`text-sm font-medium ${contact.verified ? 'text-green-600' : 'text-gray-600'}`}>
                {contact.verified ? 'Verified Contact' : 'Unverified'}
              </span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            {contact.email && (
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">Email</p>
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-blue-600 hover:text-blue-700 font-medium break-all"
                  >
                    {contact.email}
                  </a>
                </div>
              </div>
            )}

            {contact.linkedin_url && (
              <div className="flex items-start gap-3 p-4 bg-indigo-50 rounded-lg">
                <ExternalLink className="h-5 w-5 text-indigo-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-indigo-900">LinkedIn Profile</p>
                  <a
                    href={contact.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-700 font-medium break-all"
                  >
                    View Profile
                  </a>
                </div>
              </div>
            )}

            {contact.company_name && (
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Building2 className="h-5 w-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Company</p>
                  <p className="text-gray-900 font-medium">{contact.company_name}</p>
                </div>
              </div>
            )}

            {contact.contact_location && (
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <MapPin className="h-5 w-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Location</p>
                  <p className="text-gray-900">{contact.contact_location}</p>
                </div>
              </div>
            )}

            {contact.role_type && (
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Briefcase className="h-5 w-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Role Type</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleTypeColor(contact.role_type)}`}>
                    {contact.role_type.charAt(0).toUpperCase() + contact.role_type.slice(1)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* AI Reasoning */}
          {contact.reasoning && (
            <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
              <div className="flex items-start gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-purple-600 mt-0.5" />
                <h3 className="font-semibold text-purple-900">Why This Contact?</h3>
              </div>
              <p className="text-purple-800 text-sm leading-relaxed">{contact.reasoning}</p>
            </div>
          )}

          {/* Outreach Tips */}
          <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
            <h3 className="font-semibold text-blue-900 mb-3">Outreach Tips</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Personalize your message by mentioning specific aspects of the role or company</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Keep your initial message concise and professional</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Follow up if you don't hear back within 5-7 business days</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Mention your application and express genuine interest in the position</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex gap-2">
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Mail className="h-4 w-4" />
                Send Email
              </a>
            )}
            {contact.linkedin_url && (
              <a
                href={contact.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                View LinkedIn
              </a>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
