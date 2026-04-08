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
  ChevronDown,
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
  Database,
  Globe,
  FolderOpen,
  ToggleLeft,
  ToggleRight,
  Link,
  Palette,
  Cloud,
  Library,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { getToolsForRole, mockChatHistory, type ChatHistoryEntry } from '@/data/mockData';
import type { ScopeLevel, ToolCard } from '@/types/edulens';
import { SearchPipeline } from './SearchPipeline';
import { ClassroomContext, loadClassroomContext, type ClassroomContextData } from './ClassroomContext';

// Icon mapping for tool cards
const toolIconMap: Record<string, typeof FileText> = {
  FileText, ClipboardList, ListChecks, PenLine, BarChart3,
  Table, MessageSquare, Award, Presentation, AlignLeft,
  Map, ShieldCheck, Users, Languages, Layers, Scale,
  GraduationCap, PlayCircle, Target, BookOpen,
};

// Teaching To grade levels — mandatory selection for age-appropriate content
const GRADE_LEVELS = [
  { id: 'early-years', label: 'Early Years (K–2)', ages: '5–8' },
  { id: 'primary', label: 'Primary (3–6)', ages: '8–12' },
  { id: 'middle', label: 'Middle School (7–9)', ages: '12–15' },
  { id: 'senior', label: 'Senior (10–12)', ages: '15–18' },
  { id: 'tertiary', label: 'Tertiary / Adult', ages: '18+' },
] as const;

export type GradeLevel = typeof GRADE_LEVELS[number]['id'];

