'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import MainNav from '@/components/MainNav';
import { LoadingDashboard } from '@/components/crm/shared/LoadingState';
import { ContactsTable } from '@/components/crm/contacts/ContactsTable';
import { Users, AlertCircle, Download } from 'lucide-react';

interface Contact {
  id: string;
  user_id: string;
  application_id?: string;
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
  job_location?: string;
  created_at: string;
}

export default function ContactsPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    fetchContacts();
  }, [isLoaded, isSignedIn, router]);

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/contacts/search');

      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }

      const data = await response.json();
      setContacts(data.contacts || []);
    } catch (err: any) {
      console.error('Error fetching contacts:', err);
      setError(err.message || 'Failed to load contacts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (contacts.length === 0) return;

    // Create CSV content
    const headers = ['Name', 'Email', 'Position', 'Company', 'Role Type', 'Relevance Score', 'Location', 'LinkedIn URL', 'Verified', 'Found Date'];
    const rows = contacts.map(contact => [
      contact.name,
      contact.email || '',
      contact.position || '',
      contact.company_name || '',
      contact.role_type || '',
      contact.relevance_score.toString(),
      contact.contact_location || '',
      contact.linkedin_url || '',
      contact.verified ? 'Yes' : 'No',
      new Date(contact.created_at).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sivio-contacts-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingDashboard />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
                <p className="text-sm text-gray-600">
                  View and manage your discovered hiring contacts
                </p>
              </div>
            </div>

            {contacts.length > 0 && (
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error loading contacts</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <button
                  onClick={fetchContacts}
                  className="text-sm text-red-800 font-medium mt-2 hover:underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-xl border border-gray-200 p-12">
            <LoadingDashboard />
          </div>
        )}

        {/* Contacts Table */}
        {!isLoading && !error && contacts.length > 0 && (
          <ContactsTable contacts={contacts} />
        )}

        {/* Empty State */}
        {!isLoading && !error && contacts.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No contacts yet</h2>
            <p className="text-gray-600 mb-6">
              Use the Contact Finder on your applications to discover hiring managers and recruiters
            </p>
            <button
              onClick={() => router.push('/crm/applications')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Applications
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
