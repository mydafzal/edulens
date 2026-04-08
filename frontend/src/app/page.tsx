'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ArrowRight,
  ArrowUpRight,
  Check,
  X,
  ChevronDown,
} from 'lucide-react';
import { ResourceCard, LocalizationPanel, AppShell } from '@/components/edulens';
import type { Resource, ScopeLevel, Adaptation, LocalContext } from '@/types/edulens';

// ---------------------------------------------------------------------------
// Sample data (unchanged)
// ---------------------------------------------------------------------------
const sampleResources: Resource[] = [
  {
    id: '1',
    title: 'Water Scarcity in the Murray-Darling Basin',
    description:
      'Comprehensive overview of water management challenges in Australia\'s most important river system.',
    type: 'article',
    thumbnail:
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=400&fit=crop',
    source: {
      name: 'ABC Education',
      url: 'https://education.abc.net.au',
      author: 'Dr. Sarah Mitchell',
      publishDate: '2024-08-15',
      license: 'CC BY-NC',
      licenseType: 'cc-by-nc',
    },
    scorecard: {
      accuracy: { name: 'accuracy', label: 'Accuracy', level: 'safe', score: 92, rationale: 'Information verified against Bureau of Meteorology data.' },
      bias: { name: 'bias', label: 'Bias', level: 'safe', score: 88, rationale: 'Presents multiple stakeholder perspectives.' },
      ageAppropriateness: { name: 'ageAppropriateness', label: 'Age Appropriate', level: 'safe', score: 95, rationale: 'Suitable for Years 9-10.' },
      culturalSensitivity: { name: 'culturalSensitivity', label: 'Cultural Sensitivity', level: 'safe', score: 85, rationale: 'Includes First Nations perspectives.' },
      safety: { name: 'safety', label: 'Safety', level: 'safe', score: 100, rationale: 'No safety concerns.' },
      overallScore: 92,
    },
    curriculumAlignment: ['ACHGK051', 'ACHGK052'],
    yearLevels: [9, 10],
    subjects: ['Geography', 'Science'],
    tags: ['Water', 'Environment', 'Murray-Darling'],
  },
  {
    id: '2',
    title: 'Climate Data Visualization Tool',
    description:
      'Interactive tool for exploring climate data trends across Australian regions.',
    type: 'interactive',
    thumbnail:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop',
    source: {
      name: 'Bureau of Meteorology',
      url: 'http://www.bom.gov.au/climate/data/',
      publishDate: '2024-06-01',
      license: 'CC BY',
      licenseType: 'cc-by',
    },
    scorecard: {
      accuracy: { name: 'accuracy', label: 'Accuracy', level: 'safe', score: 98, rationale: 'Official government data source.' },
      bias: { name: 'bias', label: 'Bias', level: 'safe', score: 95, rationale: 'Raw data presentation.' },
      ageAppropriateness: { name: 'ageAppropriateness', label: 'Age Appropriate', level: 'caution', score: 72, rationale: 'May need teacher guidance.' },
      culturalSensitivity: { name: 'culturalSensitivity', label: 'Cultural Sensitivity', level: 'safe', score: 90, rationale: 'Neutral data presentation.' },
      safety: { name: 'safety', label: 'Safety', level: 'safe', score: 100, rationale: 'No safety concerns.' },
      overallScore: 91,
    },
    yearLevels: [9, 10, 11, 12],
    subjects: ['Science', 'Geography', 'Mathematics'],
    tags: ['Climate', 'Data', 'Interactive'],
  },
  {
    id: '3',
    title: 'First Nations Water Stories: The Murray River',
    description:
      'Documentary exploring the cultural significance of the Murray River to First Nations peoples.',
    type: 'video',
    thumbnail:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
    source: {
      name: 'AIATSIS',
      url: 'https://aiatsis.gov.au',
      author: 'Ngarrindjeri Elders Council',
      publishDate: '2023-11-20',
      license: 'Educational Use',
      licenseType: 'copyrighted',
    },
    scorecard: {
      accuracy: { name: 'accuracy', label: 'Accuracy', level: 'safe', score: 95, rationale: 'Developed with Traditional Owners.' },
      bias: { name: 'bias', label: 'Bias', level: 'safe', score: 90, rationale: 'Centres First Nations perspectives.' },
      ageAppropriateness: { name: 'ageAppropriateness', label: 'Age Appropriate', level: 'safe', score: 88, rationale: 'Suitable for Years 7+.' },
      culturalSensitivity: { name: 'culturalSensitivity', label: 'Cultural Sensitivity', level: 'safe', score: 98, rationale: 'Exemplary cultural protocols.' },
      safety: { name: 'safety', label: 'Safety', level: 'safe', score: 100, rationale: 'No safety concerns.' },
      overallScore: 94,
    },
    yearLevels: [7, 8, 9, 10],
    subjects: ['Geography', 'History', 'Aboriginal Studies'],
    tags: ['First Nations', 'Water', 'Culture'],
  },
  {
    id: '4',
    title: 'Sustainable Agriculture in Regional Australia',
    description:
      'Case study examining sustainable farming practices in drought-prone regions.',
    type: 'pdf',
    source: {
      name: 'CSIRO',
      url: 'https://csiro.au',
      author: 'Agricultural Research Division',
      publishDate: '2024-03-10',
      license: 'CC BY-SA',
      licenseType: 'cc-by-sa',
    },
    scorecard: {
      accuracy: { name: 'accuracy', label: 'Accuracy', level: 'safe', score: 96, rationale: 'Peer-reviewed CSIRO research.' },
      bias: { name: 'bias', label: 'Bias', level: 'caution', score: 78, rationale: 'Focuses on successful adaptations.' },
      ageAppropriateness: { name: 'ageAppropriateness', label: 'Age Appropriate', level: 'safe', score: 82, rationale: 'General audience writing.' },
      culturalSensitivity: { name: 'culturalSensitivity', label: 'Cultural Sensitivity', level: 'caution', score: 70, rationale: 'Limited Indigenous perspectives.' },
      safety: { name: 'safety', label: 'Safety', level: 'safe', score: 100, rationale: 'No safety concerns.' },
      overallScore: 85,
    },
    yearLevels: [9, 10, 11],
    subjects: ['Geography', 'Agriculture', 'Science'],
    tags: ['Agriculture', 'Sustainability', 'Drought'],
  },
];

