'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  BookMarked,
  Settings,
  LogOut,
  GraduationCap,
  History,
  ChevronRight,
  X,
  HardDrive,
  Plug,
  Loader2,
  Sparkles,
  FileText,
  ClipboardList,
  ListChecks,
  PenLine,
  BarChart3,
  Table,
  MessageSquare,
  Award,
  Presentation,
  AlignLeft,
  Map,
  ShieldCheck,
  Users,
  Languages,
  Layers,
  Scale,
  PlayCircle,
  Target,
  BookOpen,
  Send,
  Plus,
  Bookmark,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { getToolsForRole, mockChatHistory, type ChatHistoryEntry } from '@/data/mockData';
import type { ScopeLevel, ToolCard } from '@/types/edulens';
import { SearchPipeline } from './SearchPipeline';

// Icon mapping for tool cards
const toolIconMap: Record<string, typeof FileText> = {
  FileText, ClipboardList, ListChecks, PenLine, BarChart3,
  Table, MessageSquare, Award, Presentation, AlignLeft,
  Map, ShieldCheck, Users, Languages, Layers, Scale,
  GraduationCap, PlayCircle, Target, BookOpen,
};

export function Dashboard() {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistoryEntry[]>([]);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const tools = user?.role ? getToolsForRole(user.role) : [];

  useEffect(() => {
    // Load chat history
    const saved = localStorage.getItem('edulens-chat-history');
    if (saved) {
      try {
        setChatHistory(JSON.parse(saved));
      } catch {
        setChatHistory(mockChatHistory);
      }
    } else {
      setChatHistory(mockChatHistory);
      localStorage.setItem('edulens-chat-history', JSON.stringify(mockChatHistory));
    }
  }, []);

  const handleSearch = (query: string) => {
    if (!query.trim()) return;
    setSearchQuery(query.trim());
    setIsSearchActive(true);

    // Add to chat history
    const newEntry: ChatHistoryEntry = {
      id: `ch-${Date.now()}`,
      query: query.trim(),
      timestamp: new Date().toISOString(),
      resultCount: 0,
      saved: false,
    };
    const updated = [newEntry, ...chatHistory].slice(0, 50);
    setChatHistory(updated);
    localStorage.setItem('edulens-chat-history', JSON.stringify(updated));
  };

  const handleHistoryClick = (entry: ChatHistoryEntry) => {
    setSearchQuery(entry.query);
    setIsSearchActive(true);
    setSidebarExpanded(false);
  };

  const handleBackToHome = () => {
    setIsSearchActive(false);
    setSearchQuery('');
  };

  const handleToolClick = (tool: ToolCard) => {
    // For now, redirect to search with a prompt about the tool
    setSearchQuery(`Use ${tool.title}: `);
    inputRef.current?.focus();
  };

  const getInitial = () => user?.name?.charAt(0)?.toUpperCase() || 'U';

  const getRoleLabel = () => {
    const labels: Record<string, string> = {
      teacher: 'Classroom Teacher',
      publisher: 'Education Publisher',
      specialist: 'Subject Specialist',
      'curriculum-designer': 'Curriculum Designer',
      'instructional-coach': 'Instructional Coach',
    };
    return labels[user?.role || 'teacher'];
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* ========== LEFT SIDEBAR ========== */}
      <aside
        className={cn(
          'fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-sidebar transition-all duration-300 ease-in-out',
          sidebarExpanded ? 'w-72' : 'w-14',
          'hidden md:flex'
        )}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-3 gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence>
            {sidebarExpanded && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="text-white font-bold text-lg whitespace-nowrap overflow-hidden"
              >
                EduLens
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 flex flex-col py-3 gap-1 px-2">
          <SidebarItem icon={Search} label="Search" active onClick={handleBackToHome} expanded={sidebarExpanded} />
          <SidebarItem icon={BookMarked} label="Library" href="/library" expanded={sidebarExpanded} />
          <SidebarItem icon={Bookmark} label="Saved Searches" expanded={sidebarExpanded} onClick={() => setSidebarExpanded(true)} />
          <SidebarItem icon={HardDrive} label="School Connect Drive" expanded={sidebarExpanded} />
          <SidebarItem icon={Plug} label="MCP Connectors" expanded={sidebarExpanded} />

          {/* Chat History (visible when expanded) */}
          <AnimatePresence>
            {sidebarExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 overflow-hidden"
              >
                <p className="text-[10px] uppercase tracking-widest text-white/40 px-2 mb-2 font-medium">
                  Recent Searches
                </p>
                <div className="space-y-0.5 max-h-60 overflow-y-auto">
                  {chatHistory.slice(0, 8).map(entry => (
                    <button
                      key={entry.id}
                      onClick={() => handleHistoryClick(entry)}
                      className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left hover:bg-white/10 transition-colors group"
                    >
                      <History className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                      <span className="text-[13px] text-white/70 truncate flex-1 group-hover:text-white transition-colors">
                        {entry.query}
                      </span>
                      {entry.saved && (
                        <Star className="w-3 h-3 text-amber-400 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Footer */}
        <div className="pb-4 flex flex-col gap-1 px-2">
          <SidebarItem icon={Settings} label="Settings" expanded={sidebarExpanded} />
          <SidebarItem icon={LogOut} label="Logout" expanded={sidebarExpanded} onClick={logout} />
        </div>
      </aside>

      {/* ========== MAIN CONTENT ========== */}
      <main className="flex-1 md:ml-14 min-h-screen">
        {/* Mobile top bar */}
        <header className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-card border-b border-border flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold">EduLens</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-sidebar flex items-center justify-center">
            <span className="text-sm font-medium text-white">{getInitial()}</span>
          </div>
        </header>

        {/* Desktop top bar */}
        <div className="hidden md:flex h-14 items-center justify-between px-6 border-b border-border bg-card">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{user?.name}</span>
            <span className="mx-2 text-border">|</span>
            <span>{getRoleLabel()}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sidebar flex items-center justify-center">
              <span className="text-sm font-medium text-white">{getInitial()}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-14 md:pt-0 pb-20 md:pb-0">
          <AnimatePresence mode="wait">
            {isSearchActive ? (
              <SearchPipeline
                key="search"
                query={searchQuery}
                onBack={handleBackToHome}
                onNewSearch={handleSearch}
                userRole={user?.role || 'teacher'}
              />
            ) : (
              <HomeView
                key="home"
                tools={tools}
                onSearch={handleSearch}
                onToolClick={handleToolClick}
                inputRef={inputRef}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                userName={user?.name || 'Educator'}
              />
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// ---------- Sidebar Item ----------
function SidebarItem({
  icon: Icon,
  label,
  active,
  expanded,
  href,
  onClick,
}: {
  icon: typeof Search;
  label: string;
  active?: boolean;
  expanded: boolean;
  href?: string;
  onClick?: () => void;
}) {
  const Component = href ? 'a' : 'button';

  return (
    <Component
      href={href}
      onClick={onClick}
      title={label}
      className={cn(
        'flex items-center gap-3 h-10 rounded-lg transition-all duration-150 group relative px-2.5',
        active ? 'bg-white/15' : 'hover:bg-white/10'
      )}
    >
      <Icon className={cn('w-[18px] h-[18px] flex-shrink-0', active ? 'text-white' : 'text-white/60')} />
      <AnimatePresence>
        {expanded && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className={cn(
              'text-[13px] whitespace-nowrap overflow-hidden',
              active ? 'text-white font-medium' : 'text-white/70'
            )}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
      {!expanded && (
        <span className="absolute left-full ml-3 px-3 py-1.5 bg-foreground text-background text-[11px] rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
          {label}
        </span>
      )}
    </Component>
  );
}

// ---------- Home View ----------
function HomeView({
  tools,
  onSearch,
  onToolClick,
  inputRef,
  searchQuery,
  setSearchQuery,
  userName,
}: {
  tools: ToolCard[];
  onSearch: (q: string) => void;
  onToolClick: (tool: ToolCard) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  userName: string;
}) {
  const suggestions = [
    'Water scarcity Year 9 Geography Queensland',
    'First Nations perspectives Year 10 History',
    'Climate change data Year 11 Science',
    'Quadratic equations Year 10 Mathematics',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full px-4 sm:px-6 lg:px-8 mx-auto max-w-5xl py-8 sm:py-12 space-y-10"
    >
      {/* Greeting + Search */}
      <div className="space-y-6 text-center">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="space-y-2"
        >
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {getGreeting()}, {userName.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground text-base">
            Search across 1.5M+ verified educational resources
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto"
        >
          <div className="relative flex items-center h-[52px] px-4 rounded-full border bg-white shadow-sm hover:shadow-md transition-shadow focus-within:shadow-md focus-within:border-primary">
            <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Ask anything — 'find water scarcity resources for Year 9 Geography'"
              className="flex-1 h-full px-3 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
            <Button type="submit" disabled={!searchQuery.trim()} className="flex-shrink-0 h-10 px-5 ml-2 rounded-full gap-2">
              <Send className="w-4 h-4" /> Search
            </Button>
          </div>
        </motion.form>

        {/* Suggestions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-2"
        >
          {suggestions.map(s => (
            <button
              key={s}
              onClick={() => { setSearchQuery(s); onSearch(s); }}
              className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[13px] font-medium hover:bg-emerald-100 transition-colors"
            >
              {s}
            </button>
          ))}
        </motion.div>
      </div>

      {/* Tool Grid */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your Tools</h2>
          <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
            {tools.length} tools for your role
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {tools.map((tool, i) => {
            const Icon = toolIconMap[tool.icon] || FileText;
            return (
              <motion.button
                key={tool.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.03 }}
                onClick={() => onToolClick(tool)}
                className="flex flex-col items-start gap-2 p-4 rounded-xl border border-border bg-card hover:shadow-md hover:border-slate-200 transition-all duration-200 text-left group"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[13px] font-semibold leading-tight">{tool.title}</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{tool.description}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Pipeline Explainer mini */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="p-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50"
      >
        <div className="flex items-center gap-3 mb-3">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          <h3 className="text-sm font-semibold">How your search works</h3>
        </div>
        <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
          {['Query Expansion (HyDE)', 'Hybrid RAG Retrieval', 'Source Verification', 'Dual-Agent Review', 'Quality Scoring', 'Citation Output'].map((step, i) => (
            <span key={step} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="w-3 h-3 text-slate-300" />}
              <span className="px-2 py-1 rounded-md bg-white border border-slate-200 font-medium">{step}</span>
            </span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
