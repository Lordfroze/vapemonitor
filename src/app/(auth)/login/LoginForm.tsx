'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { loginAction } from '@/actions/auth';

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('email', data.email);
      formData.append('password', data.password);
      const result = await loginAction(formData);
      if (result.success) {
        addToast({ type: 'success', title: 'Login berhasil', message: `Selamat datang, ${result.user?.name}` });
        router.push(redirect);
        router.refresh();
      } else {
        const errorMessages = Object.values(result.error || {}).flat().join(', ');
        addToast({ type: 'error', title: 'Login gagal', message: errorMessages });
      }
    } catch {
      addToast({ type: 'error', title: 'Terjadi kesalahan', message: 'Silakan coba lagi' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4 py-12">
      <Card variant="elevated" className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-14 h-14 rounded-xl bg-[var(--color-accent)]/20 flex items-center justify-center mx-auto mb-4">
            <svg className="h-7 w-7 text-[var(--color-accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <CardTitle className="text-2xl">Masuk ke Vape Monitor</CardTitle>
          <CardDescription>Masukkan email dan password untuk melanjutkan</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              {...register('email')}
              type="email"
              label="Email"
              placeholder="admin@vape-monitor.local"
              error={errors.email?.message}
              autoComplete="email"
              disabled={isLoading}
            />

            <div className="relative">
              <Input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="••••••••"
                error={errors.password?.message}
                autoComplete="current-password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] transition-colors"
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Masuk...
                </>
              ) : (
                'Masuk'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex-col gap-3">
          <p className="text-sm text-[var(--color-fg-muted)] text-center">
            Belum punya akun?{' '}
            <Link href="/register" className="text-[var(--color-accent)] hover:underline font-medium">
              Daftar
            </Link>
          </p>
          <div className="text-xs text-center text-[var(--color-fg-muted)] p-3 rounded-[var(--radius-sm)] bg-[var(--color-bg)]">
            <p className="font-medium mb-1">Demo Credentials:</p>
            <p>Email: admin@vape-monitor.local</p>
            <p>Password: admin123</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}