'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Search, Bell, Home, BookMarked, Plus, Zap, User } from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Brand logo SVG
// ---------------------------------------------------------------------------
function ScoraLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="16" cy="16" r="5" fill="currentColor" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Nav config
// ---------------------------------------------------------------------------
const navItems = [
  { href: '/',          label: 'Dashboard' },
  { href: '/library',   label: 'Library' },
  { href: '/plans',     label: 'Create' },
  { href: '/workflows', label: 'Automation' },
  { href: '/profile',   label: 'Curriculum' },
];

const mobileNavItems = [
  { href: '/',          icon: Home },
  { href: '/library',   icon: BookMarked },
  { href: '/plans',     icon: Plus },
  { href: '/workflows', icon: Zap },
  { href: '/profile',   icon: User },
];

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname.startsWith(href);
}

// ---------------------------------------------------------------------------
// TopNav
// ---------------------------------------------------------------------------
export function TopNav() {
  const pathname = usePathname();
  const [profileData, setProfileData] = useState<{
    schoolName?: string;
    role?: string;
  } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('edulens-profile');
    if (saved) {
      try { setProfileData(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  const initial = profileData?.schoolName?.charAt(0).toUpperCase() ?? 'T';
  const name    = profileData?.schoolName ?? 'Teacher';
  const role    = profileData?.role ?? 'Educator';

  return (
    <header className="h-[72px] bg-white border-b border-[#f0f0f0] flex items-center justify-between px-8 w-full overflow-hidden">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded-full border-[1.5px] border-[#0f172a] flex items-center justify-center p-1">
          <ScoraLogo className="w-full h-full text-[#0f172a]" />
        </div>
        <span className="text-[18px] font-bold text-[#0f172a]">Scora</span>
      </Link>

      {/* Nav pills — hidden on mobile, fit-content so they never overflow */}
      <nav className="hidden md:flex items-center bg-[#f0f0f0] rounded-full px-2 py-2 gap-1 w-fit mx-auto">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'whitespace-nowrap px-5 py-2 rounded-full text-[14px] font-medium transition-colors',
                active ? 'bg-[#0f172a] text-white' : 'text-[#64748b] hover:text-[#0f172a]'
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-3 shrink-0 ml-auto">
        <button aria-label="Search" className="w-10 h-10 bg-[#0f172a] rounded-full flex items-center justify-center">
          <Search className="w-[18px] h-[18px] text-white" />
        </button>
        <button aria-label="Notifications" className="w-10 h-10 bg-[#0f172a] rounded-full flex items-center justify-center">
          <Bell className="w-[18px] h-[18px] text-white" />
        </button>
        <Link href="/profile" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#94a3b8] flex items-center justify-center shrink-0">
            <span className="text-[14px] font-semibold text-white">{initial}</span>
          </div>
          <div className="hidden md:block">
            <p className="text-[14px] font-medium text-[#0f172a] leading-tight">{name}</p>
            <p className="text-[12px] text-[#94a3b8] leading-tight">{role}</p>
          </div>
        </Link>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// MobileBottomNav
// ---------------------------------------------------------------------------
export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden">
      <div className="flex items-center gap-1 bg-[#0f172a] rounded-full px-3 py-3 shadow-lg">
        {mobileNavItems.map(({ href, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link key={href} href={href} className="relative flex flex-col items-center justify-center w-11 h-11">
              <Icon className="w-5 h-5 text-white" />
              {active && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-white" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// AppShell — includes auth guard + footer
// ---------------------------------------------------------------------------

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // A user is considered "in session" if they've selected a role or completed
    // profile setup. Only redirect to login if there's no session at all.
    const hasRole      = Boolean(localStorage.getItem('edulens-role'));
    const hasCompleted = localStorage.getItem('edulens-profile-completed') === 'true';
    if (!hasRole && !hasCompleted) {
      router.replace('/auth/login');
    }
  }, [pathname, router]);

  return (
    <div className="min-h-screen bg-[#f0f0f0] overflow-x-hidden">
      <div
        className="bg-white overflow-x-hidden flex flex-col"
        style={{ borderRadius: 24, margin: '16px', maxWidth: 'calc(100vw - 32px)', minHeight: 'calc(100vh - 32px)' }}
      >
        <TopNav />
        <main className="flex-1 pb-24 md:pb-0">{children}</main>

        {/* Footer */}
        <footer className="border-t border-[#f0f0f0] px-8 py-4 flex items-center justify-between">
          <span className="text-[12px] text-[#94a3b8]">© {new Date().getFullYear()} Scora</span>
          <div className="flex items-center gap-5">
            <Link href="/about" className="text-[12px] text-[#94a3b8] hover:text-[#64748b] transition-colors">About</Link>
            <Link href="/terms" className="text-[12px] text-[#94a3b8] hover:text-[#64748b] transition-colors">Terms</Link>
            <Link href="/privacy" className="text-[12px] text-[#94a3b8] hover:text-[#64748b] transition-colors">Privacy</Link>
          </div>
        </footer>
      </div>
      <MobileBottomNav />
    </div>
  );
}

export default AppShell;
