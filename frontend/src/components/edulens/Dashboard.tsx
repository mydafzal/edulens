'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Clock,
  Trash2,
  Globe,
  ChevronDown,
  X,
  RotateCcw,
  ArrowRight,
  ArrowUpRight,
} from 'lucide-react';
import { SearchPipeline } from './SearchPipeline';
import {
  GRADE_LEVELS,
  defaultClassroomContext,
} from '@/data/mockData';
import type {
  GradeLevelId,
  ClassroomContextData,
  ChatHistoryItem,
} from '@/data/mockData';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

// ---------------------------------------------------------------------------
// Static sidebar data
// ---------------------------------------------------------------------------
const automationAlerts = [
  {
    icon: '📚',
    title: 'New curriculum update available',
    date: 'Today',
    description: 'Year 9 Geography resources have been refreshed.',
  },
  {
    icon: '🔒',
    title: 'Resource access expiring soon',
    date: 'In 3 days',
    description: 'AIATSIS documentary licence renewal needed.',
  },
];

const recentActivityItems = [
  { text: 'Searched "water scarcity Year 9 Geography"', time: '2h ago' },
  { text: 'Saved Climate Data Visualization Tool', time: 'Yesterday' },
  { text: 'Adapted Murray-Darling Basin article', time: '3 days ago' },
];

// ---------------------------------------------------------------------------
// Dropdown picker (Quick Classroom Setup)
// ---------------------------------------------------------------------------
const YEAR_LEVEL_OPTIONS = ['Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11', 'Year 12'];
const COURSE_OPTIONS = ['Geography', 'History', 'Science', 'English', 'Mathematics', 'Art'];
const LOCATION_OPTIONS = ['Queensland', 'New South Wales', 'Victoria', 'South Australia', 'Western Australia'];

