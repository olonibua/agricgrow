'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export default function LoanApplicationSuccessPage() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get('id');
  
  return (
    <div className="max-w-md mx-auto p-6">
      <Card className="border-green-200">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-700">Application Submitted!</CardTitle>
          <CardDescription>Your loan application has been received</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">Thank you for applying for an agricultural loan with AgriGrow Finance.</p>
          <p className="mb-4">Your application ID is: <span className="font-mono font-bold">{applicationId}</span></p>
          <p>We will review your application and get back to you shortly. You will receive updates via email and SMS.</p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button asChild variant="outline">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 