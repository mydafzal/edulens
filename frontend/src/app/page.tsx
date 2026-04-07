'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Shield,
  MapPin,
  BookOpen,
  ArrowUpDown,
  Check,
  X,
  Filter
} from 'lucide-react';
import { SearchBar, ResourceCard, LocalizationPanel, AppShell, StatCard } from '@/components/edulens';
import { BookMarked, FileText, Zap, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Resource, ScopeLevel, Adaptation, LocalContext } from '@/types/edulens';

// Sample data for demo
const sampleResources: Resource[] = [
  {
    id: '1',
    title: 'Water Scarcity in the Murray-Darling Basin',
    description: 'Comprehensive overview of water management challenges in Australia\'s most important river system.',
    type: 'article',
    thumbnail: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=400&fit=crop',
    source: {
      name: 'ABC Education',
      url: 'https://education.abc.net.au',
      author: 'Dr. Sarah Mitchell',
      publishDate: '2024-08-15',
      license: 'CC BY-NC',
      licenseType: 'cc-by-nc'
    },
    scorecard: {
      accuracy: { name: 'accuracy', label: 'Accuracy', level: 'safe', score: 92, rationale: 'Information verified against Bureau of Meteorology data.' },
      bias: { name: 'bias', label: 'Bias', level: 'safe', score: 88, rationale: 'Presents multiple stakeholder perspectives.' },
      ageAppropriateness: { name: 'ageAppropriateness', label: 'Age Appropriate', level: 'safe', score: 95, rationale: 'Suitable for Years 9-10.' },
      culturalSensitivity: { name: 'culturalSensitivity', label: 'Cultural Sensitivity', level: 'safe', score: 85, rationale: 'Includes First Nations perspectives.' },
      safety: { name: 'safety', label: 'Safety', level: 'safe', score: 100, rationale: 'No safety concerns.' },
      overallScore: 92
    },
    curriculumAlignment: ['ACHGK051', 'ACHGK052'],
    yearLevels: [9, 10],
    subjects: ['Geography', 'Science'],
    tags: ['Water', 'Environment', 'Murray-Darling']
  },
  {
    id: '2',
    title: 'Climate Data Visualization Tool',
    description: 'Interactive tool for exploring climate data trends across Australian regions.',
    type: 'interactive',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop',
    source: {
      name: 'Bureau of Meteorology',
      url: 'http://www.bom.gov.au/climate/data/',
      publishDate: '2024-06-01',
      license: 'CC BY',
      licenseType: 'cc-by'
    },
    scorecard: {
      accuracy: { name: 'accuracy', label: 'Accuracy', level: 'safe', score: 98, rationale: 'Official government data source.' },
      bias: { name: 'bias', label: 'Bias', level: 'safe', score: 95, rationale: 'Raw data presentation.' },
      ageAppropriateness: { name: 'ageAppropriateness', label: 'Age Appropriate', level: 'caution', score: 72, rationale: 'May need teacher guidance.' },
      culturalSensitivity: { name: 'culturalSensitivity', label: 'Cultural Sensitivity', level: 'safe', score: 90, rationale: 'Neutral data presentation.' },
      safety: { name: 'safety', label: 'Safety', level: 'safe', score: 100, rationale: 'No safety concerns.' },
      overallScore: 91
    },
    yearLevels: [9, 10, 11, 12],
    subjects: ['Science', 'Geography', 'Mathematics'],
    tags: ['Climate', 'Data', 'Interactive']
  },
  {
    id: '3',
    title: 'First Nations Water Stories: The Murray River',
    description: 'Documentary exploring the cultural significance of the Murray River to First Nations peoples.',
    type: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
    source: {
      name: 'AIATSIS',
      url: 'https://aiatsis.gov.au',
      author: 'Ngarrindjeri Elders Council',
      publishDate: '2023-11-20',
      license: 'Educational Use',
      licenseType: 'copyrighted'
    },
    scorecard: {
      accuracy: { name: 'accuracy', label: 'Accuracy', level: 'safe', score: 95, rationale: 'Developed with Traditional Owners.' },
      bias: { name: 'bias', label: 'Bias', level: 'safe', score: 90, rationale: 'Centres First Nations perspectives.' },
      ageAppropriateness: { name: 'ageAppropriateness', label: 'Age Appropriate', level: 'safe', score: 88, rationale: 'Suitable for Years 7+.' },
      culturalSensitivity: { name: 'culturalSensitivity', label: 'Cultural Sensitivity', level: 'safe', score: 98, rationale: 'Exemplary cultural protocols.' },
      safety: { name: 'safety', label: 'Safety', level: 'safe', score: 100, rationale: 'No safety concerns.' },
      overallScore: 94
    },
    yearLevels: [7, 8, 9, 10],
    subjects: ['Geography', 'History', 'Aboriginal Studies'],
    tags: ['First Nations', 'Water', 'Culture']
  },
  {
    id: '4',
    title: 'Sustainable Agriculture in Regional Australia',
    description: 'Case study examining sustainable farming practices in drought-prone regions.',
    type: 'pdf',
    source: {
      name: 'CSIRO',
      url: 'https://csiro.au',
      author: 'Agricultural Research Division',
      publishDate: '2024-03-10',
      license: 'CC BY-SA',
      licenseType: 'cc-by-sa'
    },
    scorecard: {
      accuracy: { name: 'accuracy', label: 'Accuracy', level: 'safe', score: 96, rationale: 'Peer-reviewed CSIRO research.' },
      bias: { name: 'bias', label: 'Bias', level: 'caution', score: 78, rationale: 'Focuses on successful adaptations.' },
      ageAppropriateness: { name: 'ageAppropriateness', label: 'Age Appropriate', level: 'safe', score: 82, rationale: 'General audience writing.' },
      culturalSensitivity: { name: 'culturalSensitivity', label: 'Cultural Sensitivity', level: 'caution', score: 70, rationale: 'Limited Indigenous perspectives.' },
      safety: { name: 'safety', label: 'Safety', level: 'safe', score: 100, rationale: 'No safety concerns.' },
      overallScore: 85
    },
    yearLevels: [9, 10, 11],
    subjects: ['Geography', 'Agriculture', 'Science'],
    tags: ['Agriculture', 'Sustainability', 'Drought']
  }
];

