import { Suspense } from 'react';
import { DashboardContent } from './DashboardContent';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header - minimal, no action buttons (they're in quick actions now) */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Pantau status cartridge & liquid secara real-time</p>
      </div>

      {/* Dashboard Content with Suspense */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Metrics Panel Skeleton */}
      <div className="metrics-panel">
        {[1, 2].map((i) => (
          <div key={i} className="metric-primary">
            <div className="metric-header">
              <div className="h-3 w-24 bg-[var(--color-border)] animate-pulse rounded" />
              <div className="h-3 w-16 bg-[var(--color-border)] animate-pulse rounded" />
            </div>
            <div className="metric-value-row">
              <div className="h-14 w-32 bg-[var(--color-border)] animate-pulse rounded" />
              <div className="w-2.5 h-2.5 bg-[var(--color-border)] animate-pulse rounded-full" />
            </div>
            <div className="metric-sub">
              <div className="h-3 w-40 bg-[var(--color-border)] animate-pulse rounded" />
              <div className="h-3 w-56 bg-[var(--color-border)] animate-pulse rounded" />
            </div>
            <div className="metric-action h-5 w-32 bg-[var(--color-border)] animate-pulse rounded" />
          </div>
        ))}
      </div>

      {/* Compact Stats Skeleton */}
      <div className="stat-grid compact">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="stat-item">
            <div className="h-3 w-32 bg-[var(--color-border)] animate-pulse rounded mb-2" />
            <div className="h-9 w-20 bg-[var(--color-border)] animate-pulse rounded" />
          </div>
        ))}
      </div>

      {/* Activity Panel Skeleton */}
      <div className="activity-panel">
        <div className="activity-header">
          <div className="h-5 w-32 bg-[var(--color-border)] animate-pulse rounded" />
          <div className="h-5 w-20 bg-[var(--color-border)] animate-pulse rounded" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="activity-item">
            <div className="w-9 h-9 bg-[var(--color-border)] animate-pulse rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 bg-[var(--color-border)] animate-pulse rounded" />
              <div className="h-3 w-48 bg-[var(--color-border)] animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions Skeleton */}
      <div className="quick-actions">
        {[1, 2, 3].map((i) => (
          <div key={i} className="quick-action">
            <div className="w-11 h-11 bg-[var(--color-border)] animate-pulse rounded" />
            <div className="flex-1 space-y-1">
              <div className="h-4 w-32 bg-[var(--color-border)] animate-pulse rounded" />
              <div className="h-3 w-40 bg-[var(--color-border)] animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}