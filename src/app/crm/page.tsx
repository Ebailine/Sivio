'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { ErrorBoundary } from '@/components/crm/shared/ErrorBoundary';
import { LoadingDashboard } from '@/components/crm/shared/LoadingState';
import { ToastNotifications } from '@/components/crm/shared/ToastNotifications';
import { DashboardStats } from '@/components/crm/dashboard/DashboardStats';
import { RecentActivity, Activity } from '@/components/crm/dashboard/RecentActivity';
import { TopContacts } from '@/components/crm/dashboard/TopContacts';
import { PipelineChart } from '@/components/crm/dashboard/PipelineChart';
import { GlobalSearch } from '@/components/crm/dashboard/GlobalSearch';
import { useDashboardStats } from '@/lib/hooks/useDashboardStats';
import { useRecentActivity } from '@/lib/hooks/useRecentActivity';
import { createClient } from '@/lib/supabase/client';
import { Plus, Briefcase, Users as UsersIcon } from 'lucide-react';
import Link from 'next/link';

interface Contact {
  id: string;
  name: string;
  position: string;
  company?: string;
  relevanceScore: number;
  roleType: 'hr' | 'team' | 'manager' | 'other';
}

interface Application {
  id: string;
  company: string;
  position: string;
  location?: string;
}

export default function DashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  const [topContacts, setTopContacts] = useState<Contact[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [contacts, setContacts] = useState<Array<{ id: string; name: string; position: string; company?: string }>>([]);

  // Use custom hooks for dashboard data (only when user is loaded)
  const userId = (isLoaded && user?.id) ? user.id : '';
  const { stats, isLoading: statsLoading, error: statsError } = useDashboardStats(userId);
  const { activities, isLoading: activitiesLoading, error: activitiesError } = useRecentActivity(userId);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    fetchTopContacts();
    fetchApplicationsForSearch();
    fetchContactsForSearch();
  }, [isLoaded, isSignedIn, router, user]);

  const fetchTopContacts = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('contacts')
        .select('id, name, position, company, relevancescore, roletype')
        .eq('userid', user?.id)
        .order('relevancescore', { ascending: false })
        .limit(5);

      if (error) throw error;

      const formattedContacts: Contact[] = (data || []).map(c => ({
        id: c.id,
        name: c.name,
        position: c.position,
        company: c.company,
        relevanceScore: c.relevancescore || 0,
        roleType: c.roletype || 'other',
      }));

      setTopContacts(formattedContacts);
    } catch (error) {
      console.error('Error fetching top contacts:', error);
    }
  };

  const fetchApplicationsForSearch = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('applications')
        .select('id, company, position, location')
        .eq('userid', user?.id)
        .order('createdat', { ascending: false })
        .limit(50);

      if (error) throw error;

      setApplications((data || []).map(app => ({
        id: app.id,
        company: app.company,
        position: app.position,
        location: app.location,
      })));
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const fetchContactsForSearch = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('contacts')
        .select('id, name, position, company')
        .eq('userid', user?.id)
        .order('createdat', { ascending: false })
        .limit(50);

      if (error) throw error;

      setContacts((data || []).map(c => ({
        id: c.id,
        name: c.name,
        position: c.position,
        company: c.company,
      })));
    } catch (error) {
      console.error('Error fetching contacts for search:', error);
    }
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingDashboard />
      </div>
    );
  }

  if (statsLoading || activitiesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ToastNotifications />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingDashboard />
        </div>
      </div>
    );
  }

  if (statsError || activitiesError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ToastNotifications />
        <ErrorBoundary>
          <div />
        </ErrorBoundary>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <ToastNotifications />

        {/* Page Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Welcome back, {user?.firstName || 'there'}! Here's your job search overview.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <GlobalSearch applications={applications} contacts={contacts} />
                <Link
                  href="/jobs"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Plus className="h-4 w-4" />
                  Add Application
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Stats Cards */}
            {stats && (
              <DashboardStats
                totalApplications={stats.totalApplications}
                totalContacts={stats.totalContacts}
                responseRate={stats.responseRate}
                interviews={stats.interviews}
                avgRelevanceScore={stats.avgRelevanceScore}
                hrContacts={stats.hrContacts}
                applicationsChange={stats.applicationsChange}
                contactsChange={stats.contactsChange}
                responseRateChange={stats.responseRateChange}
              />
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Quick Actions:</span>
                <Link
                  href="/crm/applications"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
                >
                  <Briefcase className="h-4 w-4" />
                  View Applications
                </Link>
                <Link
                  href="/crm/contacts"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  <UsersIcon className="h-4 w-4" />
                  View Contacts
                </Link>
              </div>
            </div>

            {/* Activity & Contacts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity (2/3 width) */}
              <div className="lg:col-span-2">
                <RecentActivity activities={activities} />
              </div>

              {/* Top Contacts (1/3 width) */}
              <div>
                <TopContacts contacts={topContacts} />
              </div>
            </div>

            {/* Pipeline Chart */}
            {stats && (
              <PipelineChart statusCounts={stats.statusCounts} />
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
