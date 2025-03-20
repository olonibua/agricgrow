'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CalendarIcon } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getLoanApplication } from "@/lib/appwrite";
import { RepaymentSchedule, LoanApplication } from '@/types/loan';

export default function RepaymentSchedulePage() {
  const params = useParams();
  const router = useRouter();
  const [loan, setLoan] = useState<LoanApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Fetch loan details
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
      <div className="container py-10">
        <div className="flex justify-center">
          <p>Loading repayment schedule...</p>
        </div>
      </div>
    );
  }
  
  if (error || !loan) {
    return (
      <div className="container py-10">
        <div className="flex justify-center">
          <p className="text-red-500">{error || 'Loan not found'}</p>
        </div>
      </div>
    );
  }
  
  // Get all payment dates for the calendar
  const paymentDates: Record<string, { status: string; amount: number }> = {};
  
  if (loan.repaymentSchedule) {
    loan.repaymentSchedule.forEach((payment: RepaymentSchedule) => {
      const date = new Date(payment.dueDate);
      const dateStr = date.toISOString().split('T')[0];
      paymentDates[dateStr] = {
        status: payment.status,
        amount: payment.amount
      };
    });
  }
  
  // Find payment for selected date
  const selectedPayment = selectedDate && loan.repaymentSchedule ? 
    loan.repaymentSchedule.find((payment: RepaymentSchedule) => {
      const paymentDate = new Date(payment.dueDate);
      return paymentDate.toDateString() === selectedDate.toDateString();
    }) : null;
  
  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Repayment Schedule</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{loan.cropType} Loan Repayment Plan</CardTitle>
          <CardDescription>
            {formatCurrency(loan.amount)} loan with {loan.interestRate}% interest over {loan.repaymentPeriodMonths} months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-medium mb-4">Payment Calendar</h3>
              <div className="border rounded-md p-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  modifiers={{
                    paid: Object.entries(paymentDates)
                      .filter(([, data]) => data.status === 'paid')
                      .map(([date]) => new Date(date)),
                    pending: Object.entries(paymentDates)
                      .filter(([, data]) => data.status === 'pending')
                      .map(([date]) => new Date(date)),
                    overdue: Object.entries(paymentDates)
                      .filter(([, data]) => data.status === 'overdue')
                      .map(([date]) => new Date(date)),
                  }}
                  modifiersStyles={{
                    paid: { backgroundColor: '#dcfce7', color: '#166534' },
                    pending: { backgroundColor: '#e0f2fe', color: '#075985' },
                    overdue: { backgroundColor: '#fee2e2', color: '#b91c1c' },
                  }}
                />
                
                <div className="mt-4 flex justify-between text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-100 mr-1"></div>
                    <span>Paid</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-100 mr-1"></div>
                    <span>Pending</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-100 mr-1"></div>
                    <span>Overdue</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Payment Details</h3>
              {selectedPayment ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="font-medium">Payment Amount:</span>
                        <span>{formatCurrency(selectedPayment.amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Due Date:</span>
                        <span>{formatDate(selectedPayment.dueDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Status:</span>
                        <Badge variant={
                          selectedPayment.status === 'paid' ? 'default' :
                          selectedPayment.status === 'overdue' ? 'destructive' : 'outline'
                        }>
                          {selectedPayment.status}
                        </Badge>
                      </div>
                      {selectedPayment.paymentDate && (
                        <div className="flex justify-between">
                          <span className="font-medium">Payment Date:</span>
                          <span>{formatDate(selectedPayment.paymentDate)}</span>
                        </div>
                      )}
                      
                      {selectedPayment.status === 'pending' && (
                        <Button className="w-full mt-2">
                          Make Payment
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-6">
                    <div className="text-center">
                      <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-2 font-medium">Select a Payment Date</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Click on a highlighted date in the calendar to view payment details
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Payment Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Payments:</span>
                    <span className="font-medium">{loan.repaymentSchedule?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payments Made:</span>
                    <span className="font-medium">
                      {loan.repaymentSchedule?.filter((p: RepaymentSchedule) => p.status === 'paid').length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Remaining Payments:</span>
                    <span className="font-medium">
                      {loan.repaymentSchedule?.filter((p: RepaymentSchedule) => p.status !== 'paid').length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Amount:</span>
                    <span className="font-medium">
                      {formatCurrency(
                        loan.repaymentSchedule?.reduce((sum: number, p: RepaymentSchedule) => sum + p.amount, 0) || 0
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 