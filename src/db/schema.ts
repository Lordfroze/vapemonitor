import { pgTable, uuid, varchar, text, timestamp, numeric, index } from 'drizzle-orm/pg-core';

export const cartridgeLogs = pgTable('cartridge_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  cartridgeName: varchar('cartridge_name', { length: 255 }),
  replacedAt: timestamp('replaced_at', { withTimezone: true }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  replacedAtIdx: index('cartridge_logs_replaced_at_idx').on(table.replacedAt),
}));

export const liquidLogs = pgTable('liquid_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  liquidName: varchar('liquid_name', { length: 255 }),
  amountMl: numeric('amount_ml', { precision: 10, scale: 2 }),
  refilledAt: timestamp('refilled_at', { withTimezone: true }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  refilledAtIdx: index('liquid_logs_refilled_at_idx').on(table.refilledAt),
}));

export type CartridgeLog = typeof cartridgeLogs.$inferSelect;
export type NewCartridgeLog = typeof cartridgeLogs.$inferInsert;
export type LiquidLog = typeof liquidLogs.$inferSelect;
export type NewLiquidLog = typeof liquidLogs.$inferInsert;