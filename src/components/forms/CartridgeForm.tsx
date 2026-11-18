'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cartridgeFormSchema, CartridgeFormData } from '@/types';

interface CartridgeFormProps {
  initialData?: CartridgeFormData;
  onSubmit: (data: CartridgeFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function CartridgeForm({ initialData, onSubmit, onCancel, isLoading }: CartridgeFormProps) {
  const defaultValues: CartridgeFormData = {
    cartridgeName: '',
    replacedAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    notes: '',
    ...initialData,
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CartridgeFormData>({
    resolver: zodResolver(cartridgeFormSchema),
    defaultValues,
  });

  const handleFormSubmit = async (data: CartridgeFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label="Nama Cartridge (Opsional)"
        placeholder="Contoh: Caliburn G2 Pod"
        {...register('cartridgeName')}
        error={errors.cartridgeName?.message}
      />

      <div className="space-y-1.5">
        <label htmlFor="replacedAt" className="block text-sm font-medium text-slate-300">
          Tanggal & Jam Penggantian
        </label>
        <input
          id="replacedAt"
          type="datetime-local"
          {...register('replacedAt')}
          className={`
            flex h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white
            focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
            transition-colors
            ${errors.replacedAt ? 'border-red-500 focus:ring-red-500' : ''}
          `}
        />
        {errors.replacedAt && (
          <p className="text-sm text-red-400" role="alert">{errors.replacedAt.message}</p>
        )}
      </div>

      <Textarea
        label="Catatan (Opsional)"
        placeholder="Catatan tambahan..."
        {...register('notes')}
        error={errors.notes?.message}
      />

      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Batal
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Menyimpan...' : initialData ? 'Perbarui' : 'Tambah'}
        </Button>
      </div>
    </form>
  );
}