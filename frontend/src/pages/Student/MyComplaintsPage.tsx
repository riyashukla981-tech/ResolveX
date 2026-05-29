// src/pages/student/MyComplaintsPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilePlus, FileText, Search, Filter } from 'lucide-react';
import api from '@/lib/api';
import { Complaint, ComplaintStatus, ComplaintCategory } from '@/types';
import { COMPLAINT_CATEGORIES, COMPLAINT_STATUSES } from '@/lib/utils';
import { Button, EmptyState, Spinner, Select } from '@/components/ui';
import { ComplaintCard } from '@/components/complaints/ComplaintCard';

export const MyComplaintsPage: React.FC = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (statusFilter) params.append('status', statusFilter);
      if (categoryFilter) params.append('category', categoryFilter);

      const { data } = await api.get(`/complaints/user?${params}`);
      if (data.success) {
        let list: Complaint[] = data.data.complaints;
        if (search.trim()) {
          list = list.filter((c) =>
            c.title.toLowerCase().includes(search.toLowerCase()) ||
            c.complaint_id.toLowerCase().includes(search.toLowerCase())
          );
        }
        setComplaints(list);
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

  const handleFilterChange = () => { setPage(1); };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Complaints</h1>
          <p className="text-gray-500 text-sm mt-1">{total} total complaints</p>
        </div>
        <Button icon={<FilePlus className="w-4 h-4" />} onClick={() => navigate('/submit')}>
          New Complaint
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-card p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or ID..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); handleFilterChange(); }}
              className="input-base pl-9"
            />
          </div>
          <div className="w-44">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); handleFilterChange(); }}
              className="input-base bg-white"
            >
              <option value="">All Statuses</option>
              {COMPLAINT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="w-44">
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); handleFilterChange(); }}
              className="input-base bg-white"
            >
              <option value="">All Categories</option>
              {COMPLAINT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {(statusFilter || categoryFilter || search) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setStatusFilter(''); setCategoryFilter(''); setSearch(''); setPage(1); }}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-28 skeleton rounded-xl" />)}
        </div>
      ) : complaints.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-8 h-8" />}
          title="No complaints found"
          description={
            statusFilter || categoryFilter || search
              ? 'Try changing your filters.'
              : "You haven't submitted any complaints yet."
          }
          action={
            !statusFilter && !categoryFilter && !search ? (
              <Button onClick={() => navigate('/submit')} icon={<FilePlus className="w-4 h-4" />}>
                Submit Complaint
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="space-y-3">
            {complaints.map((c) => <ComplaintCard key={c.id} complaint={c} />)}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};