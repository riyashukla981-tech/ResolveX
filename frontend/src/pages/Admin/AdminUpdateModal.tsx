// src/pages/admin/AdminUpdateModal.tsx
import React, { useState } from 'react';
import { X, Save, Building2 } from 'lucide-react';
import api from '@/lib/api';
import { Complaint, ComplaintStatus } from '@/types';
import { COMPLAINT_STATUSES, DEPARTMENTS } from '@/lib/utils';
import { Button, Select, Textarea } from '@/components/ui';
import { StatusBadge, CategoryBadge } from '@/components/complaints/StatusBadge';

interface Props {
  complaint: Complaint;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminUpdateModal: React.FC<Props> = ({ complaint, onClose, onSuccess }) => {
  const [status, setStatus] = useState<ComplaintStatus>(complaint.status);
  const [department, setDepartment] = useState(complaint.assigned_department || '');
  const [remarks, setRemarks] = useState(complaint.admin_remarks || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      // Update status
      if (status !== complaint.status || remarks !== (complaint.admin_remarks || '')) {
        await api.patch(`/complaints/${complaint.id}/status`, { status, admin_remarks: remarks });
      }
      // Assign department
      if (department && department !== (complaint.assigned_department || '')) {
        await api.patch(`/complaints/${complaint.id}/assign`, { department });
      }
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-slide-up">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div>
            <p className="text-xs font-mono text-gray-400 mb-1">{complaint.complaint_id}</p>
            <h2 className="text-lg font-bold text-gray-900 line-clamp-2">{complaint.title}</h2>
            <div className="flex items-center gap-2 mt-2">
              <CategoryBadge category={complaint.category} />
              <StatusBadge status={complaint.status} />
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors ml-4">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>
          )}

          {/* Description preview */}
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-xs font-medium text-gray-500 mb-1">Complaint</p>
            <p className="text-sm text-gray-700 line-clamp-3">{complaint.description}</p>
          </div>

          {/* Status */}
          <Select
            label="Update Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ComplaintStatus)}
            options={COMPLAINT_STATUSES.map((s) => ({ value: s, label: s }))}
          />

          {/* Department */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <Building2 className="w-4 h-4" /> Assign Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="input-base bg-white"
            >
              <option value="">— Not assigned —</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Remarks */}
          <Textarea
            label="Admin Remarks (visible to student)"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Add a note or update for the student..."
            rows={3}
          />
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 pt-0">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            loading={loading}
            icon={<Save className="w-4 h-4" />}
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};