'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Activity } from '@/components/crm/dashboard/RecentActivity';

export function useRecentActivity(userId: string) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchActivities() {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const supabase = createClient();

        // Fetch applications with their created/updated timestamps
        const { data: applications, error: appsError } = await supabase
          .from('applications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(20);

        if (appsError) throw appsError;

        // Fetch contacts with their created timestamps
        const { data: contacts, error: contactsError } = await supabase
          .from('contacts')
          .select('*, applications!inner(company_name, job_title)')
          .eq('userId', userId)
          .order('created_at', { ascending: false })
          .limit(20);

        if (contactsError) throw contactsError;

        const activityList: Activity[] = [];

        // Add application created events
        applications?.forEach(app => {
          if (app.created_at) {
            activityList.push({
              id: `app-created-${app.id}`,
              type: 'application_created',
              description: 'Application created',
              timestamp: new Date(app.created_at),
              applicationId: app.id,
              applicationTitle: `${app.company_name} - ${app.job_title}`,
            });
          }
        });

        // Add contacts found events (group by application)
        const contactsByApp = contacts?.reduce((acc: any, contact: any) => {
          const appId = contact.application_id;
          if (!acc[appId]) {
            acc[appId] = {
              contacts: [],
              timestamp: contact.created_at,
              application: contact.applications,
            };
          }
          acc[appId].contacts.push(contact);
          return acc;
        }, {});

        Object.entries(contactsByApp || {}).forEach(([appId, data]: [string, any]) => {
          activityList.push({
            id: `contacts-found-${appId}`,
            type: 'contacts_found',
            description: `${data.contacts.length} contacts found`,
            timestamp: new Date(data.timestamp),
            applicationId: appId,
            applicationTitle: `${data.application?.company_name} - ${data.application?.job_title}`,
            metadata: {
              count: data.contacts.length,
            },
          });
        });

        // Sort by timestamp (most recent first) and take top 10
        activityList.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setActivities(activityList.slice(0, 10));
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    if (userId && userId.length > 0) {
      fetchActivities();
    } else {
      setIsLoading(false);
    }
  }, [userId]);

  return { activities, isLoading, error };
}
