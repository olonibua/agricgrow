'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";


interface RepaymentsTabProps {
  loans: any[]; // Using any[] to avoid type conflicts
}

export default function RepaymentsTab({ loans }: RepaymentsTabProps) {
  // Filter to only approved loans
  const approvedLoans = loans.filter(
    loan => loan.status === 'approved'
  );
  
  if (approvedLoans.length === 0) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="text-center">
            <h3 className="font-medium text-lg mb-2">No Approved Loans</h3>
            <p className="text-muted-foreground mb-4">
              You don't have any approved loans with repayment schedules yet.
            </p>
            <Button asChild>
              <Link href="/apply">Apply for a Loan</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Approved Loans</h2>
      <p className="text-muted-foreground">
        Click on "View Repayment Plan" to see the detailed payment schedule for each loan.
      </p>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {approvedLoans.map(loan => (
          <Card key={loan.$id}>
            <CardHeader>
              <CardTitle>{loan.cropType} Loan</CardTitle>
              <CardDescription>
                Approved on {formatDate(loan.approvalDate || '')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Loan Amount:</span>
                    <span className="font-medium">{formatCurrency(loan.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Interest Rate:</span>
                    <span className="font-medium">{loan.interestRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Repayment Period:</span>
                    <span className="font-medium">{loan.repaymentPeriodMonths} months</span>
                  </div>
                </div>
                
                <Button className="w-full" asChild>
                  <Link href={`/loans/${loan.$id}/repayments`}>
                    View Repayment Plan
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 