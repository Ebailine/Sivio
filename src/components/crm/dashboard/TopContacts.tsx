'use client';

import { motion } from 'framer-motion';
import { Star, ArrowRight, Users } from 'lucide-react';
import Link from 'next/link';

interface Contact {
  id: string;
  name: string;
  position: string;
  company?: string;
  relevanceScore: number;
  roleType: 'hr' | 'team' | 'manager' | 'other';
}

interface TopContactsProps {
  contacts: Contact[];
}

const getScoreColor = (score: number) => {
  if (score >= 90) return 'bg-green-100 text-green-800 border-green-300';
  if (score >= 80) return 'bg-blue-100 text-blue-800 border-blue-300';
  if (score >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  if (score >= 60) return 'bg-orange-100 text-orange-800 border-orange-300';
  return 'bg-gray-100 text-gray-800 border-gray-300';
};

export function TopContacts({ contacts }: TopContactsProps) {
  if (contacts.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Contacts</h3>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="h-12 w-12 text-gray-400 mb-3" />
          <p className="text-gray-600">No contacts yet</p>
          <p className="text-sm text-gray-500 mt-1">Find contacts from your applications</p>
          <Link
            href="/crm/applications"
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Go to Applications
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Top Contacts</h3>
        <Link
          href="/crm/contacts"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          View All
        </Link>
      </div>

      <div className="space-y-3">
        {contacts.slice(0, 5).map((contact, index) => (
          <motion.div
            key={contact.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="group p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${getScoreColor(contact.relevanceScore)}`}>
                    {contact.relevanceScore}
                  </span>
                </div>
                <h4 className="font-medium text-gray-900 truncate">{contact.name}</h4>
                <p className="text-sm text-gray-600 truncate">{contact.position}</p>
                {contact.company && (
                  <p className="text-xs text-gray-500 mt-1 truncate">{contact.company}</p>
                )}
              </div>
              <Link
                href={`/crm/contacts?id=${contact.id}`}
                className="flex-shrink-0 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      <Link
        href="/crm/contacts"
        className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        View All Contacts
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
