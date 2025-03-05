'use client';

import ProtectedRoute from '@/components/auth/protected-route';
import { DashboardSidebar } from '@/components/dashboard/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute userType="farmer">
      <div className="min-h-screen flex">
        <DashboardSidebar />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
} 