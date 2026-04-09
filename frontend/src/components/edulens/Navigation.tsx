'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Search, Bell, Home, BookMarked, Plus, Zap, User, Check, X, LogOut, Settings } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { sampleResources } from '@/lib/demoData';
import { demoNotifications } from '@/lib/demoData';
import type { Resource } from '@/types/edulens';

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
// Global Toast — rendered inside AppShell, listens for 'scora-toast' events
// ---------------------------------------------------------------------------
export function GlobalToast() {
  const [toasts, setToasts] = useState<{ id: number; message: string; type: string }[]>([]);
  const counterRef = useRef(0);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const id = ++counterRef.current;
      setToasts((prev) => [...prev, { id, ...detail }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
    };
    window.addEventListener('scora-toast', handler);
    return () => window.removeEventListener('scora-toast', handler);
  }, []);

  return (
    <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="pointer-events-auto"
          >
            <div className="flex items-center gap-3 px-4 py-3 bg-white border border-[#e2e8f0] rounded-[12px] shadow-md min-w-[260px]">
              <Check className="w-5 h-5 text-[#f97316] flex-shrink-0" />
              <p className="text-[15px] text-[#0f172a] flex-1">{t.message}</p>
              <button
                onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                className="p-1.5 rounded-[6px] hover:bg-[#f0f0f0] transition-colors"
              >
                <X className="w-4 h-4 text-[#64748b]" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Search Modal
// ---------------------------------------------------------------------------
function SearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Resource[]>([]);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const q = query.toLowerCase();
    setResults(
      sampleResources.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.tags?.some((t) => t.toLowerCase().includes(q))
      ).slice(0, 5)
    );
  }, [query]);

  const handleSelect = (r: Resource) => {
    onClose();
    router.push(`/library?resource=${r.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-20 px-4 bg-black/40"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-white rounded-[16px] shadow-xl overflow-hidden z-[10000]"
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#f0f0f0]">
          <Search className="w-5 h-5 text-[#94a3b8] shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search resources, plans, lessons..."
            className="flex-1 text-[15px] text-[#0f172a] placeholder:text-[#94a3b8] outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
              if (e.key === 'Enter' && query.trim()) {
                onClose();
                router.push(`/?q=${encodeURIComponent(query)}`);
              }
            }}
          />
          <button onClick={onClose} className="p-1 rounded hover:bg-[#f0f0f0]">
            <X className="w-4 h-4 text-[#64748b]" />
          </button>
        </div>
        {results.length > 0 && (
          <ul>
            {results.map((r) => (
              <li key={r.id}>
                <button
                  onClick={() => handleSelect(r)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#f8fafc] transition-colors text-left"
                >
                  <span className="w-8 h-8 rounded-lg bg-[#f0f0f0] flex items-center justify-center text-[14px] shrink-0">
                    {r.type === 'video' ? '▶' : r.type === 'interactive' ? '🔬' : r.type === 'pdf' ? '📄' : '📝'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-[#0f172a] truncate">{r.title}</p>
                    <p className="text-[12px] text-[#94a3b8]">{r.source.name}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
        {query && results.length === 0 && (
          <div className="px-4 py-8 text-center text-[14px] text-[#94a3b8]">
            No results for &quot;{query}&quot; — press Enter to search all resources
          </div>
        )}
        {!query && (
          <div className="px-4 py-3 flex flex-wrap gap-2">
            {['Water scarcity', 'Climate change', 'First Nations', 'French Revolution'].map((s) => (
              <button
                key={s}
                onClick={() => setQuery(s)}
                className="border border-[#e2e8f0] rounded-full px-3 py-1.5 text-[13px] text-[#64748b] hover:border-[#cbd5e1] transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Notifications Dropdown
// ---------------------------------------------------------------------------
function NotificationsDropdown({ onClose }: { onClose: () => void }) {
  const [notifications, setNotifications] = useState(demoNotifications);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div
      ref={dropRef}
      className="absolute right-0 top-full mt-2 z-[9999] bg-white border border-[#e2e8f0] rounded-[16px] shadow-xl min-w-[320px] max-h-[400px] overflow-y-auto"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0]">
        <p className="text-[15px] font-semibold text-[#0f172a]">Notifications</p>
        {unread > 0 && (
          <button
            onClick={() => setNotifications((n) => n.map((x) => ({ ...x, read: true })))}
            className="text-[12px] text-[#64748b] hover:text-[#0f172a]"
          >
            Mark all read
          </button>
        )}
      </div>
      <ul className="max-h-[320px] overflow-y-auto">
        {notifications.map((n) => (
          <li
            key={n.id}
            className={cn(
              'flex items-start gap-3 px-4 py-3 border-b border-[#f8fafc] cursor-pointer hover:bg-[#f8fafc] transition-colors',
              !n.read && 'bg-[#fefce8]'
            )}
            onClick={() => setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x))}
          >
            <span className="text-[18px] shrink-0">{n.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-[#0f172a] leading-snug">{n.text}</p>
              <p className="text-[11px] text-[#94a3b8] mt-0.5">{n.time}</p>
            </div>
            {!n.read && <span className="w-2 h-2 rounded-full bg-[#f97316] shrink-0 mt-1" />}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Avatar Dropdown
// ---------------------------------------------------------------------------
function AvatarDropdown({ name, role, initial, onClose }: { name: string; role: string; initial: string; onClose: () => void }) {
  const router = useRouter();
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const handleSignOut = () => {
    localStorage.clear();
    window.location.href = '/auth/login';
  };

  return (
    <div
      ref={dropRef}
      className="absolute right-0 top-full mt-2 z-[9999] bg-white border border-[#e2e8f0] rounded-[16px] shadow-xl min-w-[200px]"
    >
      <div className="px-4 py-3 border-b border-[#f0f0f0]">
        <p className="text-[14px] font-semibold text-[#0f172a]">{name}</p>
        <p className="text-[12px] text-[#94a3b8]">{role}</p>
      </div>
      <ul className="py-1">
        <li>
          <Link href="/profile" onClick={onClose} className="flex items-center gap-3 px-4 py-2.5 text-[14px] text-[#0f172a] hover:bg-[#f8fafc] transition-colors">
            <Settings className="w-4 h-4 text-[#64748b]" />
            Curriculum Profile
          </Link>
        </li>
        <li>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-[#ef4444] hover:bg-[#fef2f2] transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </li>
      </ul>
    </div>
  );
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
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showAvatar, setShowAvatar] = useState(false);

  const unreadCount = demoNotifications.filter((n) => !n.read).length;

  useEffect(() => {
    const saved = localStorage.getItem('edulens-profile');
    if (saved) {
      try { setProfileData(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  // Keyboard shortcut: Cmd/Ctrl+K opens search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const initial = profileData?.schoolName?.charAt(0).toUpperCase() ?? 'T';
  const name    = profileData?.schoolName ?? 'Teacher';
  const role    = profileData?.role ?? 'Educator';

  return (
    <>
      <header className="h-[72px] bg-white border-b border-[#f0f0f0] flex items-center justify-between px-8 w-full relative z-[100] rounded-t-[24px]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-full border-[1.5px] border-[#0f172a] flex items-center justify-center p-1">
            <ScoraLogo className="w-full h-full text-[#0f172a]" />
          </div>
          <span className="text-[18px] font-bold text-[#0f172a]">Scora</span>
        </Link>

        {/* Nav pills */}
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
          <button
            aria-label="Search"
            onClick={() => setShowSearch(true)}
            className="w-10 h-10 bg-[#0f172a] rounded-full flex items-center justify-center hover:bg-[#1e293b] transition-colors"
          >
            <Search className="w-[18px] h-[18px] text-white" />
          </button>

          {/* Notifications */}
          <div className="relative z-[100]">
            <button
              aria-label="Notifications"
              onClick={() => { setShowNotifs((p) => !p); setShowAvatar(false); }}
              className="w-10 h-10 bg-[#0f172a] rounded-full flex items-center justify-center hover:bg-[#1e293b] transition-colors relative"
            >
              <Bell className="w-[18px] h-[18px] text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#f97316] rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
            <AnimatePresence>
              {showNotifs && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <NotificationsDropdown onClose={() => setShowNotifs(false)} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Avatar */}
          <div className="relative z-[100]">
            <button
              onClick={() => { setShowAvatar((p) => !p); setShowNotifs(false); }}
              className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
            >
              <div className="w-9 h-9 rounded-full bg-[#94a3b8] flex items-center justify-center shrink-0">
                <span className="text-[14px] font-semibold text-white">{initial}</span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-[14px] font-medium text-[#0f172a] leading-tight">{name}</p>
                <p className="text-[12px] text-[#94a3b8] leading-tight">{role}</p>
              </div>
            </button>
            <AnimatePresence>
              {showAvatar && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <AvatarDropdown name={name} role={role} initial={initial} onClose={() => setShowAvatar(false)} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Search Modal (outside header for correct stacking) */}
      <AnimatePresence>
        {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
      </AnimatePresence>
    </>
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
// AppShell — includes auth guard + toast + footer
// ---------------------------------------------------------------------------
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const hasToken     = Boolean(localStorage.getItem('scora-token'));
    const hasRole      = Boolean(localStorage.getItem('edulens-role'));
    const hasCompleted = localStorage.getItem('edulens-profile-completed') === 'true';
    if (!hasToken && !hasRole && !hasCompleted) {
      router.replace('/auth/login');
    }
  }, [pathname, router]);

  return (
    <div className="min-h-screen bg-[#f0f0f0] overflow-x-hidden">
      <div
        className="bg-white flex flex-col overflow-visible"
        style={{ borderRadius: 24, margin: '16px', maxWidth: 'calc(100vw - 32px)', minHeight: 'calc(100vh - 32px)' }}
      >
        <TopNav />
        <main className="flex-1 pb-24 md:pb-0 relative overflow-hidden">{children}</main>

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
      <GlobalToast />
    </div>
  );
}

export default AppShell;
