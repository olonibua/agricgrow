'use client';

import { useState} from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
// import { getAllLoanApplications } from '@/lib/appwrite';
import { LoanApplication } from '@/types/loan';
import { useAuth } from '@/contexts/auth-context';
// import ApplicationsTab from '@/components/imf-dashboard/applications-tab';
import { useSearchParams } from 'next/navigation';
import ApplicationDetails from '@/components/imf-dashboard/application-details';

export default function ApplicationsPage() {
  const [activeTab, setActiveTab] = useState("pending");
  const [loanApplications, setLoanApplications] = useState<LoanApplication[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<LoanApplication | null>(null);
//   const { userProfile } = useAuth();
  const searchParams = useSearchParams();
//   const applicationId = searchParams.get('id');

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         if (userProfile) {
//           // Load all loan applications from Appwrite
//           const applications = await getAllLoanApplications();
//           setLoanApplications(applications as unknown as LoanApplication[]);
          
//           // If there's an application ID in the URL, find and select that application
//           if (applicationId) {
//             const app = applications.find(a => a.$id === applicationId);
//             if (app) {
//               setSelectedApplication(app as unknown as LoanApplication);
//             }
//           }
//         }
//         setIsLoading(false);
//       } catch (error) {
//         console.error("Error loading applications:", error);
//         setIsLoading(false);
//       }
//     };

//     loadData();
//   }, [userProfile, applicationId]);

//   const handleApplicationUpdate = (updatedApplications: LoanApplication[]) => {
//     setLoanApplications(updatedApplications);
//   };

//   const handleSelectApplication = (application: LoanApplication) => {
//     setSelectedApplication(application);
//   };

  const handleCloseDetails = () => {
    setSelectedApplication(null);
    // Remove the id from the URL
    const url = new URL(window.location.href);
    url.searchParams.delete('id');
    window.history.pushState({}, '', url);
  };

  const handleApproveApplication = (application: LoanApplication) => {
    // Implementation for approving application
    console.log("Approving application:", application.$id);
    handleCloseDetails();
  };

  const handleRejectApplication = (application: LoanApplication) => {
    // Implementation for rejecting application
    console.log("Rejecting application:", application.$id);
    handleCloseDetails();
  };

  // Filter applications by status
  const pendingApplications = loanApplications.filter(app => app.status === 'pending');
  const approvedApplications = loanApplications.filter(app => app.status === 'approved');
  const rejectedApplications = loanApplications.filter(app => app.status === 'rejected');

  return (
    <div className="min-h-screen bg-background">
      <div className="py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Loan Applications</h1>
          <p className="text-muted-foreground mb-8">Review and manage farmer loan applications</p>
          
          {selectedApplication ? (
            <ApplicationDetails 
              application={selectedApplication as any}
              onApprove={(app) => handleApproveApplication(app as any)}
              onReject={(app) => handleRejectApplication(app as any)}
              onClose={handleCloseDetails}
            />
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid grid-cols-3 w-full max-w-md">
                <TabsTrigger value="pending">
                  Pending ({pendingApplications.length})
                </TabsTrigger>
                <TabsTrigger value="approved">
                  Approved ({approvedApplications.length})
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Rejected ({rejectedApplications.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="pending">
                <Card>
                  <CardContent className="pt-6">
                    {/* <ApplicationsTab 
                      applications={pendingApplications}
                      onApplicationsUpdate={handleApplicationUpdate}
                      onSelectApplication={handleSelectApplication}
                    /> */}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="approved">
                <Card>
                  <CardContent className="pt-6">
                    {/* <ApplicationsTab 
                      applications={approvedApplications}
                      onApplicationsUpdate={handleApplicationUpdate}
                      onSelectApplication={handleSelectApplication}
                    /> */}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="rejected">
                <Card>
                  <CardContent className="pt-6">
                    {/* <ApplicationsTab 
                      applications={rejectedApplications}
                      onApplicationsUpdate={handleApplicationUpdate}
                      onSelectApplication={handleSelectApplication}
                    /> */}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
} 