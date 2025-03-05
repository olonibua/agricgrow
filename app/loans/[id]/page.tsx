"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, ArrowLeft, Calendar, Clock, DollarSign, FileText } from "lucide-react";
import { getLoanApplication } from "@/lib/appwrite";

// Define interfaces for type safety
interface LoanApplication {
  $id: string;
  amount: number;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected';
  applicationDate: string;
  cropType: string;
  farmSize: number;
  riskScore: number;
  riskExplanation?: string;
  disbursementDate?: string;
  repaymentDate?: string;
  interestRate?: number;
}

export default function LoanDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [loan, setLoan] = useState<LoanApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLoanDetails = async () => {
      try {
        setLoading(true);
        const loanData = await getLoanApplication(params.id as string);
        setLoan(loanData as unknown as LoanApplication);
        setLoading(false);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error fetching loan details';
        setError(errorMessage);
        setLoading(false);
      }
    };
    
    fetchLoanDetails();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading loan details...</p>
        </div>
      </div>
    );
  }

  if (error || !loan) {
    return (
      <div className="container mx-auto p-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>We couldn&apos;t load the loan details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>{error || "Loan application not found"}</p>
            </div>
            <Button asChild className="mt-4">
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate total repayment amount
  const interestRate = loan.interestRate || 8.5; // Default to 8.5% if not specified
  const totalRepayment = loan.amount * (1 + interestRate / 100);

  return (
    <div className="container mx-auto p-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Loan Application #{loan.$id}</CardTitle>
                  <CardDescription>Applied on {new Date(loan.applicationDate).toLocaleDateString()}</CardDescription>
                </div>
                <Badge 
                  variant={
                    loan.status === 'approved' ? 'default' : 
                    loan.status === 'rejected' ? 'destructive' : 'outline'
                  }
                  className="ml-2"
                >
                  {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Loan Amount</h3>
                  <div className="flex items-center mt-1">
                    <DollarSign className="h-5 w-5 text-gray-400 mr-1" />
                    <span className="text-2xl font-bold">₦{loan.amount.toLocaleString()}</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Purpose</h3>
                  <p className="mt-1">{loan.purpose}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Crop Type</h3>
                  <p className="mt-1">{loan.cropType}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Farm Size</h3>
                  <p className="mt-1">{loan.farmSize} hectares</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Risk Assessment</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Risk Score</span>
                    <span className="font-medium">{loan.riskScore}/100</span>
                  </div>
                  <Progress value={loan.riskScore} className="h-2" />
                  {loan.riskExplanation ? (
                    <p className="text-sm text-gray-500 mt-2">{loan.riskExplanation}</p>
                  ) : (
                    <p className="text-sm text-gray-500 mt-2">No risk explanation available</p>
                  )}
                </div>
              </div>
              
              {loan.status === 'approved' && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <h3 className="text-sm font-medium text-green-800 mb-3">Loan Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Disbursement Date</p>
                        <p className="text-sm text-gray-600">{loan.disbursementDate || "June 15, 2023"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Repayment Date</p>
                        <p className="text-sm text-gray-600">{loan.repaymentDate || "December 15, 2023"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Loan Term</p>
                        <p className="text-sm text-gray-600">6 months</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <DollarSign className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Interest Rate</p>
                        <p className="text-sm text-gray-600">{interestRate}%</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <div className="flex justify-between">
                      <p className="font-medium">Total Repayment Amount</p>
                      <p className="font-bold">₦{totalRepayment.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {loan.status === 'rejected' && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800 mb-1">Application Declined</h3>
                    <p className="text-sm text-red-700">
                      {loan.riskExplanation || "Your application did not meet our current lending criteria. Please contact our support team for more information."}
                    </p>
                  </div>
                </div>
              )}
              
              {loan.status === 'pending' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-start">
                  <Clock className="h-5 w-5 text-yellow-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800 mb-1">Application Under Review</h3>
                    <p className="text-sm text-yellow-700">
                      Your application is currently being reviewed by our team. This process typically takes 2-3 business days.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" asChild>
                <Link href={`/loans/${loan.$id}/repayment`}>
                  Make a Repayment
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full" asChild>
                <Link href="/apply">
                  Apply for Another Loan
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                Download Loan Agreement
              </Button>
              
              <Button variant="outline" className="w-full">
                Contact Support
              </Button>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Repayment Schedule</CardTitle>
              <CardDescription>Upcoming payments</CardDescription>
            </CardHeader>
            <CardContent>
              {loan.status === 'approved' ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <div>
                      <p className="font-medium">December 15, 2023</p>
                      <p className="text-sm text-gray-500">Final Payment</p>
                    </div>
                    <p className="font-bold">₦{totalRepayment.toLocaleString()}</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-500">
                      This loan has a single repayment at the end of the term.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">
                    Repayment schedule will be available once your loan is approved.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 