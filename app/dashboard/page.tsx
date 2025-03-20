'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CalendarIcon, ArrowUpRight, Tractor, BarChart3, FileText, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from '@/contexts/auth-context';
import { getLoanApplications, getFarmerProfile, databases, DATABASE_ID, FARMERS_COLLECTION_ID } from '@/lib/appwrite';
import { ID } from 'appwrite';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar as ReactCalendar } from "@/components/ui/calendar";
import { formatCurrency} from "@/lib/utils";
import UpcomingPayments from '@/components/dashboard/upcoming-payments';
import RepaymentsTab from '@/components/dashboard/repayments-tab';
import { checkOverduePayments } from '@/lib/repayment';
import { LoanApplication } from '@/types/loan';

// Define interfaces for type safety
interface FarmerData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  state?: string;
  lga?: string;
  registrationDate: string;
  farmSize?: number;
  primaryCrop?: string;
  secondaryCrop?: string;
  hasIrrigation?: boolean;
  creditScore?: number;
}

export default function FarmerDashboard() {
  const [farmerData, setFarmerData] = useState<FarmerData | null>(null);
  const [loanApplications, setLoanApplications] = useState<LoanApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userProfile, user } = useAuth();
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [farmingEvents, setFarmingEvents] = useState<{
    date: Date;
    title: string;
    description: string;
    type: 'planting' | 'fertilizer' | 'harvest' | 'other';
  }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (user) {
          console.log("User data:", user);
          
          // Try to get farmer profile from Appwrite
          let farmerProfile = null;
          
          if (userProfile) {
            farmerProfile = await getFarmerProfile(userProfile.userId || user.$id);
          }
          
          // If no profile found, try with user ID directly
          if (!farmerProfile && user.$id) {
            farmerProfile = await getFarmerProfile(user.$id);
          }
          
          console.log("Farmer profile:", farmerProfile);
          
          if (farmerProfile) {
            // Transform Appwrite document to FarmerData
            const profileData: FarmerData = {
              id: farmerProfile.$id,
              name: farmerProfile.name || user.name || 'Farmer',
              email: farmerProfile.email || user.email || '',
              phone: farmerProfile.phone || '',
              address: farmerProfile.address || '',
              state: farmerProfile.state || '',
              lga: farmerProfile.lga || '',
              registrationDate: farmerProfile.registrationDate || new Date().toISOString(),
              farmSize: farmerProfile.farmSize || 0,
              primaryCrop: farmerProfile.primaryCrop || 'Maize',
              secondaryCrop: farmerProfile.secondaryCrop || '',
              hasIrrigation: farmerProfile.hasIrrigation || false,
              creditScore: farmerProfile.creditScore || 65,
            };
            
            setFarmerData(profileData);
          } else {
            // Create a default profile if none exists
            console.log("No farmer profile found, creating default data");
            
            const defaultProfile = {
              id: 'default',
              name: user.name || 'Farmer',
              email: user.email || '',
              registrationDate: new Date().toISOString(),
              creditScore: 65,
              farmSize: 0,
              primaryCrop: 'Maize',
            };
            
            setFarmerData(defaultProfile);
            
            // Create a profile document in Appwrite
            try {
              const newProfile = await databases.createDocument(
                DATABASE_ID,
                FARMERS_COLLECTION_ID,
                ID.unique(),
                {
                  userId: user.$id,
                  name: user.name,
                  email: user.email,
                  registrationDate: new Date().toISOString(),
                  status: 'active',
                  farmSize: 0,
                  primaryCrop: 'Maize',
                  secondaryCrop: '',
                  hasIrrigation: false,
                  creditScore: 65
                }
              );
              console.log("Created new farmer profile:", newProfile);
            } catch (profileError: unknown) {
              const errorMessage = profileError instanceof Error ? profileError.message : 'Error creating farmer profile';
              console.error("Error creating farmer profile:", errorMessage);
            }
          }

          // Load loan applications from Appwrite
          const userId = userProfile?.userId || user.$id;
          const applications = await getLoanApplications(userId);
          const updatedApplications = checkOverduePayments(applications as unknown as LoanApplication[]);
          setLoanApplications(updatedApplications);
        }
        setIsLoading(false);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error loading dashboard data';
        console.error("Error loading dashboard data:", errorMessage);
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    loadData();
  }, [userProfile, user]);

  useEffect(() => {
    if (farmerData?.primaryCrop) {
      // Generate sample farming events based on the primary crop
      const currentYear = new Date().getFullYear();
      const events = [
        {
          date: new Date(currentYear, 2, 15), // March 15
          title: "Planting Season Begins",
          description: `Optimal time to plant ${farmerData.primaryCrop}`,
          type: 'planting' as const
        },
        {
          date: new Date(currentYear, 3, 30), // April 30
          title: "Planting Season Ends",
          description: `Last recommended date for planting ${farmerData.primaryCrop}`,
          type: 'planting' as const
        },
        {
          date: new Date(currentYear, 4, 10), // May 10
          title: "Fertilizer Application Begins",
          description: `Start applying NPK fertilizer to ${farmerData.primaryCrop}`,
          type: 'fertilizer' as const
        },
        {
          date: new Date(currentYear, 4, 25), // May 25
          title: "Fertilizer Application Ends",
          description: `Complete fertilizer application for ${farmerData.primaryCrop}`,
          type: 'fertilizer' as const
        },
        {
          date: new Date(currentYear, 7, 20), // August 20
          title: "Harvest Period Begins",
          description: `Start harvesting ${farmerData.primaryCrop}`,
          type: 'harvest' as const
        },
        {
          date: new Date(currentYear, 8, 15), // September 15
          title: "Harvest Period Ends",
          description: `Complete harvesting of ${farmerData.primaryCrop}`,
          type: 'harvest' as const
        },
        {
          date: new Date(currentYear, 9, 10), // October 10
          title: "Post-Harvest Processing",
          description: `Begin processing and storage of ${farmerData.primaryCrop}`,
          type: 'other' as const
        },
        {
          date: new Date(currentYear, 10, 5), // November 5
          title: "Market Preparation",
          description: `Prepare ${farmerData.primaryCrop} for market`,
          type: 'other' as const
        }
      ];
      
      setFarmingEvents(events);
    }
  }, [farmerData?.primaryCrop]);

  // Function to get events for a specific date
  const getEventsForDate = (date: Date | undefined) => {
    if (!date) return [];
    
    return farmingEvents.filter(event => 
      event.date.getDate() === date.getDate() && 
      event.date.getMonth() === date.getMonth() && 
      event.date.getFullYear() === date.getFullYear()
    );
  };
  
  // Function to determine if a date has events
  const dateHasEvent = (date: Date) => {
    return farmingEvents.some(event => 
      event.date.getDate() === date.getDate() && 
      event.date.getMonth() === date.getMonth() && 
      event.date.getFullYear() === date.getFullYear()
    );
  };

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-10">
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-red-600 mb-2">Error Loading Dashboard</h2>
              <p className="text-muted-foreground">{error}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setError(null);
                  setIsLoading(true);
                  // Retry loading data
                  window.location.reload();
                }}
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate dashboard statistics
  const totalLoans = loanApplications.length;
  const approvedLoans = loanApplications.filter(loan => loan.status === 'approved').length;
  const pendingLoans = loanApplications.filter(loan => loan.status === 'pending').length;
  const totalAmount = loanApplications
    .filter(loan => loan.status === 'approved')
    .reduce((sum, loan) => sum + loan.amount, 0);

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Farmer Dashboard</h1>
        <Button asChild>
          <Link href="/apply">Apply for a Loan</Link>
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">
                Total Loans
              </CardTitle>
              <CardDescription>All loan applications</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLoans}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">
                Approved Loans
              </CardTitle>
              <CardDescription>Loans ready for disbursement</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedLoans}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">
                Pending Applications
              </CardTitle>
              <CardDescription>Awaiting approval</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingLoans}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">
                Total Loan Amount
              </CardTitle>
              <CardDescription>Approved loans</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="loans">My Loans</TabsTrigger>
          <TabsTrigger value="repayments">Repayments</TabsTrigger>
          <TabsTrigger value="calendar">Farm Calendar</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Loans
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {approvedLoans}
                </div>
                <p className="text-xs text-muted-foreground">
                  {pendingLoans} pending applications
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Credit Score
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {farmerData?.creditScore}/100
                </div>
                <Progress
                  value={farmerData?.creditScore}
                  className="h-2 mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Farm Size</CardTitle>
                <Tractor className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {farmerData?.farmSize} hectares
                </div>
                <p className="text-xs text-muted-foreground">
                  Primary crop: {farmerData?.primaryCrop}
                </p>
              </CardContent>
            </Card>

            <UpcomingPayments loans={loanApplications } />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Recent Loan Applications</CardTitle>
                <CardDescription>
                  Your most recent loan applications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loanApplications.length > 0 ? (
                  loanApplications.slice(0, 3).map((loan) => (
                    <div
                      key={loan.$id}
                      className="flex items-center justify-between border-b pb-2"
                    >
                      <div>
                        <p className="font-medium">
                          ₦{loan.amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {loan.purpose?.substring(0, 30) || "No purpose specified"}...
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            loan.status === "approved"
                              ? "default"
                              : loan.status === "rejected"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {loan.status.charAt(0).toUpperCase() +
                            loan.status.slice(1)}
                        </Badge>
                        {loan.status === "approved" && loan.approvalReason && (
                          <div className="mt-2 text-sm text-green-700">
                            <p className="font-medium">Approval Reason:</p>
                            <p>{String(loan.approvalReason)}</p>
                          </div>
                        )}
                        {loan.status === "rejected" && loan.rejectionReason && (
                          <div className="mt-2 text-sm text-red-700">
                            <p className="font-medium">Rejection Reason:</p>
                            <p>{loan.rejectionReason as string}</p>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(loan.applicationDate as string).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">
                      No loan applications yet
                    </p>
                    <Button asChild variant="outline" className="mt-2">
                      <Link href="/apply">Apply for a Loan</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
              {loanApplications.length > 3 && (
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    // onClick={() => setActiveTab("loans")}
                  >
                    View All Applications
                  </Button>
                </CardFooter>
              )}
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Farming Calendar</CardTitle>
                <CardDescription>
                  Upcoming activities for your crops
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CalendarIcon className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Planting Season</p>
                    <p className="text-sm text-muted-foreground">
                      Optimal time to plant {farmerData?.primaryCrop}
                    </p>
                    <p className="text-xs mt-1">March 15 - April 30</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CalendarIcon className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Fertilizer Application</p>
                    <p className="text-sm text-muted-foreground">
                      Apply NPK fertilizer to {farmerData?.primaryCrop}
                    </p>
                    <p className="text-xs mt-1">May 10 - May 25</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CalendarIcon className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Harvest Period</p>
                    <p className="text-sm text-muted-foreground">
                      Expected harvest time for {farmerData?.primaryCrop}
                    </p>
                    <p className="text-xs mt-1">August 20 - September 15</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setIsCalendarModalOpen(true)}
                >
                  View Full Calendar
                </Button>
              </CardFooter>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Market Insights</CardTitle>
              <CardDescription>
                Current market prices and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">Maize</p>
                    <Badge variant="outline" className="flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      5.2%
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold mt-2">₦120,000</p>
                  <p className="text-xs text-muted-foreground">per ton</p>
                </div>

                <div className="border rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">Cassava</p>
                    <Badge variant="outline" className="flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      2.8%
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold mt-2">₦85,000</p>
                  <p className="text-xs text-muted-foreground">per ton</p>
                </div>

                <div className="border rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">Rice</p>
                    <Badge variant="outline" className="flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      7.5%
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold mt-2">₦280,000</p>
                  <p className="text-xs text-muted-foreground">per ton</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loans" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Loan Applications</CardTitle>
              <CardDescription>
                All your loan applications and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loanApplications.length > 0 ? (
                <div className="space-y-4">
                  {loanApplications.map((loan) => (
                    <Card key={loan.$id}>
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant={
                                  loan.status === "approved"
                                    ? "default"
                                    : loan.status === "rejected"
                                    ? "destructive"
                                    : "outline"
                                }
                              >
                                {loan.status.charAt(0).toUpperCase() +
                                  loan.status.slice(1)}
                              </Badge>
                              <p className="text-sm text-muted-foreground">
                                Applied on{" "}
                                {new Date(
                                  loan.applicationDate as string
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <h3 className="text-lg font-bold">
                              ₦{loan.amount.toLocaleString()}
                            </h3>
                            <p className="text-sm">{loan.purpose}</p>
                          </div>

                          <div className="mt-4 md:mt-0 space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">
                                Application ID:
                              </p>
                              <p className="text-sm">{loan.$id}</p>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">Crop Type:</p>
                              <p className="text-sm">{loan.cropType}</p>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">Farm Size:</p>
                              <p className="text-sm">
                                {loan.farmSize} hectares
                              </p>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">Risk Score:</p>
                              <div className="flex items-center">
                                <Progress
                                  value={loan.riskScore}
                                  className="h-2 w-20 mr-2"
                                />
                                <p className="text-sm">{loan.riskScore}/100</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {loan.status === "pending" && (
                          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start">
                            <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-amber-800">
                                Application Under Review
                              </p>
                              <p className="text-xs text-amber-700">
                                Your application is being reviewed by our team.
                                This process typically takes 3-5 business days.
                              </p>
                            </div>
                          </div>
                        )}

                        {loan.status === "approved" && (
                          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                            <p className="text-sm font-medium text-green-800">
                              Loan Details
                            </p>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Disbursement Date
                                </p>
                                <p className="text-sm">June 15, 2023</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Repayment Date
                                </p>
                                <p className="text-sm">December 15, 2023</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Interest Rate
                                </p>
                                <p className="text-sm">8.5%</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Total Repayment
                                </p>
                                <p className="text-sm">
                                  ₦{(loan.amount * 1.085).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {loan.status === "rejected" && (
                          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
                            <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-red-800">
                                Application Declined
                              </p>
                              <p className="text-xs text-red-700">
                                {loan.riskExplanation ||
                                  "Your application did not meet our current lending criteria. Please contact our support team for more information."}
                              </p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No Loan Applications Yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    You haven&apos;t applied for any loans yet. Start your first
                    application now.
                  </p>
                  <Button asChild>
                    <Link href="/apply">Apply for a Loan</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="repayments">
          <RepaymentsTab loans={loanApplications} />
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Farming Calendar</CardTitle>
              <CardDescription>
                Upcoming activities for your crops
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <CalendarIcon className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Planting Season</p>
                  <p className="text-sm text-muted-foreground">
                    Optimal time to plant {farmerData?.primaryCrop}
                  </p>
                  <p className="text-xs mt-1">March 15 - April 30</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CalendarIcon className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Fertilizer Application</p>
                  <p className="text-sm text-muted-foreground">
                    Apply NPK fertilizer to {farmerData?.primaryCrop}
                  </p>
                  <p className="text-xs mt-1">May 10 - May 25</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CalendarIcon className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Harvest Period</p>
                  <p className="text-sm text-muted-foreground">
                    Expected harvest time for {farmerData?.primaryCrop}
                  </p>
                  <p className="text-xs mt-1">August 20 - September 15</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setIsCalendarModalOpen(true)}
              >
                View Full Calendar
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Farming Calendar Modal */}
      <Dialog open={isCalendarModalOpen} onOpenChange={setIsCalendarModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Farming Calendar</DialogTitle>
            <DialogDescription>
              View all farming activities for your {farmerData?.primaryCrop} crop
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <ReactCalendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                modifiers={{
                  event: (date) => dateHasEvent(date)
                }}
                modifiersClassNames={{
                  event: "bg-primary/10 font-bold text-primary"
                }}
              />
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium text-lg">
                {selectedDate ? selectedDate.toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                }) : 'Select a date'}
              </h3>
              
              {getEventsForDate(selectedDate).length > 0 ? (
                <div className="space-y-3">
                  {getEventsForDate(selectedDate).map((event, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${
                          event.type === 'planting' ? 'bg-green-100 text-green-700' :
                          event.type === 'fertilizer' ? 'bg-blue-100 text-blue-700' :
                          event.type === 'harvest' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          <CalendarIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {event.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No events scheduled for this date</p>
              )}
              
              <div className="pt-4">
                <h4 className="text-sm font-medium mb-2">Legend</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span>Planting</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <span>Fertilizer</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                    <span>Harvest</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
                    <span>Other</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}