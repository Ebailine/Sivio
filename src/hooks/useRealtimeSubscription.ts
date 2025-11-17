'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface UseRealtimeSubscriptionOptions {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
  enabled?: boolean;
}

export function useRealtimeSubscription({
  table,
  event = '*',
  filter,
  onInsert,
  onUpdate,
  onDelete,
  enabled = true,
}: UseRealtimeSubscriptionOptions) {
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!enabled) return;

    const supabase = createClient();

    // Create channel
    const channel = supabase
      .channel(`realtime-${table}`)
      .on(
        'postgres_changes' as any,
        {
          event,
          schema: 'public',
          table,
          filter,
        } as any,
        (payload: any) => {
          console.log('Realtime event:', payload);

          // Handle different event types
          if (payload.eventType === 'INSERT' && onInsert) {
            onInsert(payload.new);
          } else if (payload.eventType === 'UPDATE' && onUpdate) {
            onUpdate(payload.new);
          } else if (payload.eventType === 'DELETE' && onDelete) {
            onDelete(payload.old);
          }
        }
      )
      .subscribe((status: any) => {
        console.log('Subscription status:', status);
      });

    channelRef.current = channel;

    // Cleanup
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [table, event, filter, enabled, onInsert, onUpdate, onDelete]);

  return {
    unsubscribe: () => {
      if (channelRef.current) {
        const supabase = createClient();
        supabase.removeChannel(channelRef.current);
      }
    },
  };
}

// Specialized hooks for common use cases
export function useApplicationsRealtime(
  userId: string,
  onUpdate: (applications: any[]) => void
) {
  return useRealtimeSubscription({
    table: 'applications',
    filter: `user_id=eq.${userId}`,
    onInsert: (newApp) => {
      toast.success('New application added');
      // Trigger refetch
      onUpdate([]);
    },
    onUpdate: (updatedApp) => {
      toast('Application updated', { icon: '🔄' });
      onUpdate([]);
    },
    onDelete: () => {
      toast('Application deleted', { icon: '🗑️' });
      onUpdate([]);
    },
  });
}

export function useContactsRealtime(
  userId: string,
  onNewContact: () => void
) {
  return useRealtimeSubscription({
    table: 'contacts',
    event: 'INSERT',
    filter: `user_id=eq.${userId}`,
    onInsert: (newContact) => {
      toast.success(`New contact found: ${newContact.name}`, {
        duration: 6000,
        icon: '👤',
      });
      onNewContact();
    },
  });
}
