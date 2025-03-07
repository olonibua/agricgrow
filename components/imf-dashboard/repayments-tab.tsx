'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Search } from "lucide-react";

interface RepaymentsTabProps {
  applications: any[]; // Using any[] to avoid type conflicts
}

export default function RepaymentsTab({ applications }: RepaymentsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter to only approved loans
  const approvedLoans = applications.filter(
    loan => loan.status === 'approved'
  );
  
  // Apply search filter
  const filteredLoans = approvedLoans.filter(loan => 
    loan.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.cropType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.$id?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Loan Repayment Plans</h2>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search loans..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {filteredLoans.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <h3 className="font-medium text-lg mb-2">No Approved Loans Found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Try a different search term." : "There are no approved loans with repayment plans yet."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredLoans.map(loan => (
            <Card key={loan.$id}>
              <CardHeader>
                <CardTitle>{loan.fullName}</CardTitle>
                <CardDescription>
                  {loan.cropType} Loan • {formatCurrency(loan.amount)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Loan ID:</span>
                      <span className="font-medium">{loan.$id.substring(0, 8)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Approved On:</span>
                      <span className="font-medium">{formatDate(loan.approvalDate || '')}</span>
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
      )}
    </div>
  );
} 