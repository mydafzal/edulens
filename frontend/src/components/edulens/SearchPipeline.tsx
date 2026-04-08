'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Shield,
  Zap,
  CheckCircle,
  Loader2,
  ArrowLeft,
  BookMarked,
  Share2,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  Copy,
  FileText,
  Video,
  Globe,
  Sparkles,
  RotateCcw,
  AlertCircle,
  Award,
} from 'lucide-react';
import {
  getMockSearchResult,
  GRADE_TO_STAGE,
} from '@/data/mockData';
import type {
  SearchPipelineResult,
  VerifiedSource,
  GradeLevelId,
  ClassroomContextData,
} from '@/data/mockData';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface SearchPipelineProps {
  query: string;
  teachingTo: GradeLevelId;
  classroomContext: ClassroomContextData;
  webSearchEnabled: boolean;
  onBack: () => void;
  onNewSearch: (query: string) => void;
  userRole?: string;
}

type PipelineStage = 'searching' | 'evaluating' | 'synthesizing' | 'complete';

// ---------------------------------------------------------------------------
// Pipeline stages
// ---------------------------------------------------------------------------
const STAGES: {
  id: PipelineStage;
  label: string;
  description: string;
  icon: React.ElementType;
  duration: number;
}[] = [
  {
    id: 'searching',
    label: 'Retrieving Sources',
    description: 'Searching ERIC, AIATSIS, CSIRO, BOM and 40+ trusted sources',
    icon: Search,
    duration: 1200,
  },
  {
    id: 'evaluating',
    label: 'Evaluating Quality',
    description: 'Running safety, accuracy, bias and curriculum alignment checks',
    icon: Shield,
    duration: 1400,
  },
  {
    id: 'synthesizing',
    label: 'Dual Agent Review',
    description: 'CurriculumAI Pro and CurriculumAI Check reviewing in parallel',
    icon: Zap,
    duration: 800,
  },
  {
    id: 'complete',
    label: 'Results Ready',
    description: 'Your personalised resource collection is ready',
    icon: CheckCircle,
    duration: 0,
  },
];

const STAGE_ORDER: PipelineStage[] = ['searching', 'evaluating', 'synthesizing', 'complete'];

