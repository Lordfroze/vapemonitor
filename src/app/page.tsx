import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDateTime, formatRelativeTime } from '@/lib/utils';
import { Package, Droplet, Clock, Calendar, Plus } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { DashboardContent } from './DashboardContent';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Pantau riwayat cartridge dan liquid Anda</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/cartridge">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Ganti Cartridge
            </Button>
          </Link>
          <Link href="/liquid">
            <Button size="sm" variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Isi Liquid
            </Button>
          </Link>
        </div>
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
      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-slate-800 animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-10 w-20 bg-slate-800 animate-pulse rounded mb-2" />
              <div className="h-3 w-32 bg-slate-800 animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Monitor Cards Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-5 w-40 bg-slate-800 animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-slate-800 animate-pulse rounded mb-4" />
              <div className="h-10 w-48 bg-slate-800 animate-pulse rounded mx-auto" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}