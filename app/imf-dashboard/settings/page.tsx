'use client';

import SettingsTab from '@/components/imf-dashboard/settings-tab';

export default function IMFDashboardSettingsPage() {
  return (
    <div className="flex h-screen">
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Settings</h1>
          <SettingsTab />
        </div>
      </div>
    </div>
  );
} 