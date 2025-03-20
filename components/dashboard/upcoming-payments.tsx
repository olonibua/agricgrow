'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { RepaymentSchedule, LoanApplication } from "@/types/loan";

// Use the same LoanApplication type that's used in the dashboard
interface UpcomingPaymentsProps {
  loans: LoanApplication[]; // Change to any[] to avoid type conflicts
}

export default function UpcomingPayments({ loans }: UpcomingPaymentsProps) {
  // Filter to only approved loans with repayment schedules
  const approvedLoans = loans.filter(
    loan => loan.status === 'approved' && loan.repaymentSchedule && loan.repaymentSchedule.length > 0
  );
  
  // Get all upcoming payments (pending status)
  const allPayments = approvedLoans.flatMap(loan => 
    (loan.repaymentSchedule || [])
      .filter((payment: RepaymentSchedule) => payment.status === 'pending')
      .map((payment: RepaymentSchedule) => ({
        ...payment,
        loanId: loan.$id,
        cropType: loan.cropType
      }))
  );
  
  // Sort by due date (closest first)
  const sortedPayments = allPayments.sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );
  
  // Take only the next 3 payments
  const upcomingPayments = sortedPayments.slice(0, 3);
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium">
            Upcoming Payments
          </CardTitle>
          <CardDescription>
            Your next loan repayments
          </CardDescription>
        </div>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {upcomingPayments.length > 0 ? (
          <div className="space-y-4">
            {upcomingPayments.map(payment => (
              <div key={payment.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{formatCurrency(payment.amount)}</p>
                  <p className="text-xs text-muted-foreground">
                    Due on {formatDate(payment.dueDate)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {payment.cropType} loan
                  </p>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/loans/${payment.loanId}`}>
                    View
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No upcoming payments
          </p>
        )}
        
        {approvedLoans.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/loans">
                View All Loans
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 