'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ApplicationsTab from '@/components/mfi-dashboard/applications-tab';
import CropCalendarTab from '@/components/mfi-dashboard/crop-calendar-tab';
import SettingsTab from '@/components/mfi-dashboard/settings-tab';
import AnalyticsTab from '@/components/mfi-dashboard/analytics-tab';
import { LoanApplication } from '@/types/loan';

export default function MFIDashboardPage() {
  const [activeTab, setActiveTab] = useState("applications");
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load applications from localStorage
    const loadApplications = () => {
      try {
        const savedApplications = localStorage.getItem('loanApplications');
        if (savedApplications) {
          const parsedApplications = JSON.parse(savedApplications);
          setApplications(parsedApplications);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading applications:', error);
        setIsLoading(false);
      }
    };
    
    loadApplications();
  }, []);

  const handleApplicationUpdate = (updatedApplications: LoanApplication[]) => {
    setApplications(updatedApplications);
    localStorage.setItem('loanApplications', JSON.stringify(updatedApplications));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">MFI Dashboard</h1>
          <p className="text-muted-foreground">Manage loan applications and analyze agricultural data</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="crop-calendar">Crop Calendar</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="applications">
          <ApplicationsTab 
            applications={applications} 
            onApplicationsUpdate={handleApplicationUpdate} 
          />
        </TabsContent>
        
        <TabsContent value="analytics">
          <AnalyticsTab applications={applications} />
        </TabsContent>
        
        <TabsContent value="crop-calendar">
          <CropCalendarTab />
        </TabsContent>
        
        <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
} 