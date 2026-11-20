import { CartridgeList } from '@/components/cartridge/CartridgeList';
import { Suspense } from 'react';

export default function CartridgePage() {
  return (
    <Suspense fallback={<CartridgePageSkeleton />}>
      <CartridgePageContent />
    </Suspense>
  );
}

async function CartridgePageContent() {
  const { getCartridgeLogs } = await import('@/actions/cartridge');
  const logsResult = await getCartridgeLogs();
  const logs = logsResult.success && logsResult.data ? logsResult.data : [];

  return <CartridgeList initialLogs={logs} />;
}

function CartridgePageSkeleton() {
  return (
    <div className="space-y-8">
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="h-8 w-48 bg-[var(--color-border)] animate-pulse rounded mb-2" />
          <div className="h-4 w-64 bg-[var(--color-border)] animate-pulse rounded" />
        </div>
        <div className="h-10 w-40 bg-[var(--color-border)] animate-pulse rounded" />
      </div>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-[var(--radius-md)] animate-pulse" />
        ))}
      </div>
    </div>
  );
}