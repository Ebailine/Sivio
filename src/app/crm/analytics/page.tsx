'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import MainNav from '@/components/MainNav';
import { LoadingDashboard } from '@/components/crm/shared/LoadingState';
import {
  ApplicationPipelineChart,
  ApplicationsOverTimeChart,
  StageDistributionChart,
  ContactTypeDistributionChart,
  SuccessRateChart,
} from '@/components/crm/analytics/Charts';
import {
  BarChart3,
  TrendingUp,
  Target,
  Users,
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';

interface Application {
  id: string;
  stage: string;
  applied_date: string;
  company_name: string;
  created_at: string;
}

interface Contact {
  id: string;
  role_type?: string;
  relevance_score: number;
  created_at: string;
}

export default function AnalyticsPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    fetchData();
  }, [isLoaded, isSignedIn, router]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [appsResponse, contactsResponse] = await Promise.all([
        fetch('/api/applications'),
        fetch('/api/contacts/search'),
      ]);

      if (!appsResponse.ok || !contactsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const appsData = await appsResponse.json();
      const contactsData = await contactsResponse.json();

      setApplications(appsData.applications || []);
      setContacts(contactsData.contacts || []);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingDashboard />
      </div>
    );
  }

  // Calculate metrics
  const totalApplications = applications.length;
  const acceptedCount = applications.filter((app) => app.stage === 'accepted').length;
  const rejectedCount = applications.filter((app) => app.stage === 'rejected').length;
  const activeCount = totalApplications - acceptedCount - rejectedCount;
  const successRate = totalApplications > 0 ? ((acceptedCount / totalApplications) * 100).toFixed(1) : '0.0';
  const interviewCount = applications.filter(
    (app) => app.stage === 'interviewing' || app.stage === 'offer'
  ).length;
  const interviewRate = totalApplications > 0 ? ((interviewCount / totalApplications) * 100).toFixed(1) : '0.0';

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
              <p className="text-sm text-gray-600">
                Track your application performance and insights
              </p>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error loading analytics</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <button
                  onClick={fetchData}
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

        {/* Analytics Content */}
        {!isLoading && !error && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {totalApplications}
                </div>
                <p className="text-sm text-gray-600">{activeCount} active</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Target className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {successRate}%
                </div>
                <p className="text-sm text-gray-600">{acceptedCount} accepted</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">Interview Rate</p>
                  <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {interviewRate}%
                </div>
                <p className="text-sm text-gray-600">{interviewCount} interviews</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">Total Contacts</p>
                  <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {contacts.length}
                </div>
                <p className="text-sm text-gray-600">discovered</p>
              </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ApplicationPipelineChart applications={applications} />
              <SuccessRateChart applications={applications} />
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ApplicationsOverTimeChart applications={applications} />
              <StageDistributionChart applications={applications} />
            </div>

            {/* Charts Row 3 */}
            {contacts.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ContactTypeDistributionChart contacts={contacts} />
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Best Performing Metrics
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="text-sm text-gray-700">Average Response Time</span>
                      <span className="text-sm font-semibold text-gray-900">3-5 days</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="text-sm text-gray-700">Most Effective Stage</span>
                      <span className="text-sm font-semibold text-gray-900">Screening</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="text-sm text-gray-700">Avg. Applications/Week</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {applications.length > 0 ? Math.round(applications.length / 4) : 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="text-sm text-gray-700">Contact Discovery Rate</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {applications.length > 0
                          ? ((contacts.length / applications.length) * 100).toFixed(0)
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {applications.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">No data yet</h2>
                <p className="text-gray-600 mb-6">
                  Start tracking applications to see your analytics
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
        )}
      </div>
    </div>
  );
}
