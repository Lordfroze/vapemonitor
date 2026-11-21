'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { LogOut, User, Settings, Shield, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { logoutAction } from '@/actions/auth';

interface UserMenuProps {
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export function UserMenu({ name, email, role }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { addToast } = useToast();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutAction();
      addToast({ type: 'success', title: 'Berhasil logout' });
    } catch {
      addToast({ type: 'error', title: 'Gagal logout', message: 'Silakan coba lagi' });
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 btn btn-ghost"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Menu pengguna"
      >
        <div className="w-8 h-8 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center">
          <User className="h-4 w-4 text-[var(--color-accent)]" aria-hidden="true" />
        </div>
        <span className="hidden sm:block font-medium text-[var(--color-fg)]">{name}</span>
        <ChevronDown className={cn('h-4 w-4 text-[var(--color-fg-muted)] transition-transform', isOpen && 'rotate-180')} aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-lg py-2 z-50 animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="px-4 py-3 border-b border-[var(--color-border)]">
            <p className="font-medium text-[var(--color-fg)]">{name}</p>
            <p className="text-sm text-[var(--color-fg-muted)] truncate">{email}</p>
            <span className={cn(
              'inline-block mt-1.5 px-2 py-0.5 text-xs font-medium rounded-full',
              role === 'admin'
                ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]'
                : 'bg-[var(--color-fg-muted)]/20 text-[var(--color-fg-muted)]'
            )}>
              {role === 'admin' ? 'Admin' : 'User'}
            </span>
          </div>

          <nav className="py-1" role="menu">
            <Link
              href="/pengaturan"
              role="menuitem"
              className="flex items-center gap-3 px-4 py-2 text-[var(--color-fg)] hover:bg-[var(--color-bg)] transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="h-4 w-4 text-[var(--color-fg-muted)]" aria-hidden="true" />
              <span>Pengaturan</span>
            </Link>

            {role === 'admin' && (
              <Link
                href="/admin/users"
                role="menuitem"
                className="flex items-center gap-3 px-4 py-2 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Shield className="h-4 w-4" aria-hidden="true" />
                <span>Manajemen User</span>
              </Link>
            )}

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              role="menuitem"
              className="flex items-center gap-3 w-full px-4 py-2 text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span>{isLoggingOut ? 'Keluar...' : 'Logout'}</span>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}