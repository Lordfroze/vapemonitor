'use client';

import { CartridgeForm } from '@/components/forms/CartridgeForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { useState } from 'react';
import type { CartridgeFormData } from '@/types';
import type { CartridgeLog } from '@/db/schema';
import { createCartridgeLog, updateCartridgeLog, deleteCartridgeLog, getCartridgeLogs } from '@/actions/cartridge';
import { useToast } from '@/components/ui/toast';
import { format } from 'date-fns';

interface CartridgeListProps {
  initialLogs: CartridgeLog[];
}

export function CartridgeList({ initialLogs }: CartridgeListProps) {
  const [logs, setLogs] = useState<CartridgeLog[]>(initialLogs);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingLog, setEditingLog] = useState<CartridgeLog | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { addToast } = useToast();

  const handleAdd = async (data: CartridgeFormData) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('cartridgeName', data.cartridgeName || '');
    formData.append('replacedAt', typeof data.replacedAt === 'string' ? data.replacedAt : data.replacedAt.toISOString());
    formData.append('notes', data.notes || '');
    const result = await createCartridgeLog(formData);
    setIsLoading(false);
    if (result.success) {
      addToast({ type: 'success', title: 'Berhasil', message: 'Catatan cartridge berhasil ditambahkan' });
      setIsDialogOpen(false);
      const refreshed = await getCartridgeLogs();
      if (refreshed.success && refreshed.data) setLogs(refreshed.data);
    } else {
      addToast({ type: 'error', title: 'Gagal', message: result.error || 'Gagal menambahkan catatan' });
    }
  };

  const handleEdit = async (data: CartridgeFormData) => {
    if (!editingLog) return;
    setIsLoading(true);
    const formData = new FormData();
    formData.append('cartridgeName', data.cartridgeName || '');
    formData.append('replacedAt', typeof data.replacedAt === 'string' ? data.replacedAt : data.replacedAt.toISOString());
    formData.append('notes', data.notes || '');
    const result = await updateCartridgeLog(editingLog.id, formData);
    setIsLoading(false);
    if (result.success) {
      addToast({ type: 'success', title: 'Berhasil', message: 'Catatan cartridge berhasil diperbarui' });
      setIsDialogOpen(false);
      setIsEditing(false);
      setEditingLog(null);
      const refreshed = await getCartridgeLogs();
      if (refreshed.success && refreshed.data) setLogs(refreshed.data);
    } else {
      addToast({ type: 'error', title: 'Gagal', message: result.error || 'Gagal memperbarui catatan' });
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsLoading(true);
    const result = await deleteCartridgeLog(deletingId);
    setIsLoading(false);
    if (result.success) {
      addToast({ type: 'success', title: 'Berhasil', message: 'Catatan cartridge berhasil dihapus' });
      setDeleteDialogOpen(false);
      setDeletingId(null);
      setLogs(logs.filter((log) => log.id !== deletingId));
    } else {
      addToast({ type: 'error', title: 'Gagal', message: result.error || 'Gagal menghapus catatan' });
    }
  };

  const openEditDialog = (log: CartridgeLog) => {
    setEditingLog(log);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const formatDateForInput = (date: Date | string) => {
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Catatan Cartridge</h1>
          <p className="page-subtitle">Kelola riwayat penggantian cartridge</p>
        </div>
        <Button onClick={() => { setIsEditing(false); setEditingLog(null); setIsDialogOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Catatan
        </Button>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-sm sm:max-w-md lg:max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Catatan Cartridge' : 'Tambah Catatan Cartridge'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Perbarui informasi penggantian cartridge' : 'Catat penggantian cartridge baru'}
            </DialogDescription>
            <DialogClose />
          </DialogHeader>
          <CartridgeForm
            initialData={editingLog ? {
              cartridgeName: editingLog.cartridgeName || '',
              replacedAt: formatDateForInput(editingLog.replacedAt),
              notes: editingLog.notes || '',
            } : undefined}
            onSubmit={isEditing ? (data) => handleEdit(data) : (data) => handleAdd(data)}
            onCancel={() => { setIsDialogOpen(false); setIsEditing(false); setEditingLog(null); }}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus Catatan</DialogTitle>
            <DialogDescription>Apakah Anda yakin ingin menghapus catatan ini? Tindakan ini tidak dapat dibatalkan.</DialogDescription>
            <DialogClose />
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => { setDeleteDialogOpen(false); setDeletingId(null); }}>
              Batal
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logs List - no cards, clean rows */}
      {logs.length === 0 ? (
        <div className="empty-state">
          <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h2 className="empty-state-title">Belum ada catatan cartridge</h2>
          <p className="empty-state-desc">Mulai dengan menambahkan catatan penggantian cartridge pertama Anda</p>
          <Button onClick={() => { setIsEditing(false); setEditingLog(null); setIsDialogOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" />
            Tambah Catatan Pertama
          </Button>
        </div>
      ) : (
        <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-[var(--radius-md)] overflow-hidden">
          {logs.map((log) => (
            <div
              key={log.id}
              className="row row-hover px-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {log.cartridgeName && (
                    <span className="font-medium text-[var(--color-fg)] truncate">{log.cartridgeName}</span>
                  )}
                  <span className="text-mono text-sm text-[var(--color-fg-muted)] whitespace-nowrap">
                    {formatDateTime(log.replacedAt)}
                  </span>
                  <span className="text-mono text-xs text-[var(--color-fg-subtle)] whitespace-nowrap">
                    ({formatRelativeTime(log.replacedAt)})
                  </span>
                </div>
                {log.notes && (
                  <p className="text-sm text-[var(--color-fg-muted)] truncate">{log.notes}</p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => openEditDialog(log)}
                  aria-label="Edit catatan"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => openDeleteDialog(log.id)}
                  aria-label="Hapus catatan"
                >
                  <svg className="h-4 w-4 text-[var(--color-danger)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}