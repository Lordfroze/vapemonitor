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
  Shield,
  Users,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { UserMenu } from '@/components/auth/UserMenu';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Cartridge', href: '/cartridge', icon: Package },
  { name: 'Liquid', href: '/liquid', icon: Droplet },
  { name: 'Riwayat', href: '/riwayat', icon: History },
  { name: 'Pengaturan', href: '/pengaturan', icon: Settings },
];

const adminNavigation = [
  { name: 'Manajemen User', href: '/admin/users', icon: Users },
];

interface NavigationProps {
  children: React.ReactNode;
}

export function Navigation({ children }: NavigationProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showCollapseToggle, setShowCollapseToggle] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; role: 'user' | 'admin' } | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch {
        // User not logged in
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    const checkDesktop = () => {
      setShowCollapseToggle(window.innerWidth >= 1024);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const handleNavigationClick = () => {
    if (window.innerWidth < 1024) {
      setIsMobileMenuOpen(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const renderNavItems = (items: typeof navigation, collapsed: boolean) => (
    items.map((item) => {
      const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
      return (
        <Link
          key={item.name}
          href={item.href}
          onClick={handleNavigationClick}
          className={cn(
            'sidebar-item',
            collapsed && 'justify-center',
            isActive && 'active'
          )}
          aria-current={isActive ? 'page' : undefined}
          title={collapsed ? item.name : undefined}
        >
          <item.icon className="sidebar-item-icon" aria-hidden="true" />
          {!collapsed && <span>{item.name}</span>}
        </Link>
      );
    })
  );

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 border-b border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur-sm">
        <div className="flex h-full items-center justify-between px-4">
          <h1 className="text-heading font-medium text-[var(--color-fg)]">Vape Monitor</h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="btn btn-ghost btn-icon-sm"
            aria-label={isMobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/70"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Desktop: Flex container for sidebar + main */}
      <div className="hidden lg:flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={cn(
            'sidebar flex flex-col transition-all duration-200',
            isSidebarCollapsed ? 'sidebar-collapsed' : ''
          )}
          aria-label="Navigasi utama"
        >
          <div className="sidebar-header">
            {!isSidebarCollapsed && (
              <h1 className="text-heading font-medium text-[var(--color-fg)]">Vape Monitor</h1>
            )}
            <div className="flex items-center gap-2">
              {/* Collapse toggle for desktop */}
              {showCollapseToggle && (
                <button
                  onClick={toggleSidebar}
                  className="btn btn-ghost btn-icon"
                  aria-label={isSidebarCollapsed ? 'Buka sidebar' : 'Tutup sidebar'}
                  aria-expanded={!isSidebarCollapsed}
                >
                  {isSidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </button>
              )}
            </div>
          </div>

          <nav className="sidebar-nav flex-1" role="navigation" aria-label="Menu navigasi">
            {renderNavItems(navigation, isSidebarCollapsed)}

            {/* Admin navigation */}
            {user?.role === 'admin' && (
              <>
                <div className="sidebar-divider" />
                {renderNavItems(adminNavigation, isSidebarCollapsed)}
              </>
            )}
          </nav>

          {!isSidebarCollapsed && (
            <div className="sidebar-footer border-t border-[var(--color-border)] p-4">
              {user ? (
                <UserMenu name={user.name} email={user.email} role={user.role} />
              ) : (
                <p className="sidebar-version">v1.0.0</p>
              )}
            </div>
          )}
        </aside>

        {/* Main content wrapper */}
        <main className="page">
          {children}
        </main>
      </div>

      {/* Mobile: Fixed sidebar + main with margin */}
      <div className="lg:hidden">
        {/* Mobile sidebar (fixed, slide-in) */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-64 border-r border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur-sm transition-transform duration-300 ease-in-out',
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          )}
          aria-label="Navigasi utama"
        >
          <div className="sidebar-header">
            <h1 className="text-heading font-medium text-[var(--color-fg)]">Vape Monitor</h1>
            <button
              className="btn btn-ghost btn-icon"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Tutup menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="sidebar-nav flex-1 overflow-y-auto" role="navigation" aria-label="Menu navigasi">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleNavigationClick}
                  className={cn('sidebar-item', isActive && 'active')}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon className="sidebar-item-icon" aria-hidden="true" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* Admin navigation for mobile */}
            {user?.role === 'admin' && (
              <>
                <div className="sidebar-divider" />
                {adminNavigation.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={handleNavigationClick}
                      className={cn('sidebar-item', isActive && 'active')}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <item.icon className="sidebar-item-icon" aria-hidden="true" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </>
            )}
          </nav>

          <div className="sidebar-footer border-t border-[var(--color-border)] p-4">
            {user ? (
              <UserMenu name={user.name} email={user.email} role={user.role} />
            ) : (
              <p className="sidebar-version">v1.0.0</p>
            )}
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/70"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Main content wrapper (mobile) */}
        <main className="page pt-14">
          {children}
        </main>
      </div>

      {/* Bottom navigation for mobile */}
      <nav className="bottom-nav" aria-label="Navigasi bawah">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleNavigationClick}
              className={cn('bottom-nav-item', isActive && 'active')}
              aria-current={isActive ? 'page' : undefined}
            >
              <item.icon aria-hidden="true" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}