const sampleAdaptations: Adaptation[] = [
  {
    type: 'example',
    original: 'Consider a major river system in your country...',
    adapted: 'The Condamine-Balonne River system in the Darling Downs region faces similar challenges...',
    rationale: 'Replaced generic example with local Toowoomba reference'
  },
  {
    type: 'reference',
    original: 'Local farmers have adapted to water scarcity...',
    adapted: 'Farmers in the Lockyer Valley have pioneered innovative drip irrigation systems...',
    rationale: 'Added regional Queensland agricultural reference'
  },
  {
    type: 'cultural',
    original: 'Indigenous communities have traditional water management practices...',
    adapted: 'The Jarowair and Giabal peoples, Traditional Owners of the Toowoomba region, have practiced sustainable water management for thousands of years...',
    rationale: 'Incorporated local First Nations context'
  },
  {
    type: 'reading-level',
    original: 'The anthropogenic factors contributing to hydrological stress...',
    adapted: 'Human activities that put pressure on water supplies...',
    rationale: 'Simplified for Year 9 reading level'
  }
];

const sampleLocalContext: LocalContext = {
  country: 'Australia',
  state: 'Queensland',
  region: 'Darling Downs',
  suburb: 'Toowoomba',
  yearLevel: 9,
  subject: 'Geography',
  studentInterests: ['Sports', 'Gaming', 'Music'],
  communityAnchors: ['Toowoomba Grammar', 'USQ', 'Picnic Point']
};

type SortOption = 'relevance' | 'score' | 'date';

