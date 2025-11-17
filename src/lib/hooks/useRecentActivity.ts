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
      try {
        setIsLoading(true);
        const supabase = createClient();

        // Fetch applications with their created/updated timestamps
        const { data: applications, error: appsError } = await supabase
          .from('applications')
          .select('*')
          .eq('userid', userId)
          .order('createdat', { ascending: false })
          .limit(20);

        if (appsError) throw appsError;

        // Fetch contacts with their created timestamps
        const { data: contacts, error: contactsError } = await supabase
          .from('contacts')
          .select('*, applications!inner(company, position)')
          .eq('userid', userId)
          .order('createdat', { ascending: false })
          .limit(20);

        if (contactsError) throw contactsError;

        const activityList: Activity[] = [];

        // Add application created events
        applications?.forEach(app => {
          if (app.createdat) {
            activityList.push({
              id: `app-created-${app.id}`,
              type: 'application_created',
              description: 'Application created',
              timestamp: new Date(app.createdat),
              applicationId: app.id,
              applicationTitle: `${app.company} - ${app.position}`,
            });
          }
        });

        // Add contacts found events (group by application)
        const contactsByApp = contacts?.reduce((acc: any, contact: any) => {
          const appId = contact.applicationid;
          if (!acc[appId]) {
            acc[appId] = {
              contacts: [],
              timestamp: contact.createdat,
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
            applicationTitle: `${data.application?.company} - ${data.application?.position}`,
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

    if (userId) {
      fetchActivities();
    }
  }, [userId]);

  return { activities, isLoading, error };
}
