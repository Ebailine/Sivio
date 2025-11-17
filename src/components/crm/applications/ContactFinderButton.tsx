'use client';

import { useState } from 'react';
import { Zap, Loader2, CheckCircle2, AlertCircle, Users } from 'lucide-react';

interface ContactFinderButtonProps {
  selectedApplicationIds: string[];
  onComplete?: () => void;
}

export function ContactFinderButton({ selectedApplicationIds, onComplete }: ContactFinderButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleFindContacts = async () => {
    if (selectedApplicationIds.length === 0) {
      setStatus('error');
      setMessage('Please select at least one application');
      setTimeout(() => setStatus('idle'), 3000);
      return;
    }

    setIsLoading(true);
    setStatus('idle');

    try {
      const response = await fetch('/api/contact-finder/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationIds: selectedApplicationIds,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to trigger contact finder');
      }

      setStatus('success');
      setMessage(`Finding contacts for ${selectedApplicationIds.length} application${selectedApplicationIds.length !== 1 ? 's' : ''}...`);

      if (onComplete) {
        onComplete();
      }

      // Reset after showing success
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);

    } catch (error: any) {
      console.error('Contact finder error:', error);
      setStatus('error');
      setMessage(error.message || 'Failed to find contacts');

      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonClass = () => {
    const base = 'inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-sm';

    if (selectedApplicationIds.length === 0) {
      return `${base} bg-gray-100 text-gray-400 cursor-not-allowed`;
    }

    if (isLoading) {
      return `${base} bg-blue-600 text-white cursor-wait`;
    }

    if (status === 'success') {
      return `${base} bg-green-600 text-white`;
    }

    if (status === 'error') {
      return `${base} bg-red-600 text-white`;
    }

    return `${base} bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-md transform hover:-translate-y-0.5`;
  };

  const getIcon = () => {
    if (isLoading) return <Loader2 className="h-5 w-5 animate-spin" />;
    if (status === 'success') return <CheckCircle2 className="h-5 w-5" />;
    if (status === 'error') return <AlertCircle className="h-5 w-5" />;
    return <Zap className="h-5 w-5" />;
  };

  const getButtonText = () => {
    if (isLoading) return 'Finding Contacts...';
    if (status === 'success') return 'Contacts Found!';
    if (status === 'error') return 'Error';
    if (selectedApplicationIds.length > 0) {
      return `Find Contacts (${selectedApplicationIds.length})`;
    }
    return 'Find Contacts';
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleFindContacts}
        disabled={selectedApplicationIds.length === 0 || isLoading}
        className={getButtonClass()}
      >
        {getIcon()}
        {getButtonText()}
      </button>

      {message && (
        <p className={`text-sm ${status === 'success' ? 'text-green-600' : status === 'error' ? 'text-red-600' : 'text-gray-600'}`}>
          {message}
        </p>
      )}

      {selectedApplicationIds.length > 0 && status === 'idle' && !isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2 text-sm text-blue-900">
            <Users className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Auto-find hiring managers and HR contacts</p>
              <p className="text-xs text-blue-700 mt-0.5">
                This will use 5 credits per application (~{selectedApplicationIds.length * 5} credits total)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