const sampleAdaptations: Adaptation[] = [
  {
    type: 'example',
    original: 'Consider a major river system in your country...',
    adapted: 'The Condamine-Balonne River system in the Darling Downs region faces similar challenges...',
    rationale: 'Replaced generic example with local Toowoomba reference',
  },
  {
    type: 'reference',
    original: 'Local farmers have adapted to water scarcity...',
    adapted: 'Farmers in the Lockyer Valley have pioneered innovative drip irrigation systems...',
    rationale: 'Added regional Queensland agricultural reference',
  },
  {
    type: 'cultural',
    original: 'Indigenous communities have traditional water management practices...',
    adapted: 'The Jarowair and Giabal peoples, Traditional Owners of the Toowoomba region, have practiced sustainable water management for thousands of years...',
    rationale: 'Incorporated local First Nations context',
  },
  {
    type: 'reading-level',
    original: 'The anthropogenic factors contributing to hydrological stress...',
    adapted: 'Human activities that put pressure on water supplies...',
    rationale: 'Simplified for Year 9 reading level',
  },
];

const sampleLocalContext: LocalContext = {
  country: 'Australia',
  state: 'Queensland',
  region: 'Darling Downs',
  suburb: 'Toowoomba',
  yearLevel: 9,
  subject: 'Geography',
  studentInterests: ['Sports', 'Gaming', 'Music'],
  communityAnchors: ['Toowoomba Grammar', 'USQ', 'Picnic Point'],
};

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
// Component
// ---------------------------------------------------------------------------
export default function Home() {
  const [searchInputValue, setSearchInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Resource[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [showLocalization, setShowLocalization] = useState(false);
  const [notification, setNotification] = useState<{ message: string } | null>(null);
  const [profileData, setProfileData] = useState<{
    schoolName?: string;
    state?: string;
    suburb?: string;
    yearLevels?: string[];
    subjects?: string[];
  } | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem('edulens-profile');
    if (savedProfile) {
      try {
        setProfileData(JSON.parse(savedProfile));
      } catch {
        // ignore
      }
    }
  }, []);

  const displayName = profileData?.schoolName ?? 'Teacher';

  const handleSearch = useCallback(async (query: string, scope: ScopeLevel) => {
    if (!query.trim()) return;
    setSearchQuery(query);
    setIsSearching(true);
    setHasSearched(true);

    const history = JSON.parse(localStorage.getItem('edulens-search-history') || '[]');
    const newHistory = [query, ...history.filter((h: string) => h !== query)].slice(0, 10);
    localStorage.setItem('edulens-search-history', JSON.stringify(newHistory));

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const filtered = sampleResources.filter(
      (r) =>
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.description.toLowerCase().includes(query.toLowerCase()) ||
        r.tags?.some((t) => query.toLowerCase().includes(t.toLowerCase()))
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
    setNotification({ message: `${adaptations.length} adaptations applied successfully!` });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSaveResource = (resource: Resource) => {
    const saved = JSON.parse(localStorage.getItem('edulens-library') || '[]');
    const alreadySaved = saved.some((r: Resource) => r.id === resource.id);
    if (!alreadySaved) {
      saved.push(resource);
      localStorage.setItem('edulens-library', JSON.stringify(saved));
      setNotification({ message: `"${resource.title}" saved to library.` });
    } else {
      setNotification({ message: 'Already in your library.' });
    }
    setTimeout(() => setNotification(null), 3000);
  };

  const handleShareResource = (resource: Resource) => {
    navigator.clipboard.writeText(resource.source.url);
    setNotification({ message: 'Link copied to clipboard!' });
    setTimeout(() => setNotification(null), 3000);
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
          <div
            className="flex flex-col gap-3 p-5 rounded-2xl"
            style={{ background: '#f97316' }}
          >
            <div>
              <p className="text-[15px] font-semibold text-white">✨ Instant Lesson Creation</p>
              <p className="text-[12px] text-white/80 mt-0.5">Generate ready-to-use lesson plans</p>
            </div>
            <div className="mt-auto pt-2">
              <button className="bg-white text-[#f97316] rounded-full px-4 py-2 text-[13px] font-medium hover:bg-white/90 transition-colors">
                Generate Lesson Plan →
              </button>
            </div>
          </div>

          {/* Card 2 — Trusted Evaluation */}
          <div className="flex flex-col gap-3 p-5 rounded-2xl bg-white border border-[#e2e8f0]">
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
          </div>

          {/* Card 3 — One-Click Adaptation */}
          <div className="flex flex-col gap-3 p-5 rounded-2xl bg-white border border-[#e2e8f0]">
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
          </div>
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
                {(['Year Level', 'Course', 'Location'] as const).map((label) => (
                  <button
                    key={label}
                    className="flex items-center gap-1.5 border border-[#e2e8f0] rounded-full px-4 py-2 text-[13px] text-[#0f172a] hover:bg-[#f8fafc] transition-colors"
                  >
                    {label}
                    <ChevronDown className="w-3.5 h-3.5 text-[#94a3b8]" />
                  </button>
                ))}
                <button className="flex items-center gap-1.5 bg-[#0f172a] text-white rounded-full px-5 py-2 text-[13px] font-medium hover:bg-[#1e293b] transition-colors">
                  Create classroom
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </section>

            {/* Suggested For You */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[20px] font-bold text-[#0f172a]">
                  Suggested For You{' '}
                  <span className="text-[14px] font-normal text-[#94a3b8]">(AI recommended)</span>
                </h2>
                <button className="text-[13px] text-[#64748b] hover:text-[#0f172a] transition-colors">
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
                <button className="text-[13px] text-[#64748b] hover:text-[#0f172a] transition-colors">
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
                        <p className="text-[12px] text-[#94a3b8] mt-1 pl-0">{alert.description}</p>
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
                <button className="text-[13px] text-[#64748b] hover:text-[#0f172a] transition-colors">
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

      {/* ------------------------------------------------------------------ */}
      {/* Notification Toast                                                   */}
      {/* ------------------------------------------------------------------ */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="flex items-center gap-3 px-4 py-3 bg-white border border-[#e2e8f0] rounded-[12px] shadow-md">
              <Check className="w-5 h-5 text-[#f97316] flex-shrink-0" />
              <p className="text-[15px] text-[#0f172a]">{notification.message}</p>
              <button
                onClick={() => setNotification(null)}
                className="p-1.5 rounded-[6px] hover:bg-[#f0f0f0] transition-colors"
              >
                <X className="w-4 h-4 text-[#64748b]" />
              </button>
            </div>
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
