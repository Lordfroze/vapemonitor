'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { createSession, setSessionCookie, clearSessionCookie, getSession } from '@/lib/auth/session';
import { getUserByEmail, createUser, updateLastLogin, getUsers } from '@/lib/db/queries/users';
import { cookies } from 'next/headers';

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

const registerSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  name: z.string().min(2, 'Nama minimal 2 karakter'),
});

export async function loginAction(formData: FormData) {
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const parsed = loginSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  const { email, password } = parsed.data;

  const user = await getUserByEmail(email);
  if (!user) {
    return { success: false, error: { email: ['Email atau password salah'] } };
  }

  if (!user.isActive) {
    return { success: false, error: { email: ['Akun tidak aktif. Hubungi admin.'] } };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { success: false, error: { password: ['Email atau password salah'] } };
  }

  await updateLastLogin(user.id);

  const token = await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role as 'user' | 'admin',
  });

  await setSessionCookie(token);

  return { success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
}

export async function registerAction(formData: FormData) {
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    name: formData.get('name') as string,
  };

  const parsed = registerSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  const { email, password, name } = parsed.data;

  const existing = await getUserByEmail(email);
  if (existing) {
    return { success: false, error: { email: ['Email sudah terdaftar'] } };
  }

  const passwordHash = await hashPassword(password);

  // First user becomes admin, rest are users
  const { total: userCount } = await getUsers({ limit: 1 });
  const role = userCount === 0 ? 'admin' : 'user';

  const user = await createUser({
    email,
    passwordHash,
    name,
    role,
    isActive: true,
  });

  const token = await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role as 'user' | 'admin',
  });

  await setSessionCookie(token);

  return { success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect('/login');
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  return {
    id: session.userId,
    email: session.email,
    name: session.name,
    role: session.role,
  };
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== 'admin') {
    redirect('/');
  }
  return user;
}