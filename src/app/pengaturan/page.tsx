import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, Shield, Info, Key, Package, Droplet, History, LayoutDashboard, Smartphone } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Pengaturan</h1>
        <p className="page-subtitle">Kelola preferensi aplikasi</p>
      </div>

      {/* Database Info */}
      <div className="settings-section">
        <div className="settings-header">
          <Database className="settings-icon" aria-hidden="true" />
          <h2 className="settings-title">Database</h2>
        </div>
        <div className="space-y-4">
          <div className="settings-row">
            <div>
              <p className="settings-label">Status Koneksi</p>
              <p className="settings-label-sub">Neon PostgreSQL</p>
            </div>
            <Badge variant="success">Terhubung</Badge>
          </div>
          <div className="settings-row">
            <div>
              <p className="settings-label">Driver</p>
              <p className="settings-label-sub">@neondatabase/serverless</p>
            </div>
            <Badge variant="neutral">Serverless</Badge>
          </div>
          <div className="settings-row">
            <div>
              <p className="settings-label">ORM</p>
              <p className="settings-label-sub">Drizzle ORM</p>
            </div>
            <Badge variant="neutral">Type-safe</Badge>
          </div>
          <p className="settings-desc">
            Database di-hosting oleh Neon. Koneksi menggunakan connection pooling untuk performa optimal di lingkungan serverless.
          </p>
        </div>
      </div>

      {/* Security */}
      <div className="settings-section">
        <div className="settings-header">
          <Shield className="settings-icon" aria-hidden="true" />
          <h2 className="settings-title">Keamanan</h2>
        </div>
        <div className="space-y-4">
          <div>
            <p className="settings-label mb-2">Autentikasi</p>
            <p className="settings-desc" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
              Saat ini aplikasi berjalan tanpa autentikasi. Untuk deployment ke production,
              disarankan menambahkan autentikasi menggunakan NextAuth.js atau Clerk.
            </p>
            <Button variant="secondary" className="gap-2 mt-4" disabled>
              <Key className="h-4 w-4" />
              Tambah Autentikasi (Coming Soon)
            </Button>
          </div>
          <div>
            <h4 className="font-medium text-[var(--color-fg)] mb-3">Fitur Keamanan yang Diimplementasikan:</h4>
            <ul className="settings-list">
              <li className="settings-list-item"><span className="settings-list-check" aria-hidden="true">✓</span> Validasi input dengan Zod</li>
              <li className="settings-list-item"><span className="settings-list-check" aria-hidden="true">✓</span> Validasi UUID untuk parameter ID</li>
              <li className="settings-list-item"><span className="settings-list-check" aria-hidden="true">✓</span> Semua operasi DB di server-side</li>
              <li className="settings-list-item"><span className="settings-list-check" aria-hidden="true">✓</span> Environment variables untuk kredensial</li>
              <li className="settings-list-item"><span className="settings-list-check" aria-hidden="true">✓</span> Prepared statements via Drizzle</li>
            </ul>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="settings-section">
        <div className="settings-header">
          <Info className="settings-icon" aria-hidden="true" />
          <h2 className="settings-title">Tentang Aplikasi</h2>
        </div>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="settings-label">Nama</p>
              <p className="text-[var(--color-fg)]">Vape Monitor</p>
            </div>
            <div>
              <p className="settings-label">Versi</p>
              <p className="text-[var(--color-fg)]">1.0.0</p>
            </div>
            <div>
              <p className="settings-label">Framework</p>
              <p className="text-[var(--color-fg)]">Next.js 16 (App Router)</p>
            </div>
            <div>
              <p className="settings-label">Styling</p>
              <p className="text-[var(--color-fg)]">Tailwind CSS 4</p>
            </div>
            <div>
              <p className="settings-label">Database</p>
              <p className="text-[var(--color-fg)]">Neon PostgreSQL</p>
            </div>
            <div>
              <p className="settings-label">ORM</p>
              <p className="text-[var(--color-fg)]">Drizzle ORM</p>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-[var(--color-fg)] mb-3">Fitur:</h4>
            <ul className="settings-list">
              <li className="settings-list-item"><Package className="h-4 w-4 text-[var(--color-accent)]" /> Catatan penggantian cartridge</li>
              <li className="settings-list-item"><Droplet className="h-4 w-4 text-[var(--color-accent)]" /> Catatan pengisian liquid</li>
              <li className="settings-list-item"><History className="h-4 w-4 text-[var(--color-accent)]" /> Riwayat aktivitas tergabung</li>
              <li className="settings-list-item"><LayoutDashboard className="h-4 w-4 text-[var(--color-accent)]" /> Dashboard statistik</li>
              <li className="settings-list-item"><Smartphone className="h-4 w-4 text-[var(--color-accent)]" /> Responsif mobile & desktop</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="settings-section">
        <div className="settings-header">
          <h2 className="settings-title">Tech Stack</h2>
        </div>
        <div className="tech-badges">
          {[
            'Next.js 16',
            'React 19',
            'TypeScript',
            'Tailwind CSS 4',
            'Drizzle ORM',
            'Neon PostgreSQL',
            'Lucide React',
            'Zod',
            'React Hook Form',
            'date-fns',
          ].map((tech) => (
            <span key={tech} className="tech-badge">{tech}</span>
          ))}
        </div>
      </div>
    </div>
  );
}