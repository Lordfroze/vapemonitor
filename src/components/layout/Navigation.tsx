'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  Droplet,
  History,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Cartridge', href: '/cartridge', icon: Package },
  { name: 'Liquid', href: '/liquid', icon: Droplet },
  { name: 'Riwayat', href: '/riwayat', icon: History },
  { name: 'Pengaturan', href: '/pengaturan', icon: Settings },
];

interface NavigationProps {
  children: React.ReactNode;
}

export function Navigation({ children }: NavigationProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLaptop, setIsLaptop] = useState(false);
  const [showCollapseToggle, setShowCollapseToggle] = useState(false);

  useEffect(() => {
    const checkLaptop = () => {
      const width = window.innerWidth;
      setIsLaptop(width >= 1024 && width < 1280);
      setShowCollapseToggle(width >= 1024);
    };
    checkLaptop();
    window.addEventListener('resize', checkLaptop);
    return () => window.removeEventListener('resize', checkLaptop);
  }, []);

  const handleNavigationClick = () => {
    if (window.innerWidth < 1024) {
      setIsMobileMenuOpen(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-16 border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm">
        <div className="flex h-full items-center justify-between px-4">
          <h1 className="text-lg font-semibold text-white">Vape Monitor</h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            aria-label={isMobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Desktop: Flex container for sidebar + main */}
      <div className="hidden lg:flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={cn(
            'z-50 border-r border-slate-800 bg-slate-900/95 backdrop-blur-sm transition-all duration-300 ease-in-out flex-shrink-0 flex flex-col',
            isSidebarCollapsed ? 'w-20' : 'w-64'
          )}
          aria-label="Navigasi utama"
        >
          <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800">
            {!isSidebarCollapsed && (
              <h1 className="text-lg font-semibold text-white truncate">Vape Monitor</h1>
            )}
            <div className="flex items-center gap-2">
              {/* Collapse toggle for laptop/desktop */}
              {showCollapseToggle && (
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                  aria-label={isSidebarCollapsed ? 'Buka sidebar' : 'Tutup sidebar'}
                  aria-expanded={!isSidebarCollapsed}
                >
                  {isSidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </button>
              )}
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto" role="navigation" aria-label="Menu navigasi">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleNavigationClick}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isSidebarCollapsed && 'justify-center px-2',
                    isActive
                      ? 'bg-cyan-600/20 text-cyan-400'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                  title={isSidebarCollapsed ? item.name : undefined}
                >
                  <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  {!isSidebarCollapsed && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {!isSidebarCollapsed && (
            <div className="p-4 border-t border-slate-800">
              <p className="text-xs text-slate-500 text-center">
                Versi 1.0.0
              </p>
            </div>
          )}
        </aside>

        {/* Main content wrapper */}
        <main className="flex-1 min-w-0 min-h-screen transition-all duration-300 ease-in-out">
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile: Fixed sidebar + main with margin (existing behavior) */}
      <div className="lg:hidden">
        {/* Mobile sidebar (fixed, slide-in) */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-800 bg-slate-900/95 backdrop-blur-sm transition-transform duration-300 ease-in-out',
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          )}
          aria-label="Navigasi utama"
        >
          <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800">
            <h1 className="text-lg font-semibold text-white">Vape Monitor</h1>
            <button
              className="p-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Tutup menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto" role="navigation" aria-label="Menu navigasi">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleNavigationClick}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-cyan-600/20 text-cyan-400'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <p className="text-xs text-slate-500 text-center">
              Versi 1.0.0
            </p>
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Main content wrapper (mobile) */}
        <main className="min-h-screen pt-16 pb-20">
          <div className="p-4">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom navigation for mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800 bg-slate-900/95 backdrop-blur-sm" aria-label="Navigasi bawah">
        <div className="grid grid-cols-5">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavigationClick}
                className={cn(
                  'flex flex-col items-center gap-1 px-2 py-3 text-xs font-medium transition-colors',
                  isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <item.icon className="h-5 w-5" aria-hidden="true" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}