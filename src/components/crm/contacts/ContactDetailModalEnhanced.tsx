'use client';

import { useState } from 'react';
import {
  X,
  ExternalLink,
  Mail,
  MapPin,
  Briefcase,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Building2,
  MessageSquare,
  Sparkles,
  Bell,
  FileText,
} from 'lucide-react';
import { EmailTemplates } from './EmailTemplates';
import { AIRecommendations } from './AIRecommendations';
import { ReminderSystem } from './ReminderSystem';

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

interface ContactDetailModalEnhancedProps {
  contact: Contact;
  isOpen: boolean;
  onClose: () => void;
  jobTitle?: string;
}

type TabType = 'overview' | 'email' | 'ai' | 'reminders';

export function ContactDetailModalEnhanced({
  contact,
  isOpen,
  onClose,
  jobTitle,
}: ContactDetailModalEnhancedProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

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

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: FileText },
    { id: 'email' as TabType, label: 'Email Templates', icon: Mail },
    { id: 'ai' as TabType, label: 'AI Insights', icon: Sparkles },
    { id: 'reminders' as TabType, label: 'Reminders', icon: Bell },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-2xl">
              {contact.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{contact.name}</h2>
              {contact.position && <p className="text-sm text-gray-600">{contact.position}</p>}
              {contact.company_name && (
                <p className="text-sm text-gray-500">{contact.company_name}</p>
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

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium text-sm">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Relevance Score & Verification */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Relevance Score</span>
                    <TrendingUp className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-3xl font-bold ${getRelevanceColor(contact.relevance_score)}`}
                    >
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
                  <span
                    className={`text-sm font-medium ${
                      contact.verified ? 'text-green-600' : 'text-gray-600'
                    }`}
                  >
                    {contact.verified ? 'Verified Contact' : 'Unverified'}
                  </span>
                </div>
              </div>

              {/* Role Type */}
              {contact.role_type && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Role Type</label>
                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getRoleTypeColor(
                      contact.role_type
                    )}`}
                  >
                    {contact.role_type.charAt(0).toUpperCase() + contact.role_type.slice(1)}
                  </span>
                </div>
              )}

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>

                {contact.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Email</p>
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {contact.email}
                      </a>
                    </div>
                  </div>
                )}

                {contact.linkedin_url && (
                  <div className="flex items-center gap-3">
                    <ExternalLink className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">LinkedIn</p>
                      <a
                        href={contact.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                      >
                        View Profile
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}

                {contact.contact_location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Location</p>
                      <p className="text-gray-900">{contact.contact_location}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* AI Reasoning */}
              {contact.reasoning && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">Why This Contact?</h4>
                      <p className="text-sm text-blue-800">{contact.reasoning}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Email Templates Tab */}
          {activeTab === 'email' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Templates</h3>
              <EmailTemplates contact={contact} jobTitle={jobTitle} />
            </div>
          )}

          {/* AI Insights Tab */}
          {activeTab === 'ai' && (
            <div>
              <AIRecommendations
                contact={contact}
                isLoading={false}
                onRefresh={() => {
                  // Trigger AI recommendations refresh
                  console.log('Refresh AI recommendations');
                }}
              />
            </div>
          )}

          {/* Reminders Tab */}
          {activeTab === 'reminders' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Follow-up Reminders</h3>
              <ReminderSystem
                contactId={contact.id}
                contactName={contact.name}
                onSave={async (reminders) => {
                  // Save reminders
                  console.log('Save reminders:', reminders);
                }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end">
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
