'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface DashboardStats {
  totalApplications: number;
  totalContacts: number;
  responseRate: number;
  interviews: number;
  avgRelevanceScore: number;
  hrContacts: number;
  applicationsChange: number;
  contactsChange: number;
  responseRateChange: number;
  statusCounts: {
    applied: number;
    screening: number;
    interviewing: number;
    offer: number;
    rejected: number;
    accepted: number;
  };
}

export function useDashboardStats(userId: string) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const supabase = createClient();

        // Fetch all applications
        const { data: applications, error: appsError } = await supabase
          .from('applications')
          .select('*')
          .eq('user_id', userId);

        if (appsError) throw appsError;

        // Fetch all contacts
        const { data: contacts, error: contactsError } = await supabase
          .from('contacts')
          .select('*')
          .eq('userId', userId);

        if (contactsError) throw contactsError;

        // Calculate stats
        const totalApplications = applications?.length || 0;
        const totalContacts = contacts?.length || 0;

        // Calculate status counts
        const statusCounts = {
          applied: applications?.filter(app => app.status === 'applied').length || 0,
          screening: applications?.filter(app => app.status === 'screening').length || 0,
          interviewing: applications?.filter(app => app.status === 'interviewing').length || 0,
          offer: applications?.filter(app => app.status === 'offer').length || 0,
          rejected: applications?.filter(app => app.status === 'rejected').length || 0,
          accepted: applications?.filter(app => app.status === 'accepted').length || 0,
        };

        // Calculate interviews (interviewing + offer + accepted)
        const interviews = statusCounts.interviewing + statusCounts.offer + statusCounts.accepted;

        // Calculate response rate (screening + interviewing + offer + accepted) / total
        const responded = statusCounts.screening + statusCounts.interviewing + statusCounts.offer + statusCounts.accepted;
        const responseRate = totalApplications > 0 ? Math.round((responded / totalApplications) * 100) : 0;

        // Calculate avg relevance score
        const avgRelevanceScore = contacts && contacts.length > 0
          ? Math.round(contacts.reduce((sum, c) => sum + (c.relevance_score || 0), 0) / contacts.length)
          : 0;

        // Calculate HR contacts count
        const hrContacts = contacts?.filter(c => c.role_type === 'hr').length || 0;

        // For now, set changes to 0 (would need historical data)
        const applicationsChange = 0;
        const contactsChange = 0;
        const responseRateChange = 0;

        setStats({
          totalApplications,
          totalContacts,
          responseRate,
          interviews,
          avgRelevanceScore,
          hrContacts,
          applicationsChange,
          contactsChange,
          responseRateChange,
          statusCounts,
        });
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId && userId.length > 0) {
      fetchStats();
    } else {
      setIsLoading(false);
    }
  }, [userId]);

  return { stats, isLoading, error, refetch: fetchStats };
}
