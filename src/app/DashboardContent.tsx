import { getDashboardStats } from '@/actions/dashboard';
import { getHistory } from '@/actions/history';
import { Badge } from '@/components/ui/badge';
import { formatDateTime, formatRelativeTime } from '@/lib/utils';
import { Package, Droplet, Clock, AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export async function DashboardContent() {
  const [statsResult, historyResult] = await Promise.all([
    getDashboardStats(),
    getHistory(undefined, 1, 5),
  ]);
  
  const stats = statsResult.success ? statsResult.data : null;
  const recentActivity = historyResult.success && historyResult.data ? historyResult.data : [];

  // Calculate status indicators
  const cartridgeHours = stats?.lastCartridgeChange 
    ? Math.floor((Date.now() - new Date(stats.lastCartridgeChange).getTime()) / 3600000)
    : null;
  const liquidHours = stats?.lastLiquidRefill
    ? Math.floor((Date.now() - new Date(stats.lastLiquidRefill).getTime()) / 3600000)
    : null;
  
  // Typical coil life: 7-14 days (168-336 hours), liquid refill: 1-3 days
  const cartridgeStatus = cartridgeHours === null ? 'unknown' 
    : cartridgeHours > 336 ? 'critical' 
    : cartridgeHours > 168 ? 'warning' 
    : 'good';
  const liquidStatus = liquidHours === null ? 'unknown'
    : liquidHours > 72 ? 'critical'
    : liquidHours > 48 ? 'warning'
    : 'good';

  return (
    <>
      {/* Primary Metrics Row - Instrument panel style */}
      <div className="metrics-panel" role="region" aria-label="Metrik utama">
        <div className={`metric-primary ${cartridgeStatus !== 'unknown' ? cartridgeStatus : ''}`}>
          <div className="metric-header">
            <span className="metric-type">CARTRIDGE</span>
            <span className="metric-unit">JAM</span>
          </div>
          <div className="metric-value-row">
            <div className="metric-main text-mono">
              {cartridgeHours !== null ? cartridgeHours : '—'}
            </div>
            <div className="metric-status">
              {cartridgeStatus === 'good' && (
                <span className="status-dot good" aria-label="Cartridge normal" />
              )}
              {cartridgeStatus === 'warning' && (
                <span className="status-dot warning" aria-label="Cartridge usia sedang" />
              )}
              {cartridgeStatus === 'critical' && (
                <span className="status-dot critical" aria-label="Cartridge perlu diganti" />
              )}
              {cartridgeStatus === 'unknown' && (
                <span className="status-dot unknown" aria-label="Belum ada data" />
              )}
            </div>
          </div>
          <div className="metric-sub">
            <span className="metric-label">sejak penggantian terakhir</span>
            {cartridgeStatus === 'warning' && (
              <span className="metric-hint">⚠ Coil mendekati batas umur (7-14 hari)</span>
            )}
            {cartridgeStatus === 'critical' && (
              <span className="metric-hint critical">⛔ Coil melebihi umur pakai — ganti segera</span>
            )}
            {cartridgeStatus === 'unknown' && (
              <span className="metric-hint">Belum ada catatan penggantian</span>
            )}
          </div>
          <Link href="/cartridge" className="metric-action">
            <span>Catat penggantian</span>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </Link>
        </div>

        <div className={`metric-primary ${liquidStatus !== 'unknown' ? liquidStatus : ''}`}>
          <div className="metric-header">
            <span className="metric-type">LIQUID</span>
            <span className="metric-unit">JAM</span>
          </div>
          <div className="metric-value-row">
            <div className="metric-main text-mono">
              {liquidHours !== null ? liquidHours : '—'}
            </div>
            <div className="metric-status">
              {liquidStatus === 'good' && (
                <span className="status-dot good" aria-label="Liquid normal" />
              )}
              {liquidStatus === 'warning' && (
                <span className="status-dot warning" aria-label="Liquid mulai menipis" />
              )}
              {liquidStatus === 'critical' && (
                <span className="status-dot critical" aria-label="Liquid kosong" />
              )}
              {liquidStatus === 'unknown' && (
                <span className="status-dot unknown" aria-label="Belum ada data" />
              )}
            </div>
          </div>
          <div className="metric-sub">
            <span className="metric-label">sejak pengisian terakhir</span>
            {liquidStatus === 'warning' && (
              <span className="metric-hint">⚠ Liquid menipis — siapkan refill</span>
            )}
            {liquidStatus === 'critical' && (
              <span className="metric-hint critical">⛔ Liquid habis — isi segera untuk hindari dry hit</span>
            )}
            {liquidStatus === 'unknown' && (
              <span className="metric-hint">Belum ada catatan pengisian</span>
            )}
          </div>
          <Link href="/liquid" className="metric-action">
            <span>Catat pengisian</span>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </Link>
        </div>
      </div>

      {/* Secondary Stats - Compact row */}
      <div className="stat-grid compact" role="region" aria-label="Statistik ringkas">
        <div className="stat-item">
          <div className="stat-label">Total Ganti Cartridge</div>
          <div className="stat-value text-mono stat-accent">{stats?.totalCartridgeChanges || 0}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Total Isi Liquid</div>
          <div className="stat-value text-mono stat-accent">{stats?.totalLiquidRefills || 0}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Cartridge Terakhir</div>
          {stats?.lastCartridgeChange ? (
            <>
              <div className="stat-value text-mono text-sm font-body">{formatDateTime(stats.lastCartridgeChange)}</div>
              <div className="stat-sub">{formatRelativeTime(stats.lastCartridgeChange)}</div>
            </>
          ) : (
            <div className="stat-value text-mono text-sm font-body text-[var(--color-fg-muted)]">—</div>
          )}
        </div>
        <div className="stat-item">
          <div className="stat-label">Liquid Terakhir</div>
          {stats?.lastLiquidRefill ? (
            <>
              <div className="stat-value text-mono text-sm font-body">{formatDateTime(stats.lastLiquidRefill)}</div>
              <div className="stat-sub">{formatRelativeTime(stats.lastLiquidRefill)}</div>
            </>
          ) : (
            <div className="stat-value text-mono text-sm font-body text-[var(--color-fg-muted)]">—</div>
          )}
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="activity-panel" role="region" aria-label="Aktivitas terbaru">
        <div className="activity-header">
          <h2 className="activity-title">Aktivitas Terbaru</h2>
          <Link href="/riwayat" className="activity-view-all">Lihat semua →</Link>
        </div>
        
        {recentActivity.length === 0 ? (
          <div className="activity-empty">
            <svg className="activity-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="activity-empty-text">Belum ada aktivitas</p>
            <p className="activity-empty-sub">Mulai catat penggantian cartridge atau pengisian liquid pertama Anda</p>
            <div className="activity-empty-actions">
              <a href="/cartridge"><Button variant="primary" className="gap-2"><Package className="h-4 w-4" /> Cartridge</Button></a>
              <a href="/liquid"><Button variant="secondary" className="gap-2"><Droplet className="h-4 w-4" /> Liquid</Button></a>
            </div>
          </div>
        ) : (
          <div className="activity-list">
            {recentActivity.map((item) => (
              <Link key={item.id} href={item.type === 'cartridge' ? '/cartridge' : '/liquid'} className="activity-item">
                <div className={`activity-indicator ${item.type}`} aria-hidden="true">
                  {item.type === 'cartridge' ? <Package className="h-4 w-4" /> : <Droplet className="h-4 w-4" />}
                </div>
                <div className="activity-content">
                  <div className="activity-main">
                    <span className="activity-name">{item.name || 'Tanpa nama'}</span>
                    <span className="activity-time text-mono">{formatRelativeTime(item.date)}</span>
                  </div>
                  <div className="activity-meta">
                    <span className="activity-type text-mono text-xs">
                      {item.type === 'cartridge' ? 'Penggantian cartridge' : 'Pengisian liquid'}
                    </span>
                    {'amount' in item && item.amount !== undefined && item.amount !== null && (
                      <span className="activity-amount text-mono">{item.amount} ml</span>
                    )}
                  </div>
                  {item.notes && (
                    <p className="activity-notes">{item.notes}</p>
                  )}
                </div>
                <svg className="activity-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions" role="region" aria-label="Aksi cepat">
        <a href="/cartridge" className="quick-action primary">
          <div className="quick-action-icon" aria-hidden="true"><Package className="h-5 w-5" /></div>
          <div className="quick-action-content">
            <span className="quick-action-title">Ganti Cartridge</span>
            <span className="quick-action-desc">Catat penggantian coil/cartridge baru</span>
          </div>
        </a>
        <a href="/liquid" className="quick-action secondary">
          <div className="quick-action-icon" aria-hidden="true"><Droplet className="h-5 w-5" /></div>
          <div className="quick-action-content">
            <span className="quick-action-title">Isi Liquid</span>
            <span className="quick-action-desc">Catat pengisian ulang liquid</span>
          </div>
        </a>
        <a href="/riwayat" className="quick-action tertiary">
          <div className="quick-action-icon" aria-hidden="true"><Clock className="h-5 w-5" /></div>
          <div className="quick-action-content">
            <span className="quick-action-title">Riwayat Lengkap</span>
            <span className="quick-action-desc">Lihat dan filter semua catatan</span>
          </div>
        </a>
      </div>
    </>
  );
}