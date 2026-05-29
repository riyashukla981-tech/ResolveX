// src/types/index.ts

export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  enrollment_number?: string;
  role: UserRole;
  department?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
}

export type ComplaintStatus =
  | 'Submitted'
  | 'Under Review'
  | 'In Progress'
  | 'Resolved'
  | 'Closed';

export type ComplaintCategory =
  | 'Infrastructure'
  | 'Academic'
  | 'Hostel'
  | 'Canteen'
  | 'Others';

export interface Complaint {
  id: string;
  complaint_id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  image_url?: string;
  status: ComplaintStatus;
  is_anonymous: boolean;
  student_id?: string;
  student?: {
    id: string;
    name: string;
    email: string;
    department?: string;
  };
  assigned_department?: string;
  admin_remarks?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  history?: ComplaintHistory[];
}

export interface ComplaintHistory {
  id: string;
  complaint_id: string;
  changed_by?: string;
  changed_by_user?: { name: string; role: UserRole };
  old_status?: ComplaintStatus;
  new_status?: ComplaintStatus;
  remarks?: string;
  action: string;
  created_at: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: { field: string; message: string }[];
}

export interface ComplaintsResponse {
  complaints: Complaint[];
  pagination: PaginationMeta;
}

export interface StatsData {
  total: number;
  pending: number;
  recentWeek: number;
  byStatus: Record<ComplaintStatus, number>;
  byCategory: Record<ComplaintCategory, number>;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}