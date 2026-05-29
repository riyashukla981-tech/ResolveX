// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ComplaintStatus, ComplaintCategory } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Status Helpers ───────────────────────────────────────────

export const STATUS_LABELS: Record<ComplaintStatus, string> = {
  'Submitted': 'Submitted',
  'Under Review': 'Under Review',
  'In Progress': 'In Progress',
  'Resolved': 'Resolved',
  'Closed': 'Closed',
};

export const STATUS_CLASSES: Record<ComplaintStatus, string> = {
  'Submitted': 'status-submitted',
  'Under Review': 'status-under-review',
  'In Progress': 'status-in-progress',
  'Resolved': 'status-resolved',
  'Closed': 'status-closed',
};

export const STATUS_COLORS: Record<ComplaintStatus, string> = {
  'Submitted': '#3B82F6',
  'Under Review': '#F59E0B',
  'In Progress': '#F97316',
  'Resolved': '#10B981',
  'Closed': '#6B7280',
};

export const CATEGORY_CLASSES: Record<ComplaintCategory, string> = {
  'Infrastructure': 'cat-infrastructure',
  'Academic': 'cat-academic',
  'Hostel': 'cat-hostel',
  'Canteen': 'cat-canteen',
  'Others': 'cat-others',
};

export const CATEGORY_COLORS: Record<ComplaintCategory, string> = {
  'Infrastructure': '#8B5CF6',
  'Academic': '#3B82F6',
  'Hostel': '#EC4899',
  'Canteen': '#F59E0B',
  'Others': '#6B7280',
};

export const COMPLAINT_CATEGORIES: ComplaintCategory[] = [
  'Infrastructure', 'Academic', 'Hostel', 'Canteen', 'Others'
];

export const COMPLAINT_STATUSES: ComplaintStatus[] = [
  'Submitted', 'Under Review', 'In Progress', 'Resolved', 'Closed'
];

export const DEPARTMENTS = [
  'Infrastructure & Facilities',
  'Academic Affairs',
  'Hostel Administration',
  'Canteen & Food Services',
  'Student Affairs',
  'IT Department',
  'Administration',
];

// ─── Date Helpers ─────────────────────────────────────────────

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(dateString);
}

// ─── Text Helpers ─────────────────────────────────────────────

export function truncate(str: string, len: number): string {
  return str.length > len ? str.slice(0, len) + '…' : str;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// ─── Error Helper ─────────────────────────────────────────────

export function getErrorMessage(error: unknown): string {
  if (axios_isAxiosError(error)) {
    return error.response?.data?.message || error.message || 'An error occurred';
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
}

function axios_isAxiosError(error: unknown): error is { response?: { data?: { message?: string } }; message: string } {
  return typeof error === 'object' && error !== null && 'message' in error;
}