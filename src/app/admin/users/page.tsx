'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Key,
  Loader2,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import {
  getUsersAction,
  createUserAction,
  updateUserAction,
  deleteUserAction,
  toggleUserStatusAction,
  resetUserPasswordAction,
} from '@/actions/admin';

interface User {
  id: string;
  email: string;
  name: string;
  role: string; // Database returns string, we'll cast when needed
  isActive: boolean;
  lastLoginAt: Date | string | null;
  createdAt: Date | string | null;
}

interface UsersResponse {
  users: User[];
  total: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const searchParams = useSearchParams();
  const { addToast } = useToast();

  // State
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null);
  const [resetPasswordConfirm, setResetPasswordConfirm] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'user' as 'user' | 'admin',
    isActive: true,
  });

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getUsersAction({
        page,
        limit,
        search,
        role: roleFilter,
        isActive: statusFilter,
      });
      setUsers(result.users);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (error) {
      addToast({ type: 'error', title: 'Gagal memuat data', message: 'Silakan coba lagi' });
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, roleFilter, statusFilter, addToast]);

  // Load initial data and when params change
  const initialPage = Number(searchParams.get('page')) || 1;
  const initialSearch = searchParams.get('search') || '';
  const initialRole = searchParams.get('role') || '';
  const initialStatus = searchParams.get('status') || '';

  useEffect(() => {
    setPage(initialPage);
    setSearch(initialSearch);
    setRoleFilter(initialRole);
    setStatusFilter(initialStatus);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Open create modal
  const openCreateModal = () => {
    setFormData({ email: '', password: '', name: '', role: 'user', isActive: true });
    setIsCreateOpen(true);
  };

  // Open edit modal
  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      name: user.name,
      role: user.role as 'user' | 'admin',
      isActive: user.isActive,
    });
    setIsEditOpen(true);
  };

  // Close modals
  const closeModals = () => {
    setIsCreateOpen(false);
    setIsEditOpen(false);
    setEditingUser(null);
    setFormData({ email: '', password: '', name: '', role: 'user', isActive: true });
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formDataObj = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          formDataObj.append(key, String(value));
        }
      });

      if (isCreateOpen) {
        const result = await createUserAction(formDataObj);
        if (result.success) {
          addToast({ type: 'success', title: 'User dibuat', message: `${result.user?.name} telah ditambahkan` });
          closeModals();
          fetchUsers();
        } else {
          addToast({ type: 'error', title: 'Gagal membuat user', message: Object.values(result.error || {}).flat().join(', ') });
        }
      } else if (isEditOpen && editingUser) {
        const result = await updateUserAction(editingUser.id, formDataObj);
        if (result.success) {
          addToast({ type: 'success', title: 'User diperbarui', message: `${result.user?.name} telah diperbarui` });
          closeModals();
          fetchUsers();
        } else {
          addToast({ type: 'error', title: 'Gagal memperbarui user', message: Object.values(result.error || {}).flat().join(', ') });
        }
      }
    } catch {
      addToast({ type: 'error', title: 'Terjadi kesalahan', message: 'Silakan coba lagi' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle user status
  const handleToggleStatus = async (user: User) => {
    try {
      const result = await toggleUserStatusAction(user.id);
      if (result.success) {
        addToast({ type: 'success', title: 'Status diperbarui', message: `${user.name} sekarang ${result.user?.isActive ? 'aktif' : 'nonaktif'}` });
        fetchUsers();
      } else {
        addToast({ type: 'error', title: 'Gagal mengubah status', message: result.error });
      }
    } catch {
      addToast({ type: 'error', title: 'Terjadi kesalahan', message: 'Silakan coba lagi' });
    }
  };

  // Confirm delete
  const confirmDelete = (user: User) => {
    setDeleteConfirm(user);
  };

  // Execute delete
  const executeDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const result = await deleteUserAction(deleteConfirm.id);
      if (result.success) {
        addToast({ type: 'success', title: 'User dihapus', message: `${deleteConfirm.name} telah dihapus` });
        fetchUsers();
      } else {
        addToast({ type: 'error', title: 'Gagal menghapus user', message: result.error });
      }
    } catch {
      addToast({ type: 'error', title: 'Terjadi kesalahan', message: 'Silakan coba lagi' });
    } finally {
      setDeleteConfirm(null);
    }
  };

  // Reset password
  const confirmResetPassword = (user: User) => {
    setResetPasswordConfirm(user);
  };

  const executeResetPassword = async () => {
    if (!resetPasswordConfirm) return;
    try {
      const result = await resetUserPasswordAction(resetPasswordConfirm.id);
      if (result.success && result.newPassword) {
        setNewPassword(result.newPassword);
        addToast({ type: 'success', title: 'Password direset', message: `Password baru: ${result.newPassword}` });
      } else {
        addToast({ type: 'error', title: 'Gagal reset password', message: result.error });
      }
    } catch {
      addToast({ type: 'error', title: 'Terjadi kesalahan', message: 'Silakan coba lagi' });
    } finally {
      setResetPasswordConfirm(null);
    }
  };

  // Format date
  const formatDate = (date: Date | string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-heading text-xl font-medium">Manajemen User</h2>
          <p className="text-sm text-[var(--color-fg-muted)]">Kelola akun pengguna dan hak akses</p>
        </div>
        <Button onClick={openCreateModal} size="lg">
          <Plus className="h-4 w-4" />
          Tambah User
        </Button>
      </div>

      {/* Filters */}
      <Card variant="panel" className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Input
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (setPage(1), fetchUsers())}
            className="max-w-xs"
          >
            <Search className="h-4 w-4 absolute right-3 top-[38px] text-[var(--color-fg-muted)]" aria-hidden="true" />
          </Input>
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); fetchUsers(); }}
            className="input"
          >
            <option value="">Semua Role</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); fetchUsers(); }}
            className="input"
          >
            <option value="">Semua Status</option>
            <option value="true">Aktif</option>
            <option value="false">Nonaktif</option>
          </select>
          <Button variant="ghost" onClick={() => { setSearch(''); setRoleFilter(''); setStatusFilter(''); setPage(1); fetchUsers(); }}>
            Reset Filter
          </Button>
        </div>
      </Card>

      {/* Users Table */}
      <Card variant="elevated">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)] mx-auto mb-2" />
              <p className="text-[var(--color-fg-muted)]">Memuat data...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-[var(--color-fg-muted)]">Tidak ada user ditemukan</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full" role="table">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-fg-muted)] uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-fg-muted)] uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-fg-muted)] uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-fg-muted)] uppercase tracking-wider">Terakhir Login</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-fg-muted)] uppercase tracking-wider">Dibuat</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-[var(--color-fg-muted)] uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-[var(--color-bg)]/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-[var(--color-fg)]">{user.name}</p>
                            <p className="text-sm text-[var(--color-fg-muted)] truncate max-w-xs">{user.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={user.role === 'admin' ? 'accent' : 'neutral'}>
                            {user.role === 'admin' ? (
                              <>
                                <Shield className="h-3 w-3 mr-1" />
                                Admin
                              </>
                            ) : 'User'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={user.isActive ? 'success' : 'neutral'}>
                            {user.isActive ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-[var(--color-fg-muted)]">
                          {formatDate(user.lastLoginAt)}
                        </td>
                        <td className="px-6 py-4 text-sm text-[var(--color-fg-muted)]">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => openEditModal(user)}
                              aria-label={`Edit ${user.name}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleToggleStatus(user)}
                              aria-label={user.isActive ? `Nonaktifkan ${user.name}` : `Aktifkan ${user.name}`}
                            >
                              {user.isActive ? (
                                <UserX className="h-4 w-4 text-[var(--color-fg-muted)]" />
                              ) : (
                                <UserCheck className="h-4 w-4 text-green-500" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => confirmResetPassword(user)}
                              aria-label={`Reset password ${user.name}`}
                            >
                              <Key className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => confirmDelete(user)}
                              aria-label={`Hapus ${user.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-[var(--color-border)] flex items-center justify-between">
                  <p className="text-sm text-[var(--color-fg-muted)]">
                    Menampilkan {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} dari {total} user
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create User Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="w-full max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Tambah User Baru</DialogTitle>
              <DialogDescription>Isi formulir di bawah untuk membuat user baru</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                name="name"
                label="Nama Lengkap"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
                error={!formData.name && isSubmitting ? 'Nama wajib diisi' : undefined}
              />
              <Input
                name="email"
                type="email"
                label="Email"
                placeholder="user@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                error={!formData.email && isSubmitting ? 'Email wajib diisi' : undefined}
              />
              <Input
                name="password"
                type="password"
                label="Password"
                placeholder="Minimal 8 karakter"
                value={formData.password}
                onChange={handleChange}
                required
                error={formData.password.length > 0 && formData.password.length < 8 ? 'Minimal 8 karakter' : undefined}
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    name="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                  />
                  <span className="text-sm text-[var(--color-fg)]">Aktif</span>
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={closeModals} disabled={isSubmitting}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="w-full max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Kosongkan password jika tidak ingin mengubahnya</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                name="name"
                label="Nama Lengkap"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <Input
                name="email"
                type="email"
                label="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <Input
                name="password"
                type="password"
                label="Password Baru (opsional)"
                placeholder="Kosongkan jika tidak diubah"
                value={formData.password}
                onChange={handleChange}
                error={formData.password.length > 0 && formData.password.length < 8 ? 'Minimal 8 karakter' : undefined}
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    name="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                  />
                  <span className="text-sm text-[var(--color-fg)]">Aktif</span>
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={closeModals} disabled={isSubmitting}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan Perubahan'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Modal */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="w-full max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus User</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus <strong>{deleteConfirm?.name}</strong> ({deleteConfirm?.email})?
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
              Batal
            </Button>
            <Button variant="danger" onClick={executeDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Confirm Modal */}
      <Dialog open={!!resetPasswordConfirm} onOpenChange={() => setResetPasswordConfirm(null)}>
        <DialogContent className="w-full max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin mereset password untuk <strong>{resetPasswordConfirm?.name}</strong>?
              Password baru akan di-generate otomatis.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setResetPasswordConfirm(null)}>
              Batal
            </Button>
            <Button variant="primary" onClick={executeResetPassword}>
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Password Toast Modal */}
      {newPassword && (
        <Dialog open={!!newPassword} onOpenChange={() => setNewPassword('')}>
          <DialogContent className="w-full max-w-md">
            <DialogHeader>
              <DialogTitle>Password Baru Dibuat</DialogTitle>
              <DialogDescription>
                Simpan password ini dengan aman. Password tidak akan ditampilkan lagi.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 bg-[var(--color-bg)] rounded-[var(--radius-md)] font-mono text-lg break-all">
                {newPassword}
              </div>
              <p className="text-sm text-[var(--color-fg-muted)] mt-2">Klik OK untuk menutup</p>
            </div>
            <DialogFooter>
              <Button onClick={() => setNewPassword('')}>OK, Saya Sudah Catat</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}