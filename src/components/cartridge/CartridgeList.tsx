'use client';

import { CartridgeForm } from '@/components/forms/CartridgeForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { useState } from 'react';
import type { CartridgeFormData } from '@/types';
import type { CartridgeLog } from '@/db/schema';
import { createCartridgeLog, updateCartridgeLog, deleteCartridgeLog, getCartridgeLogs } from '@/actions/cartridge';

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
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAdd = async (data: CartridgeFormData) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('cartridgeName', data.cartridgeName || '');
    formData.append('replacedAt', typeof data.replacedAt === 'string' ? data.replacedAt : data.replacedAt.toISOString());
    formData.append('notes', data.notes || '');
    const result = await createCartridgeLog(formData);
    setIsLoading(false);
    if (result.success) {
      showToast('success', 'Catatan cartridge berhasil ditambahkan');
      setIsDialogOpen(false);
      const refreshed = await getCartridgeLogs();
      if (refreshed.success && refreshed.data) setLogs(refreshed.data);
    } else {
      showToast('error', result.error || 'Gagal menambahkan catatan');
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
      showToast('success', 'Catatan cartridge berhasil diperbarui');
      setIsDialogOpen(false);
      setIsEditing(false);
      setEditingLog(null);
      const refreshed = await getCartridgeLogs();
      if (refreshed.success && refreshed.data) setLogs(refreshed.data);
    } else {
      showToast('error', result.error || 'Gagal memperbarui catatan');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsLoading(true);
    const result = await deleteCartridgeLog(deletingId);
    setIsLoading(false);
    if (result.success) {
      showToast('success', 'Catatan cartridge berhasil dihapus');
      setDeleteDialogOpen(false);
      setDeletingId(null);
      setLogs(logs.filter((log) => log.id !== deletingId));
    } else {
      showToast('error', result.error || 'Gagal menghapus catatan');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Catatan Cartridge</h1>
          <p className="text-slate-400 mt-1">Kelola riwayat penggantian cartridge</p>
        </div>
        <Button onClick={() => { setIsEditing(false); setEditingLog(null); setIsDialogOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Catatan
        </Button>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Catatan Cartridge' : 'Tambah Catatan Cartridge'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Perbarui informasi penggantian cartridge' : 'Catat penggantian cartridge baru'}
            </DialogDescription>
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
        <DialogContent className="max-w-md">
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
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-right">
          <div className={`flex items-center gap-3 p-4 rounded-lg border shadow-lg min-w-[300px] max-w-md ${
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-slate-400 mb-4">Belum ada catatan cartridge</p>
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
                <div className="flex items-center gap-3">
                  {log.cartridgeName && (
                    <span className="font-medium text-white truncate">{log.cartridgeName}</span>
                  )}
                  <span className="text-sm text-slate-400 whitespace-nowrap">
                    {new Date(log.replacedAt).toLocaleString('id-ID', {
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