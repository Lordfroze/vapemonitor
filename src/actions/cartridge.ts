'use server';

import { db } from '@/db';
import { cartridgeLogs } from '@/db/schema';
import { cartridgeFormSchema, idSchema } from '@/types';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

function parseJakartaDate(input: string): Date {
  const match = input.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return new Date(input);
  const [, y, mo, d, h, mi, s = '0'] = match;
  return new Date(Date.UTC(+y, +mo - 1, +d, +h - 7, +mi, +s));
}

export async function getCartridgeLogs() {
  try {
    const logs = await db
      .select()
      .from(cartridgeLogs)
      .orderBy(desc(cartridgeLogs.replacedAt));
    return { success: true, data: logs };
  } catch (error) {
    console.error('Error fetching cartridge logs:', error);
    return { success: false, error: 'Gagal memuat riwayat cartridge' };
  }
}

export async function getCartridgeLogById(id: string) {
  try {
    const validation = idSchema.safeParse(id);
    if (!validation.success) {
      return { success: false, error: 'ID tidak valid' };
    }

    const logs = await db
      .select()
      .from(cartridgeLogs)
      .where(eq(cartridgeLogs.id, validation.data))
      .limit(1);

    if (logs.length === 0) {
      return { success: false, error: 'Catatan tidak ditemukan' };
    }

    return { success: true, data: logs[0] };
  } catch (error) {
    console.error('Error fetching cartridge log:', error);
    return { success: false, error: 'Gagal memuat catatan cartridge' };
  }
}

export async function createCartridgeLog(formData: FormData) {
  try {
    const rawData = {
      cartridgeName: formData.get('cartridgeName') as string || undefined,
      replacedAt: formData.get('replacedAt') as string,
      notes: formData.get('notes') as string || undefined,
    };

    const validation = cartridgeFormSchema.safeParse(rawData);
    if (!validation.success) {
      return { success: false, error: 'Data tidak valid', issues: validation.error.flatten().fieldErrors };
    }

    const { cartridgeName, replacedAt, notes } = validation.data;
    const replacedAtDate = typeof replacedAt === 'string' ? parseJakartaDate(replacedAt) : replacedAt;

    await db.insert(cartridgeLogs).values({
      cartridgeName: cartridgeName || null,
      replacedAt: replacedAtDate,
      notes: notes || null,
    });

    revalidatePath('/');
    revalidatePath('/cartridge');
    revalidatePath('/riwayat');

    return { success: true };
  } catch (error) {
    console.error('Error creating cartridge log:', error);
    return { success: false, error: 'Gagal menambahkan catatan cartridge' };
  }
}

export async function updateCartridgeLog(id: string, formData: FormData) {
  try {
    const idValidation = idSchema.safeParse(id);
    if (!idValidation.success) {
      return { success: false, error: 'ID tidak valid' };
    }

    const rawData = {
      cartridgeName: formData.get('cartridgeName') as string || undefined,
      replacedAt: formData.get('replacedAt') as string,
      notes: formData.get('notes') as string || undefined,
    };

    const validation = cartridgeFormSchema.safeParse(rawData);
    if (!validation.success) {
      return { success: false, error: 'Data tidak valid', issues: validation.error.flatten().fieldErrors };
    }

    const { cartridgeName, replacedAt, notes } = validation.data;
    const replacedAtDate = typeof replacedAt === 'string' ? parseJakartaDate(replacedAt) : replacedAt;

    await db
      .update(cartridgeLogs)
      .set({
        cartridgeName: cartridgeName || null,
        replacedAt: replacedAtDate,
        notes: notes || null,
        updatedAt: new Date(),
      })
      .where(eq(cartridgeLogs.id, idValidation.data));

    revalidatePath('/');
    revalidatePath('/cartridge');
    revalidatePath('/riwayat');

    return { success: true };
  } catch (error) {
    console.error('Error updating cartridge log:', error);
    return { success: false, error: 'Gagal memperbarui catatan cartridge' };
  }
}

export async function deleteCartridgeLog(id: string) {
  try {
    const validation = idSchema.safeParse(id);
    if (!validation.success) {
      return { success: false, error: 'ID tidak valid' };
    }

    await db.delete(cartridgeLogs).where(eq(cartridgeLogs.id, validation.data));

    revalidatePath('/');
    revalidatePath('/cartridge');
    revalidatePath('/riwayat');

    return { success: true };
  } catch (error) {
    console.error('Error deleting cartridge log:', error);
    return { success: false, error: 'Gagal menghapus catatan cartridge' };
  }
}