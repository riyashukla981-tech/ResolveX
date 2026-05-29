// src/pages/admin/AdminComplaintsPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import { Complaint, ComplaintStatus } from '@/types';
import { COMPLAINT_CATEGORIES, COMPLAINT_STATUSES, formatDateTime } from '@/lib/utils';
import { Button, EmptyState, Spinner } from '@/components/ui';
import { StatusBadge, CategoryBadge } from '@/components/complaints/StatusBadge';
import { AdminUpdateModal } from './AdminUpdateModal';

export const AdminComplaintsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '15' });
      if (statusFilter) params.append('status', statusFilter);
      if (categoryFilter) params.append('category', categoryFilter);
      if (search.trim()) params.append('search', search.trim());

      const { data } = await api.get(`/complaints/all?${params}`);
      if (data.success) {
        setComplaints(data.data.complaints);
        setTotalPages(data.data.pagination.totalPages);
        setTotal(data.data.pagination.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, categoryFilter, search]);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  const handleUpdateSuccess = () => {
    setSelectedComplaint(null);
    fetchComplaints();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Complaint Management</h1>
          <p className="text-gray-500 text-sm mt-1">{total} total complaints</p>
        </div>
        <Button variant="secondary" icon={<RefreshCw className="w-4 h-4" />} onClick={fetchComplaints}>
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-card p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search complaints..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input-base pl-9"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="input-base bg-white w-44"
          >
            <option value="">All Statuses</option>
            {COMPLAINT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="input-base bg-white w-44"
          >
            <option value="">All Categories</option>
            {COMPLAINT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {(statusFilter || categoryFilter || search) && (
            <Button variant="ghost" size="sm" onClick={() => { setStatusFilter(''); setCategoryFilter(''); setSearch(''); setPage(1); }}>
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : complaints.length === 0 ? (
        <EmptyState
          icon={<Filter className="w-8 h-8" />}
          title="No complaints found"
          description="Try adjusting your filters."
        />
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">ID</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Title</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Category</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Student</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Date</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {complaints.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-gray-500">{c.complaint_id}</span>
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <p className="font-medium text-gray-900 truncate">{c.title}</p>
                        {c.assigned_department && (
                          <p className="text-xs text-gray-400 truncate">{c.assigned_department}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <CategoryBadge category={c.category} />
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {c.is_anonymous ? (
                          <span className="text-gray-400 italic text-xs">Anonymous</span>
                        ) : (
                          <span className="text-xs">{c.student?.name || '—'}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                        {formatDateTime(c.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => navigate(`/admin/complaints/${c.id}`)}>
                            View
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => setSelectedComplaint(c)}>
                            Manage
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
                Previous
              </Button>
              <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
              <Button variant="secondary" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Update Modal */}
      {selectedComplaint && (
        <AdminUpdateModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          onSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  );
};