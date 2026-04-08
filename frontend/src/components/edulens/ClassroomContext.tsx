'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Check,
  School,
  Users,
  Globe,
  Landmark,
  Music,
  Trophy,
  Palette,
  BookOpen,
  TreePine,
  Heart,
  Edit3,
  Save,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// ── Types ──

export interface ClassroomContextData {
  // Location
  country: string;
  state: string;
  town: string;
  schoolName: string;

  // Community & Culture
  localLandmarks: string[];          // e.g., "Murray River", "Uluru", "Sydney Harbour"
  firstNationsContext: string[];     // e.g., "Ngarrindjeri Country", "Wurundjeri People"
  communityProjects: string[];      // e.g., "River Clean-up 2025", "Local food garden"
  culturalFigures: string[];        // e.g., "local footy team", "street artist Mia Chen"
  localSportsTeams: string[];       // e.g., "Adelaide Crows", "Geelong Cats"
  localArtistsMusic: string[];      // e.g., "Baker Boy", "local art trail"

  // Student Context
  studentInterests: string[];       // e.g., "gaming", "TikTok", "surfing", "K-pop"
  languageBackgrounds: string[];    // e.g., "Vietnamese", "Arabic", "Mandarin"

  // Local Data Sources
  localDataSources: string[];       // e.g., "Council water usage data", "ABS suburb stats"
}

const EMPTY_CONTEXT: ClassroomContextData = {
  country: 'Australia',
  state: '',
  town: '',
  schoolName: '',
  localLandmarks: [],
  firstNationsContext: [],
  communityProjects: [],
  culturalFigures: [],
  localSportsTeams: [],
  localArtistsMusic: [],
  studentInterests: [],
  languageBackgrounds: [],
  localDataSources: [],
};

const AUSTRALIAN_STATES = [
  'New South Wales', 'Victoria', 'Queensland', 'South Australia',
  'Western Australia', 'Tasmania', 'Northern Territory', 'ACT',
];

// ── Quick-add suggestions per category ──
const SUGGESTIONS: Record<string, string[]> = {
  firstNationsContext: [
    'Acknowledge local Traditional Owners',
    'Wurundjeri Country (Melbourne)',
    'Gadigal Country (Sydney)',
    'Kaurna Country (Adelaide)',
    'Noongar Country (Perth)',
    'Turrbal Country (Brisbane)',
    'Palawa Country (Tasmania)',
  ],
  studentInterests: [
    'Gaming', 'TikTok', 'Surfing', 'AFL', 'Cricket', 'K-pop',
    'Anime', 'Skateboarding', 'Coding', 'Art', 'Music Production',
  ],
  languageBackgrounds: [
    'Vietnamese', 'Mandarin', 'Arabic', 'Hindi', 'Tagalog',
    'Greek', 'Italian', 'Korean', 'Samoan', 'Aboriginal languages',
  ],
};

// ── Storage ──
const STORAGE_KEY = 'edulens-classroom-context';

export function loadClassroomContext(): ClassroomContextData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return { ...EMPTY_CONTEXT, ...JSON.parse(saved) };
  } catch { /* ignore */ }
  return { ...EMPTY_CONTEXT };
}

