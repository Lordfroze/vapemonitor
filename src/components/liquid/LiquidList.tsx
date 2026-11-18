'use client';

import { LiquidForm } from '@/components/forms/LiquidForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { useState } from 'react';
import type { LiquidFormData } from '@/types';
import type { LiquidLog } from '@/db/schema';
import { createLiquidLog, updateLiquidLog, deleteLiquidLog, getLiquidLogs } from '@/actions/liquid';

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
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

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
      showToast('success', 'Catatan liquid berhasil ditambahkan');
      setIsDialogOpen(false);
      const refreshed = await getLiquidLogs();
      if (refreshed.success && refreshed.data) setLogs(refreshed.data);
    } else {
      showToast('error', result.error || 'Gagal menambahkan catatan');
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
      showToast('success', 'Catatan liquid berhasil diperbarui');
      setIsDialogOpen(false);
      setIsEditing(false);
      setEditingLog(null);
      const refreshed = await getLiquidLogs();
      if (refreshed.success && refreshed.data) setLogs(refreshed.data);
    } else {
      showToast('error', result.error || 'Gagal memperbarui catatan');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsLoading(true);
    const result = await deleteLiquidLog(deletingId);
    setIsLoading(false);
    if (result.success) {
      showToast('success', 'Catatan liquid berhasil dihapus');
      setDeleteDialogOpen(false);
      setDeletingId(null);
      setLogs(logs.filter((log) => log.id !== deletingId));
    } else {
      showToast('error', result.error || 'Gagal menghapus catatan');
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

  const formatAmount = (amount: string | number | null | undefined) => {
    if (amount === null || amount === undefined) return '-';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `${num} ml`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Catatan Liquid</h1>
          <p className="text-slate-400 mt-1">Kelola riwayat pengisian ulang liquid</p>
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
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeleteDialogOpen(false); setDeletingId(null); }}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-50 animate-in slide-in-from-right">
          <div className={`flex items-center gap-3 p-4 rounded-lg border shadow-lg min-w-[280px] max-w-sm sm:max-w-md lg:max-w-lg ${
            toast.type === 'success' ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-red-500 bg-red-500/10 text-red-400'
          }`}>
            {toast.type === 'success' ? (
              <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            )}
            <p className="font-medium">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Logs List */}
      {logs.length === 0 ? (
        <div className="text-center py-12">
          <svg className="h-16 w-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
          <p className="text-slate-400 mb-4">Belum ada catatan liquid</p>
          <Button onClick={() => { setIsEditing(false); setEditingLog(null); setIsDialogOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" />
            Tambah Catatan Pertama
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  {log.liquidName && (
                    <span className="font-medium text-white truncate">{log.liquidName}</span>
                  )}
                  <span className="text-sm text-cyan-400 whitespace-nowrap font-mono">
                    {formatAmount(log.amountMl)}
                  </span>
                  <span className="text-sm text-slate-400 whitespace-nowrap">
                    {new Date(log.refilledAt).toLocaleString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                {log.notes && (
                  <p className="text-sm text-slate-500 mt-1 truncate">{log.notes}</p>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => openEditDialog(log)} aria-label="Edit catatan">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(log.id)} aria-label="Hapus catatan">
                  <svg className="h-4 w-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}