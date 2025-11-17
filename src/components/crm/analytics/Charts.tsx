'use client';

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  FunnelChart,
  Funnel,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Application {
  id: string;
  stage: string;
  applied_date: string;
  company_name: string;
  created_at: string;
}

interface Contact {
  id: string;
  role_type?: string;
  relevance_score: number;
  created_at: string;
}

interface ChartsProps {
  applications: Application[];
  contacts?: Contact[];
}

const STAGE_COLORS = {
  applied: '#3B82F6',
  screening: '#F59E0B',
  interviewing: '#A855F7',
  offer: '#10B981',
  accepted: '#059669',
  rejected: '#EF4444',
};

export function ApplicationPipelineChart({ applications }: { applications: Application[] }) {
  const stageCounts = applications.reduce((acc, app) => {
    acc[app.stage] = (acc[app.stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = [
    { stage: 'Applied', count: stageCounts.applied || 0, fill: STAGE_COLORS.applied },
    { stage: 'Screening', count: stageCounts.screening || 0, fill: STAGE_COLORS.screening },
    { stage: 'Interviewing', count: stageCounts.interviewing || 0, fill: STAGE_COLORS.interviewing },
    { stage: 'Offer', count: stageCounts.offer || 0, fill: STAGE_COLORS.offer },
    { stage: 'Accepted', count: stageCounts.accepted || 0, fill: STAGE_COLORS.accepted },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Pipeline</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="stage" tick={{ fill: '#6B7280', fontSize: 12 }} />
          <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
            }}
          />
          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ApplicationsOverTimeChart({ applications }: { applications: Application[] }) {
  const groupByWeek = applications.reduce((acc, app) => {
    const date = new Date(app.applied_date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const key = weekStart.toISOString().split('T')[0];
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(groupByWeek)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      applications: count,
    }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Applications Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 12 }} />
          <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
            }}
          />
          <Line
            type="monotone"
            dataKey="applications"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ fill: '#3B82F6', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StageDistributionChart({ applications }: { applications: Application[] }) {
  const stageCounts = applications.reduce((acc, app) => {
    acc[app.stage] = (acc[app.stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(stageCounts).map(([stage, count]) => ({
    name: stage.charAt(0).toUpperCase() + stage.slice(1),
    value: count,
    color: STAGE_COLORS[stage as keyof typeof STAGE_COLORS] || '#6B7280',
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Stage Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ContactTypeDistributionChart({ contacts }: { contacts: Contact[] }) {
  const typeCounts = contacts.reduce((acc, contact) => {
    const type = contact.role_type || 'Unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#A855F7', '#EF4444'];

  const data = Object.entries(typeCounts).map(([type, count], index) => ({
    name: type,
    value: count,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Type Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SuccessRateChart({ applications }: { applications: Application[] }) {
  const total = applications.length;
  const accepted = applications.filter((app) => app.stage === 'accepted').length;
  const rejected = applications.filter((app) => app.stage === 'rejected').length;
  const active = total - accepted - rejected;

  const data = [
    { name: 'Accepted', value: accepted, color: '#10B981' },
    { name: 'Active', value: active, color: '#3B82F6' },
    { name: 'Rejected', value: rejected, color: '#EF4444' },
  ];

  const successRate = total > 0 ? ((accepted / total) * 100).toFixed(1) : '0.0';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Success Rate</h3>
        <div className="text-right">
          <div className="text-3xl font-bold text-green-600">{successRate}%</div>
          <div className="text-sm text-gray-600">Acceptance Rate</div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
