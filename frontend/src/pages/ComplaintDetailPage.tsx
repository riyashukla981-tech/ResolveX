// src/pages/ComplaintDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Building2, User, EyeOff, Image, CheckCircle2, Circle } from 'lucide-react';
import api from '@/lib/api';
import { Complaint, ComplaintHistory, ComplaintStatus } from '@/types';
import { formatDateTime, STATUS_COLORS } from '@/lib/utils';
import { Button, Spinner, Badge } from '@/components/ui';
import { StatusBadge, CategoryBadge } from '@/components/complaints/StatusBadge';
import { useAuth } from '@/hooks/useAuth';
import { AdminUpdateModal } from '@/pages/admin/AdminUpdateModal';

const STATUS_ORDER: ComplaintStatus[] = ['Submitted', 'Under Review', 'In Progress', 'Resolved', 'Closed'];

const TimelineItem: React.FC<{ item: ComplaintHistory; isLast: boolean }> = ({ item, isLast }) => (
  <div className="flex gap-4">
    <div className="flex flex-col items-center">
      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: item.new_status ? STATUS_COLORS[item.new_status] + '20' : '#F3F4F6' }}>
        <CheckCircle2 className="w-4 h-4" style={{ color: item.new_status ? STATUS_COLORS[item.new_status] : '#9CA3AF' }} />
      </div>
      {!isLast && <div className="w-0.5 flex-1 bg-gray-200 my-1" />}
    </div>
    <div className="flex-1 pb-6">
      <p className="text-sm font-medium text-gray-900">{item.action}</p>
      {item.remarks && (
        <div className="mt-1.5 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 italic">"{item.remarks}"</p>
        </div>
      )}
      <div className="flex items-center gap-3 mt-1.5">
        <p className="text-xs text-gray-400">{formatDateTime(item.created_at)}</p>
        {item.changed_by_user && (
          <p className="text-xs text-gray-400">
            by <span className="font-medium text-gray-600">{item.changed_by_user.name}</span>
          </p>
        )}
      </div>
    </div>
  </div>
);

export const ComplaintDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);

  const fetchComplaint = () => {
    if (!id) return;
    api.get(`/complaints/${id}`)
      .then(({ data }) => {
        if (data.success) setComplaint(data.data);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    if (!id) return;
    api.get(`/complaints/${id}`)
      .then(({ data }) => {
        if (data.success) setComplaint(data.data);
        else setError('Complaint not found.');
      })
      .catch(() => setError('Failed to load complaint.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 mb-4">{error || 'Complaint not found.'}</p>
        <Button variant="secondary" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const currentStepIndex = STATUS_ORDER.indexOf(complaint.status);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                {complaint.complaint_id}
              </span>
              <CategoryBadge category={complaint.category} />
              {complaint.is_anonymous && (
                <Badge className="bg-gray-100 text-gray-500 border border-gray-200">
                  <EyeOff className="w-3 h-3" /> Anonymous
                </Badge>
              )}
            </div>
            <h1 className="text-xl font-bold text-gray-900">{complaint.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={complaint.status} />
            {user?.role === 'admin' && (
              <Button size="sm" variant="secondary" onClick={() => setShowAdminModal(true)}>
                Manage
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" /> {formatDateTime(complaint.created_at)}
          </span>
          {complaint.assigned_department && (
            <span className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4" /> {complaint.assigned_department}
            </span>
          )}
          {complaint.student && !complaint.is_anonymous && (
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" /> {complaint.student.name}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Description</h2>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{complaint.description}</p>

        {complaint.image_url && (
          <div className="mt-4">
            <a href={complaint.image_url} target="_blank" rel="noopener noreferrer">
              <img
                src={complaint.image_url}
                alt="Complaint attachment"
                className="rounded-xl border border-gray-200 max-h-64 object-cover hover:opacity-90 transition-opacity cursor-pointer"
              />
            </a>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <Image className="w-3 h-3" /> Attachment (click to view full size)
            </p>
          </div>
        )}
      </div>

      {/* Admin Remarks */}
      {complaint.admin_remarks && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-amber-700 uppercase tracking-wider mb-2">Staff Remarks</h2>
          <p className="text-amber-800 text-sm italic">"{complaint.admin_remarks}"</p>
        </div>
      )}

      {/* Status Progress */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-5">Status Progress</h2>
        <div className="flex items-center gap-0">
          {STATUS_ORDER.filter((s) => s !== 'Closed').map((status, i, arr) => {
            const passed = STATUS_ORDER.indexOf(complaint.status) >= STATUS_ORDER.indexOf(status);
            const isLast = i === arr.length - 1;
            return (
              <React.Fragment key={status}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      passed ? 'text-white' : 'bg-gray-100 text-gray-400'
                    }`}
                    style={passed ? { backgroundColor: STATUS_COLORS[status] } : {}}
                  >
                    {passed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                  </div>
                  <span className="text-xs text-center mt-1.5 text-gray-500 max-w-[60px] leading-tight">{status}</span>
                </div>
                {!isLast && (
                  <div
                    className="h-0.5 flex-1 transition-all"
                    style={{ backgroundColor: passed ? STATUS_COLORS[status] + '60' : '#E5E7EB' }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Timeline History */}
      {complaint.history && complaint.history.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-5">Activity Timeline</h2>
          <div>
            {complaint.history.map((item, i) => (
              <TimelineItem
                key={item.id}
                item={item}
                isLast={i === complaint.history!.length - 1}
              />
            ))}
          </div>
        </div>
      )}

      {showAdminModal && complaint && (
        <AdminUpdateModal
          complaint={complaint}
          onClose={() => setShowAdminModal(false)}
          onSuccess={() => {
            setShowAdminModal(false);
            fetchComplaint();
          }}
        />
      )}
    </div>
  );
};