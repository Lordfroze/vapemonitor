'use client';

import { Suspense } from 'react';
import { LoginForm } from './LoginForm';

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4 py-12">
      <div className="w-full max-w-md animate-pulse">
        <div className="h-14 w-14 rounded-xl bg-[var(--color-border)] mx-auto mb-4" />
        <div className="h-8 w-48 bg-[var(--color-border)] rounded mx-auto mb-2" />
        <div className="h-4 w-64 bg-[var(--color-border)] rounded mx-auto mb-8" />
        <div className="space-y-4 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-6">
          <div className="h-10 w-full bg-[var(--color-border)] rounded" />
          <div className="h-10 w-full bg-[var(--color-border)] rounded" />
          <div className="h-12 w-full bg-[var(--color-border)] rounded" />
        </div>
      </div>
    </div>
  );
}