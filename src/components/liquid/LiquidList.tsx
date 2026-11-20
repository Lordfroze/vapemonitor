'use client';

import { LiquidForm } from '@/components/forms/LiquidForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { useState } from 'react';
import type { LiquidFormData } from '@/types';
import type { LiquidLog } from '@/db/schema';
import { createLiquidLog, updateLiquidLog, deleteLiquidLog, getLiquidLogs } from '@/actions/liquid';
import { useToast } from '@/components/ui/toast';
import { format } from 'date-fns';

interface LiquidListProps {
  initialLogs: LiquidLog[];
}

export function LiquidList({ initialLogs }: LiquidListProps) {
  const [logs, setLogs] = useState<LiquidLog[]>(initialLogs);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingLog, setEditingLog] = useState<LiquidLog | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { addToast } = useToast();

  const handleAdd = async (data: LiquidFormData) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('liquidName', data.liquidName || '');
    if (data.amountMl !== undefined && data.amountMl !== null) {
      formData.append('amountMl', data.amountMl.toString());
    }
    formData.append('refilledAt', typeof data.refilledAt === 'string' ? data.refilledAt : data.refilledAt.toISOString());
    formData.append('notes', data.notes || '');
    const result = await createLiquidLog(formData);
    setIsLoading(false);
    if (result.success) {
      addToast({ type: 'success', title: 'Berhasil', message: 'Catatan liquid berhasil ditambahkan' });
      setIsDialogOpen(false);
      const refreshed = await getLiquidLogs();
      if (refreshed.success && refreshed.data) setLogs(refreshed.data);
    } else {
      addToast({ type: 'error', title: 'Gagal', message: result.error || 'Gagal menambahkan catatan' });
    }
  };

  const handleEdit = async (data: LiquidFormData) => {
    if (!editingLog) return;
    setIsLoading(true);
    const formData = new FormData();
    formData.append('liquidName', data.liquidName || '');
    if (data.amountMl !== undefined && data.amountMl !== null) {
      formData.append('amountMl', data.amountMl.toString());
    }
    formData.append('refilledAt', typeof data.refilledAt === 'string' ? data.refilledAt : data.refilledAt.toISOString());
    formData.append('notes', data.notes || '');
    const result = await updateLiquidLog(editingLog.id, formData);
    setIsLoading(false);
    if (result.success) {
      addToast({ type: 'success', title: 'Berhasil', message: 'Catatan liquid berhasil diperbarui' });
      setIsDialogOpen(false);
      setIsEditing(false);
      setEditingLog(null);
      const refreshed = await getLiquidLogs();
      if (refreshed.success && refreshed.data) setLogs(refreshed.data);
    } else {
      addToast({ type: 'error', title: 'Gagal', message: result.error || 'Gagal memperbarui catatan' });
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsLoading(true);
    const result = await deleteLiquidLog(deletingId);
    setIsLoading(false);
    if (result.success) {
      addToast({ type: 'success', title: 'Berhasil', message: 'Catatan liquid berhasil dihapus' });
      setDeleteDialogOpen(false);
      setDeletingId(null);
      setLogs(logs.filter((log) => log.id !== deletingId));
    } else {
      addToast({ type: 'error', title: 'Gagal', message: result.error || 'Gagal menghapus catatan' });
    }
  };

  const openEditDialog = (log: LiquidLog) => {
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

  const formatAmount = (amount: string | number | null | undefined) => {
    if (amount === null || amount === undefined) return '-';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `${num} ml`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Catatan Liquid</h1>
          <p className="page-subtitle">Kelola riwayat pengisian ulang liquid</p>
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
            <DialogTitle>{isEditing ? 'Edit Catatan Liquid' : 'Tambah Catatan Liquid'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Perbarui informasi pengisian liquid' : 'Catat pengisian liquid baru'}
            </DialogDescription>
            <DialogClose />
          </DialogHeader>
          <LiquidForm
            initialData={editingLog ? {
              liquidName: editingLog.liquidName || '',
              amountMl: editingLog.amountMl !== null && editingLog.amountMl !== undefined ? Number(editingLog.amountMl) : undefined,
              refilledAt: formatDateForInput(editingLog.refilledAt),
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
          <h2 className="empty-state-title">Belum ada catatan liquid</h2>
          <p className="empty-state-desc">Mulai dengan menambahkan catatan pengisian liquid pertama Anda</p>
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
                  {log.liquidName && (
                    <span className="font-medium text-[var(--color-fg)] truncate">{log.liquidName}</span>
                  )}
                  <span className="text-mono text-sm text-[var(--color-accent)] whitespace-nowrap font-medium">
                    {formatAmount(log.amountMl)}
                  </span>
                  <span className="text-mono text-sm text-[var(--color-fg-muted)] whitespace-nowrap">
                    {formatDateTime(log.refilledAt)}
                  </span>
                  <span className="text-mono text-xs text-[var(--color-fg-subtle)] whitespace-nowrap">
                    ({formatRelativeTime(log.refilledAt)})
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