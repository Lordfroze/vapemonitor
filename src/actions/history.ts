'use server';

import { db } from '@/db';
import { cartridgeLogs, liquidLogs } from '@/db/schema';
import { desc, asc, sql } from 'drizzle-orm';

export interface HistoryItem {
  id: string;
  type: 'cartridge' | 'liquid';
  name: string | null;
  date: Date;
  amount?: number | null;
  notes: string | null;
}

export async function getHistory(type?: 'cartridge' | 'liquid', page = 1, limit = 20) {
  try {
    const offset = (page - 1) * limit;

    if (type === 'cartridge') {
      const logs = await db
        .select()
        .from(cartridgeLogs)
        .orderBy(desc(cartridgeLogs.replacedAt))
        .limit(limit)
        .offset(offset);

      const total = await db
        .select({ count: sql`count(*)` })
        .from(cartridgeLogs);

      return {
        success: true,
        data: logs.map((log) => ({
          id: log.id,
          type: 'cartridge' as const,
          name: log.cartridgeName,
          date: log.replacedAt,
          notes: log.notes,
        })),
        total: total[0]?.count || 0,
      };
    }

    if (type === 'liquid') {
      const logs = await db
        .select()
        .from(liquidLogs)
        .orderBy(desc(liquidLogs.refilledAt))
        .limit(limit)
        .offset(offset);

      const total = await db
        .select({ count: sql`count(*)` })
        .from(liquidLogs);

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
        total: total[0]?.count || 0,
      };
    }

    // Combined history - we need to fetch both and merge
    const [cartridgeLogsResult, liquidLogsResult] = await Promise.all([
      db.select().from(cartridgeLogs),
      db.select().from(liquidLogs),
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