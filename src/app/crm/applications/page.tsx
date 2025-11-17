'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import MainNav from '@/components/MainNav';
import { LoadingDashboard } from '@/components/crm/shared/LoadingState';
import { ApplicationsTable } from '@/components/crm/applications/ApplicationsTable';
import { ContactFinderButton } from '@/components/crm/applications/ContactFinderButton';
import { Briefcase, AlertCircle } from 'lucide-react';

interface Application {
  id: string;
  job_id: string;
  job_title: string;
  company_name: string;
  company_logo_url?: string;
  location?: string;
  employment_type?: string;
  seniority_level?: string;
  salary_range?: string;
  stage: string;
  status: string;
  applied_date: string;
  created_at: string;
  updated_at?: string;
  notes?: string[];
}

export default function ApplicationsPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    fetchApplications();
  }, [isLoaded, isSignedIn, router]);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/applications');

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const data = await response.json();
      setApplications(data.applications || []);
    } catch (err: any) {
      console.error('Error fetching applications:', err);
      setError(err.message || 'Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactFinderComplete = () => {
    // Optionally refresh applications or show success message
    setSelectedApplications([]);
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
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
                <p className="text-sm text-gray-600">
                  Manage your job applications and find hiring contacts
                </p>
              </div>
            </div>

            <ContactFinderButton
              selectedApplicationIds={selectedApplications}
              onComplete={handleContactFinderComplete}
            />
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error loading applications</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <button
                  onClick={fetchApplications}
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

        {/* Applications Table */}
        {!isLoading && !error && (
          <ApplicationsTable
            applications={applications}
            onSelectApplications={setSelectedApplications}
            selectedApplications={selectedApplications}
          />
        )}

        {/* Empty State */}
        {!isLoading && !error && applications.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No applications yet</h2>
            <p className="text-gray-600 mb-6">
              Start by finding jobs and marking them as applied
            </p>
            <button
              onClick={() => router.push('/jobs')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Jobs
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
