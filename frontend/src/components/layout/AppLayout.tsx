// src/components/layout/AppLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const AppLayout: React.FC = () => (
  <div className="flex min-h-screen bg-gray-50">
    <Sidebar />
    <main className="flex-1 min-w-0 overflow-auto">
      <div className="p-6 lg:p-8 max-w-[1200px] mx-auto animate-fade-in">
        <Outlet />
      </div>
    </main>
  </div>
);