'use server';

import { db } from '@/db';
import { cartridgeLogs, liquidLogs } from '@/db/schema';
import { desc, asc, sql, eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/actions/auth';

export interface HistoryItem {
  id: string;
  type: 'cartridge' | 'liquid';
  name: string | null;
  date: Date;
  amount?: number | null;
  notes: string | null;
}

async function getUserFilter() {
  const user = await getCurrentUser();
  if (!user) return null;
  return user.role === 'admin' ? undefined : user.id;
}

export async function getHistory(type?: 'cartridge' | 'liquid', page = 1, limit = 20) {
  try {
    const userId = await getUserFilter();

    const cartridgeWhere = userId ? eq(cartridgeLogs.userId, userId) : undefined;
    const liquidWhere = userId ? eq(liquidLogs.userId, userId) : undefined;

    const offset = (page - 1) * limit;

    if (type === 'cartridge') {
      const logs = await db
        .select()
        .from(cartridgeLogs)
        .where(cartridgeWhere)
        .orderBy(desc(cartridgeLogs.replacedAt))
        .limit(limit)
        .offset(offset);

      const total = await db
        .select({ count: sql`count(*)` })
        .from(cartridgeLogs)
        .where(cartridgeWhere);

      return {
        success: true,
        data: logs.map((log) => ({
          id: log.id,
          type: 'cartridge' as const,
          name: log.cartridgeName,
          date: log.replacedAt,
          notes: log.notes,
        })),
        total: Number(total[0]?.count || 0),
      };
    }

    if (type === 'liquid') {
      const logs = await db
        .select()
        .from(liquidLogs)
        .where(liquidWhere)
        .orderBy(desc(liquidLogs.refilledAt))
        .limit(limit)
        .offset(offset);

      const total = await db
        .select({ count: sql`count(*)` })
        .from(liquidLogs)
        .where(liquidWhere);

      return {
        success: true,
        data: logs.map((log) => ({
          id: log.id,
          type: 'liquid' as const,
          name: log.liquidName,
          date: log.refilledAt,
          amount: log.amountMl !== null && log.amountMl !== undefined ? Number(log.amountMl) : null,
          notes: log.notes,
        })),
        total: Number(total[0]?.count || 0),
      };
    }

    // Combined history - we need to fetch both and merge
    const [cartridgeLogsResult, liquidLogsResult] = await Promise.all([
      db.select().from(cartridgeLogs).where(cartridgeWhere),
      db.select().from(liquidLogs).where(liquidWhere),
    ]);

    const combined: HistoryItem[] = [
      ...cartridgeLogsResult.map((log) => ({
        id: log.id,
        type: 'cartridge' as const,
        name: log.cartridgeName,
        date: log.replacedAt,
        notes: log.notes,
      })),
      ...liquidLogsResult.map((log) => ({
        id: log.id,
        type: 'liquid' as const,
        name: log.liquidName,
        date: log.refilledAt,
        amount: log.amountMl !== null && log.amountMl !== undefined ? Number(log.amountMl) : null,
        notes: log.notes,
      })),
    ];

    // Sort by date descending
    combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const paginated = combined.slice(offset, offset + limit);

    return {
      success: true,
      data: paginated,
      total: combined.length,
    };
  } catch (error) {
    console.error('Error fetching history:', error);
    return { success: false, error: 'Gagal memuat riwayat aktivitas' };
  }
}