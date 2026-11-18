import { getDashboardStats } from '@/actions/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDateTime, formatRelativeTime } from '@/lib/utils';
import { Package, Droplet, Clock, Calendar, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export async function DashboardContent() {
  const statsResult = await getDashboardStats();
  const stats = statsResult.success ? statsResult.data : null;

  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Cartridge</CardTitle>
            <Package className="h-5 w-5 text-cyan-400" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {stats?.totalCartridgeChanges || 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">Kali penggantian</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Liquid</CardTitle>
            <Droplet className="h-5 w-5 text-cyan-400" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {stats?.totalLiquidRefills || 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">Kali pengisian</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Cartridge Terakhir</CardTitle>
            <Calendar className="h-5 w-5 text-cyan-400" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            {stats?.lastCartridgeChange ? (
              <>
                <div className="text-lg font-medium text-white">
                  {formatDateTime(stats.lastCartridgeChange)}
                </div>
                <div className="flex items-center gap-1 text-sm text-slate-400 mt-1">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{formatRelativeTime(stats.lastCartridgeChange)}</span>
                </div>
              </>
            ) : (
              <div className="text-slate-500 text-center py-4">
                <p className="font-medium">Belum ada catatan</p>
                <p className="text-sm mt-1">Tambah catatan pertama Anda</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Liquid Terakhir</CardTitle>
            <Calendar className="h-5 w-5 text-cyan-400" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            {stats?.lastLiquidRefill ? (
              <>
                <div className="text-lg font-medium text-white">
                  {formatDateTime(stats.lastLiquidRefill)}
                </div>
                <div className="flex items-center gap-1 text-sm text-slate-400 mt-1">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{formatRelativeTime(stats.lastLiquidRefill)}</span>
                </div>
              </>
            ) : (
              <div className="text-slate-500 text-center py-4">
                <p className="font-medium">Belum ada catatan</p>
                <p className="text-sm mt-1">Tambah catatan pertama Anda</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monitor Cards */}
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
        {/* Cartridge Monitor */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-cyan-400" aria-hidden="true" />
                Cartridge Monitor
              </CardTitle>
              <Badge variant="secondary">Penggantian</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {stats?.lastCartridgeChange ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-600/20">
                      <Package className="h-5 w-5 text-cyan-400" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Terakhir diganti</p>
                      <p className="text-sm text-slate-400">{formatDateTime(stats.lastCartridgeChange)}</p>
                    </div>
                  </div>
                  <Badge variant="success">{stats.timeSinceCartridgeChange}</Badge>
                </div>
                <Link href="/cartridge" className="block text-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                  Lihat riwayat cartridge →
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-slate-600 mx-auto mb-3" aria-hidden="true" />
                <p className="text-slate-400 mb-2">Belum ada catatan cartridge</p>
                <Link href="/cartridge">
                  <Button variant="outline" className="w-full sm:w-auto gap-2">
                    <Plus className="h-4 w-4" />
                    Tambah Catatan Pertama
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Liquid Monitor */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Droplet className="h-5 w-5 text-cyan-400" aria-hidden="true" />
                Liquid Monitor
              </CardTitle>
              <Badge variant="secondary">Pengisian</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {stats?.lastLiquidRefill ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-600/20">
                      <Droplet className="h-5 w-5 text-cyan-400" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Terakhir diisi</p>
                      <p className="text-sm text-slate-400">{formatDateTime(stats.lastLiquidRefill)}</p>
                    </div>
                  </div>
                  <Badge variant="success">{stats.timeSinceLiquidRefill}</Badge>
                </div>
                <Link href="/liquid" className="block text-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                  Lihat riwayat liquid →
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <Droplet className="h-12 w-12 text-slate-600 mx-auto mb-3" aria-hidden="true" />
                <p className="text-slate-400 mb-2">Belum ada catatan liquid</p>
                <Link href="/liquid">
                  <Button variant="outline" className="w-full sm:w-auto gap-2">
                    <Plus className="h-4 w-4" />
                    Tambah Catatan Pertama
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}