'use client';

import ProtectedRoute from '@/components/auth/protected-route';
import { IMFDashboardSidebar } from '@/components/imf-dashboard/sidebar';

export default function IMFDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute userType="imf">
      <div className="min-h-screen flex">
        <IMFDashboardSidebar />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
} 