'use client';

import { useState } from 'react';
import {
  Sparkles,
  Target,
  Clock,
  MessageSquare,
  TrendingUp,
  Copy,
  Check,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Contact {
  id: string;
  name: string;
  position?: string;
  company_name?: string;
  email?: string;
  role_type?: string;
  relevance_score: number;
}

interface ContactRecommendation {
  contactId: string;
  priority: 'high' | 'medium' | 'low';
  reasoning: string;
  suggestedApproach: string;
  bestTimeToContact: string;
  talkingPoints: string[];
}

interface AIRecommendationsProps {
  contact: Contact;
  recommendation?: ContactRecommendation;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function AIRecommendations({
  contact,
  recommendation,
  isLoading = false,
  onRefresh,
}: AIRecommendationsProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
          <span className="ml-3 text-purple-900 font-medium">
            Analyzing contact with AI...
          </span>
        </div>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6">
        <div className="text-center py-8">
          <Sparkles className="h-12 w-12 text-purple-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            AI-Powered Recommendations
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Get personalized outreach strategies and insights
          </p>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              Generate Recommendations
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Recommendations</h3>
            <p className="text-sm text-gray-600">Powered by Claude</p>
          </div>
        </div>
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
            recommendation.priority
          )}`}
        >
          {recommendation.priority.toUpperCase()} PRIORITY
        </span>
      </div>

      {/* Priority Reasoning */}
      <div className="bg-white rounded-lg border border-purple-200 p-4">
        <div className="flex items-start gap-2 mb-2">
          <Target className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 mb-1">Why This Contact?</h4>
            <p className="text-sm text-gray-700">{recommendation.reasoning}</p>
          </div>
        </div>
      </div>

      {/* Suggested Approach */}
      <div className="bg-white rounded-lg border border-purple-200 p-4">
        <div className="flex items-start gap-2 mb-3">
          <MessageSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium text-gray-900">Recommended Approach</h4>
              <button
                onClick={() =>
                  handleCopy(recommendation.suggestedApproach, 'approach')
                }
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                {copiedSection === 'approach' ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            <p className="text-sm text-gray-700">{recommendation.suggestedApproach}</p>
          </div>
        </div>
      </div>

      {/* Best Time to Contact */}
      <div className="bg-white rounded-lg border border-purple-200 p-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-orange-600 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-gray-900">Best Time to Reach Out</h4>
            <p className="text-sm text-gray-700 mt-1">
              {recommendation.bestTimeToContact}
            </p>
          </div>
        </div>
      </div>

      {/* Talking Points */}
      <div className="bg-white rounded-lg border border-purple-200 p-4">
        <div className="flex items-start gap-2">
          <TrendingUp className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Key Talking Points</h4>
              <button
                onClick={() =>
                  handleCopy(recommendation.talkingPoints.join('\n'), 'points')
                }
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                {copiedSection === 'points' ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            <ul className="space-y-2">
              {recommendation.talkingPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-semibold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="w-full px-4 py-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
        >
          Refresh Recommendations
        </button>
      )}
    </div>
  );
}
