import { Suspense } from 'react';

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">
          Loading...
        </p>
      </div>
    </div>
  );
}

export default function AuthCallbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      {children}
    </Suspense>
  );
} 