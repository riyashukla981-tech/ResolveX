// src/pages/student/DashboardPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilePlus, FileText, CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Complaint, ComplaintStatus } from '@/types';
import { Button, StatCard, EmptyState, Spinner } from '@/components/ui';
import { ComplaintCard } from '@/components/complaints/ComplaintCard';
import { formatDate } from '@/lib/utils';

interface DashboardStats {
  total: number;
  submitted: number;
  inProgress: number;
  resolved: number;
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recent, setRecent] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ total: 0, submitted: 0, inProgress: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/complaints/user?limit=5');
        if (data.success) {
          const complaints: Complaint[] = data.data.complaints;
          setRecent(complaints);
          setStats({
            total: data.data.pagination.total,
            submitted: complaints.filter((c) => c.status === 'Submitted').length,
            inProgress: complaints.filter((c) => ['Under Review', 'In Progress'].includes(c.status)).length,
            resolved: complaints.filter((c) => c.status === 'Resolved').length,
          });
          // More accurate counts from full pagination
          const total = data.data.pagination.total;
          // Fetch counts per status
          const [sub, review, inprog, res] = await Promise.all(
            (['Submitted', 'Under Review', 'In Progress', 'Resolved'] as ComplaintStatus[]).map((s) =>
              api.get(`/complaints/user?status=${encodeURIComponent(s)}&limit=1`).then((r) => r.data.data.pagination.total).catch(() => 0)
            )
          );
          setStats({ total, submitted: sub, inProgress: review + inprog, resolved: res });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {formatDate(new Date().toISOString())} · Here's your complaint overview
          </p>
        </div>
        <Button icon={<FilePlus className="w-4 h-4" />} onClick={() => navigate('/submit')}>
          New Complaint
        </Button>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card h-28 skeleton" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Complaints"
            value={stats.total}
            icon={<FileText className="w-6 h-6 text-primary-600" />}
            iconBg="bg-primary-50"
          />
          <StatCard
            title="Submitted"
            value={stats.submitted}
            icon={<AlertCircle className="w-6 h-6 text-blue-500" />}
            iconBg="bg-blue-50"
          />
          <StatCard
            title="In Progress"
            value={stats.inProgress}
            icon={<Clock className="w-6 h-6 text-orange-500" />}
            iconBg="bg-orange-50"
          />
          <StatCard
            title="Resolved"
            value={stats.resolved}
            icon={<CheckCircle className="w-6 h-6 text-green-500" />}
            iconBg="bg-green-50"
          />
        </div>
      )}

      {/* Recent Complaints */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Complaints</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/complaints')} icon={<TrendingUp className="w-4 h-4" />}>
            View All
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-28 skeleton rounded-xl" />)}
          </div>
        ) : recent.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-8 h-8" />}
            title="No complaints yet"
            description="Submit your first complaint to get started."
            action={
              <Button onClick={() => navigate('/submit')} icon={<FilePlus className="w-4 h-4" />}>
                Submit Complaint
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {recent.map((c) => <ComplaintCard key={c.id} complaint={c} />)}
          </div>
        )}
      </div>
    </div>
  );
};