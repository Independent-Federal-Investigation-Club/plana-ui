'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle } from 'lucide-react';

export default function AuthCallback() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Completing authentication...');

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    
    
    // This page only handles redirect flow
    // Popup flow is handled directly by backend HTML response
    if (error) {
      setStatus('error');
      setMessage('Authentication failed. Redirecting...');
      setTimeout(() => {
        window.location.href = `/?error=${encodeURIComponent(error)}`;
      }, 2000);
    } else if (token) {
      setStatus('success');
      setMessage('Authentication successful! Redirecting to dashboard...');
      
      // Store token and redirect to dashboard
      localStorage.setItem('auth_token', token);
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    } else {
      setStatus('error');
      setMessage('Authentication failed. Redirecting...');
      setTimeout(() => {
        window.location.href = '/?error=oauth_failed';
      }, 2000);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-6">
          {status === 'loading' && (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          )}
          {status === 'success' && (
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
          )}
          {status === 'error' && (
            <XCircle className="h-12 w-12 text-red-500 mx-auto" />
          )}
        </div>
        
        <h1 className="text-xl font-semibold mb-2">
          {status === 'loading' && 'Authenticating...'}
          {status === 'success' && 'Success!'}
          {status === 'error' && 'Authentication Failed'}
        </h1>
        
        <p className="text-muted-foreground mb-4">
          {message}
        </p>
      </div>
    </div>
  );
} 