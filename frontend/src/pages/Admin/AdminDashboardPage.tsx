// src/pages/admin/AdminDashboardPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, CheckCircle, Clock, AlertCircle, TrendingUp, Users
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import api from '@/lib/api';
import { StatsData } from '@/types';
import { CATEGORY_COLORS, STATUS_COLORS, formatDate } from '@/lib/utils';
import { StatCard, Spinner, Button } from '@/components/ui';
import { Complaint } from '@/types';
import { ComplaintCard } from '@/components/complaints/ComplaintCard';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [recent, setRecent] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/complaints/stats'),
      api.get('/complaints/all?limit=5'),
    ]).then(([statsRes, complaintsRes]) => {
      if (statsRes.data.success) setStats(statsRes.data.data);
      if (complaintsRes.data.success) setRecent(complaintsRes.data.data.complaints);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;
  }

  const categoryChartData = stats
    ? Object.entries(stats.byCategory).map(([name, value]) => ({ name, value }))
    : [];

  const statusChartData = stats
    ? Object.entries(stats.byStatus).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">{formatDate(new Date().toISOString())} · System Overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Complaints"
          value={stats?.total ?? 0}
          icon={<FileText className="w-6 h-6 text-primary-600" />}
          iconBg="bg-primary-50"
        />
        <StatCard
          title="Pending"
          value={stats?.pending ?? 0}
          subtitle="Submitted + In Review"
          icon={<Clock className="w-6 h-6 text-orange-500" />}
          iconBg="bg-orange-50"
        />
        <StatCard
          title="Resolved"
          value={stats?.byStatus?.Resolved ?? 0}
          icon={<CheckCircle className="w-6 h-6 text-green-500" />}
          iconBg="bg-green-50"
        />
        <StatCard
          title="This Week"
          value={stats?.recentWeek ?? 0}
          subtitle="New complaints"
          icon={<TrendingUp className="w-6 h-6 text-teal-500" />}
          iconBg="bg-teal-50"
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category Distribution - Pie */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">By Category</h2>
          {categoryChartData.every((d) => d.value === 0) ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryChartData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={CATEGORY_COLORS[entry.name as keyof typeof CATEGORY_COLORS] || '#9CA3AF'}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => [`${val} complaints`, '']} />
                <Legend formatter={(val) => <span className="text-xs text-gray-600">{val}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status Distribution - Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">By Status</h2>
          {statusChartData.every((d) => d.value === 0) ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusChartData} barCategoryGap="30%">
                <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: '#F3F4F6' }} formatter={(val) => [`${val}`, 'Complaints']} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {statusChartData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] || '#9CA3AF'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Quick status counts */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Object.entries(stats.byStatus).map(([status, count]) => (
            <button
              key={status}
              onClick={() => navigate(`/admin/complaints?status=${encodeURIComponent(status)}`)}
              className="bg-white rounded-xl border border-gray-100 shadow-card p-4 text-left hover:shadow-card-hover transition-shadow group"
            >
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className="text-xs text-gray-500 mt-0.5 group-hover:text-primary-600 transition-colors">{status}</p>
            </button>
          ))}
        </div>
      )}

      {/* Recent Complaints */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Complaints</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/complaints')}>
            View All
          </Button>
        </div>
        <div className="space-y-3">
          {recent.length === 0 ? (
            <div className="card text-center py-10 text-gray-400 text-sm">No complaints yet</div>
          ) : (
            recent.map((c) => <ComplaintCard key={c.id} complaint={c} showStudent />)
          )}
        </div>
      </div>
    </div>
  );
};