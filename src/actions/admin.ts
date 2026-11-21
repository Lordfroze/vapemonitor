'use server';

import { z } from 'zod';
import { hashPassword } from '@/lib/auth/password';
import {
  getUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
} from '@/lib/db/queries/users';
import { requireAdmin, requireAuth } from '@/actions/auth';

const userCreateSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  role: z.enum(['user', 'admin']),
  isActive: z.boolean().default(true),
});

const userUpdateSchema = z.object({
  email: z.string().email('Email tidak valid').optional(),
  name: z.string().min(2, 'Nama minimal 2 karakter').optional(),
  role: z.enum(['user', 'admin']).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(8, 'Password minimal 8 karakter').optional(),
});

export async function getUsersAction(params: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: string;
}) {
  await requireAdmin();
  return getUsers(params);
}

export async function getUserAction(id: string) {
  await requireAdmin();
  return getUserById(id);
}

export async function createUserAction(formData: FormData) {
  await requireAdmin();

  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    name: formData.get('name') as string,
    role: formData.get('role') as 'user' | 'admin',
    isActive: formData.get('isActive') === 'true',
  };

  const parsed = userCreateSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  const { email, password, name, role, isActive } = parsed.data;

  const existing = await getUserByEmail(email);
  if (existing) {
    return { success: false, error: { email: ['Email sudah terdaftar'] } };
  }

  const passwordHash = await hashPassword(password);

  const user = await createUser({
    email,
    passwordHash,
    name,
    role,
    isActive,
  });

  return { success: true, user };
}

export async function updateUserAction(id: string, formData: FormData) {
  await requireAdmin();

  const rawData = {
    email: formData.get('email') as string | undefined,
    name: formData.get('name') as string | undefined,
    role: formData.get('role') as 'user' | 'admin' | undefined,
    isActive: formData.get('isActive') !== undefined ? formData.get('isActive') === 'true' : undefined,
    password: formData.get('password') as string | undefined,
  };

  const parsed = userUpdateSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  if (data.email) {
    const existing = await getUserByEmail(data.email);
    if (existing && existing.id !== id) {
      return { success: false, error: { email: ['Email sudah digunakan user lain'] } };
    }
  }

  const updateData: Record<string, unknown> = { ...data };
  if (data.password) {
    updateData.passwordHash = await hashPassword(data.password);
    delete updateData.password;
  }

  const user = await updateUser(id, updateData as Parameters<typeof updateUser>[1]);
  if (!user) {
    return { success: false, error: { form: ['User tidak ditemukan'] } };
  }

  return { success: true, user };
}

export async function deleteUserAction(id: string) {
  await requireAdmin();

  const currentUser = await getUserById(id);
  if (!currentUser) {
    return { success: false, error: 'User tidak ditemukan' };
  }

  // Prevent deleting yourself
  const session = await requireAuth();
  if (session.id === id) {
    return { success: false, error: 'Tidak bisa menghapus akun sendiri' };
  }

  const deleted = await deleteUser(id);
  return { success: deleted };
}

export async function toggleUserStatusAction(id: string) {
  await requireAdmin();

  const user = await getUserById(id);
  if (!user) {
    return { success: false, error: 'User tidak ditemukan' };
  }

  const session = await requireAuth();
  if (session.id === id) {
    return { success: false, error: 'Tidak bisa menonaktifkan akun sendiri' };
  }

  const updated = await updateUser(id, { isActive: !user.isActive });
  return { success: !!updated, user: updated };
}

export async function resetUserPasswordAction(id: string) {
  await requireAdmin();

  const user = await getUserById(id);
  if (!user) {
    return { success: false, error: 'User tidak ditemukan' };
  }

  // Generate a random password
  const newPassword = await generateRandomPassword(12);
  const passwordHash = await hashPassword(newPassword);

  const updated = await updateUser(id, { passwordHash });
  return { success: !!updated, newPassword };
}

async function generateRandomPassword(length: number): Promise<string> {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}