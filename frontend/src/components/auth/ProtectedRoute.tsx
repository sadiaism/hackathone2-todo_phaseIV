import React from 'react';
import { useAuth } from '../../app/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
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

  useEffect(() => {
    if (!state.isLoading && !state.isAuthenticated) {
      // Redirect to login page if not authenticated
      router.push('/auth/login');
    }
  }, [state, router]);

  // Show fallback while checking auth status or if not authenticated
  if (state.isLoading || !state.isAuthenticated) {
    return fallback;
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;