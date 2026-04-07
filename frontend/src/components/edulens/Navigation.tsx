'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search,
  BookMarked,
  FileText,
  Zap,
  User,
  Settings,
  LogOut,
  GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Search, label: 'Search' },
  { href: '/library', icon: BookMarked, label: 'Library' },
  { href: '/plans', icon: FileText, label: 'Plans' },
  { href: '/workflows', icon: Zap, label: 'Workflows' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export function MobileTopBar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 md:hidden h-14 bg-card border-b border-border flex items-center justify-between px-4">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-[8px] bg-primary flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold">EduLens</span>
      </Link>

      {/* Avatar */}
      <Link
        href="/profile"
        className="w-8 h-8 rounded-full bg-sidebar flex items-center justify-center"
      >
        <span className="text-sm font-medium text-sidebar-primary-foreground">T</span>
      </Link>
    </header>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card rounded-t-[16px] shadow-[0_-4px_12px_rgba(0,0,0,0.06)] safe-area-bottom border-t border-border">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[56px] relative"
            >
              <item.icon
                className={cn(
                  'w-5 h-5 transition-colors stroke-[1.5]',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              />
              <span className={cn(
                'text-[9px] font-medium',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}>
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute bottom-1.5 w-1 h-1 rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-14 flex-col bg-sidebar z-40">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center">
        <div className="w-8 h-8 rounded-[8px] bg-sidebar-primary flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-sidebar-primary-foreground" />
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 flex flex-col items-center py-4 gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                'w-9 h-9 flex items-center justify-center rounded-[10px] transition-all duration-150 group relative',
                isActive
                  ? 'bg-sidebar-accent'
                  : 'hover:bg-sidebar-accent/50'
              )}
            >
              <item.icon
                className={cn(
                  'w-5 h-5 stroke-[1.5]',
                  isActive ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground'
                )}
              />
              {/* Custom tooltip */}
              <span className="absolute left-full ml-3 px-3 py-1.5 bg-foreground text-background text-[11px] rounded-[6px] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer - Settings & Logout */}
      <div className="pb-4 flex flex-col items-center gap-2">
        <button
          title="Settings"
          className="w-9 h-9 flex items-center justify-center rounded-[10px] hover:bg-sidebar-accent/50 transition-all duration-150 group relative"
        >
          <Settings className="w-5 h-5 text-sidebar-foreground stroke-[1.5]" />
          <span className="absolute left-full ml-3 px-3 py-1.5 bg-foreground text-background text-[11px] rounded-[6px] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50">
            Settings
          </span>
        </button>
        <button
          title="Logout"
          className="w-9 h-9 flex items-center justify-center rounded-[10px] hover:bg-sidebar-accent/50 transition-all duration-150 group relative"
        >
          <LogOut className="w-5 h-5 text-sidebar-foreground stroke-[1.5]" />
          <span className="absolute left-full ml-3 px-3 py-1.5 bg-foreground text-background text-[11px] rounded-[6px] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50">
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />
      <MobileTopBar />
      <MobileBottomNav />

      {/* Main content area - offset for 56px sidebar on desktop, top/bottom padding for mobile nav */}
      <main className="md:ml-14 pt-14 md:pt-0 pb-20 md:pb-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}

export default AppShell;
