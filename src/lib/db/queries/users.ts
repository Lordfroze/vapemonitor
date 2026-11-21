import { db } from '@/db';
import { users, type User, type NewUser } from '@/db/schema';
import { eq, and, ilike, or, desc, count } from 'drizzle-orm';

export async function getUserById(id: string): Promise<User | null> {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] || null;
}

export async function createUser(data: NewUser): Promise<User> {
  const result = await db.insert(users).values(data).returning();
  return result[0];
}

export async function updateUser(id: string, data: Partial<NewUser>): Promise<User | null> {
  const result = await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  return result[0] || null;
}

export async function updateLastLogin(id: string): Promise<void> {
  await db
    .update(users)
    .set({ lastLoginAt: new Date(), updatedAt: new Date() })
    .where(eq(users.id, id));
}

export async function deleteUser(id: string): Promise<boolean> {
  const result = await db.delete(users).where(eq(users.id, id)).returning({ id: users.id });
  return result.length > 0;
}

export async function getUsers({
  page = 1,
  limit = 10,
  search = '',
  role = '',
  isActive = '',
}: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: string;
} = {}): Promise<{ users: User[]; total: number; totalPages: number }> {
  const offset = (page - 1) * limit;

  const conditions = [];
  if (search) {
    conditions.push(
      or(ilike(users.name, `%${search}%`), ilike(users.email, `%${search}%`))
    );
  }
  if (role) {
    conditions.push(eq(users.role, role as 'user' | 'admin'));
  }
  if (isActive !== '') {
    conditions.push(eq(users.isActive, isActive === 'true'));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [usersResult, totalResult] = await Promise.all([
    db
      .select()
      .from(users)
      .where(whereClause)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: count() }).from(users).where(whereClause),
  ]);

  const total = totalResult[0]?.count || 0;
  const totalPages = Math.ceil(total / limit);

  return { users: usersResult, total, totalPages };
}

export async function getAllUsers(): Promise<User[]> {
  return db.select().from(users).where(eq(users.isActive, true)).orderBy(desc(users.createdAt));
}