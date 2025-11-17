'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface StatusCount {
  status: string;
  count: number;
  color: string;
}

interface PipelineChartProps {
  statusCounts: {
    applied: number;
    screening: number;
    interviewing: number;
    offer: number;
    rejected: number;
    accepted: number;
  };
}

const statusConfig = {
  applied: {
    label: 'Applied',
    color: 'bg-purple-500',
    hoverColor: 'hover:bg-purple-600',
  },
  screening: {
    label: 'Screening',
    color: 'bg-yellow-500',
    hoverColor: 'hover:bg-yellow-600',
  },
  interviewing: {
    label: 'Interviewing',
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600',
  },
  offer: {
    label: 'Offer',
    color: 'bg-green-500',
    hoverColor: 'hover:bg-green-600',
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-500',
    hoverColor: 'hover:bg-red-600',
  },
  accepted: {
    label: 'Accepted',
    color: 'bg-emerald-500',
    hoverColor: 'hover:bg-emerald-600',
  },
};

export function PipelineChart({ statusCounts }: PipelineChartProps) {
  const router = useRouter();
  const maxCount = Math.max(...Object.values(statusCounts));

  const data: StatusCount[] = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
    color: statusConfig[status as keyof typeof statusConfig].color,
  }));

  const handleBarClick = (status: string) => {
    router.push(`/crm/applications?status=${status}`);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Application Pipeline</h3>

      <div className="space-y-4">
        {data.map((item, index) => {
          const config = statusConfig[item.status as keyof typeof statusConfig];
          const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;

          return (
            <div key={item.status}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{config.label}</span>
                <span className="text-sm font-semibold text-gray-900">{item.count}</span>
              </div>
              <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1, ease: 'easeOut' }}
                  onClick={() => handleBarClick(item.status)}
                  className={`
                    h-full ${config.color} ${config.hoverColor}
                    cursor-pointer transition-all duration-200
                    flex items-center justify-end pr-3
                  `}
                >
                  {item.count > 0 && (
                    <span className="text-xs font-medium text-white">
                      {item.count}
                    </span>
                  )}
                </motion.div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">Total Applications</span>
          <span className="font-bold text-gray-900">
            {Object.values(statusCounts).reduce((sum, count) => sum + count, 0)}
          </span>
        </div>
      </div>
    </div>
  );
}
