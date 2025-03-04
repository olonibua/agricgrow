'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CalendarIcon, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { formatCurrency, formatDate, calculateLoanStatus, calculateRepaymentProgress } from "@/lib/utils";

export default function LoanDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  
  const [loan, setLoan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchLoanDetails = () => {
      try {
        // In a real app, we would fetch this from an API
        // For now, we'll load it from localStorage
        const savedApplications = localStorage.getItem('loanApplications');
        if (savedApplications) {
          const applications = JSON.parse(savedApplications);
          const foundLoan = applications.find((app: any) => app.$id === id || app.id === id);
          
          if (foundLoan) {
            setLoan(foundLoan);
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading loan details:", error);
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchLoanDetails();
    }
  }, [id]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading loan details...</p>
        </div>
      </div>
    );
  }
  
  if (!loan) {
    return (
      <div className="container mx-auto p-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        
        <Card className="max-w-3xl mx-auto">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Loan Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The loan application you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const status = calculateLoanStatus(loan);
  const progress = calculateRepaymentProgress(loan);
  
  return (
    <div className="container mx-auto p-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">Loan Application</CardTitle>
                  <CardDescription>Application ID: {loan.$id || loan.id}</CardDescription>
                </div>
                <Badge 
                  variant={
                    status === 'Active' ? 'default' : 
                    status === 'Overdue' ? 'destructive' : 
                    status === 'Pending Review' ? 'outline' :
                    status === 'Rejected' ? 'destructive' : 'secondary'
                  }
                  className="text-sm px-3 py-1"
                >
                  {status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Loan Amount</p>
                  <p className="text-2xl font-bold">{formatCurrency(loan.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Repayment Period</p>
                  <p className="text-lg font-medium">{loan.repaymentPeriod.replace('_', ' ')}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Loan Purpose</p>
                <p>{loan.purpose}</p>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Application Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="mr-3 bg-primary/20 p-2 rounded-full">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Application Submitted</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(loan.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  {loan.status === 'approved' && (
                    <div className="flex items-start">
                      <div className="mr-3 bg-green-100 p-2 rounded-full">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Application Approved</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(loan.approvalDate || loan.createdAt)}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {loan.status === 'rejected' && (
                    <div className="flex items-start">
                      <div className="mr-3 bg-red-100 p-2 rounded-full">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium">Application Rejected</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(loan.rejectionDate || loan.createdAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {status === 'Active' && (
                <div>
                  <h3 className="font-medium mb-2">Repayment Progress</h3>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm text-muted-foreground">Progress</p>
                    <p className="text-sm font-medium">{progress}%</p>
                  </div>
                  <Progress value={progress} className="h-2 mb-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Start: {formatDate(loan.approvalDate || loan.createdAt)}</span>
                    <span>End: {formatDate(loan.dueDate || '2024-12-31')}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm text-muted-foreground">Risk Score</p>
                  <p className="text-sm font-medium">{loan.riskScore}%</p>
                </div>
                <Progress 
                  value={loan.riskScore} 
                  className={`h-2 ${
                    loan.riskScore >= 70 ? "[--progress-foreground:theme(colors.green.500)]" :
                    loan.riskScore >= 40 ? "[--progress-foreground:theme(colors.yellow.500)]" : 
                    "[--progress-foreground:theme(colors.red.500)]"
                  }`}
                />
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Risk Explanation</p>
                <p className="text-sm">{loan.riskExplanation}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {status === 'Pending Review' && (
                <Button variant="outline" className="w-full">Check Application Status</Button>
              )}
              
              {status === 'Active' && (
                <>
                  <Button className="w-full">Make a Payment</Button>
                  <Button variant="outline" className="w-full">Download Repayment Schedule</Button>
                </>
              )}
              
              <Button variant="outline" className="w-full">Contact Support</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 