function DropdownPicker({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string | null;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 border border-[#e2e8f0] rounded-full px-4 py-2 text-[13px] text-[#0f172a] hover:bg-[#f8fafc] transition-colors"
        style={value ? { borderColor: '#0f172a', background: '#f8fafc' } : {}}
      >
        {value ?? label}
        {value ? (
          <button
            onClick={(e) => { e.stopPropagation(); onChange(''); setOpen(false); }}
            className="ml-1 hover:text-red-500 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-[#94a3b8]" />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full mt-1 left-0 bg-white border border-[#e2e8f0] rounded-[12px] shadow-lg z-50 py-1 min-w-[160px]"
          >
            {options.map((opt) => (
              <li key={opt}>
                <button
                  onClick={() => { onChange(opt); setOpen(false); }}
                  className="w-full text-left px-4 py-2 text-[13px] text-[#0f172a] hover:bg-[#f8fafc] transition-colors"
                >
                  {opt}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Time-ago helper
// ---------------------------------------------------------------------------
function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ---------------------------------------------------------------------------
// Toast notification
// ---------------------------------------------------------------------------
function ToastNotification({ notification }: { notification: string | null }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="bg-[#0f172a] text-white rounded-[12px] px-5 py-3 text-[14px] shadow-lg whitespace-nowrap"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
export default function Dashboard() {
  const router = useRouter();

  // Core state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [teachingTo, setTeachingTo] = useState<GradeLevelId | null>(null);
  const [classroomContext, setClassroomContext] = useState<ClassroomContextData>(defaultClassroomContext);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [showGradeError, setShowGradeError] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  // Quick classroom setup
  const [yearLevel, setYearLevel] = useState<string | null>(null);
  const [course, setCourse] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);

  // Profile display name
  const [displayName, setDisplayName] = useState('Teacher');

  // Load persisted state on mount
  useEffect(() => {
    try {
      const ctx = localStorage.getItem('scora-classroom-context');
      if (ctx) setClassroomContext(JSON.parse(ctx));
    } catch { /* ignore */ }

    try {
      const hist = localStorage.getItem('scora-chat-history');
      if (hist) setChatHistory(JSON.parse(hist));
    } catch { /* ignore */ }

    try {
      const profile = localStorage.getItem('scora-profile');
      if (profile) {
        const p = JSON.parse(profile);
        if (p.schoolName) setDisplayName(p.schoolName);
        if (p.yearLevels?.[0]) {
          const yr = parseInt(p.yearLevels[0]);
          if (yr <= 2) setTeachingTo('early');
          else if (yr <= 6) setTeachingTo('primary');
          else if (yr <= 9) setTeachingTo('middle');
          else setTeachingTo('senior');
        }
      }
    } catch { /* ignore */ }
  }, []);

  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const handleSearch = useCallback(
    (query: string) => {
      if (!query.trim() || !teachingTo) return;
      const item: ChatHistoryItem = {
        id: Date.now().toString(),
        query: query.trim(),
        teachingTo: teachingTo,
        timestamp: new Date().toISOString(),
      };
      const updated = [item, ...chatHistory].slice(0, 20);
      setChatHistory(updated);
      localStorage.setItem('scora-chat-history', JSON.stringify(updated));
      setSearchQuery(query.trim());
      setIsSearchActive(true);
    },
    [chatHistory, teachingTo],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!teachingTo) { setShowGradeError(true); return; }
      setShowGradeError(false);
      handleSearch(inputValue);
    },
    [teachingTo, inputValue, handleSearch],
  );

  const handleBackToHome = useCallback(() => {
    setIsSearchActive(false);
    setSearchQuery('');
    setInputValue('');
  }, []);

  const clearHistory = useCallback(() => {
    setChatHistory([]);
    localStorage.removeItem('scora-chat-history');
  }, []);

  const handleCreateClassroom = () => {
    const parts: string[] = [];
    if (yearLevel) parts.push(yearLevel);
    if (course) parts.push(course);
    if (location) parts.push(location);
    if (parts.length === 0) { router.push('/profile'); return; }
    showNotification(`Classroom set: ${parts.join(' · ')}`);
  };

  // -------------------------------------------------------------------------
  // SEARCH ACTIVE — hand off to SearchPipeline
  // -------------------------------------------------------------------------
  if (isSearchActive && teachingTo) {
    const userRole = (() => {
      try { return localStorage.getItem('scora-role') || 'teacher'; } catch { return 'teacher'; }
    })();

    return (
      <>
        <SearchPipeline
          query={searchQuery}
          teachingTo={teachingTo}
          classroomContext={classroomContext}
          webSearchEnabled={webSearchEnabled}
          onBack={handleBackToHome}
          onNewSearch={handleSearch}
          userRole={userRole}
        />
        <ToastNotification notification={notification} />
      </>
    );
  }

  // -------------------------------------------------------------------------
  // HOME VIEW
  // -------------------------------------------------------------------------
  const searchDisabled = !inputValue.trim() || !teachingTo;

  return (
    <>
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">

          {/* ================================================================
              LEFT COLUMN
          ================================================================ */}
          <div className="min-w-0 space-y-6">

            {/* Greeting */}
            <div>
              <h1 className="text-[32px] font-bold text-[#0f172a] leading-tight">
                Welcome in, {displayName}
              </h1>
              <p className="text-[13px] text-[#64748b] mt-1">
                Discover, evaluate, and adapt the best teaching resources — in seconds.
              </p>
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => router.push('/plans')}
                className="flex flex-col gap-3 p-5 rounded-2xl text-left hover:opacity-90 transition-opacity"
                style={{ background: '#f97316' }}
              >
                <div>
                  <p className="text-[15px] font-semibold text-white">✨ Instant Lesson Creation</p>
                  <p className="text-[12px] text-white/80 mt-0.5">Generate ready-to-use lesson plans</p>
                </div>
                <div className="mt-auto pt-2">
                  <span className="bg-white text-[#f97316] rounded-full px-4 py-2 text-[13px] font-medium">
                    Generate Lesson Plan →
                  </span>
                </div>
              </button>

              <button
                onClick={() => showNotification('Search for a resource to see its quality scorecard.')}
                className="flex flex-col gap-3 p-5 rounded-2xl bg-white border border-[#e2e8f0] text-left hover:border-[#cbd5e1] transition-colors"
              >
                <div>
                  <p className="text-[15px] font-semibold text-[#0f172a]">📊 Trusted Evaluation</p>
                  <p className="text-[12px] text-[#64748b] mt-0.5">See quality, bias &amp; safety insights</p>
                </div>
                <div className="flex flex-wrap gap-2 mt-auto pt-2">
                  <span className="bg-[#0f172a] text-white rounded-full text-[12px] px-3 py-1">95% accuracy score</span>
                  <span className="border border-[#e2e8f0] text-[#64748b] rounded-full text-[12px] px-3 py-1">5% errors</span>
                </div>
              </button>

              <button
                onClick={() => router.push('/library')}
                className="flex flex-col gap-3 p-5 rounded-2xl bg-white border border-[#e2e8f0] text-left hover:border-[#cbd5e1] transition-colors"
              >
                <div>
                  <p className="text-[15px] font-semibold text-[#0f172a]">🌐 One-Click Adaptation</p>
                  <p className="text-[12px] text-[#64748b] mt-0.5">Tailor content to your classroom</p>
                </div>
                <div className="flex flex-wrap gap-2 mt-auto pt-2">
                  <span className="border border-[#e2e8f0] text-[#64748b] rounded-full text-[12px] px-3 py-1">Lessons</span>
                  <span className="border border-[#e2e8f0] text-[#64748b] rounded-full text-[12px] px-3 py-1">Classrooms</span>
                </div>
              </button>
            </div>

            {/* ── Smart Resource Discovery ── */}
            <section>
              <h2 className="text-[20px] font-bold text-[#0f172a] mb-2">
                Smart Resource Discovery
              </h2>

              {/* Teaching To gate */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-[#64748b] font-medium">Teaching to:</span>
                  {!teachingTo ? (
                    <span className="bg-[#fef3c7] text-[#b45309] rounded-full text-[10px] px-2 py-0.5 font-medium animate-pulse">
                      REQUIRED
                    </span>
                  ) : (
                    <span className="bg-[#dcfce7] text-[#15803d] rounded-full text-[10px] px-2 py-0.5 font-medium">
                      SELECTED ✓
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  {GRADE_LEVELS.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => { setTeachingTo(level.id); setShowGradeError(false); }}
                      className={cn(
                        'rounded-full px-4 py-2 text-[13px] font-medium transition-colors',
                        teachingTo === level.id
                          ? 'bg-[#0f172a] text-white cursor-pointer'
                          : 'bg-white border border-[#e2e8f0] text-[#64748b] cursor-pointer hover:border-[#0f172a]',
                      )}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>

                <AnimatePresence>
                  {showGradeError && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-[#ef4444] text-[12px] mt-1"
                    >
                      ⚠ Please select a year level before searching
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Search bar */}
              <form
                onSubmit={handleSubmit}
                className="flex items-center h-[52px] bg-white border border-[#e2e8f0] rounded-full px-5 gap-3 mt-3"
              >
                <Search className="w-[18px] h-[18px] text-[#94a3b8] shrink-0" />
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Search for resources, plans & lessons"
                  className="flex-1 bg-transparent text-[14px] text-[#0f172a] placeholder:text-[#94a3b8] outline-none"
                />
                <button
                  type="submit"
                  disabled={searchDisabled}
                  aria-label="Search"
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors',
                    searchDisabled
                      ? 'bg-[#f97316] opacity-40 cursor-not-allowed'
                      : 'bg-[#f97316] hover:bg-[#ea6c00] cursor-pointer',
                  )}
                >
                  <Search className="w-4 h-4 text-white" />
                </button>
              </form>

              {/* Web search toggle */}
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[13px] text-[#64748b]">🌐 Include web search</span>
                <div
                  onClick={() => setWebSearchEnabled((p) => !p)}
                  className={cn(
                    'relative w-10 h-6 rounded-full cursor-pointer transition-colors shrink-0',
                    webSearchEnabled ? 'bg-[#f97316]' : 'bg-[#e2e8f0]',
                  )}
                >
                  <div
                    className={cn(
                      'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform',
                      webSearchEnabled ? 'translate-x-4' : 'translate-x-0',
                    )}
                  />
                </div>
                {webSearchEnabled && (
                  <span className="text-[11px] text-[#b45309]">
                    Extended sources enabled · results tagged Bronze tier
                  </span>
                )}
              </div>
            </section>

            {/* ── Quick Classroom Setup ── */}
            <section>
              <h2 className="text-[20px] font-bold text-[#0f172a]">Quick Classroom Setup</h2>
              <p className="text-[13px] text-[#64748b] mt-0.5 mb-3">Setup your classroom profile</p>
              <div className="flex flex-wrap gap-2 items-center">
                <DropdownPicker
                  label="Year Level"
                  options={YEAR_LEVEL_OPTIONS}
                  value={yearLevel}
                  onChange={(v) => setYearLevel(v || null)}
                />
                <DropdownPicker
                  label="Course"
                  options={COURSE_OPTIONS}
                  value={course}
                  onChange={(v) => setCourse(v || null)}
                />
                <DropdownPicker
                  label="Location"
                  options={LOCATION_OPTIONS}
                  value={location}
                  onChange={(v) => setLocation(v || null)}
                />
                <button
                  onClick={handleCreateClassroom}
                  className="flex items-center gap-1.5 bg-[#0f172a] text-white rounded-full px-5 py-2 text-[13px] font-medium hover:bg-[#1e293b] transition-colors"
                >
                  Create classroom
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </section>

            {/* ── Suggested For You ── */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[20px] font-bold text-[#0f172a]">
                  Suggested For You{' '}
                  <span className="text-[14px] font-normal text-[#94a3b8]">(AI recommended)</span>
                </h2>
                <button
                  onClick={() => router.push('/library')}
                  className="text-[13px] text-[#64748b] hover:text-[#0f172a] transition-colors"
                >
                  View All →
                </button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {['Geography', 'Science', 'History'].map((subject) => (
                  <div
                    key={subject}
                    className="min-w-[280px] max-w-[280px] flex flex-col bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden p-4"
                  >
                    <span className="self-start border border-[#e2e8f0] rounded-full text-[12px] px-3 py-1 text-[#64748b]">
                      {subject}
                    </span>
                    <h3 className="text-[16px] font-semibold text-[#0f172a] mt-2 leading-snug">
                      Explore {subject} Resources
                    </h3>
                    <p className="text-[13px] text-[#64748b] mt-1 line-clamp-3 flex-1">
                      Curated teaching materials aligned to the Australian curriculum.
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-[12px] text-[#94a3b8]">EduLens</span>
                      <button
                        onClick={() => {
                          setTeachingTo('middle');
                          setInputValue(`${subject} Year 9`);
                          handleSearch(`${subject} Year 9`);
                        }}
                        aria-label="Explore"
                        className="w-9 h-9 bg-[#0f172a] rounded-full flex items-center justify-center hover:bg-[#1e293b] transition-colors shrink-0"
                      >
                        <ArrowRight className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ================================================================
              RIGHT COLUMN
          ================================================================ */}
          <div className="space-y-4 lg:sticky lg:top-6 lg:h-fit">

            {/* Recent Searches */}
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5">
              <div className="flex items-center mb-3">
                <h3 className="text-[16px] font-bold text-[#0f172a]">Recent Searches</h3>
                {chatHistory.length > 0 && (
                  <button
                    onClick={clearHistory}
                    aria-label="Clear history"
                    className="ml-auto text-[#94a3b8] hover:text-[#ef4444] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {chatHistory.length === 0 ? (
                <p className="text-[13px] text-[#94a3b8] italic text-center py-4">
                  Your search history will appear here
                </p>
              ) : (
                <div className="space-y-0.5">
                  {chatHistory.slice(0, 8).map((item) => {
                    const gradeLabel = GRADE_LEVELS.find((g) => g.id === item.teachingTo)?.label;
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setTeachingTo(item.teachingTo);
                          setInputValue(item.query);
                          handleSearch(item.query);
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-[10px] cursor-pointer hover:bg-[#f8fafc] transition-colors"
                      >
                        <Clock className="w-[14px] h-[14px] text-[#94a3b8] shrink-0" />
                        <span className="text-[13px] text-[#0f172a] truncate flex-1">
                          {item.query}
                        </span>
                        {gradeLabel && (
                          <span className="text-[10px] bg-[#f0f0f0] text-[#64748b] rounded-full px-2 py-0.5 shrink-0">
                            {gradeLabel}
                          </span>
                        )}
                        <span className="text-[11px] text-[#94a3b8] shrink-0">
                          {timeAgo(item.timestamp)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Automation Alerts */}
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[18px] font-bold text-[#0f172a]">Automation Alerts</h3>
                <button
                  onClick={() => router.push('/workflows')}
                  className="text-[13px] text-[#64748b] hover:text-[#0f172a] transition-colors"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-0">
                {automationAlerts.map((alert, i) => (
                  <div
                    key={i}
                    className={`py-3 ${i < automationAlerts.length - 1 ? 'border-b border-[#f0f0f0]' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-[20px] leading-none mt-0.5 shrink-0">{alert.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[14px] font-medium text-[#0f172a] leading-tight flex-1 min-w-0">
                            {alert.title}
                          </p>
                          <span className="bg-[#fef3c7] text-[#b45309] rounded-full text-[11px] px-2 py-0.5 shrink-0">
                            {alert.date}
                          </span>
                        </div>
                        <p className="text-[12px] text-[#94a3b8] mt-1">{alert.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[18px] font-bold text-[#0f172a]">Recent Activity</h3>
                <button
                  onClick={() => router.push('/library')}
                  className="text-[13px] text-[#64748b] hover:text-[#0f172a] transition-colors"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-0">
                {recentActivityItems.map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 py-[10px] ${
                      i < recentActivityItems.length - 1 ? 'border-b border-[#f0f0f0]' : ''
                    }`}
                  >
                    <Search className="w-4 h-4 text-[#94a3b8] shrink-0" />
                    <p className="flex-1 min-w-0 text-[13px] text-[#0f172a] leading-tight">{item.text}</p>
                    <span className="bg-[#f0f0f0] text-[#64748b] rounded-full text-[11px] px-2 py-0.5 shrink-0">
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      <ToastNotification notification={notification} />
    </>
  );
}
