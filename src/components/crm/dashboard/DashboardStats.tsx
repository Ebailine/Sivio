'use client';

import { motion } from 'framer-motion';
import {
  Briefcase,
  Users,
  TrendingUp,
  Video,
  Star,
  UserCheck,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Stat {
  label: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down';
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
}

interface DashboardStatsProps {
  totalApplications: number;
  totalContacts: number;
  responseRate: number;
  interviews: number;
  avgRelevanceScore: number;
  hrContacts: number;
  applicationsChange?: number;
  contactsChange?: number;
  responseRateChange?: number;
}

export function DashboardStats({
  totalApplications,
  totalContacts,
  responseRate,
  interviews,
  avgRelevanceScore,
  hrContacts,
  applicationsChange = 0,
  contactsChange = 0,
  responseRateChange = 0,
}: DashboardStatsProps) {
  const router = useRouter();

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Great';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Low';
  };

  const stats: Stat[] = [
    {
      label: 'Total Applications',
      value: totalApplications,
      change: applicationsChange,
      trend: applicationsChange >= 0 ? 'up' : 'down',
      icon: <Briefcase className="h-6 w-6" />,
      color: 'bg-purple-500',
      onClick: () => router.push('/crm/applications'),
    },
    {
      label: 'Contacts Found',
      value: totalContacts,
      change: contactsChange,
      trend: contactsChange >= 0 ? 'up' : 'down',
      icon: <Users className="h-6 w-6" />,
      color: 'bg-blue-500',
      onClick: () => router.push('/crm/contacts'),
    },
    {
      label: 'Response Rate',
      value: `${responseRate}%`,
      change: responseRateChange,
      trend: responseRateChange >= 0 ? 'up' : 'down',
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'bg-green-500',
    },
    {
      label: 'Interviews',
      value: interviews,
      icon: <Video className="h-6 w-6" />,
      color: 'bg-indigo-500',
      onClick: () => router.push('/crm/applications?status=interviewing'),
    },
    {
      label: 'Avg Relevance Score',
      value: avgRelevanceScore,
      icon: <Star className="h-6 w-6" />,
      color: 'bg-yellow-500',
    },
    {
      label: 'HR Contacts',
      value: hrContacts,
      icon: <UserCheck className="h-6 w-6" />,
      color: 'bg-emerald-500',
      onClick: () => router.push('/crm/contacts?roleType=hr'),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          onClick={stat.onClick}
          className={`
            bg-white rounded-xl border border-gray-200 p-6 shadow-sm
            ${stat.onClick ? 'cursor-pointer hover:border-blue-300 hover:shadow-md transition-all' : ''}
          `}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <div className="mt-2 flex items-baseline gap-2">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-3xl font-bold text-gray-900"
                >
                  {stat.label === 'Avg Relevance Score'
                    ? Math.round(stat.value as number)
                    : stat.value}
                </motion.p>
                {stat.label === 'Avg Relevance Score' && (
                  <span className="text-sm font-medium text-gray-600">
                    {getScoreLabel(stat.value as number)}
                  </span>
                )}
              </div>
              {stat.change !== undefined && (
                <div className="mt-2 flex items-center gap-1">
                  {stat.trend === 'up' ? (
                    <ArrowUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {Math.abs(stat.change)}% from last month
                  </span>
                </div>
              )}
              {stat.label === 'Interviews' && (
                <p className="mt-2 text-sm text-gray-600">
                  This week
                </p>
              )}
              {stat.label === 'HR Contacts' && totalContacts > 0 && (
                <p className="mt-2 text-sm text-gray-600">
                  {Math.round((hrContacts / totalContacts) * 100)}% of total
                </p>
              )}
            </div>
            <div className={`${stat.color} rounded-lg p-3 text-white`}>
              {stat.icon}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
