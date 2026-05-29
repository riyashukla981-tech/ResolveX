// src/components/layout/Sidebar.tsx
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FilePlus, FileText, Settings, LogOut,
  ChevronLeft, ChevronRight, ShieldCheck, Users, BarChart2, Menu, X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn, getInitials } from '@/lib/utils';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
}

const STUDENT_NAV: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Submit Complaint', to: '/submit', icon: <FilePlus className="w-5 h-5" /> },
  { label: 'My Complaints', to: '/complaints', icon: <FileText className="w-5 h-5" /> },
  { label: 'Profile', to: '/profile', icon: <Settings className="w-5 h-5" /> },
];

const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', to: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'All Complaints', to: '/admin/complaints', icon: <FileText className="w-5 h-5" /> },
  { label: 'Analytics', to: '/admin/analytics', icon: <BarChart2 className="w-5 h-5" /> },
  { label: 'Users', to: '/admin/users', icon: <Users className="w-5 h-5" /> },
  { label: 'Profile', to: '/profile', icon: <Settings className="w-5 h-5" /> },
];

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = user?.role === 'admin' ? ADMIN_NAV : STUDENT_NAV;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 py-5 border-b border-gray-100', collapsed && 'justify-center px-2')}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-teal-500 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <span className="text-lg font-bold text-primary-800">Resolve</span>
            <span className="text-lg font-bold text-teal-500">X</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard' || item.to === '/admin'}
            className={({ isActive }) =>
              cn('sidebar-link', isActive ? 'sidebar-link-active' : 'sidebar-link-inactive', collapsed && 'justify-center px-2')
            }
            title={collapsed ? item.label : undefined}
            onClick={() => setMobileOpen(false)}
          >
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className={cn('p-3 border-t border-gray-100', collapsed && 'px-2')}>
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 mb-1 rounded-lg bg-gray-50">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-semibold shrink-0">
              {getInitials(user?.name || 'U')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors',
            collapsed && 'justify-center'
          )}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && 'Logout'}
        </button>
      </div>

      {/* Collapse toggle (desktop) */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center shadow-sm hover:shadow-md transition-shadow text-gray-500 hover:text-gray-700"
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm"
        onClick={() => setMobileOpen((o) => !o)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'lg:hidden fixed top-0 left-0 h-full w-64 bg-white z-50 flex flex-col shadow-xl transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col sticky top-0 h-screen bg-white border-r border-gray-100 relative transition-all duration-300',
          collapsed ? 'w-[68px]' : 'w-64'
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
};