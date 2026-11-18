'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { liquidFormSchema, LiquidFormData } from '@/types';

interface LiquidFormProps {
  initialData?: LiquidFormData;
  onSubmit: (data: LiquidFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function LiquidForm({ initialData, onSubmit, onCancel, isLoading }: LiquidFormProps) {
  const defaultValues: LiquidFormData = {
    liquidName: '',
    amountMl: undefined,
    refilledAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    notes: '',
    ...initialData,
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LiquidFormData>({
    resolver: zodResolver(liquidFormSchema),
    defaultValues,
  });

  const handleFormSubmit = async (data: LiquidFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label="Nama Liquid (Opsional)"
        placeholder="Contoh: Nasty Juice Slow Blow"
        {...register('liquidName')}
        error={errors.liquidName?.message}
      />

      <Input
        label="Jumlah (ml) (Opsional)"
        type="number"
        step="0.1"
        min="0.1"
        max="9999.99"
        placeholder="Contoh: 30"
        {...register('amountMl', { valueAsNumber: true })}
        error={errors.amountMl?.message}
      />

      <div className="space-y-1.5">
        <label htmlFor="refilledAt" className="block text-sm font-medium text-slate-300">
          Tanggal & Jam Pengisian
        </label>
        <input
          id="refilledAt"
          type="datetime-local"
          {...register('refilledAt')}
          className={`
            flex h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white
            focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
            transition-colors
            ${errors.refilledAt ? 'border-red-500 focus:ring-red-500' : ''}
          `}
        />
        {errors.refilledAt && (
          <p className="text-sm text-red-400" role="alert">{errors.refilledAt.message}</p>
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