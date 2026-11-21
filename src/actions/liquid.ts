'use server';

import { db } from '@/db';
import { liquidLogs } from '@/db/schema';
import { liquidFormSchema, idSchema } from '@/types';
import { eq, desc, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getCurrentUser, requireAuth } from '@/actions/auth';

function parseJakartaDate(input: string): Date {
  const match = input.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return new Date(input);
  const [, y, mo, d, h, mi, s = '0'] = match;
  return new Date(Date.UTC(+y, +mo - 1, +d, +h - 7, +mi, +s));
}

async function getUserFilter() {
  const user = await getCurrentUser();
  if (!user) return null;
  return user.role === 'admin' ? undefined : user.id;
}

export async function getLiquidLogs() {
  try {
    const userId = await getUserFilter();
    const whereClause = userId ? eq(liquidLogs.userId, userId) : undefined;

    const logs = await db
      .select()
      .from(liquidLogs)
      .where(whereClause)
      .orderBy(desc(liquidLogs.refilledAt));
    return { success: true, data: logs };
  } catch (error) {
    console.error('Error fetching liquid logs:', error);
    return { success: false, error: 'Gagal memuat riwayat liquid' };
  }
}

export async function getLiquidLogById(id: string) {
  try {
    const validation = idSchema.safeParse(id);
    if (!validation.success) {
      return { success: false, error: 'ID tidak valid' };
    }

    const userId = await getUserFilter();
    const whereClause = userId
      ? and(eq(liquidLogs.id, validation.data), eq(liquidLogs.userId, userId))
      : eq(liquidLogs.id, validation.data);

    const logs = await db
      .select()
      .from(liquidLogs)
      .where(whereClause)
      .limit(1);

    if (logs.length === 0) {
      return { success: false, error: 'Catatan tidak ditemukan' };
    }

    return { success: true, data: logs[0] };
  } catch (error) {
    console.error('Error fetching liquid log:', error);
    return { success: false, error: 'Gagal memuat catatan liquid' };
  }
}

export async function createLiquidLog(formData: FormData) {
  try {
    const user = await requireAuth();

    const rawData = {
      liquidName: formData.get('liquidName') as string || undefined,
      amountMl: formData.get('amountMl') ? parseFloat(formData.get('amountMl') as string) : undefined,
      refilledAt: formData.get('refilledAt') as string,
      notes: formData.get('notes') as string || undefined,
    };

    const validation = liquidFormSchema.safeParse(rawData);
    if (!validation.success) {
      return { success: false, error: 'Data tidak valid', issues: validation.error.flatten().fieldErrors };
    }

    const { liquidName, amountMl, refilledAt, notes } = validation.data;
    const refilledAtDate = typeof refilledAt === 'string' ? parseJakartaDate(refilledAt) : refilledAt;

    await db.insert(liquidLogs).values({
      userId: user.id,
      liquidName: liquidName || null,
      amountMl: amountMl !== undefined && amountMl !== null ? amountMl.toString() : null,
      refilledAt: refilledAtDate,
      notes: notes || null,
    });

    revalidatePath('/');
    revalidatePath('/liquid');
    revalidatePath('/riwayat');

    return { success: true };
  } catch (error) {
    console.error('Error creating liquid log:', error);
    return { success: false, error: 'Gagal menambahkan catatan liquid' };
  }
}

export async function updateLiquidLog(id: string, formData: FormData) {
  try {
    const user = await requireAuth();

    const idValidation = idSchema.safeParse(id);
    if (!idValidation.success) {
      return { success: false, error: 'ID tidak valid' };
    }

    const rawData = {
      liquidName: formData.get('liquidName') as string || undefined,
      amountMl: formData.get('amountMl') ? parseFloat(formData.get('amountMl') as string) : undefined,
      refilledAt: formData.get('refilledAt') as string,
      notes: formData.get('notes') as string || undefined,
    };

    const validation = liquidFormSchema.safeParse(rawData);
    if (!validation.success) {
      return { success: false, error: 'Data tidak valid', issues: validation.error.flatten().fieldErrors };
    }

    const { liquidName, amountMl, refilledAt, notes } = validation.data;
    const refilledAtDate = typeof refilledAt === 'string' ? parseJakartaDate(refilledAt) : refilledAt;

    const whereClause = user.role === 'admin'
      ? eq(liquidLogs.id, idValidation.data)
      : and(eq(liquidLogs.id, idValidation.data), eq(liquidLogs.userId, user.id));

    const result = await db
      .update(liquidLogs)
      .set({
        liquidName: liquidName || null,
        amountMl: amountMl !== undefined && amountMl !== null ? amountMl.toString() : null,
        refilledAt: refilledAtDate,
        notes: notes || null,
        updatedAt: new Date(),
      })
      .where(whereClause);

    if (result.rowCount === 0) {
      return { success: false, error: 'Catatan tidak ditemukan atau akses ditolak' };
    }

    revalidatePath('/');
    revalidatePath('/liquid');
    revalidatePath('/riwayat');

    return { success: true };
  } catch (error) {
    console.error('Error updating liquid log:', error);
    return { success: false, error: 'Gagal memperbarui catatan liquid' };
  }
}

export async function deleteLiquidLog(id: string) {
  try {
    const user = await requireAuth();

    const validation = idSchema.safeParse(id);
    if (!validation.success) {
      return { success: false, error: 'ID tidak valid' };
    }

    const whereClause = user.role === 'admin'
      ? eq(liquidLogs.id, validation.data)
      : and(eq(liquidLogs.id, validation.data), eq(liquidLogs.userId, user.id));

    const result = await db.delete(liquidLogs).where(whereClause);

    if (result.rowCount === 0) {
      return { success: false, error: 'Catatan tidak ditemukan atau akses ditolak' };
    }

    revalidatePath('/');
    revalidatePath('/liquid');
    revalidatePath('/riwayat');

    return { success: true };
  } catch (error) {
    console.error('Error deleting liquid log:', error);
    return { success: false, error: 'Gagal menghapus catatan liquid' };
  }
}