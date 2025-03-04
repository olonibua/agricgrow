'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CalendarIcon, ArrowUpRight, Tractor, Leaf, BarChart3, FileText, AlertCircle } from "lucide-react";

export default function FarmerDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [farmerData, setFarmerData] = useState<any>(null);
  const [loanApplications, setLoanApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, we would fetch this data from an API
    // For now, we'll load it from localStorage
    const loadData = () => {
      try {
        // Load farmer profile (mock data for now)
        const mockFarmerData = {
          id: "FARMER-123",
          name: "John Doe",
          email: "john.doe@example.com",
          phone: "08012345678",
          address: "123 Farm Road, Lagos",
          state: "Lagos",
          lga: "Ikeja",
          registrationDate: "2023-01-15",
          farmSize: 5.5,
          primaryCrop: "Maize",
          secondaryCrop: "Cassava",
          hasIrrigation: true,
          creditScore: 75
        };
        setFarmerData(mockFarmerData);
        
        // Load loan applications from localStorage
        const savedApplications = localStorage.getItem('loanApplications');
        if (savedApplications) {
          setLoanApplications(JSON.parse(savedApplications));
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Farmer Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {farmerData?.name}</p>
        </div>
        <Button asChild className="mt-4 md:mt-0">
          <Link href="/apply">Apply for Loan</Link>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="loans">Loan Applications</TabsTrigger>
          <TabsTrigger value="farm">Farm Details</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loanApplications.filter(loan => loan.status === 'approved').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {loanApplications.filter(loan => loan.status === 'pending').length} pending applications
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Credit Score</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{farmerData?.creditScore}/100</div>
                <Progress value={farmerData?.creditScore} className="h-2 mt-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Farm Size</CardTitle>
                <Tractor className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{farmerData?.farmSize} hectares</div>
                <p className="text-xs text-muted-foreground">
                  Primary crop: {farmerData?.primaryCrop}
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Recent Loan Applications</CardTitle>
                <CardDescription>Your most recent loan applications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loanApplications.length > 0 ? (
                  loanApplications.slice(0, 3).map((loan) => (
                    <div key={loan.$id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">₦{loan.amount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{loan.purpose.substring(0, 30)}...</p>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={
                            loan.status === 'approved' ? 'default' : 
                            loan.status === 'rejected' ? 'destructive' : 'outline'
                          }
                        >
                          {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(loan.applicationDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">No loan applications yet</p>
                    <Button asChild variant="outline" className="mt-2">
                      <Link href="/apply">Apply for a Loan</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
              {loanApplications.length > 3 && (
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => setActiveTab("loans")}>
                    View All Applications
                  </Button>
                </CardFooter>
              )}
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Farming Calendar</CardTitle>
                <CardDescription>Upcoming activities for your crops</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CalendarIcon className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Planting Season</p>
                    <p className="text-sm text-muted-foreground">Optimal time to plant {farmerData?.primaryCrop}</p>
                    <p className="text-xs mt-1">March 15 - April 30</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CalendarIcon className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Fertilizer Application</p>
                    <p className="text-sm text-muted-foreground">Apply NPK fertilizer to {farmerData?.primaryCrop}</p>
                    <p className="text-xs mt-1">May 10 - May 25</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CalendarIcon className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Harvest Period</p>
                    <p className="text-sm text-muted-foreground">Expected harvest time for {farmerData?.primaryCrop}</p>
                    <p className="text-xs mt-1">August 20 - September 15</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View Full Calendar
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Market Insights</CardTitle>
              <CardDescription>Current market prices and trends</CardDescription>
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
              <CardDescription>All your loan applications and their status</CardDescription>
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
                                  loan.status === 'approved' ? 'default' : 
                                  loan.status === 'rejected' ? 'destructive' : 'outline'
                                }
                              >
                                {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                              </Badge>
                              <p className="text-sm text-muted-foreground">
                                Applied on {new Date(loan.applicationDate).toLocaleDateString()}
                              </p>
                            </div>
                            <h3 className="text-lg font-bold">₦{loan.amount.toLocaleString()}</h3>
                            <p className="text-sm">{loan.purpose}</p>
                          </div>
                          
                          <div className="mt-4 md:mt-0 space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">Application ID:</p>
                              <p className="text-sm">{loan.$id}</p>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">Crop Type:</p>
                              <p className="text-sm">{loan.cropType}</p>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">Farm Size:</p>
                              <p className="text-sm">{loan.farmSize} hectares</p>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">Risk Score:</p>
                              <div className="flex items-center">
                                <Progress value={loan.riskScore} className="h-2 w-20 mr-2" />
                                <p className="text-sm">{loan.riskScore}/100</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {loan.status === 'pending' && (
                          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start">
                            <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-amber-800">Application Under Review</p>
                              <p className="text-xs text-amber-700">
                                Your application is being reviewed by our team. This process typically takes 3-5 business days.
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {loan.status === 'approved' && (
                          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                            <p className="text-sm font-medium text-green-800">Loan Details</p>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <div>
                                <p className="text-xs text-muted-foreground">Disbursement Date</p>
                                <p className="text-sm">June 15, 2023</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Repayment Date</p>
                                <p className="text-sm">December 15, 2023</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Interest Rate</p>
                                <p className="text-sm">8.5%</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Total Repayment</p>
                                <p className="text-sm">₦{(loan.amount * 1.085).toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {loan.status === 'rejected' && (
                          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
                            <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-red-800">Application Declined</p>
                              <p className="text-xs text-red-700">
                                {loan.riskExplanation || "Your application did not meet our current lending criteria. Please contact our support team for more information."}
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
                  <h3 className="text-lg font-medium mb-2">No Loan Applications Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't applied for any loans yet. Start your first application now.
                  </p>
                  <Button asChild>
                    <Link href="/apply">Apply for a Loan</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="farm" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Farm Details</CardTitle>
              <CardDescription>Information about your farm and crops</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Farm Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <p className="text-muted-foreground">Farm Size:</p>
                        <p className="font-medium">{farmerData?.farmSize} hectares</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-muted-foreground">Location:</p>
                        <p className="font-medium">{farmerData?.address}</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-muted-foreground">State:</p>
                        <p className="font-medium">{farmerData?.state}</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-muted-foreground">LGA:</p>
                        <p className="font-medium">{farmerData?.lga}</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-muted-foreground">Irrigation System:</p>
                        <p className="font-medium">{farmerData?.hasIrrigation ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Crops</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Leaf className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{farmerData?.primaryCrop}</p>
                          <p className="text-sm text-muted-foreground">Primary Crop</p>
                        </div>
                      </div>
                      
                      {farmerData?.secondaryCrop && (
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <Leaf className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">{farmerData?.secondaryCrop}</p>
                            <p className="text-sm text-muted-foreground">Secondary Crop</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Farming History</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <p className="text-muted-foreground">Farming Since:</p>
                        <p className="font-medium">2018</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-muted-foreground">Last Harvest:</p>
                        <p className="font-medium">September 2022</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-muted-foreground">Yield (Last Season):</p>
                        <p className="font-medium">3.2 tons/hectare</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-muted-foreground">Revenue (Last Season):</p>
                        <p className="font-medium">₦1,850,000</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Equipment</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center space-x-2">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                        <span>Tractor (Leased)</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                        <span>Irrigation Pumps</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                        <span>Storage Facility (100 sq m)</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                        <span>Processing Equipment</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <Button variant="outline" className="w-full">Update Farm Information</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Farming Resources</CardTitle>
              <CardDescription>Helpful resources and information for your farming activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Best Practices</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="border-b pb-2">
                      <Link href="#" className="text-primary hover:underline font-medium">
                        Maize Farming Guide for Nigerian Climate
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        Learn the best practices for maize cultivation in Nigeria's diverse climate zones.
                      </p>
                    </div>
                    <div className="border-b pb-2">
                      <Link href="#" className="text-primary hover:underline font-medium">
                        Irrigation Techniques for Small-Scale Farmers
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        Cost-effective irrigation solutions for farms under 10 hectares.
                      </p>
                    </div>
                    <div>
                      <Link href="#" className="text-primary hover:underline font-medium">
                        Pest Management for Cassava
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        Identify and manage common pests affecting cassava crops.
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Training & Workshops</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="border-b pb-2">
                      <p className="font-medium">Modern Farming Techniques</p>
                      <p className="text-sm text-muted-foreground">
                        July 15, 2023 • Ikeja Agricultural Center
                      </p>
                      <Button variant="outline" size="sm" className="mt-2">Register</Button>
                    </div>
                    <div className="border-b pb-2">
                      <p className="font-medium">Financial Management for Farmers</p>
                      <p className="text-sm text-muted-foreground">
                        August 5, 2023 • Online Webinar
                      </p>
                      <Button variant="outline" size="sm" className="mt-2">Register</Button>
                    </div>
                    <div>
                      <p className="font-medium">Post-Harvest Storage Solutions</p>
                      <p className="text-sm text-muted-foreground">
                        August 22, 2023 • Lagos State Agricultural Development Center
                      </p>
                      <Button variant="outline" size="sm" className="mt-2">Register</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Weather Forecast</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                    <div key={day} className="border rounded-lg p-3 text-center">
                      <p className="font-medium">{day}</p>
                      <div className="my-2">
                        {/* Weather icon would go here */}
                        <div className="h-10 w-10 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 text-xs">Icon</span>
                        </div>
                      </div>
                      <p className="text-sm">28°C</p>
                      <p className="text-xs text-muted-foreground">20% rain</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Market Connections</h3>
                <div className="space-y-3">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Lagos Farmers Market</p>
                        <p className="text-sm text-muted-foreground">
                          Direct sales to consumers at premium prices
                        </p>
                      </div>
                      <Button size="sm">Contact</Button>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">AgriProcess Ltd.</p>
                        <p className="text-sm text-muted-foreground">
                          Bulk buyer for cassava and maize
                        </p>
                      </div>
                      <Button size="sm">Contact</Button>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Export Opportunities</p>
                        <p className="text-sm text-muted-foreground">
                          Connect with exporters for international markets
                        </p>
                      </div>
                      <Button size="sm">Contact</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 