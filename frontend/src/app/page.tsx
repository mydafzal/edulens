'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ResourceCard, LocalizationPanel, AppShell } from '@/components/edulens';
import type { Resource, ScopeLevel, Adaptation } from '@/types/edulens';
import { sampleResources, sampleAdaptations, sampleLocalContext } from '@/lib/demoData';
import { showToast } from '@/lib/toast';

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
// Dropdown picker (Year Level / Course / Location)
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
// Component
// ---------------------------------------------------------------------------
export default function Home() {
  const router = useRouter();
  const [searchInputValue, setSearchInputValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Resource[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [showLocalization, setShowLocalization] = useState(false);
  const [profileData, setProfileData] = useState<{
    schoolName?: string;
    state?: string;
    suburb?: string;
    yearLevels?: string[];
    subjects?: string[];
  } | null>(null);

  // Classroom setup dropdowns
  const [yearLevel, setYearLevel] = useState<string | null>(null);
  const [course, setCourse] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem('edulens-profile');
    if (savedProfile) {
      try { setProfileData(JSON.parse(savedProfile)); } catch { /* ignore */ }
    }
    // Pre-fill from URL query
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      setSearchInputValue(q);
      handleSearch(q, 'state');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayName = profileData?.schoolName ?? 'Teacher';

  const handleSearch = useCallback(async (query: string, _scope: ScopeLevel) => {
    if (!query.trim()) return;
    setIsSearching(true);
    setHasSearched(true);

    const history = JSON.parse(localStorage.getItem('edulens-search-history') || '[]');
    const newHistory = [query, ...history.filter((h: string) => h !== query)].slice(0, 10);
    localStorage.setItem('edulens-search-history', JSON.stringify(newHistory));

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const q = query.toLowerCase();
    const filtered = sampleResources.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.tags?.some((t) => t.toLowerCase().includes(q))
    );
    setSearchResults(filtered.length > 0 ? filtered : sampleResources);
    setIsSearching(false);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchInputValue, 'state');
  };

  const handleLocalize = (resource: Resource) => {
    setSelectedResource(resource);
    setShowLocalization(true);
  };

  const handleAcceptAdaptations = (adaptations: Adaptation[]) => {
    setShowLocalization(false);
    setSelectedResource(null);
    showToast(`${adaptations.length} adaptations applied successfully!`);
  };

  const handleSaveResource = (resource: Resource) => {
    const saved = JSON.parse(localStorage.getItem('edulens-library') || '[]');
    const alreadySaved = saved.some((r: Resource) => r.id === resource.id);
    if (!alreadySaved) {
      saved.push(resource);
      localStorage.setItem('edulens-library', JSON.stringify(saved));
      showToast(`"${resource.title}" saved to library.`);
    } else {
      showToast('Already in your library.');
    }
  };

  const handleShareResource = (resource: Resource) => {
    navigator.clipboard.writeText(resource.source.url).catch(() => {});
    showToast('Link copied to clipboard!');
  };

  const handleCreateClassroom = () => {
    const parts: string[] = [];
    if (yearLevel) parts.push(yearLevel);
    if (course) parts.push(course);
    if (location) parts.push(location);
    if (parts.length === 0) {
      router.push('/profile');
      return;
    }
    showToast(`Classroom set: ${parts.join(' · ')}`);
    handleSearch(parts.join(' '), 'state');
  };

  const suggestedResources = hasSearched ? searchResults : sampleResources;

  return (
    <AppShell>
      <div className="px-8 py-8">
        {/* ---------------------------------------------------------------- */}
        {/* Welcome                                                           */}
        {/* ---------------------------------------------------------------- */}
        <div className="mb-6">
          <h1 className="text-[36px] font-bold text-[#0f172a] leading-tight">
            Welcome in, {displayName}
          </h1>
          <p className="text-[13px] text-[#64748b] mt-1">
            Discover, evaluate, and adapt the best teaching resources — in seconds.
          </p>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Feature cards row                                                  */}
        {/* ---------------------------------------------------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Card 1 — Instant Lesson Creation */}
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

          {/* Card 2 — Trusted Evaluation */}
          <button
            onClick={() => {
              searchInputRef.current?.focus();
              showToast('Search for a resource to see its quality scorecard.');
            }}
            className="flex flex-col gap-3 p-5 rounded-2xl bg-white border border-[#e2e8f0] text-left hover:border-[#cbd5e1] transition-colors"
          >
            <div>
              <p className="text-[15px] font-semibold text-[#0f172a]">📊 Trusted Evaluation</p>
              <p className="text-[12px] text-[#64748b] mt-0.5">See quality, bias &amp; safety insights</p>
            </div>
            <div className="flex flex-wrap gap-2 mt-auto pt-2">
              <span className="bg-[#0f172a] text-white rounded-full text-[12px] px-3 py-1">
                95% accuracy score
              </span>
              <span className="border border-[#e2e8f0] text-[#64748b] rounded-full text-[12px] px-3 py-1">
                5% errors
              </span>
            </div>
          </button>

          {/* Card 3 — One-Click Adaptation */}
          <button
            onClick={() => router.push('/library')}
            className="flex flex-col gap-3 p-5 rounded-2xl bg-white border border-[#e2e8f0] text-left hover:border-[#cbd5e1] transition-colors"
          >
            <div>
              <p className="text-[15px] font-semibold text-[#0f172a]">🌐 One-Click Adaptation</p>
              <p className="text-[12px] text-[#64748b] mt-0.5">Tailor content to your classroom</p>
            </div>
            <div className="flex flex-wrap gap-2 mt-auto pt-2">
              <span className="border border-[#e2e8f0] text-[#64748b] rounded-full text-[12px] px-3 py-1">
                Lessons
              </span>
              <span className="border border-[#e2e8f0] text-[#64748b] rounded-full text-[12px] px-3 py-1">
                Classrooms
              </span>
            </div>
          </button>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Two-column layout                                                 */}
        {/* ---------------------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* -------- LEFT -------- */}
          <div className="min-w-0 space-y-6">
            {/* Smart Resource Discovery */}
            <section>
              <h2 className="text-[20px] font-bold text-[#0f172a] mb-3">
                Smart Resource Discovery
              </h2>
              <form onSubmit={handleSearchSubmit}>
                <div className="flex items-center h-[52px] bg-white border border-[#e2e8f0] rounded-full px-4 gap-3">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchInputValue}
                    onChange={(e) => setSearchInputValue(e.target.value)}
                    placeholder="Search for resources, plans & lessons"
                    className="flex-1 bg-transparent text-[14px] text-[#0f172a] placeholder:text-[#94a3b8] outline-none"
                  />
                  <button
                    type="submit"
                    aria-label="Search"
                    className="w-9 h-9 bg-[#f97316] rounded-full flex items-center justify-center shrink-0 hover:bg-[#ea6c0a] transition-colors"
                  >
                    <Search className="w-4 h-4 text-white" />
                  </button>
                </div>
              </form>
            </section>

            {/* Quick Classroom Setup */}
            <section>
              <h2 className="text-[20px] font-bold text-[#0f172a]">Quick Classroom Setup</h2>
              <p className="text-[13px] text-[#64748b] mt-0.5 mb-3">
                Setup your classroom profile
              </p>
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

            {/* Suggested For You */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[20px] font-bold text-[#0f172a]">
                  {hasSearched ? 'Search Results' : 'Suggested For You'}{' '}
                  <span className="text-[14px] font-normal text-[#94a3b8]">(AI recommended)</span>
                </h2>
                <button
                  onClick={() => router.push('/library')}
                  className="text-[13px] text-[#64748b] hover:text-[#0f172a] transition-colors"
                >
                  View All →
                </button>
              </div>

              {isSearching ? (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="min-w-[280px] h-[220px] rounded-2xl border border-[#e2e8f0] bg-white animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {suggestedResources.map((resource) => (
                    <SuggestedCard
                      key={resource.id}
                      resource={resource}
                      onLocalize={handleLocalize}
                      onSave={handleSaveResource}
                      onShare={handleShareResource}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* -------- RIGHT 380px -------- */}
          <div className="space-y-4 lg:sticky lg:top-6 lg:h-fit">
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
                          <span className="bg-[#fef3c7] text-[#b45309] rounded-full text-[11px] px-2 py-0.5 shrink-0 ml-auto">
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
                    <span className="bg-[#f0f0f0] text-[#64748b] rounded-full text-[11px] px-2 py-0.5 shrink-0 ml-auto">
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Localization Panel Modal                                             */}
      {/* ------------------------------------------------------------------ */}
      <AnimatePresence>
        {showLocalization && selectedResource && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
            onClick={() => setShowLocalization(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-4xl max-h-[90vh] overflow-auto rounded-t-[16px] sm:rounded-[12px]"
            >
              <LocalizationPanel
                resource={selectedResource}
                adaptations={sampleAdaptations}
                localContext={sampleLocalContext}
                onAccept={handleAcceptAdaptations}
                onReject={() => setShowLocalization(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}

// ---------------------------------------------------------------------------
// Suggested resource card
// ---------------------------------------------------------------------------
function SuggestedCard({
  resource,
  onLocalize,
  onSave,
  onShare,
}: {
  resource: Resource;
  onLocalize: (r: Resource) => void;
  onSave: (r: Resource) => void;
  onShare: (r: Resource) => void;
}) {
  void onSave;
  void onShare;
  const subject = resource.subjects?.[0] ?? resource.type;

  return (
    <div className="min-w-[280px] max-w-[280px] flex flex-col bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden p-4">
      <span className="self-start border border-[#e2e8f0] rounded-full text-[12px] px-3 py-1 text-[#64748b]">
        {subject}
      </span>
      <h3 className="text-[16px] font-semibold text-[#0f172a] mt-2 leading-snug">
        {resource.title}
      </h3>
      <p className="text-[13px] text-[#64748b] mt-1 line-clamp-3 flex-1">
        {resource.description}
      </p>
      <div className="flex items-center justify-between mt-4">
        <span className="text-[12px] text-[#94a3b8]">{resource.source.name}</span>
        <button
          onClick={() => onLocalize(resource)}
          aria-label="Adapt resource"
          className="w-9 h-9 bg-[#0f172a] rounded-full flex items-center justify-center hover:bg-[#1e293b] transition-colors shrink-0"
        >
          <ArrowRight className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}
