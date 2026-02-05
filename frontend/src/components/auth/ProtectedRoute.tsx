'use client';

import React from 'react';
import { useAuth } from '../../app/lib/auth/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback = <div>Loading...</div>
}) => {
  const { state } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Exclude /chat from auth protection - it handles its own logic
  const isChatRoute = pathname === '/chat';

  useEffect(() => {
    // Don't redirect if on /chat page - it handles its own auth logic
    if (!isChatRoute && !state.isLoading && !state.isAuthenticated) {
      // Redirect to login page if not authenticated
      router.push('/auth/login');
    }
  }, [state, router, pathname, isChatRoute]);

  // Don't apply protection to /chat page - it handles its own auth logic
  if (isChatRoute) {
    return <>{children}</>;
  }

  // Show fallback while checking auth status or if not authenticated
  if (state.isLoading || !state.isAuthenticated) {
    return fallback;
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;