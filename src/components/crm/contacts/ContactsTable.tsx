'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  MapPin,
  Briefcase,
  Mail,
  User,
  Calendar,
  TrendingUp,
  Building2,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

interface Contact {
  id: string;
  user_id: string;
  application_id?: string;
  name: string;
  position?: string;
  email?: string;
  company_name?: string;
  linkedin_url?: string;
  verified: boolean;
  relevance_score: number;
  reasoning?: string;
  role_type?: string;
  contact_location?: string;
  job_location?: string;
  created_at: string;
}

interface ContactsTableProps {
  contacts: Contact[];
  groupByApplication?: boolean;
}

type SortField = 'relevance_score' | 'created_at' | 'name' | 'role_type';
type SortDirection = 'asc' | 'desc';

export function ContactsTable({ contacts, groupByApplication = false }: ContactsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRoleType, setFilterRoleType] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('relevance_score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Filter and sort contacts
  const filteredContacts = useMemo(() => {
    return contacts
      .filter(contact => {
        // Search filter
        const matchesSearch =
          contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.position?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.email?.toLowerCase().includes(searchQuery.toLowerCase());

        // Role type filter
        const matchesRole = filterRoleType === 'all' || contact.role_type === filterRoleType;

        return matchesSearch && matchesRole;
      })
      .sort((a, b) => {
        let aValue: any = a[sortField];
        let bValue: any = b[sortField];

        // Handle null/undefined values
        if (aValue === null || aValue === undefined) aValue = '';
        if (bValue === null || bValue === undefined) bValue = '';

        // Convert to comparable values
        if (sortField === 'relevance_score') {
          aValue = Number(aValue) || 0;
          bValue = Number(bValue) || 0;
        }

        if (sortDirection === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
  }, [contacts, searchQuery, filterRoleType, sortField, sortDirection]);

  const getRoleTypeColor = (roleType?: string) => {
    const colors = {
      hr: 'bg-blue-100 text-blue-700 border-blue-200',
      team: 'bg-purple-100 text-purple-700 border-purple-200',
      manager: 'bg-green-100 text-green-700 border-green-200',
      recruiter: 'bg-orange-100 text-orange-700 border-orange-200',
      executive: 'bg-red-100 text-red-700 border-red-200',
      other: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colors[roleType as keyof typeof colors] || colors.other;
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const roleTypes = [
    { value: 'all', label: 'All Roles' },
    { value: 'hr', label: 'HR' },
    { value: 'recruiter', label: 'Recruiter' },
    { value: 'manager', label: 'Manager' },
    { value: 'team', label: 'Team' },
    { value: 'executive', label: 'Executive' },
    { value: 'other', label: 'Other' },
  ];

  const stats = useMemo(() => ({
    total: contacts.length,
    verified: contacts.filter(c => c.verified).length,
    highRelevance: contacts.filter(c => c.relevance_score >= 80).length,
    hasEmail: contacts.filter(c => c.email).length,
  }), [contacts]);

  return (
    <div className="space-y-4">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Contacts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <User className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Verified</p>
              <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">High Relevance</p>
              <p className="text-2xl font-bold text-purple-600">{stats.highRelevance}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Has Email</p>
              <p className="text-2xl font-bold text-blue-600">{stats.hasEmail}</p>
            </div>
            <Mail className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, position, company, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={filterRoleType}
            onChange={(e) => setFilterRoleType(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {roleTypes.map(role => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    Contact
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Position & Company
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('role_type')}
                >
                  <div className="flex items-center gap-2">
                    Role Type
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('relevance_score')}
                >
                  <div className="flex items-center gap-2">
                    Relevance
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Location
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center gap-2">
                    Found
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <User className="h-12 w-12 mb-3 text-gray-300" />
                      <p className="text-sm font-medium">No contacts found</p>
                      <p className="text-xs mt-1">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{contact.name}</p>
                          {contact.email && (
                            <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-0.5">
                              <Mail className="h-3 w-3" />
                              <span>{contact.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {contact.position && (
                        <p className="font-medium text-gray-900">{contact.position}</p>
                      )}
                      {contact.company_name && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-0.5">
                          <Building2 className="h-3 w-3" />
                          <span>{contact.company_name}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {contact.role_type ? (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRoleTypeColor(contact.role_type)}`}>
                          {contact.role_type.charAt(0).toUpperCase() + contact.role_type.slice(1)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getRelevanceColor(contact.relevance_score)}`}>
                          {contact.relevance_score}%
                        </span>
                        {contact.verified && (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {contact.contact_location ? (
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{contact.contact_location}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{format(new Date(contact.created_at), 'MMM d, yyyy')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {contact.linkedin_url && (
                          <a
                            href={contact.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
                            title="View LinkedIn Profile"
                          >
                            <ExternalLink className="h-4 w-4 text-blue-600" />
                          </a>
                        )}
                        {contact.email && (
                          <a
                            href={`mailto:${contact.email}`}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Send Email"
                          >
                            <Mail className="h-4 w-4 text-gray-600" />
                          </a>
                        )}
                        {contact.reasoning && (
                          <button
                            className="p-1.5 hover:bg-purple-100 rounded-lg transition-colors"
                            title={contact.reasoning}
                          >
                            <AlertCircle className="h-4 w-4 text-purple-600" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Summary */}
      {filteredContacts.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-600 px-2">
          <span>
            Showing {filteredContacts.length} of {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
          </span>
          {searchQuery || filterRoleType !== 'all' && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterRoleType('all');
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
