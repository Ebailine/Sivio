"use client";

import { useState, useEffect } from "react";
import { Connection, TargetCompany } from "@/lib/types";
import { Search, Building2, MapPin, ExternalLink, TrendingUp, Users, Star, CheckCircle, MessageSquare, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function DiscoverPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ConnectionMatch[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Load connections
  useEffect(() => {
    const stored = localStorage.getItem("pathfinder_connections");
    if (stored) {
      setConnections(JSON.parse(stored));
    }
  }, []);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);

    // Find connections that work at the target company
    const matches = connections
      .filter((conn) =>
        conn.current_company?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map((conn) => ({
        connection: conn,
        matchReason: generateMatchReason(conn),
        pathStrength: calculatePathStrength(conn),
        whyGoodMatch: generateWhyGoodMatch(conn),
        suggestedApproach: generateSuggestedApproach(conn),
      }))
      .sort((a, b) => b.connection.intro_likelihood_score - a.connection.intro_likelihood_score);

    setSearchResults(matches);
    setIsSearching(false);
  };

  const generateMatchReason = (conn: Connection): string => {
    const reasons: string[] = [];
    if (conn.same_school) reasons.push("Same school");
    if (conn.same_major) reasons.push("Same major");
    if (conn.recent_graduate) reasons.push("Recent graduate");
    if (conn.mutual_connections > 0) reasons.push(`${conn.mutual_connections} mutual connections`);
    return reasons.length > 0 ? reasons.join(" • ") : "Professional connection";
  };

  const calculatePathStrength = (conn: Connection): "strong" | "good" | "moderate" => {
    if (conn.intro_likelihood_score >= 70) return "strong";
    if (conn.intro_likelihood_score >= 40) return "good";
    return "moderate";
  };

  const generateWhyGoodMatch = (conn: Connection): string[] => {
    const reasons: string[] = [];

    if (conn.same_school) {
      reasons.push("Alumni connection gives you instant credibility and common ground");
    }
    if (conn.same_major) {
      reasons.push("Shared academic background means they understand your skills");
    }
    if (conn.recent_graduate) {
      reasons.push("Recent grads remember the job search struggle and are often willing to help");
    }
    if (conn.mutual_connections > 0) {
      reasons.push("Mutual connections can vouch for you and warm up the introduction");
    }
    if (conn.how_you_know) {
      reasons.push(`Your existing relationship (${conn.how_you_know}) makes this a warm outreach`);
    }

    if (reasons.length === 0) {
      reasons.push("Any connection is better than a cold outreach");
    }

    return reasons;
  };

  const generateSuggestedApproach = (conn: Connection): string => {
    if (conn.same_school && conn.same_major) {
      return "Lead with your shared school and major. Ask for a 15-minute informational chat about their role and the company.";
    }
    if (conn.same_school) {
      return "Open with your shared school connection. Express genuine interest in their career path and ask for advice.";
    }
    if (conn.how_you_know) {
      return `Reference how you know them (${conn.how_you_know}). Catch them up briefly on what you're up to and ask if they have 15 minutes to chat.`;
    }
    return "Be genuine and specific. Mention something from their profile that interests you and ask for a brief informational chat.";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Discover Warm Paths
          </h1>
          <p className="text-gray-600">
            Find connections who can introduce you to your target companies. Warm introductions are 3x more likely to land interviews.
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-blue-100">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Which company are you targeting?
          </label>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                placeholder="e.g., Google, Goldman Sachs, McKinsey..."
                className="w-full pl-14 pr-4 py-4 border-2 border-gray-200 rounded-xl text-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={!searchQuery.trim()}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Find Paths
            </button>
          </div>
        </div>

        {/* Teaching Tip */}
        <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 mb-8">
          <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
            <Star className="w-5 h-5" />
            Why Warm Introductions Work
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-bold text-purple-900 mb-1">67% Response Rate</div>
              <p className="text-purple-800">vs. 5-10% for cold emails</p>
            </div>
            <div>
              <div className="font-bold text-purple-900 mb-1">3x More Interviews</div>
              <p className="text-purple-800">Referrals get prioritized in recruiting</p>
            </div>
            <div>
              <div className="font-bold text-purple-900 mb-1">84% of Jobs</div>
              <p className="text-purple-800">are filled through networking, not applications</p>
            </div>
          </div>
        </div>

        {/* Results */}
        {searchResults.length > 0 ? (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Found {searchResults.length} Path{searchResults.length !== 1 ? "s" : ""} to {searchQuery}
              </h2>
              <p className="text-gray-600">
                Ranked by intro likelihood score. Start with your strongest connections first.
              </p>
            </div>

            <div className="space-y-6">
              {searchResults.map((match, index) => (
                <PathCard key={match.connection.id} match={match} rank={index + 1} />
              ))}
            </div>
          </div>
        ) : isSearching ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Searching your network...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">
              Search for a company to find your warm paths
            </h3>
            <p className="text-gray-500 mb-6">
              We'll show you which of your connections work there and help you craft the perfect outreach message.
            </p>
            {connections.length === 0 && (
              <Link
                href="/networking"
                className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Add Connections First
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Types
interface ConnectionMatch {
  connection: Connection;
  matchReason: string;
  pathStrength: "strong" | "good" | "moderate";
  whyGoodMatch: string[];
  suggestedApproach: string;
}

// Path Card Component
function PathCard({ match, rank }: { match: ConnectionMatch; rank: number }) {
  const { connection, matchReason, pathStrength, whyGoodMatch, suggestedApproach } = match;

  const strengthConfig = {
    strong: {
      color: "border-green-300 bg-green-50",
      badge: "bg-green-100 text-green-800",
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      label: "Strong Path",
    },
    good: {
      color: "border-blue-300 bg-blue-50",
      badge: "bg-blue-100 text-blue-800",
      icon: <TrendingUp className="w-5 h-5 text-blue-600" />,
      label: "Good Path",
    },
    moderate: {
      color: "border-orange-300 bg-orange-50",
      badge: "bg-orange-100 text-orange-800",
      icon: <AlertCircle className="w-5 h-5 text-orange-600" />,
      label: "Moderate Path",
    },
  };

  const config = strengthConfig[pathStrength];

  return (
    <div className={`bg-white rounded-2xl shadow-lg border-2 ${config.color} p-6 hover:shadow-xl transition-all`}>
      <div className="flex items-start gap-6">
        {/* Rank Badge */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
            {rank}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              {connection.profile_photo_url ? (
                <img
                  src={connection.profile_photo_url}
                  alt={connection.full_name}
                  className="w-16 h-16 rounded-full border-2 border-white shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold text-2xl border-2 border-white shadow-md">
                  {connection.full_name.charAt(0)}
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-gray-900">{connection.full_name}</h3>
                <p className="text-gray-600">{connection.current_role}</p>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <Building2 className="w-4 h-4" />
                  {connection.current_company}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.badge} flex items-center gap-1`}>
                {config.icon}
                {config.label}
              </span>
              <span className="text-sm text-gray-500">Score: {connection.intro_likelihood_score}</span>
            </div>
          </div>

          {/* Match Reason */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">Connection:</span> {matchReason}
            </p>
          </div>

          {/* Why Good Match */}
          <div className="mb-4">
            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              Why this is a strong path:
            </h4>
            <ul className="space-y-1">
              {whyGoodMatch.map((reason, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Suggested Approach */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Suggested Approach:
            </h4>
            <p className="text-sm text-blue-800">{suggestedApproach}</p>
          </div>

          {/* Contact Info */}
          {(connection.email || connection.linkedin_url) && (
            <div className="flex flex-wrap gap-3 mb-4">
              {connection.email && (
                <a
                  href={`mailto:${connection.email}`}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <ExternalLink className="w-4 h-4" />
                  {connection.email}
                </a>
              )}
              {connection.linkedin_url && (
                <a
                  href={connection.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <ExternalLink className="w-4 h-4" />
                  LinkedIn Profile
                </a>
              )}
            </div>
          )}

          {/* Notes */}
          {connection.notes && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-xs text-gray-500 mb-1">Your notes:</p>
              <p className="text-sm text-gray-700">{connection.notes}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Link
              href={`/message-generator?connection=${connection.id}&company=${connection.current_company}`}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all text-center flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-5 h-5" />
              Generate Outreach Message
            </Link>
            <Link
              href={`/networking`}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
            >
              View Full Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
