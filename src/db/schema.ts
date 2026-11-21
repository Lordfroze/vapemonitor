import { pgTable, uuid, varchar, text, timestamp, numeric, index, boolean, foreignKey } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 20 }).notNull().default('user'), // 'user' | 'admin'
  avatarUrl: varchar('avatar_url', { length: 500 }),
  isActive: boolean('is_active').notNull().default(true),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
  roleIdx: index('users_role_idx').on(table.role),
  isActiveIdx: index('users_is_active_idx').on(table.isActive),
}));

export const cartridgeLogs = pgTable('cartridge_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  cartridgeName: varchar('cartridge_name', { length: 255 }),
  replacedAt: timestamp('replaced_at', { withTimezone: true }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  replacedAtIdx: index('cartridge_logs_replaced_at_idx').on(table.replacedAt),
  userIdIdx: index('cartridge_logs_user_id_idx').on(table.userId),
}));

export const liquidLogs = pgTable('liquid_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  liquidName: varchar('liquid_name', { length: 255 }),
  amountMl: numeric('amount_ml', { precision: 10, scale: 2 }),
  refilledAt: timestamp('refilled_at', { withTimezone: true }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  refilledAtIdx: index('liquid_logs_refilled_at_idx').on(table.refilledAt),
  userIdIdx: index('liquid_logs_user_id_idx').on(table.userId),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type CartridgeLog = typeof cartridgeLogs.$inferSelect;
export type NewCartridgeLog = typeof cartridgeLogs.$inferInsert;
export type LiquidLog = typeof liquidLogs.$inferSelect;
export type NewLiquidLog = typeof liquidLogs.$inferInsert;