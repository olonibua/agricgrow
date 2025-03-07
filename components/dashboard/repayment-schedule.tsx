'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { RepaymentSchedule } from '@/types/loan';
import { updateLoanRepayment } from '@/lib/appwrite';

interface RepaymentScheduleProps {
  loanId: string;
  repaymentSchedule: RepaymentSchedule[];
  onRepaymentUpdate: () => void;
}

export default function RepaymentScheduleComponent({ 
  loanId, 
  repaymentSchedule,
  onRepaymentUpdate
}: RepaymentScheduleProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleMakePayment = async (repaymentId: string) => {
    try {
      setIsProcessing(true);
      
      // In a real application, this would integrate with a payment gateway
      // For now, we'll just mark the payment as paid
      await updateLoanRepayment(loanId, repaymentId, {
        status: 'paid',
        paymentDate: new Date().toISOString(),
        paymentMethod: 'bank_transfer', // This would come from user selection
        transactionId: `TRANS-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
      });
      
      // Refresh the loan data
      onRepaymentUpdate();
      
      setIsProcessing(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error processing payment';
      console.error("Error processing payment:", errorMessage);
      setIsProcessing(false);
    }
  };
  
  // Sort repayments by due date
  const sortedRepayments = [...repaymentSchedule].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Repayment Schedule</CardTitle>
        <CardDescription>Your loan repayment plan</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Due Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRepayments.map((repayment) => (
              <TableRow key={repayment.id}>
                <TableCell>{formatDate(repayment.dueDate)}</TableCell>
                <TableCell>{formatCurrency(repayment.amount)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      repayment.status === 'paid' ? 'default' :
                      repayment.status === 'overdue' ? 'destructive' : 'outline'
                    }
                  >
                    {repayment.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {repayment.paymentDate ? formatDate(repayment.paymentDate) : '-'}
                </TableCell>
                <TableCell className="text-right">
                  {repayment.status === 'pending' && (
                    <Button 
                      size="sm" 
                      onClick={() => handleMakePayment(repayment.id)}
                      disabled={isProcessing}
                    >
                      Make Payment
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 