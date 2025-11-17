'use client';

import { useState } from 'react';
import {
  CheckSquare,
  Square,
  Search,
  Filter,
  ArrowUpDown,
  MoreVertical,
  ExternalLink,
  Zap,
  Calendar,
  MapPin,
  Briefcase
} from 'lucide-react';
import { format } from 'date-fns';

interface Application {
  id: string;
  job_id: string;
  job_title: string;
  company_name: string;
  company_logo_url?: string;
  location?: string;
  employment_type?: string;
  seniority_level?: string;
  salary_range?: string;
  stage: string;
  status: string;
  applied_date: string;
  created_at: string;
  updated_at?: string;
  notes?: string[];
}

interface ApplicationsTableProps {
  applications: Application[];
  onSelectApplications: (selectedIds: string[]) => void;
  selectedApplications: string[];
}

export function ApplicationsTable({
  applications,
  onSelectApplications,
  selectedApplications
}: ApplicationsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStage, setFilterStage] = useState<string>('all');
  const [sortField, setSortField] = useState<'created_at' | 'company_name' | 'job_title'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filter and sort applications
  const filteredApplications = applications
    .filter(app => {
      const matchesSearch =
        app.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.location?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStage = filterStage === 'all' || app.stage === filterStage;

      return matchesSearch && matchesStage;
    })
    .sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const isAllSelected = filteredApplications.length > 0 &&
    filteredApplications.every(app => selectedApplications.includes(app.id));

  const isSomeSelected = selectedApplications.length > 0 && !isAllSelected;

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectApplications([]);
    } else {
      onSelectApplications(filteredApplications.map(app => app.id));
    }
  };

  const handleSelectOne = (appId: string) => {
    if (selectedApplications.includes(appId)) {
      onSelectApplications(selectedApplications.filter(id => id !== appId));
    } else {
      onSelectApplications([...selectedApplications, appId]);
    }
  };

  const getStageColor = (stage: string) => {
    const colors = {
      applied: 'bg-blue-100 text-blue-700 border-blue-200',
      screening: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      interviewing: 'bg-purple-100 text-purple-700 border-purple-200',
      offer: 'bg-green-100 text-green-700 border-green-200',
      accepted: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[stage as keyof typeof colors] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const stages = [
    { value: 'all', label: 'All Stages' },
    { value: 'applied', label: 'Applied' },
    { value: 'screening', label: 'Screening' },
    { value: 'interviewing', label: 'Interviewing' },
    { value: 'offer', label: 'Offer' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by company, position, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {stages.map(stage => (
              <option key={stage.value} value={stage.value}>
                {stage.label}
              </option>
            ))}
          </select>

          <button className="px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4" />
            <span className="hidden sm:inline">Sort</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-12 px-6 py-4">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center justify-center"
                  >
                    {isAllSelected ? (
                      <CheckSquare className="h-5 w-5 text-blue-600" />
                    ) : isSomeSelected ? (
                      <div className="h-5 w-5 border-2 border-blue-600 rounded flex items-center justify-center bg-blue-50">
                        <div className="h-2 w-2 bg-blue-600" />
                      </div>
                    ) : (
                      <Square className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Company & Position
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Stage
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Applied Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Briefcase className="h-12 w-12 mb-3 text-gray-300" />
                      <p className="text-sm font-medium">No applications found</p>
                      <p className="text-xs mt-1">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => (
                  <tr
                    key={app.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      selectedApplications.includes(app.id) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleSelectOne(app.id)}
                        className="flex items-center justify-center"
                      >
                        {selectedApplications.includes(app.id) ? (
                          <CheckSquare className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Square className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {app.company_logo_url ? (
                          <img
                            src={app.company_logo_url}
                            alt={app.company_name}
                            className="h-10 w-10 rounded-lg object-contain bg-gray-50 p-1"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                            {app.company_name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">{app.company_name}</p>
                          <p className="text-sm text-gray-600">{app.job_title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {app.location ? (
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{app.location}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStageColor(app.stage)}`}>
                        {app.stage.charAt(0).toUpperCase() + app.stage.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{format(new Date(app.applied_date), 'MMM d, yyyy')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                          <ExternalLink className="h-4 w-4 text-gray-500" />
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreVertical className="h-4 w-4 text-gray-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selection Summary */}
      {selectedApplications.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-blue-900">
            <CheckSquare className="h-4 w-4" />
            <span className="font-medium">
              {selectedApplications.length} application{selectedApplications.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          <button
            onClick={() => onSelectApplications([])}
            className="text-sm text-blue-700 hover:text-blue-800 font-medium"
          >
            Clear selection
          </button>
        </div>
      )}
    </div>
  );
}
