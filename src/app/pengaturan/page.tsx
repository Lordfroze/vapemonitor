import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, Shield, Info, Key, Package, Droplet, History, LayoutDashboard, Smartphone } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Pengaturan</h1>
        <p className="text-slate-400 mt-1">Kelola preferensi aplikasi</p>
      </div>

      {/* Database Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-cyan-400" aria-hidden="true" />
            <CardTitle>Database</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Status Koneksi</p>
              <p className="text-sm text-slate-400">Neon PostgreSQL</p>
            </div>
            <Badge variant="success">Terhubung</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Driver</p>
              <p className="text-sm text-slate-400">@neondatabase/serverless</p>
            </div>
            <Badge variant="secondary">Serverless</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">ORM</p>
              <p className="text-sm text-slate-400">Drizzle ORM</p>
            </div>
            <Badge variant="secondary">Type-safe</Badge>
          </div>
          <div className="pt-4 border-t border-slate-800">
            <p className="text-sm text-slate-400">
              Database di-hosting oleh Neon. Koneksi menggunakan connection pooling untuk performa optimal di lingkungan serverless.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-cyan-400" aria-hidden="true" />
            <CardTitle>Keamanan</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium text-white mb-2">Autentikasi</p>
            <p className="text-sm text-slate-400 mb-4">
              Saat ini aplikasi berjalan tanpa autentikasi. Untuk deployment ke production, 
              disarankan menambahkan autentikasi menggunakan NextAuth.js atau Clerk.
            </p>
            <Button variant="outline" className="gap-2" disabled>
              <Key className="h-4 w-4" />
              Tambah Autentikasi (Coming Soon)
            </Button>
          </div>
          <div className="pt-4 border-t border-slate-800">
            <h4 className="font-medium text-slate-300 mb-2">Fitur Keamanan yang Diimplementasikan:</h4>
            <ul className="space-y-1 text-sm text-slate-400">
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Validasi input dengan Zod</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Validasi UUID untuk parameter ID</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Semua operasi DB di server-side</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Environment variables untuk kredensial</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Prepared statements via Drizzle</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-cyan-400" aria-hidden="true" />
            <CardTitle>Tentang Aplikasi</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="font-medium text-white">Nama</p>
              <p className="text-slate-400">Vape Monitor</p>
            </div>
            <div>
              <p className="font-medium text-white">Versi</p>
              <p className="text-slate-400">1.0.0</p>
            </div>
            <div>
              <p className="font-medium text-white">Framework</p>
              <p className="text-slate-400">Next.js 16 (App Router)</p>
            </div>
            <div>
              <p className="font-medium text-white">Styling</p>
              <p className="text-slate-400">Tailwind CSS 4</p>
            </div>
            <div>
              <p className="font-medium text-white">Database</p>
              <p className="text-slate-400">Neon PostgreSQL</p>
            </div>
            <div>
              <p className="font-medium text-white">ORM</p>
              <p className="text-slate-400">Drizzle ORM</p>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-800">
            <h4 className="font-medium text-slate-300 mb-2">Fitur:</h4>
            <ul className="space-y-1 text-sm text-slate-400">
              <li className="flex items-center gap-2"><Package className="h-4 w-4 text-cyan-400" /> Catatan penggantian cartridge</li>
              <li className="flex items-center gap-2"><Droplet className="h-4 w-4 text-cyan-400" /> Catatan pengisian liquid</li>
              <li className="flex items-center gap-2"><History className="h-4 w-4 text-cyan-400" /> Riwayat aktivitas tergabung</li>
              <li className="flex items-center gap-2"><LayoutDashboard className="h-4 w-4 text-cyan-400" /> Dashboard statistik</li>
              <li className="flex items-center gap-2"><Smartphone className="h-4 w-4 text-cyan-400" /> Responsif mobile & desktop</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Tech Stack */}
      <Card>
        <CardHeader>
          <CardTitle>Tech Stack</CardTitle>
          <CardDescription>Teknologi yang digunakan dalam pengembangan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
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
              <Badge key={tech} variant="outline">{tech}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}