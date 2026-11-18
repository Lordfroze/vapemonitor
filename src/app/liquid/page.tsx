import { LiquidList } from '@/components/liquid/LiquidList';
import { Suspense } from 'react';

export default function LiquidPage() {
  return (
    <Suspense fallback={<LiquidPageSkeleton />}>
      <LiquidPageContent />
    </Suspense>
  );
}

async function LiquidPageContent() {
  const { getLiquidLogs } = await import('@/actions/liquid');
  const logsResult = await getLiquidLogs();
  const logs = logsResult.success && logsResult.data ? logsResult.data : [];

  return <LiquidList initialLogs={logs} />;
}

function LiquidPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="h-8 w-48 bg-slate-800 animate-pulse rounded mb-2" />
          <div className="h-4 w-64 bg-slate-800 animate-pulse rounded" />
        </div>
        <div className="h-10 w-40 bg-slate-800 animate-pulse rounded" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-slate-800 animate-pulse rounded-lg" />
        ))}
      </div>
    </div>
  );
}