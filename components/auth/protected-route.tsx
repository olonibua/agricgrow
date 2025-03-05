'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
  userType?: 'farmer' | 'imf' | null;
}

export default function ProtectedRoute({ children, userType }: ProtectedRouteProps) {
  const { user, userType: currentUserType, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    } else if (!isLoading && userType && currentUserType !== userType) {
      // Redirect to appropriate dashboard if user type doesn't match
      if (currentUserType === 'farmer') {
        router.push('/dashboard');
      } else if (currentUserType === 'imf') {
        router.push('/imf-dashboard');
      }
    }
  }, [user, userType, currentUserType, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  if (userType && currentUserType !== userType) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
} 