// Active filters type
interface ActiveFilters {
  scope: ScopeLevel;
  yearLevels: string[];
  subjects: string[];
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Resource[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [showLocalization, setShowLocalization] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [notification, setNotification] = useState<{ message: string } | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [profileData, setProfileData] = useState<{
    schoolName?: string;
    state?: string;
    suburb?: string;
    yearLevels?: string[];
    subjects?: string[];
  } | null>(null);
  const [personalizedSuggestions, setPersonalizedSuggestions] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    scope: 'state',
    yearLevels: [],
    subjects: []
  });

  useEffect(() => {
    const savedProfile = localStorage.getItem('edulens-profile');
    const profileCompleted = localStorage.getItem('edulens-profile-completed');

    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setProfileData(profile);
      setHasProfile(profileCompleted === 'true');

      // Set active filters from profile
      if (profile.yearLevels) {
        setActiveFilters(prev => ({ ...prev, yearLevels: profile.yearLevels }));
      }
      if (profile.subjects) {
        setActiveFilters(prev => ({ ...prev, subjects: profile.subjects }));
      }

      const suggestions: string[] = [];
      const yearLevel = profile.yearLevels?.[0] ? `Year ${profile.yearLevels[0]}` : '';

      if (profile.subjects?.includes('Geography')) {
        suggestions.push(`Water scarcity ${yearLevel} Geography ${profile.state || ''}`);
      }
      if (profile.subjects?.includes('History')) {
        suggestions.push(`First Nations perspectives ${yearLevel} History`);
      }
      if (profile.subjects?.includes('Science')) {
        suggestions.push(`Climate change data ${yearLevel} Science`);
      }
      if (profile.subjects?.includes('English')) {
        suggestions.push(`Australian poetry ${yearLevel} English`);
      }

      setPersonalizedSuggestions(suggestions.length > 0 ? suggestions : [
        'Water scarcity Year 9 Geography Queensland',
        'First Nations perspectives colonisation Year 10',
        'Climate change data Year 11 Science',
        'Australian poetry Year 8 English',
      ]);
    }
  }, []);

  const sortResults = (results: Resource[], sort: SortOption): Resource[] => {
    const sorted = [...results];
    switch (sort) {
      case 'score':
        return sorted.sort((a, b) => b.scorecard.overallScore - a.scorecard.overallScore);
      case 'date':
        return sorted.sort((a, b) => {
          const dateA = a.source.publishDate ? new Date(a.source.publishDate).getTime() : 0;
          const dateB = b.source.publishDate ? new Date(b.source.publishDate).getTime() : 0;
          return dateB - dateA;
        });
      default:
        return sorted;
    }
  };

  const handleSortChange = () => {
    const sortOptions: SortOption[] = ['relevance', 'score', 'date'];
    const currentIndex = sortOptions.indexOf(sortBy);
    const nextSort = sortOptions[(currentIndex + 1) % sortOptions.length];
    setSortBy(nextSort);
    setSearchResults(prev => sortResults(prev, nextSort));
  };

  const getSortLabel = (sort: SortOption) => {
    switch (sort) {
      case 'score': return 'Quality Score';
      case 'date': return 'Most Recent';
      default: return 'Relevance';
    }
  };

  const handleSearch = useCallback(async (query: string, scope: ScopeLevel) => {
    setSearchQuery(query);
    setIsSearching(true);
    setHasSearched(true);
    setActiveFilters(prev => ({ ...prev, scope }));

    // Save to search history
    const history = JSON.parse(localStorage.getItem('edulens-search-history') || '[]');
    const newHistory = [query, ...history.filter((h: string) => h !== query)].slice(0, 10);
    localStorage.setItem('edulens-search-history', JSON.stringify(newHistory));

    await new Promise(resolve => setTimeout(resolve, 1200));

    const filtered = sampleResources.filter(r =>
      r.title.toLowerCase().includes(query.toLowerCase()) ||
      r.description.toLowerCase().includes(query.toLowerCase()) ||
      r.tags?.some(t => query.toLowerCase().includes(t.toLowerCase()))
    );

    setSearchResults(filtered.length > 0 ? filtered : sampleResources);
    setIsSearching(false);
  }, []);

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
    // Actually persist to localStorage for Library feature
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

  const removeFilter = (type: 'yearLevel' | 'subject', value: string) => {
    if (type === 'yearLevel') {
      setActiveFilters(prev => ({
        ...prev,
        yearLevels: prev.yearLevels.filter(y => y !== value)
      }));
    } else {
      setActiveFilters(prev => ({
        ...prev,
        subjects: prev.subjects.filter(s => s !== value)
      }));
    }
  };

  const scopeLabels: Record<ScopeLevel, string> = {
    country: 'Australia',
    state: profileData?.state || 'State',
    region: 'Region',
    suburb: profileData?.suburb || 'Local',
    school: profileData?.schoolName || 'School',
    class: 'Class',
    individual: 'Student'
  };

  return (
    <AppShell>
      <div className="w-full px-4 sm:px-6 lg:px-8 mx-auto max-w-5xl py-6">
        <AnimatePresence mode="wait">
          {!hasSearched ? (
            /* Hero Section */
            <motion.div
              key="hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="py-8 sm:py-12 space-y-8"
            >
              <div className="text-center space-y-4 max-w-xl mx-auto">
                {hasProfile && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[13px] font-medium text-primary"
                  >
                    Welcome back, {profileData?.schoolName || 'Teacher'}
                  </motion.p>
                )}

                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-[28px] sm:text-[32px] font-bold tracking-tight leading-tight"
                >
                  {hasProfile ? (
                    <>What are you teaching today?</>
                  ) : (
                    <>
                      Find teaching resources
                      <br />
                      <span className="text-primary">for your classroom</span>
                    </>
                  )}
                </motion.h1>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-[15px] text-muted-foreground leading-relaxed"
                >
                  {hasProfile ? (
                    <>
                      Resources for{' '}
                      <span className="font-medium text-foreground">
                        {profileData?.yearLevels?.map(y => `Year ${y}`).join(', ')}
                      </span>{' '}
                      {profileData?.subjects?.slice(0, 2).join(', ')}
                    </>
                  ) : (
                    <>
                      Every resource evaluated for accuracy, bias, and cultural sensitivity.
                    </>
                  )}
                </motion.p>
              </div>

              {/* Stat Cards - Only show when profile exists */}
              {hasProfile && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                >
                  <StatCard
                    label="Saved Resources"
                    value={JSON.parse(localStorage.getItem('edulens-library') || '[]').length}
                    subLabel="in your library"
                    variant="green"
                    icon={BookMarked}
                    index={0}
                  />
                  <StatCard
                    label="Lesson Plans"
                    value={0}
                    subLabel="created"
                    variant="default"
                    icon={FileText}
                    index={1}
                  />
                  <StatCard
                    label="Workflows"
                    value={0}
                    subLabel="active"
                    variant="indigo"
                    icon={Zap}
                    index={2}
                  />
                  <StatCard
                    label="This Week"
                    value={3}
                    subLabel="searches"
                    variant="default"
                    icon={TrendingUp}
                    index={3}
                  />
                </motion.div>
              )}

              {/* Search Bar */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <SearchBar
                  onSearch={handleSearch}
                  isSearching={isSearching}
                  placeholder={hasProfile
                    ? `Search ${profileData?.subjects?.[0] || 'resources'}...`
                    : "Try 'water scarcity Year 9 Geography'"
                  }
                  suggestions={personalizedSuggestions.length > 0 ? personalizedSuggestions : undefined}
                />
              </motion.div>

              {/* Features */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6"
              >
                {[
                  { icon: Shield, title: 'Quality Evaluated', description: 'Scored on accuracy, bias, and safety' },
                  { icon: MapPin, title: 'Locally Adapted', description: 'One-click localization for your region' },
                  { icon: BookOpen, title: 'Curriculum Aligned', description: 'Mapped to Australian Curriculum' }
                ].map((feature) => (
                  <div key={feature.title} className="p-5 rounded-[12px] border border-border bg-card">
                    <feature.icon className="w-8 h-8 text-primary mb-4" />
                    <h3 className="text-[15px] font-semibold mb-1">{feature.title}</h3>
                    <p className="text-[13px] text-muted-foreground">{feature.description}</p>
                  </div>
                ))}
              </motion.div>

              {/* Trusted Sources */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center pt-4"
              >
                <p className="text-[11px] text-muted-foreground mb-3 uppercase tracking-wide font-medium">
                  Trusted Sources
                </p>
                <div className="flex items-center justify-center gap-6 text-[13px] text-muted-foreground">
                  {['ABC Education', 'AIATSIS', 'CSIRO', 'BOM'].map((source) => (
                    <span key={source}>{source}</span>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          ) : (
            /* Search Results */
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-4 space-y-5"
            >
              <SearchBar
                onSearch={handleSearch}
                isSearching={isSearching}
                initialQuery={searchQuery}
              />

              {/* Dynamic Filter Chips */}
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <button className="px-3 py-1.5 rounded-full bg-secondary text-primary text-[13px] font-medium">
                  {scopeLabels[activeFilters.scope]}
                </button>
                {activeFilters.yearLevels.length > 0 ? (
                  activeFilters.yearLevels.map(year => (
                    <button
                      key={year}
                      onClick={() => removeFilter('yearLevel', year)}
                      className="px-3 py-1.5 rounded-full bg-muted text-foreground text-[13px] font-medium flex items-center gap-1.5 hover:bg-muted/80"
                    >
                      Year {year}
                      <X className="w-3 h-3" />
                    </button>
                  ))
                ) : (
                  <span className="px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-[13px]">
                    All Years
                  </span>
                )}
                {activeFilters.subjects.length > 0 ? (
                  activeFilters.subjects.slice(0, 2).map(subject => (
                    <button
                      key={subject}
                      onClick={() => removeFilter('subject', subject)}
                      className="px-3 py-1.5 rounded-full bg-muted text-foreground text-[13px] font-medium flex items-center gap-1.5 hover:bg-muted/80"
                    >
                      {subject}
                      <X className="w-3 h-3" />
                    </button>
                  ))
                ) : (
                  <span className="px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-[13px]">
                    All Subjects
                  </span>
                )}
              </div>

              {/* Results Header */}
              {!isSearching && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between"
                >
                  <div>
                    <h2 className="text-[18px] font-semibold">
                      {searchResults.length} resources
                    </h2>
                    <p className="text-[13px] text-muted-foreground">
                      for &ldquo;{searchQuery}&rdquo;
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="default"
                    className="gap-2 h-10"
                    onClick={handleSortChange}
                  >
                    <ArrowUpDown className="w-4 h-4" />
                    {getSortLabel(sortBy)}
                  </Button>
                </motion.div>
              )}

              {/* Loading State */}
              {isSearching && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-[12px] border border-border p-4 space-y-4">
                      <div className="h-32 rounded-[6px] skeleton" />
                      <div className="h-5 w-3/4 rounded-[6px] skeleton" />
                      <div className="h-4 w-full rounded-[6px] skeleton" />
                      <div className="h-4 w-2/3 rounded-[6px] skeleton" />
                    </div>
                  ))}
                </div>
              )}

              {/* Results Grid */}
              {!isSearching && searchResults.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {searchResults.map((resource, index) => (
                    <ResourceCard
                      key={resource.id}
                      resource={resource}
                      index={index}
                      onLocalize={handleLocalize}
                      onSave={handleSaveResource}
                      onShare={handleShareResource}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Localization Panel Modal */}
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

        {/* Notification Toast - NO semantic colors */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-50"
            >
              <div className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-[12px] shadow-md">
                <Check className="w-5 h-5 text-primary flex-shrink-0" />
                <p className="text-[15px]">{notification.message}</p>
                <button
                  onClick={() => setNotification(null)}
                  className="p-1.5 rounded-[6px] hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
