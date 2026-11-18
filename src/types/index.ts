import { z } from 'zod';

const datetimeLocalRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;

export const cartridgeFormSchema = z.object({
  cartridgeName: z.string().max(255).optional(),
  replacedAt: z.union([
    z.string().regex(datetimeLocalRegex, 'Format datetime tidak valid (YYYY-MM-DDTHH:mm)'),
    z.date(),
  ]),
  notes: z.string().optional(),
});

export const liquidFormSchema = z.object({
  liquidName: z.string().max(255).optional(),
  amountMl: z.number().positive().max(9999.99).optional().nullable(),
  refilledAt: z.union([
    z.string().regex(datetimeLocalRegex, 'Format datetime tidak valid (YYYY-MM-DDTHH:mm)'),
    z.date(),
  ]),
  notes: z.string().optional(),
});

export const idSchema = z.string().uuid();

export type CartridgeFormData = z.infer<typeof cartridgeFormSchema>;
export type LiquidFormData = z.infer<typeof liquidFormSchema>;
export type IdParam = z.infer<typeof idSchema>;

export interface ActivityItem {
  id: string;
  type: 'cartridge' | 'liquid';
  name: string | null;
  date: Date;
  amount?: number | null;
  notes: string | null;
}

export interface DashboardStats {
  totalCartridgeChanges: number;
  totalLiquidRefills: number;
  lastCartridgeChange: Date | null;
  lastLiquidRefill: Date | null;
  timeSinceCartridgeChange: string | null;
  timeSinceLiquidRefill: string | null;
}