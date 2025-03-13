'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'react-oidc-context';

export default function AuthCallback() {
  const router = useRouter();
  const auth = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // The auth context will automatically process the authentication response
    
    // Check if we're in the middle of signing in
    if (auth.isLoading) {
      return; // Still loading, wait
    }

    // Check for authentication errors
    if (auth.error) {
      setError(`Authentication error: ${auth.error.message}`);
      return;
    }

    // If authentication is complete, redirect to the main scenario page
    if (auth.isAuthenticated) {
      router.replace('/scenario1');
    } else if (!auth.isLoading && !auth.error) {
      // If not authenticated and not loading, redirect to the main page
      // This handles cases where the user may have navigated to callback directly
      router.replace('/scenario1');
    }
  }, [auth.isAuthenticated, auth.isLoading, auth.error, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      {auth.isLoading ? (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-xl">Completing authentication...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
          <div className="mt-3">
            <button 
              onClick={() => router.push('/scenario1')}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              Return to login
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-xl">Redirecting you...</p>
        </div>
      )}
    </div>
  );
}
