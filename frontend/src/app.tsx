// src/App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { ToastContainer } from '@/components/ui/Toast';
import { useToast, setGlobalToast } from '@/hooks/useToast';

// Pages
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { DashboardPage } from '@/pages/student/DashboardPage';
import { SubmitComplaintPage } from '@/pages/student/SubmitComplaintPage';
import { MyComplaintsPage } from '@/pages/student/MyComplaintsPage';
import { ComplaintDetailPage } from '@/pages/ComplaintDetailPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminComplaintsPage } from '@/pages/admin/AdminComplaintsPage';
import { AdminAnalyticsPage } from '@/pages/admin/AdminAnalyticsPage';

// Redirect authenticated users from auth pages
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }
  return <>{children}</>;
};

// Global toast setup
const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toasts, toast, dismiss } = useToast();
  useEffect(() => { setGlobalToast(toast); }, [toast]);
  return (
    <>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </>
  );
};

const AppRoutes: React.FC = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-teal-500 animate-pulse" />
          <p className="text-sm text-gray-400">Loading ResolveX…</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Student routes */}
      <Route element={<ProtectedRoute role="student"><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/submit" element={<SubmitComplaintPage />} />
        <Route path="/complaints" element={<MyComplaintsPage />} />
        <Route path="/complaints/:id" element={<ComplaintDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Admin routes */}
      <Route element={<ProtectedRoute role="admin"><AppLayout /></ProtectedRoute>}>
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/complaints" element={<AdminComplaintsPage />} />
        <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
        <Route path="/admin/users" element={<ProfilePage />} /> {/* placeholder */}
        <Route path="/admin/complaints/:id" element={<ComplaintDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => (
  <BrowserRouter>
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;