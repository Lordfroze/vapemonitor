'use server';

import { db } from '@/db';
import { cartridgeLogs, liquidLogs } from '@/db/schema';
import { desc, count, and, eq } from 'drizzle-orm';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { getCurrentUser } from '@/actions/auth';

export async function getDashboardStats() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const userIdFilter = user.role === 'admin' ? undefined : user.id;

    const cartridgeWhere = userIdFilter ? eq(cartridgeLogs.userId, userIdFilter) : undefined;
    const liquidWhere = userIdFilter ? eq(liquidLogs.userId, userIdFilter) : undefined;

    const [cartridgeResult, liquidResult] = await Promise.all([
      db
        .select({ count: count() })
        .from(cartridgeLogs)
        .where(cartridgeWhere),
      db
        .select({ count: count() })
        .from(liquidLogs)
        .where(liquidWhere),
    ]);

    const [lastCartridge, lastLiquid] = await Promise.all([
      db
        .select()
        .from(cartridgeLogs)
        .where(cartridgeWhere)
        .orderBy(desc(cartridgeLogs.replacedAt))
        .limit(1),
      db
        .select()
        .from(liquidLogs)
        .where(liquidWhere)
        .orderBy(desc(liquidLogs.refilledAt))
        .limit(1),
    ]);

    const totalCartridgeChanges = cartridgeResult[0]?.count || 0;
    const totalLiquidRefills = liquidResult[0]?.count || 0;
    const lastCartridgeChange = lastCartridge[0]?.replacedAt || null;
    const lastLiquidRefill = lastLiquid[0]?.refilledAt || null;

    let timeSinceCartridgeChange: string | null = null;
    let timeSinceLiquidRefill: string | null = null;

    if (lastCartridgeChange) {
      timeSinceCartridgeChange = formatDistanceToNow(new Date(lastCartridgeChange), { addSuffix: true, locale: id });
    }

    if (lastLiquidRefill) {
      timeSinceLiquidRefill = formatDistanceToNow(new Date(lastLiquidRefill), { addSuffix: true, locale: id });
    }

    return {
      success: true,
      data: {
        totalCartridgeChanges,
        totalLiquidRefills,
        lastCartridgeChange,
        lastLiquidRefill,
        timeSinceCartridgeChange,
        timeSinceLiquidRefill,
      },
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return { success: false, error: 'Gagal memuat statistik dashboard' };
  }
}