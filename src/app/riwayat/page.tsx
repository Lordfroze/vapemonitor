import { HistoryList } from '@/components/history/HistoryList';
import { Suspense } from 'react';

export default function HistoryPage() {
  return (
    <Suspense fallback={<HistoryPageSkeleton />}>
      <HistoryPageContent />
    </Suspense>
  );
}

async function HistoryPageContent() {
  const { getHistory } = await import('@/actions/history');
  const initialResult = await getHistory();
  const initialData = initialResult.success && initialResult.data ? initialResult.data : [];
  const initialTotal = initialResult.success && typeof initialResult.total === 'number' ? initialResult.total : 0;

  return <HistoryList initialData={initialData} initialTotal={initialTotal} />;
}

function HistoryPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="h-8 w-48 bg-slate-800 animate-pulse rounded mb-2" />
          <div className="h-4 w-64 bg-slate-800 animate-pulse rounded" />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 w-32 bg-slate-800 animate-pulse rounded" />
        ))}
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="w-12 h-12 bg-slate-800 animate-pulse rounded-full" />
            <div className="flex-1 h-20 bg-slate-800 animate-pulse rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}