export function Dashboard() {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistoryEntry[]>([]);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [teachingTo, setTeachingTo] = useState<GradeLevel | null>(null);
  const [classroomContext, setClassroomContext] = useState<ClassroomContextData>(loadClassroomContext);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
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
        <nav className="flex-1 flex flex-col py-3 gap-1 px-2 overflow-y-auto overflow-x-hidden">
          <SidebarItem icon={Search} label="Search" active onClick={handleBackToHome} expanded={sidebarExpanded} />
          <SidebarItem icon={BookMarked} label="Library" href="/library" expanded={sidebarExpanded} />
          <SidebarItem icon={Bookmark} label="Saved Searches" expanded={sidebarExpanded} onClick={() => setSidebarExpanded(true)} />

          {/* Connectors Section */}
          <AnimatePresence>
            {sidebarExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 overflow-hidden"
              >
                <p className="text-[10px] uppercase tracking-widest text-white/40 px-2 mb-1.5 font-medium">
                  Connectors
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          <SidebarItem icon={HardDrive} label="School Connect Drive" expanded={sidebarExpanded} />
          <SidebarItem icon={Plug} label="MCP Connectors" expanded={sidebarExpanded} />
          <SidebarItem icon={Cloud} label="Google Drive / OneDrive" expanded={sidebarExpanded} />
          <SidebarItem icon={Palette} label="Canva Import" expanded={sidebarExpanded} />
          <SidebarItem icon={Link} label="Custom URL Sources" expanded={sidebarExpanded} />

          {/* Resource Factory Section */}
          <AnimatePresence>
            {sidebarExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 overflow-hidden"
              >
                <p className="text-[10px] uppercase tracking-widest text-white/40 px-2 mb-1.5 font-medium">
                  Resource Factory
                </p>
                <div className="space-y-0.5">
                  {[
                    { name: 'ERIC (1.5M+ records)', on: true },
                    { name: 'OER Commons', on: true },
                    { name: 'AIATSIS', on: true },
                    { name: 'Khan Academy', on: false },
                    { name: 'CSIRO Education', on: true },
                    { name: 'ABC Education', on: true },
                    { name: 'Bureau of Meteorology', on: false },
                    { name: 'National Library of Aus.', on: false },
                  ].map(src => (
                    <button
                      key={src.name}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left hover:bg-white/10 transition-colors group"
                    >
                      {src.on ? (
                        <ToggleRight className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <ToggleLeft className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                      )}
                      <span className={cn(
                        'text-[12px] truncate flex-1',
                        src.on ? 'text-white/80' : 'text-white/40'
                      )}>
                        {src.name}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {!sidebarExpanded && (
            <SidebarItem icon={Database} label="Resource Factory" expanded={sidebarExpanded} />
          )}

          {/* Chat History (visible when expanded) */}
          <AnimatePresence>
            {sidebarExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 overflow-hidden"
              >
                <p className="text-[10px] uppercase tracking-widest text-white/40 px-2 mb-1.5 font-medium">
                  Recent Searches
                </p>
                <div className="space-y-0.5 max-h-40 overflow-y-auto">
                  {chatHistory.slice(0, 6).map(entry => (
                    <button
                      key={entry.id}
                      onClick={() => handleHistoryClick(entry)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left hover:bg-white/10 transition-colors group"
                    >
                      <History className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                      <span className="text-[12px] text-white/70 truncate flex-1 group-hover:text-white transition-colors">
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
                teachingTo={teachingTo || 'all'}
                classroomContext={classroomContext}
                webSearchEnabled={webSearchEnabled}
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
                teachingTo={teachingTo}
                setTeachingTo={setTeachingTo}
                gradeLevels={GRADE_LEVELS}
                classroomContext={classroomContext}
                setClassroomContext={setClassroomContext}
                webSearchEnabled={webSearchEnabled}
                setWebSearchEnabled={setWebSearchEnabled}
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
  teachingTo,
  setTeachingTo,
  gradeLevels,
  classroomContext,
  setClassroomContext,
  webSearchEnabled,
  setWebSearchEnabled,
}: {
  tools: ToolCard[];
  onSearch: (q: string) => void;
  onToolClick: (tool: ToolCard) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  userName: string;
  teachingTo: GradeLevel | null;
  setTeachingTo: (g: GradeLevel) => void;
  gradeLevels: readonly { id: string; label: string; ages: string }[];
  classroomContext: ClassroomContextData;
  setClassroomContext: (ctx: ClassroomContextData) => void;
  webSearchEnabled: boolean;
  setWebSearchEnabled: (v: boolean) => void;
}) {
  const suggestions = [
    'Water scarcity Year 9 Geography Queensland',
    'First Nations perspectives Year 10 History',
    'Climate change data Year 11 Science',
    'Quadratic equations Year 10 Mathematics',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teachingTo) return; // Grade level is mandatory
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
            <Button type="submit" disabled={!searchQuery.trim() || !teachingTo} className="flex-shrink-0 h-10 px-5 ml-2 rounded-full gap-2">
              <Send className="w-4 h-4" /> Search
            </Button>
          </div>

          {/* Web Search Toggle */}
          <div className="flex items-center justify-end mt-2 gap-2">
            <button
              type="button"
              onClick={() => setWebSearchEnabled(!webSearchEnabled)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-200 border',
                webSearchEnabled
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-white text-slate-400 border-slate-200 hover:text-slate-600 hover:border-slate-300'
              )}
            >
              {webSearchEnabled ? (
                <ToggleRight className="w-3.5 h-3.5 text-amber-500" />
              ) : (
                <ToggleLeft className="w-3.5 h-3.5" />
              )}
              <Globe className="w-3 h-3" />
              Web Search
              {webSearchEnabled && (
                <span className="text-[9px] font-bold uppercase px-1 py-0.5 rounded bg-amber-200 text-amber-800 leading-none">
                  ON
                </span>
              )}
            </button>
            {webSearchEnabled && (
              <motion.span
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[10px] text-amber-600"
              >
                Extended sources enabled — results tagged as Bronze tier
              </motion.span>
            )}
          </div>
        </motion.form>

        {/* Teaching To — Mandatory Grade Level Selector */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="max-w-3xl mx-auto"
        >
          <div className={cn(
            'p-3 rounded-2xl border-2 transition-all duration-300',
            !teachingTo ? 'border-amber-200 bg-amber-50/50' : 'border-emerald-200 bg-emerald-50/30'
          )}>
            <div className="flex items-center gap-2 justify-center mb-2.5">
              <Users className={cn('w-4 h-4', !teachingTo ? 'text-amber-600' : 'text-emerald-600')} />
              <span className={cn('text-sm font-semibold', !teachingTo ? 'text-amber-800' : 'text-emerald-800')}>
                Teaching to:
              </span>
              <span className={cn(
                'text-[10px] font-bold uppercase px-1.5 py-0.5 rounded',
                !teachingTo ? 'bg-amber-200 text-amber-700' : 'bg-emerald-200 text-emerald-700'
              )}>
                {!teachingTo ? 'Required' : 'Selected'}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {gradeLevels.map(level => (
                <button
                  key={level.id}
                  onClick={() => setTeachingTo(level.id as GradeLevel)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 border',
                    teachingTo === level.id
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm scale-105'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-700'
                  )}
                >
                  {level.label}
                </button>
              ))}
            </div>
            {!teachingTo ? (
              <p className="text-xs text-amber-600 text-center mt-2 font-medium">
                Select a grade level to ensure age-appropriate content delivery
              </p>
            ) : (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-emerald-600 text-center mt-2"
              >
                Content will be filtered for ages {gradeLevels.find(g => g.id === teachingTo)?.ages}
              </motion.p>
            )}
          </div>
        </motion.div>

        {/* Classroom Context — Localised content embedding */}
        <ClassroomContext
          context={classroomContext}
          onChange={setClassroomContext}
        />

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
              onClick={() => {
                if (!teachingTo) {
                  // Just fill the query, don't search — they need to pick a grade first
                  setSearchQuery(s);
                  return;
                }
                setSearchQuery(s);
                onSearch(s);
              }}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors',
                teachingTo
                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              )}
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
          <a
            href="/tools"
            className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
          >
            Explore All Tools <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {tools.slice(0, 8).map((tool, i) => {
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

          {/* Explore All Tools card */}
          <motion.a
            href="/tools"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + 8 * 0.03 }}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:border-primary hover:bg-emerald-50/50 transition-all duration-200 text-center group"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[13px] font-semibold text-slate-500 group-hover:text-emerald-700 transition-colors">
                Explore All {tools.length}+ Tools
              </h3>
            </div>
          </motion.a>
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
        <div className="flex items-center gap-3 flex-wrap text-xs text-slate-500">
          {[
            { phase: 'Search', detail: 'HyDE + Hybrid RAG + ColBERT Rerank' },
            { phase: 'Evaluate', detail: 'Dual-Agent Filter + Consensus' },
            { phase: 'Synthesize', detail: 'Verified Summary + Citations' },
          ].map((step, i) => (
            <span key={step.phase} className="flex items-center gap-2">
              {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
              <span className="flex flex-col px-3 py-1.5 rounded-lg bg-white border border-slate-200">
                <span className="font-semibold text-slate-700">{step.phase}</span>
                <span className="text-[10px] text-slate-400">{step.detail}</span>
              </span>
            </span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
