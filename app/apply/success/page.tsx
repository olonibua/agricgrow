'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get('id');

  return (
    <div className="container max-w-lg py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <CardTitle>Application Submitted!</CardTitle>
          </div>
          <CardDescription>
            Your loan application has been received successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            Application ID: <span className="font-mono">{applicationId}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            We will review your application and get back to you within 2-3 business days.
          </p>
          <div className="flex justify-end">
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
} 