function saveClassroomContext(data: ClassroomContextData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ── Main Component ──

interface ClassroomContextProps {
  context: ClassroomContextData;
  onChange: (ctx: ClassroomContextData) => void;
  compact?: boolean;
}

export function ClassroomContext({ context, onChange, compact = false }: ClassroomContextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState<ClassroomContextData>(context);

  const hasContext = Boolean(context.state || context.town || context.schoolName);
  const contextSummary = hasContext
    ? [context.schoolName, context.town, context.state].filter(Boolean).join(', ')
    : null;

  const totalItems =
    context.localLandmarks.length +
    context.firstNationsContext.length +
    context.communityProjects.length +
    context.culturalFigures.length +
    context.localSportsTeams.length +
    context.localArtistsMusic.length +
    context.studentInterests.length +
    context.languageBackgrounds.length +
    context.localDataSources.length;

  const handleSave = () => {
    onChange(draft);
    saveClassroomContext(draft);
    setEditMode(false);
  };

  const handleStartEdit = () => {
    setDraft({ ...context });
    setEditMode(true);
    setIsExpanded(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.17 }}
      className="max-w-3xl mx-auto"
    >
      <div className={cn(
        'rounded-2xl border-2 transition-all duration-300 overflow-hidden',
        hasContext
          ? 'border-indigo-200 bg-indigo-50/30'
          : 'border-dashed border-slate-200 bg-slate-50/50'
      )}>
        {/* Header — always visible */}
        <button
          onClick={() => {
            if (!hasContext && !isExpanded) {
              handleStartEdit();
            } else {
              setIsExpanded(!isExpanded);
            }
          }}
          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/50 transition-colors"
        >
          <div className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
            hasContext ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'
          )}>
            <MapPin className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={cn(
                'text-sm font-semibold',
                hasContext ? 'text-indigo-800' : 'text-slate-600'
              )}>
                My Classroom Context
              </span>
              {hasContext && (
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-200 text-indigo-700">
                  Active
                </span>
              )}
              {!hasContext && (
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-200 text-slate-500">
                  Set Up
                </span>
              )}
            </div>
            {contextSummary && (
              <p className="text-xs text-indigo-600 truncate mt-0.5">
                {contextSummary} · {totalItems} local reference{totalItems !== 1 ? 's' : ''}
              </p>
            )}
            {!hasContext && (
              <p className="text-xs text-slate-400 mt-0.5">
                Add your location, community, and cultural context for localised results
              </p>
            )}
          </div>
          {hasContext && !editMode && (
            <button
              onClick={(e) => { e.stopPropagation(); handleStartEdit(); }}
              className="p-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
            </button>
          )}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
          )}
        </button>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-4">
                {editMode ? (
                  <EditView draft={draft} setDraft={setDraft} onSave={handleSave} onCancel={() => setEditMode(false)} />
                ) : (
                  <ReadView context={context} onEdit={handleStartEdit} />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── Read View (show saved context as tags) ──

function ReadView({ context, onEdit }: { context: ClassroomContextData; onEdit: () => void }) {
  const sections = [
    { icon: Landmark, label: 'Landmarks', items: context.localLandmarks, color: 'bg-blue-50 text-blue-700' },
    { icon: Globe, label: 'First Nations', items: context.firstNationsContext, color: 'bg-amber-50 text-amber-700' },
    { icon: Heart, label: 'Community', items: context.communityProjects, color: 'bg-rose-50 text-rose-700' },
    { icon: Users, label: 'Cultural Figures', items: context.culturalFigures, color: 'bg-violet-50 text-violet-700' },
    { icon: Trophy, label: 'Sports', items: context.localSportsTeams, color: 'bg-emerald-50 text-emerald-700' },
    { icon: Music, label: 'Arts & Music', items: context.localArtistsMusic, color: 'bg-pink-50 text-pink-700' },
    { icon: Palette, label: 'Student Interests', items: context.studentInterests, color: 'bg-cyan-50 text-cyan-700' },
    { icon: BookOpen, label: 'Languages', items: context.languageBackgrounds, color: 'bg-orange-50 text-orange-700' },
    { icon: TreePine, label: 'Local Data', items: context.localDataSources, color: 'bg-teal-50 text-teal-700' },
  ];

  const activeSections = sections.filter(s => s.items.length > 0);

  return (
    <div className="space-y-3">
      {/* Location summary */}
      <div className="flex items-center gap-2 text-sm">
        <School className="w-4 h-4 text-indigo-500" />
        <span className="text-indigo-700 font-medium">
          {[context.schoolName, context.town, context.state, context.country].filter(Boolean).join(' · ')}
        </span>
      </div>

      {/* Tags by category */}
      {activeSections.length > 0 && (
        <div className="space-y-2">
          {activeSections.map(section => (
            <div key={section.label} className="flex items-start gap-2">
              <section.icon className="w-3.5 h-3.5 mt-1 text-slate-400 flex-shrink-0" />
              <div className="flex flex-wrap gap-1">
                {section.items.map(item => (
                  <span
                    key={item}
                    className={cn('px-2 py-0.5 rounded-md text-[11px] font-medium', section.color)}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-[11px] text-indigo-500 italic">
        Search results will be localised using this context automatically
      </p>
    </div>
  );
}

// ── Edit View (form to set up context) ──

function EditView({
  draft,
  setDraft,
  onSave,
  onCancel,
}: {
  draft: ClassroomContextData;
  setDraft: (d: ClassroomContextData) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Location Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div>
          <label className="text-[11px] font-medium text-slate-500 mb-1 block">Country</label>
          <input
            value={draft.country}
            onChange={e => setDraft({ ...draft, country: e.target.value })}
            className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm bg-white outline-none focus:border-indigo-400"
            placeholder="Australia"
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-slate-500 mb-1 block">State</label>
          <select
            value={draft.state}
            onChange={e => setDraft({ ...draft, state: e.target.value })}
            className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm bg-white outline-none focus:border-indigo-400"
          >
            <option value="">Select...</option>
            {AUSTRALIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[11px] font-medium text-slate-500 mb-1 block">Town / Suburb</label>
          <input
            value={draft.town}
            onChange={e => setDraft({ ...draft, town: e.target.value })}
            className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm bg-white outline-none focus:border-indigo-400"
            placeholder="e.g., Mildura"
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-slate-500 mb-1 block">School</label>
          <input
            value={draft.schoolName}
            onChange={e => setDraft({ ...draft, schoolName: e.target.value })}
            className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm bg-white outline-none focus:border-indigo-400"
            placeholder="e.g., Mildura Senior College"
          />
        </div>
      </div>

      {/* Tag Input Sections */}
      <div className="space-y-3">
        <TagInputSection
          icon={Globe}
          label="First Nations Context"
          description="Traditional Owners, Country names, cultural knowledge"
          items={draft.firstNationsContext}
          onChange={items => setDraft({ ...draft, firstNationsContext: items })}
          suggestions={SUGGESTIONS.firstNationsContext}
          color="amber"
        />
        <TagInputSection
          icon={Landmark}
          label="Local Landmarks & Geography"
          description="Rivers, mountains, parks, significant places"
          items={draft.localLandmarks}
          onChange={items => setDraft({ ...draft, localLandmarks: items })}
          color="blue"
        />
        <TagInputSection
          icon={Trophy}
          label="Local Sports Teams"
          description="AFL clubs, cricket teams, local sporting heroes"
          items={draft.localSportsTeams}
          onChange={items => setDraft({ ...draft, localSportsTeams: items })}
          color="emerald"
        />
        <TagInputSection
          icon={Music}
          label="Local Artists, Music & Culture"
          description="Musicians, street artists, cultural festivals, galleries"
          items={draft.localArtistsMusic}
          onChange={items => setDraft({ ...draft, localArtistsMusic: items })}
          color="pink"
        />
        <TagInputSection
          icon={Heart}
          label="Community Projects"
          description="River clean-ups, food gardens, sustainability initiatives"
          items={draft.communityProjects}
          onChange={items => setDraft({ ...draft, communityProjects: items })}
          color="rose"
        />
        <TagInputSection
          icon={Users}
          label="Cultural Figures & Role Models"
          description="Local leaders, educators, entrepreneurs, elders"
          items={draft.culturalFigures}
          onChange={items => setDraft({ ...draft, culturalFigures: items })}
          color="violet"
        />
        <TagInputSection
          icon={Palette}
          label="Student Interests"
          description="What your students are into — helps make content relatable"
          items={draft.studentInterests}
          onChange={items => setDraft({ ...draft, studentInterests: items })}
          suggestions={SUGGESTIONS.studentInterests}
          color="cyan"
        />
        <TagInputSection
          icon={BookOpen}
          label="Language Backgrounds"
          description="Languages spoken by students in your classroom"
          items={draft.languageBackgrounds}
          onChange={items => setDraft({ ...draft, languageBackgrounds: items })}
          suggestions={SUGGESTIONS.languageBackgrounds}
          color="orange"
        />
        <TagInputSection
          icon={TreePine}
          label="Local Data Sources"
          description="Council data, regional statistics, local archives"
          items={draft.localDataSources}
          onChange={items => setDraft({ ...draft, localDataSources: items })}
          color="teal"
        />
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-2 pt-2">
        <Button variant="ghost" size="sm" onClick={onCancel} className="rounded-full">
          Cancel
        </Button>
        <Button size="sm" onClick={onSave} className="rounded-full gap-1.5 bg-indigo-600 hover:bg-indigo-700">
          <Save className="w-3.5 h-3.5" /> Save Context
        </Button>
      </div>
    </div>
  );
}

// ── Tag Input (reusable for each category) ──

function TagInputSection({
  icon: Icon,
  label,
  description,
  items,
  onChange,
  suggestions,
  color = 'slate',
}: {
  icon: typeof MapPin;
  label: string;
  description: string;
  items: string[];
  onChange: (items: string[]) => void;
  suggestions?: string[];
  color?: string;
}) {
  const [input, setInput] = useState('');

  const addItem = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !items.includes(trimmed)) {
      onChange([...items, trimmed]);
    }
    setInput('');
  };

  const removeItem = (item: string) => {
    onChange(items.filter(i => i !== item));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem(input);
    }
  };

  // Filter suggestions to exclude already-added items
  const availableSuggestions = suggestions?.filter(s => !items.includes(s)) || [];

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-xs font-semibold text-slate-700">{label}</span>
        <span className="text-[10px] text-slate-400">{description}</span>
      </div>

      {/* Existing tags */}
      <div className="flex flex-wrap gap-1">
        {items.map(item => (
          <span
            key={item}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-${color}-50 text-${color}-700`}
          >
            {item}
            <button onClick={() => removeItem(item)} className="hover:text-red-500">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {/* Input inline */}
        <div className="inline-flex items-center">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type & press Enter"
            className="w-32 h-6 px-2 text-[11px] bg-white border border-dashed border-slate-200 rounded-md outline-none focus:border-indigo-400 placeholder:text-slate-300"
          />
        </div>
      </div>

      {/* Quick-add suggestions */}
      {availableSuggestions.length > 0 && items.length < 3 && (
        <div className="flex flex-wrap gap-1">
          {availableSuggestions.slice(0, 4).map(s => (
            <button
              key={s}
              onClick={() => addItem(s)}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              <Plus className="w-2.5 h-2.5" /> {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
