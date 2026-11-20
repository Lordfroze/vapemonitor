'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Droplet, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { getHistory, HistoryItem } from '@/actions/history';

interface HistoryListProps {
  initialData: HistoryItem[];
  initialTotal: number;
}

export function HistoryList({ initialData, initialTotal }: HistoryListProps) {
  const [data, setData] = useState<HistoryItem[]>(initialData);
  const [total, setTotal] = useState<number>(initialTotal);
  const [filter, setFilter] = useState<'all' | 'cartridge' | 'liquid'>('all');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const limit = 20;
  const totalPages = Math.ceil(total / limit);

  const fetchData = async () => {
    setIsLoading(true);
    const result = await getHistory(filter === 'all' ? undefined : filter, page, limit);
    if (result.success && result.data) {
      setData(result.data);
      setTotal(typeof result.total === 'number' ? result.total : 0);
    }
    setIsLoading(false);
  };

  const handleFilterChange = (newFilter: 'all' | 'cartridge' | 'liquid') => {
    setFilter(newFilter);
    setPage(1);
  };

  const formatDateTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRelativeTime = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return formatDateTime(date);
  };

  const hasAmount = (item: HistoryItem): item is HistoryItem & { amount: number } => {
    return item.amount !== undefined && item.amount !== null;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Riwayat Aktivitas</h1>
          <p className="page-subtitle">Semua catatan cartridge dan liquid</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === 'all' ? 'primary' : 'secondary'}
          onClick={() => handleFilterChange('all')}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Semua
        </Button>
        <Button
          variant={filter === 'cartridge' ? 'primary' : 'secondary'}
          onClick={() => handleFilterChange('cartridge')}
          className="gap-2"
        >
          <Package className="h-4 w-4" />
          Cartridge
        </Button>
        <Button
          variant={filter === 'liquid' ? 'primary' : 'secondary'}
          onClick={() => handleFilterChange('liquid')}
          className="gap-2"
        >
          <Droplet className="h-4 w-4" />
          Liquid
        </Button>
      </div>

      {/* Timeline */}
      {data.length === 0 ? (
        <div className="empty-state">
          <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h2 className="empty-state-title">
            {filter === 'all' ? 'Belum ada aktivitas' : filter === 'cartridge' ? 'Belum ada catatan cartridge' : 'Belum ada catatan liquid'}
          </h2>
          <p className="empty-state-desc">
            {filter === 'all' ? 'Mulai catat aktivitas pertama Anda' : 'Tambah catatan untuk melihat riwayat di sini'}
          </p>
        </div>
      ) : (
        <>
          <div className="timeline">
            {data.map((item) => (
              <div key={item.id} className="timeline-item">
                <div className="timeline-dot" aria-hidden="true" />
                <div className="timeline-content">
                  <div className="timeline-meta">
                    <Badge variant={item.type === 'cartridge' ? 'accent' : 'neutral'}>
                      {item.type === 'cartridge' ? <Package className="h-3 w-3 mr-1" /> : <Droplet className="h-3 w-3 mr-1" />}
                      {item.type === 'cartridge' ? 'Cartridge' : 'Liquid'}
                    </Badge>
                    <span className="text-mono text-sm text-[var(--color-fg-muted)]">{formatDateTime(item.date)}</span>
                    <span className="text-mono text-xs text-[var(--color-fg-subtle)]">({formatRelativeTime(item.date)})</span>
                  </div>
                  <p className="font-medium text-[var(--color-fg)]">{item.name || 'Tanpa nama'}</p>
                  {hasAmount(item) && (
                    <p className="timeline-amount">{item.amount} ml</p>
                  )}
                  {item.notes && (
                    <p className="timeline-notes">{item.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => { if (page > 1) { setPage(page - 1); fetchData(); }}}
                disabled={page === 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-mono text-sm text-[var(--color-fg-muted)] px-4">
                Halaman {page} dari {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => { if (page < totalPages) { setPage(page + 1); fetchData(); }}}
                disabled={page >= totalPages || isLoading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}