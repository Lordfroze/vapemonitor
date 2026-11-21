import { Metadata } from 'next';
import { requireAdmin } from '@/actions/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Admin - Vape Monitor',
  description: 'Panel administrasi Vape Monitor',
};

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  
  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Panel Admin</h1>
            <p className="page-subtitle">Kelola pengguna dan pengaturan sistem</p>
          </div>
          <span className="px-3 py-1 text-xs font-medium bg-[var(--color-accent)]/20 text-[var(--color-accent)] rounded-full">
            Admin: {admin.name}
          </span>
        </div>
      </div>

      {children}
    </div>
  );
}