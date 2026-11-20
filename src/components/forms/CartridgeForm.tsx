'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cartridgeFormSchema, CartridgeFormData } from '@/types';
import { cn } from '@/lib/utils';

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
        <label htmlFor="replacedAt" className="input-label">
          Tanggal & Jam Penggantian
        </label>
        <input
          id="replacedAt"
          type="datetime-local"
          {...register('replacedAt')}
          className={cn(
            'input',
            errors.replacedAt && 'input-error'
          )}
        />
        {errors.replacedAt && (
          <p className="input-error-text" role="alert">{errors.replacedAt.message}</p>
        )}
      </div>

      <Textarea
        label="Catatan (Opsional)"
        placeholder="Catatan tambahan..."
        {...register('notes')}
        error={errors.notes?.message}
      />

      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Batal
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Menyimpan...' : initialData ? 'Perbarui' : 'Tambah'}
        </Button>
      </div>
    </form>
  );
}