function stageIndex(s: PipelineStage) {
  return STAGE_ORDER.indexOf(s);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function typeIcon(type: VerifiedSource['type']) {
  if (type === 'video') return <Video className="w-3.5 h-3.5" />;
  if (type === 'interactive') return <Globe className="w-3.5 h-3.5" />;
  return <FileText className="w-3.5 h-3.5" />;
}

function typeLabel(type: VerifiedSource['type']) {
  if (type === 'article') return 'Article';
  if (type === 'video') return 'Video';
  if (type === 'pdf') return 'PDF';
  if (type === 'interactive') return 'Interactive';
  return type;
}

function trustBadge(tier: VerifiedSource['trust_tier']) {
  if (tier === 'gold') return { cls: 'bg-[#fef3c7] text-[#b45309]', label: '⭐ Gold' };
  if (tier === 'silver') return { cls: 'bg-[#f1f5f9] text-[#475569]', label: '🥈 Silver' };
  return { cls: 'bg-[#fff7ed] text-[#c2410c]', label: '🔶 Bronze' };
}

function qualityColor(score: number) {
  if (score >= 90) return 'bg-[#16a34a]';
  if (score >= 70) return 'bg-[#f97316]';
  return 'bg-[#ef4444]';
}

// ---------------------------------------------------------------------------
// Source card
// ---------------------------------------------------------------------------
function SourceCard({
  source,
  expanded,
  onToggle,
  onSave,
  onToast,
}: {
  source: VerifiedSource;
  expanded: boolean;
  onToggle: () => void;
  onSave: (source: VerifiedSource) => void;
  onToast: (msg: string) => void;
}) {
  const trust = trustBadge(source.trust_tier);

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-[16px] overflow-hidden flex flex-col">
      {source.thumbnail && (
        <img
          src={source.thumbnail}
          alt={source.title}
          className="w-full object-cover"
          style={{ height: 140 }}
        />
      )}

      <div className="p-4 flex flex-col flex-1">
        {/* Trust tier + type */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn('rounded-full text-[11px] px-2 py-0.5 font-medium', trust.cls)}>
            {trust.label}
          </span>
          <span className="flex items-center gap-1 border border-[#e2e8f0] rounded-full text-[11px] px-2 py-0.5 text-[#64748b]">
            {typeIcon(source.type)}
            {typeLabel(source.type)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-[16px] font-semibold text-[#0f172a] leading-snug mt-2 line-clamp-2">
          {source.title}
        </h3>

        {/* Provider + author */}
        <div className="flex items-center gap-1 mt-1">
          <Globe className="w-3 h-3 text-[#94a3b8] shrink-0" />
          <span className="text-[12px] text-[#64748b]">
            {source.provider}
            {source.author ? ` · ${source.author}` : ''}
          </span>
        </div>

        {/* Snippet */}
        <p className="text-[13px] text-[#64748b] mt-1 line-clamp-2">{source.snippet}</p>

        {/* Score bars */}
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#94a3b8] w-16 shrink-0">Relevance</span>
            <div className="flex-1 h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-[#0f172a]"
                style={{ width: `${source.relevance_score}%` }}
              />
            </div>
            <span className="text-[11px] text-[#64748b] w-8 text-right shrink-0">
              {source.relevance_score}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#94a3b8] w-16 shrink-0">Quality</span>
            <div className="flex-1 h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full', qualityColor(source.quality_score))}
                style={{ width: `${source.quality_score}%` }}
              />
            </div>
            <span className="text-[11px] text-[#64748b] w-8 text-right shrink-0">
              {source.quality_score}%
            </span>
          </div>
        </div>

        {/* Curriculum codes (collapsed preview) */}
        {!expanded && source.curriculum_codes && source.curriculum_codes.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {source.curriculum_codes.slice(0, 3).map((code) => (
              <span
                key={code}
                className="border border-[#e2e8f0] rounded-full text-[10px] px-2 py-0.5 text-[#64748b]"
              >
                {code}
              </span>
            ))}
          </div>
        )}

        {/* Expand toggle */}
        <button
          onClick={onToggle}
          className="flex items-center gap-1 text-[12px] text-[#94a3b8] hover:text-[#64748b] transition-colors mt-2 self-start"
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {expanded ? 'Less details' : 'More details'}
        </button>

        {/* Expanded content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-2 space-y-2">
                <p className="text-[13px] text-[#64748b]">{source.snippet}</p>
                {source.curriculum_codes && source.curriculum_codes.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {source.curriculum_codes.map((code) => (
                      <span
                        key={code}
                        className="border border-[#e2e8f0] rounded-full text-[10px] px-2 py-0.5 text-[#64748b]"
                      >
                        {code}
                      </span>
                    ))}
                  </div>
                )}
                {source.license && (
                  <p className="text-[12px] text-[#94a3b8]">License: {source.license}</p>
                )}
                {source.publish_date && (
                  <p className="text-[12px] text-[#94a3b8]">Published: {source.publish_date}</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="border-t border-[#f0f0f0] mt-3 pt-3 flex items-center gap-2">
          <button
            onClick={() => onToast('Localisation applied!')}
            className="flex-1 bg-[#f97316] text-white rounded-full px-4 py-2 text-[13px] font-medium hover:bg-[#ea6c0a] transition-colors"
          >
            Localise →
          </button>
          <button
            onClick={() => { onSave(source); onToast('Saved to Library'); }}
            aria-label="Save to library"
            className="w-10 h-10 bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] flex items-center justify-center hover:bg-[#f1f5f9] transition-colors shrink-0"
          >
            <BookMarked className="w-4 h-4 text-[#64748b]" />
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(source.url).catch(() => {});
              onToast('Link copied!');
            }}
            aria-label="Share"
            className="w-10 h-10 bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] flex items-center justify-center hover:bg-[#f1f5f9] transition-colors shrink-0"
          >
            <Share2 className="w-4 h-4 text-[#64748b]" />
          </button>
          <button
            onClick={() => window.open(source.url, '_blank', 'noopener,noreferrer')}
            aria-label="Open source"
            className="w-10 h-10 bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] flex items-center justify-center hover:bg-[#f1f5f9] transition-colors shrink-0"
          >
            <ExternalLink className="w-4 h-4 text-[#64748b]" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function SearchPipeline({
  query,
  teachingTo,
  classroomContext,
  webSearchEnabled,
  onBack,
  onNewSearch,
}: SearchPipelineProps) {
  const [currentStage, setCurrentStage] = useState<PipelineStage>('searching');
  const [result, setResult] = useState<SearchPipelineResult | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [newQuery, setNewQuery] = useState('');
  const [activeSection, setActiveSection] = useState<'sources' | 'review' | 'summary'>('sources');
  const [expandedSourceId, setExpandedSourceId] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [sourceCount, setSourceCount] = useState(0);

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Pipeline effect
  useEffect(() => {
    setCurrentStage('searching');
    setResult(null);
    setIsSaved(false);
    setActiveSection('sources');
    setExpandedSourceId(null);
    setSourceCount(0);

    // Clear any previous timeouts
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    const t1 = setTimeout(() => setCurrentStage('evaluating'), 1200);
    const t2 = setTimeout(() => setCurrentStage('synthesizing'), 2600);
    const t3 = setTimeout(() => {
      setCurrentStage('complete');
      setResult(getMockSearchResult(query, teachingTo));
    }, 3400);

    timeoutsRef.current = [t1, t2, t3];
    return () => { timeoutsRef.current.forEach(clearTimeout); };
  }, [query]);

  // Animate source counter while searching
  useEffect(() => {
    if (currentStage !== 'searching') return;
    setSourceCount(0);
    let count = 0;
    const interval = setInterval(() => {
      count += Math.ceil(47 / (3000 / 50));
      if (count >= 47) { setSourceCount(47); clearInterval(interval); return; }
      setSourceCount(count);
    }, 50);
    return () => clearInterval(interval);
  }, [currentStage]);

  const handleSave = () => {
    const saved = JSON.parse(localStorage.getItem('scora-saved-searches') || '[]');
    saved.unshift({
      id: Date.now().toString(),
      query,
      teachingTo,
      result,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem('scora-saved-searches', JSON.stringify(saved.slice(0, 20)));
    setIsSaved(true);
  };

  const handleSaveSource = (source: VerifiedSource) => {
    const lib = JSON.parse(localStorage.getItem('scora-library') || '[]');
    if (!lib.find((s: { id: string }) => s.id === source.id)) lib.unshift(source);
    localStorage.setItem('scora-library', JSON.stringify(lib));
  };

  const handleCopyRef = (ref: string) => {
    navigator.clipboard.writeText(ref).catch(() => {});
    setCopiedRef(ref);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  const handleNewSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuery.trim()) return;
    onNewSearch(newQuery.trim());
    setNewQuery('');
  };

  const currentStageIdx = stageIndex(currentStage);
  const currentStageCfg = STAGES.find((s) => s.id === currentStage)!;
  const stageLabel = GRADE_TO_STAGE[teachingTo] || teachingTo;

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="max-w-5xl mx-auto px-6 py-6">

        {/* ============================================================
            SECTION 1: TOP BAR
        ============================================================ */}
        <div className="flex items-center justify-between mb-6 gap-4">
          {/* Back */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[14px] text-[#64748b] hover:text-[#0f172a] transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Search
          </button>

          {/* Query */}
          <p className="text-[16px] font-semibold text-[#0f172a] truncate max-w-sm text-center flex-1">
            &ldquo;{query}&rdquo;
          </p>

          {/* Search again */}
          <form onSubmit={handleNewSearch} className="flex items-center shrink-0">
            <input
              type="text"
              value={newQuery}
              onChange={(e) => setNewQuery(e.target.value)}
              placeholder="New search..."
              className="bg-white border border-[#e2e8f0] rounded-full px-4 py-2 text-[13px] w-48 outline-none focus:border-[#cbd5e1] transition-colors"
            />
            <button
              type="submit"
              className="bg-[#0f172a] text-white rounded-full px-4 py-2 text-[13px] ml-2 hover:bg-[#1e293b] transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Search
            </button>
          </form>
        </div>

        {/* ============================================================
            SECTION 2: CONTEXT BADGES
        ============================================================ */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <span className="bg-[#dcfce7] text-[#15803d] rounded-full px-3 py-1 text-[12px] font-medium">
            {stageLabel}
          </span>
          {(classroomContext.town || classroomContext.state) && (
            <span className="bg-[#ede9fe] text-[#6d28d9] rounded-full px-3 py-1 text-[12px]">
              {[classroomContext.town, classroomContext.state].filter(Boolean).join(', ')}
            </span>
          )}
          {webSearchEnabled && (
            <span className="bg-[#fef3c7] text-[#b45309] rounded-full px-3 py-1 text-[12px]">
              ⚠ Extended Sources · Bronze tier
            </span>
          )}
        </div>

        {/* ============================================================
            SECTION 3: PIPELINE PROGRESS BAR
        ============================================================ */}
        <div className="bg-white border border-[#e2e8f0] rounded-[16px] p-5 mb-6">
          {/* Stage circles + connectors */}
          <div className="flex items-start">
            {STAGES.map((stage, i) => {
              const isComplete = currentStageIdx > i;
              const isActive = currentStageIdx === i;
              const isFuture = currentStageIdx < i;
              const Icon = stage.icon;

              return (
                <React.Fragment key={stage.id}>
                  <div className="flex flex-col items-center shrink-0">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                        isComplete ? 'bg-[#0f172a] text-white' :
                        isActive && currentStage !== 'complete' ? 'bg-[#f97316] text-white' :
                        isActive && currentStage === 'complete' ? 'bg-[#0f172a] text-white' :
                        'bg-[#f0f0f0] text-[#94a3b8]',
                      )}
                    >
                      {isActive && currentStage !== 'complete' ? (
                        <Loader2 className="w-[18px] h-[18px] animate-spin" />
                      ) : (
                        <Icon className="w-[18px] h-[18px]" />
                      )}
                    </div>
                    <span
                      className={cn(
                        'text-[11px] font-medium text-center mt-2 max-w-[72px]',
                        isComplete || isActive ? 'text-[#0f172a]' : 'text-[#94a3b8]',
                      )}
                    >
                      {stage.label}
                    </span>
                  </div>

                  {i < STAGES.length - 1 && (
                    <div
                      className="flex-1 h-[2px] mx-3 rounded-full transition-colors"
                      style={{
                        marginTop: 20,
                        background: currentStageIdx > i ? '#0f172a' : '#e2e8f0',
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Stage description + counter when loading */}
          {currentStage !== 'complete' && (
            <div className="mt-3 text-center">
              <p className="text-[13px] text-[#64748b]">{currentStageCfg.description}</p>
              {currentStage === 'searching' && (
                <p className="text-[12px] text-[#94a3b8] mt-1">
                  Scanning {sourceCount} trusted Australian sources...
                </p>
              )}
            </div>
          )}
        </div>

        {/* ============================================================
            SECTION 4: LOADING STATE
        ============================================================ */}
        <AnimatePresence mode="wait">
          {currentStage !== 'complete' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-16"
            >
              <div className="flex items-center gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-2.5 h-2.5 rounded-full bg-[#f97316]"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                  />
                ))}
              </div>
              <p className="text-[16px] text-[#64748b] mt-4">
                Analysing resources for {stageLabel}...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============================================================
            SECTION 5: RESULTS
        ============================================================ */}
        <AnimatePresence>
          {currentStage === 'complete' && result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Results header card */}
              <div className="bg-white border border-[#e2e8f0] rounded-[16px] p-5 mb-4 flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-[22px] font-bold text-[#0f172a]">
                    {result.sources.length} resources found
                  </h1>
                  <p className="text-[13px] text-[#64748b] mt-1">
                    for &ldquo;{query}&rdquo; · {result.total_time.toFixed(1)}s
                  </p>
                </div>
                <button
                  onClick={handleSave}
                  className={cn(
                    'flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium transition-colors shrink-0',
                    isSaved
                      ? 'bg-[#dcfce7] text-[#15803d]'
                      : 'bg-[#0f172a] text-white hover:bg-[#1e293b]',
                  )}
                >
                  <BookMarked className="w-4 h-4" />
                  {isSaved ? 'Saved ✓' : 'Save Results'}
                </button>
              </div>

              {/* Tab row */}
              <div className="flex gap-1 bg-[#f0f0f0] rounded-full p-1 w-fit mb-4">
                {(
                  [
                    { id: 'sources', label: `Sources (${result.sources.length})` },
                    { id: 'review', label: 'Dual Agent Review' },
                    { id: 'summary', label: 'Summary' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSection(tab.id)}
                    className={cn(
                      'px-5 py-2 text-[13px] rounded-full transition-colors',
                      activeSection === tab.id
                        ? 'bg-white text-[#0f172a] font-medium shadow-sm'
                        : 'text-[#64748b] hover:text-[#0f172a]',
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* ---- TAB: SOURCES ---- */}
              {activeSection === 'sources' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {result.sources.map((source) => (
                    <SourceCard
                      key={source.id}
                      source={source}
                      expanded={expandedSourceId === source.id}
                      onToggle={() =>
                        setExpandedSourceId(expandedSourceId === source.id ? null : source.id)
                      }
                      onSave={handleSaveSource}
                      onToast={showToast}
                    />
                  ))}
                </div>
              )}

              {/* ---- TAB: DUAL AGENT REVIEW ---- */}
              {activeSection === 'review' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Good cop */}
                    <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-[16px] p-5">
                      <div className="flex items-center gap-3">
                        <ThumbsUp className="w-5 h-5 text-[#16a34a] shrink-0" />
                        <p className="text-[16px] font-semibold text-[#0f172a] flex-1">
                          CurriculumAI Pro
                        </p>
                        <span className="bg-[#16a34a] text-white rounded-full px-3 py-1 text-[13px] shrink-0">
                          {result.dual_agent_review.good_cop.rating}/10
                        </span>
                      </div>
                      <ul className="mt-4 space-y-2">
                        {result.dual_agent_review.good_cop.points.map((point, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-[#16a34a] shrink-0 mt-0.5" />
                            <span className="text-[13px] text-[#374151]">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Bad cop */}
                    <div className="bg-[#fff7ed] border border-[#fed7aa] rounded-[16px] p-5">
                      <div className="flex items-center gap-3">
                        <ThumbsDown className="w-5 h-5 text-[#f97316] shrink-0" />
                        <p className="text-[16px] font-semibold text-[#0f172a] flex-1">
                          CurriculumAI Check
                        </p>
                        <span className="bg-[#f97316] text-white rounded-full px-3 py-1 text-[13px] shrink-0">
                          {result.dual_agent_review.bad_cop.rating}/10
                        </span>
                      </div>
                      <ul className="mt-4 space-y-2">
                        {result.dual_agent_review.bad_cop.concerns.map((concern, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <AlertCircle className="w-3.5 h-3.5 text-[#f97316] shrink-0 mt-0.5" />
                            <span className="text-[13px] text-[#374151]">{concern}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Consensus */}
                  <div className="bg-[#0f172a] text-white rounded-[16px] p-6">
                    <div className="flex items-start gap-4">
                      <div>
                        <p className="text-[14px] text-white/60 uppercase tracking-wide font-medium">
                          Consensus Score
                        </p>
                        <p className="text-[28px] font-bold leading-tight">
                          {result.dual_agent_review.consensus_score}
                          <span className="text-[16px] font-normal text-white/60">/10</span>
                        </p>
                      </div>
                      <div className="ml-auto">
                        <span
                          className={cn(
                            'rounded-full px-4 py-2 text-[13px] font-medium text-white',
                            result.dual_agent_review.recommendation === 'approve'
                              ? 'bg-[#16a34a]'
                              : result.dual_agent_review.recommendation === 'review'
                              ? 'bg-[#f97316]'
                              : 'bg-[#ef4444]',
                          )}
                        >
                          {result.dual_agent_review.recommendation === 'approve'
                            ? '✓ Approved for classroom use'
                            : result.dual_agent_review.recommendation === 'review'
                            ? '⚠ Teacher review recommended'
                            : '✗ Not recommended'}
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="bg-white/20 h-2 rounded-full mt-3 overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          result.dual_agent_review.consensus_score >= 7
                            ? 'bg-[#16a34a]'
                            : 'bg-[#f97316]',
                        )}
                        style={{ width: `${(result.dual_agent_review.consensus_score / 10) * 100}%` }}
                      />
                    </div>

                    <p className="text-[14px] text-white/80 leading-relaxed mt-4">
                      {result.dual_agent_review.consensus_verdict}
                    </p>
                  </div>
                </div>
              )}

              {/* ---- TAB: SUMMARY ---- */}
              {activeSection === 'summary' && (
                <div className="bg-white border border-[#e2e8f0] rounded-[16px] p-6">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#f97316]" />
                    <h2 className="text-[18px] font-semibold text-[#0f172a]">AI Summary</h2>
                  </div>
                  <p className="text-[15px] text-[#334155] leading-relaxed mt-3">{result.summary}</p>

                  {result.references.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-[16px] font-bold text-[#0f172a] mb-3">References</h3>
                      <ul className="space-y-2">
                        {result.references.map((ref, i) => (
                          <li
                            key={i}
                            className="bg-[#f8fafc] rounded-[12px] px-4 py-3 flex items-start gap-3"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#94a3b8] shrink-0 mt-0.5" />
                            <span className="text-[12px] text-[#64748b] flex-1 leading-snug">
                              {ref}
                            </span>
                            <button
                              onClick={() => handleCopyRef(ref)}
                              aria-label="Copy reference"
                              className="shrink-0 text-[#94a3b8] hover:text-[#64748b] transition-colors"
                            >
                              {copiedRef === ref ? (
                                <CheckCircle className="w-3.5 h-3.5 text-[#16a34a]" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    onClick={handleSave}
                    disabled={isSaved}
                    className={cn(
                      'w-full h-[52px] rounded-[12px] text-[15px] font-medium mt-6 transition-colors',
                      isSaved
                        ? 'bg-[#dcfce7] text-[#15803d]'
                        : 'bg-[#0f172a] text-white hover:bg-[#1e293b]',
                    )}
                  >
                    {isSaved ? 'Results Saved ✓' : 'Save Results'}
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ============================================================
          TOAST
      ============================================================ */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="bg-[#0f172a] text-white rounded-[12px] px-5 py-3 text-[14px] shadow-lg whitespace-nowrap"
            >
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default SearchPipeline;
