// src/pages/admin/AdminAnalyticsPage.tsx
import React, { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, RadarChart, PolarGrid,
  PolarAngleAxis, Radar,
} from 'recharts';
import api from '@/lib/api';
import { StatsData } from '@/types';
import { CATEGORY_COLORS, STATUS_COLORS } from '@/lib/utils';
import { Spinner, StatCard } from '@/components/ui';
import { FileText, CheckCircle, Clock, TrendingUp } from 'lucide-react';

export const AdminAnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/complaints/stats')
      .then(({ data }) => { if (data.success) setStats(data.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const categoryData = stats
    ? Object.entries(stats.byCategory).map(([name, value]) => ({ name, value }))
    : [];

  const statusData = stats
    ? Object.entries(stats.byStatus).map(([name, value]) => ({ name, value }))
    : [];

  const resolutionRate = stats && stats.total > 0
    ? Math.round((stats.byStatus.Resolved / stats.total) * 100)
    : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">System-wide complaint statistics</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Complaints"
          value={stats?.total ?? 0}
          icon={<FileText className="w-6 h-6 text-primary-600" />}
          iconBg="bg-primary-50"
        />
        <StatCard
          title="Resolution Rate"
          value={`${resolutionRate}%`}
          subtitle="Resolved / Total"
          icon={<CheckCircle className="w-6 h-6 text-green-500" />}
          iconBg="bg-green-50"
        />
        <StatCard
          title="Pending"
          value={stats?.pending ?? 0}
          icon={<Clock className="w-6 h-6 text-orange-500" />}
          iconBg="bg-orange-50"
        />
        <StatCard
          title="This Week"
          value={stats?.recentWeek ?? 0}
          icon={<TrendingUp className="w-6 h-6 text-teal-500" />}
          iconBg="bg-teal-50"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category Breakdown - Pie */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">Category Distribution</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" outerRadius={100} innerRadius={60} paddingAngle={4} dataKey="value">
                {categoryData.map((entry) => (
                  <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name as keyof typeof CATEGORY_COLORS] || '#9CA3AF'} />
                ))}
              </Pie>
              <Tooltip formatter={(val) => [`${val} complaints`]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Status Overview - Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">Status Overview</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={statusData} barCategoryGap="35%">
              <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip cursor={{ fill: '#F3F4F6' }} formatter={(val) => [`${val}`, 'Complaints']} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {statusData.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] || '#9CA3AF'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Radar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">Category Radar</h2>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={categoryData}>
              <PolarGrid stroke="#E5E7EB" />
              <PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} />
              <Radar name="Complaints" dataKey="value" stroke="#14B8A6" fill="#14B8A6" fillOpacity={0.25} />
              <Tooltip formatter={(val) => [`${val}`, 'Complaints']} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Text Stats */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">Status Breakdown</h2>
          <div className="space-y-3">
            {statusData.map((s) => {
              const pct = stats?.total ? Math.round((s.value / stats.total) * 100) : 0;
              const color = STATUS_COLORS[s.name as keyof typeof STATUS_COLORS] || '#9CA3AF';
              return (
                <div key={s.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">{s.name}</span>
                    <span className="text-sm font-semibold text-gray-900">{s.value} <span className="text-gray-400 font-normal text-xs">({pct}%)</span></span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};