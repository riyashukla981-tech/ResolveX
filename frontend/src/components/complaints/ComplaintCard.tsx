// src/components/complaints/ComplaintCard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Building2, EyeOff, ChevronRight } from 'lucide-react';
import { Complaint } from '@/types';
import { timeAgo, truncate } from '@/lib/utils';
import { StatusBadge, CategoryBadge } from './StatusBadge';
import { Card } from '@/components/ui';

interface ComplaintCardProps {
  complaint: Complaint;
  showStudent?: boolean;
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({ complaint, showStudent }) => {
  const navigate = useNavigate();
  const role = (() => {
    try { return JSON.parse(localStorage.getItem('rx_user') || '{}').role; } catch { return 'student'; }
  })();
  const basePath = role === 'admin' ? '/admin/complaints' : '/complaints';

  return (
    <Card
      hover
      className="group"
      onClick={() => navigate(`${basePath}/${complaint.id}`)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="text-xs font-mono text-gray-400">{complaint.complaint_id}</span>
            <CategoryBadge category={complaint.category} />
            {complaint.is_anonymous && (
              <span className="badge bg-gray-100 text-gray-500 border border-gray-200">
                <EyeOff className="w-3 h-3" /> Anonymous
              </span>
            )}
          </div>

          <h3 className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors truncate">
            {complaint.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {truncate(complaint.description, 120)}
          </p>

          <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {timeAgo(complaint.created_at)}
            </span>
            {complaint.assigned_department && (
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                {complaint.assigned_department}
              </span>
            )}
            {showStudent && complaint.student && (
              <span className="text-gray-500">by {complaint.student.name}</span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-3 shrink-0">
          <StatusBadge status={complaint.status} />
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
        </div>
      </div>
    </Card>
  );
};