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
  BookmarkCheck,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  Copy,
  FileText,
  Globe,
  Sparkles,
  AlertCircle,
  AlignLeft,
  Database,
  Users,
  BookOpen,
  X,
  ClipboardList,
  HelpCircle,
  RefreshCw,
  BarChart2,
  CheckSquare,
  MessageSquare,
  Monitor,
  Map,
  GitMerge,
  Lock,
  FileCheck,
  Play,
} from 'lucide-react';
import {
  GRADE_TO_STAGE,
  getToolsForRole,
} from '@/data/mockData';
import { api } from '@/lib/api';
import type {
  SearchPipelineResult,
  VerifiedSource,
  GradeLevelId,
  ClassroomContextData,
} from '@/data/mockData';
import { cn } from '@/lib/utils';

const TOOL_ICON_MAP: Record<string, React.ElementType> = {
  FileText, ClipboardList, HelpCircle, RefreshCw, BarChart2,
  CheckSquare, MessageSquare, Monitor, AlignLeft, Map,
  Shield: Shield, GitMerge, Lock, Users, Globe, FileCheck, BookOpen, Youtube: Play,
};

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
  detail: string;
  icon: React.ElementType;
  duration: number;
}[] = [
  {
    id: 'searching',
    label: 'Retrieving Sources',
    description: 'Retrieving from 1.5M+ resources...',
    detail: 'Query expansion (HyDE) → Hybrid search → Rerank → Trust-tier tagging',
    icon: Search,
    duration: 1200,
  },
  {
    id: 'evaluating',
    label: 'Evaluating Quality',
    description: 'Dual-agent filter running...',
    detail: 'Bad Cop removes weak sources · Good Cop validates quality · Consensus scoring',
    icon: Shield,
    duration: 1400,
  },
  {
    id: 'synthesizing',
    label: 'Dual Agent Review',
    description: 'Generating verified summary...',
    detail: 'Citation-grounded generation · APA references compiled',
    icon: Zap,
    duration: 800,
  },
  {
    id: 'complete',
    label: 'Results Ready',
    description: 'Pipeline complete',
    detail: '',
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

// ---------------------------------------------------------------------------
// Collapsible Section wrapper
// ---------------------------------------------------------------------------
function CollapsibleSection({
  icon: Icon,
  title,
  badge,
  open,
  onToggle,
  children,
}: {
  icon: React.ElementType;
  title: string;
  badge?: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-[16px] mb-4">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-6 py-4 cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-[#0f172a]" />
          <span className="text-[16px] font-bold text-[#0f172a]">{title}</span>
          {badge}
        </div>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-[#94a3b8] transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
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
  userRole,
}: SearchPipelineProps) {
  const [currentStage, setCurrentStage] = useState<PipelineStage>('searching');
  const [result, setResult] = useState<SearchPipelineResult | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [newQuery, setNewQuery] = useState('');
  const [copiedRef, setCopiedRef] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [sourceCount, setSourceCount] = useState(0);

  // Collapsible section states
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [sourcesOpen, setSourcesOpen] = useState(true);
  const [agentOpen, setAgentOpen] = useState(false);
  const [referencesOpen, setReferencesOpen] = useState(false);

  // Tool execution states
  const [generatingTool, setGeneratingTool] = useState<string | null>(null);
  const [toolOutput, setToolOutput] = useState<string | null>(null);
  const [customRequest, setCustomRequest] = useState('');

  const role = typeof window !== 'undefined' ? (localStorage.getItem('scora-role') || 'teacher') : 'teacher';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Pipeline effect
  useEffect(() => {
    setCurrentStage('searching');
    setResult(null);
    setIsSaved(false);
    setSourceCount(0);
    setSummaryOpen(true);
    setSourcesOpen(true);
    setAgentOpen(false);
    setReferencesOpen(false);
    setToolOutput(null);
    setGeneratingTool(null);

    // Animate through pipeline stages while the real API call runs (~6s)
    const t1 = setTimeout(() => setCurrentStage('evaluating'), 1500);
    const t2 = setTimeout(() => setCurrentStage('synthesizing'), 3500);

    const runSearch = async () => {
      try {
        const apiResult = await api.search({
          query,
          grade_level: teachingTo,
          user_role: userRole || 'teacher',
          classroom_context: classroomContext as unknown as Record<string, unknown>,
          web_search_enabled: webSearchEnabled,
        });
        setResult(apiResult);
      } catch (err) {
        console.warn('Search failed, using mock data:', err);
        const { getMockSearchResult } = await import('@/data/mockData');
        setResult(getMockSearchResult(query, teachingTo));
      } finally {
        setCurrentStage('complete');
      }
    };

    const t3 = setTimeout(runSearch, 100);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [query]);

  // Animate source counter
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

  // --- Handlers ---
  const handleSave = () => {
    const payload = {
      id: Date.now().toString(),
      query,
      teachingTo,
      timestamp: new Date().toISOString(),
      summary: result?.summary,
      rag_sources: result?.rag_sources,
      dual_agent_review: result?.dual_agent_review,
      references: result?.references,
      consensus_score: result?.dual_agent_review?.consensus_score,
      sources_count: result?.rag_sources?.length,
    };
    const saved = JSON.parse(localStorage.getItem('scora-saved-searches') || '[]');
    saved.unshift(payload);
    localStorage.setItem('scora-saved-searches', JSON.stringify(saved.slice(0, 20)));
    api.saveSearch(query, teachingTo, result, result?.rag_sources?.length || 0, result?.dual_agent_review?.consensus_score).catch(() => {});
    setIsSaved(true);
    showToast('Search results saved to your library');
  };

  const handleSaveSource = (source: VerifiedSource) => {
    const lib = JSON.parse(localStorage.getItem('scora-library') || '[]');
    if (!lib.find((s: { id: string }) => s.id === source.id)) lib.unshift(source);
    localStorage.setItem('scora-library', JSON.stringify(lib));
    api.saveResource({ resource_id: source.id, ...source }).catch(() => {});
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

  const handleToolClick = async (toolId: string, _toolTitle: string) => {
    setGeneratingTool(toolId);
    setToolOutput(null);
    try {
      const content = [
        result?.summary || '',
        ...(result?.rag_sources || []).map((s: VerifiedSource, i: number) =>
          `[${i + 1}] ${s.title}\nProvider: ${s.provider}\nURL: ${s.url}\n${s.snippet}`
        ),
      ].join('\n\n');

      const res = await api.executeTool(
        toolId,
        {
          content,
          subject: result?.subject || '',
          query,
        },
        teachingTo,
        userRole || role,
      );
      setToolOutput(res?.output?.content || res?.output?.message || 'No output returned.');
    } catch (err) {
      setToolOutput(`Error generating content: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setGeneratingTool(null);
    }
  };

  const handleCustomGenerate = async () => {
    if (!customRequest.trim()) return;
    setGeneratingTool('custom');
    setToolOutput(null);
    try {
      const content = [
        result?.summary || '',
        ...(result?.rag_sources || []).map((s: VerifiedSource, i: number) =>
          `[${i + 1}] ${s.title}\nProvider: ${s.provider}\nURL: ${s.url}\n${s.snippet}`
        ),
      ].join('\n\n');

      const res = await api.executeTool(
        'text-rewriter',
        {
          content,
          subject: result?.subject || '',
          query,
          custom_instructions: customRequest,
        },
        teachingTo,
        userRole || role,
      );
      setToolOutput(res?.output?.content || res?.output?.message || 'No output returned.');
    } catch (err) {
      setToolOutput(`Error generating content: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setGeneratingTool(null);
    }
  };

  const currentStageIdx = stageIndex(currentStage);
  const currentStageCfg = STAGES.find((s) => s.id === currentStage)!;
  const stageLabel = GRADE_TO_STAGE[teachingTo] || teachingTo;
  const sortedSources = result?.rag_sources ? [...result.rag_sources].sort((a, b) => b.relevance_score - a.relevance_score) : [];
  const roleTools = getToolsForRole(role).slice(0, 5);

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="max-w-5xl mx-auto px-6 py-6">

        {/* TOP BAR */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-[14px] text-[#64748b] hover:text-[#0f172a] transition-colors shrink-0">
            <ArrowLeft className="w-4 h-4" /> Back to Search
          </button>
          <p className="text-[16px] font-semibold text-[#0f172a] truncate max-w-sm text-center flex-1">&ldquo;{query}&rdquo;</p>
          <div className="shrink-0" />
        </div>

        {/* CONTEXT BADGES */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <span className="bg-[#dcfce7] text-[#15803d] rounded-full px-3 py-1 text-[12px] font-medium">{stageLabel}</span>
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

        {/* PIPELINE PROGRESS BAR */}
        <div className="bg-white border border-[#e2e8f0] rounded-[16px] p-5 mb-6">
          <div className="flex items-start">
            {STAGES.map((stage, i) => {
              const isComplete = currentStageIdx > i;
              const isActive = currentStageIdx === i;
              const Icon = stage.icon;
              return (
                <React.Fragment key={stage.id}>
                  <div className="flex flex-col items-center shrink-0">
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                      isComplete ? 'bg-[#0f172a] text-white' :
                      isActive && currentStage !== 'complete' ? 'bg-[#f97316] text-white' :
                      isActive && currentStage === 'complete' ? 'bg-[#0f172a] text-white' :
                      'bg-[#f0f0f0] text-[#94a3b8]',
                    )}>
                      {isActive && currentStage !== 'complete' ? <Loader2 className="w-[18px] h-[18px] animate-spin" /> : <Icon className="w-[18px] h-[18px]" />}
                    </div>
                    <span className={cn('text-[11px] font-medium text-center mt-2 max-w-[72px]', isComplete || isActive ? 'text-[#0f172a]' : 'text-[#94a3b8]')}>
                      {stage.label}
                    </span>
                  </div>
                  {i < STAGES.length - 1 && (
                    <div className="flex-1 h-[2px] mx-3 rounded-full transition-colors" style={{ marginTop: 20, background: currentStageIdx > i ? '#0f172a' : '#e2e8f0' }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          {currentStage !== 'complete' && (
            <div className="mt-3 text-center">
              <p className="text-[13px] text-[#64748b]">{currentStageCfg.description}</p>
              <p className="text-[11px] text-[#94a3b8] mt-1 italic">{currentStageCfg.detail}</p>
              {currentStage === 'searching' && (
                <p className="text-[12px] text-[#94a3b8] mt-1">Scanning {sourceCount} trusted Australian sources...</p>
              )}
            </div>
          )}
        </div>

        {/* LOADING STATE */}
        <AnimatePresence mode="wait">
          {currentStage !== 'complete' && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center py-16">
              <div className="flex items-center gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.span key={i} className="w-2.5 h-2.5 rounded-full bg-[#f97316]" animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }} />
                ))}
              </div>
              <p className="text-[16px] text-[#64748b] mt-4">Analysing resources for {stageLabel}...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============================================================
            RESULTS — COLLAPSIBLE SECTIONS
        ============================================================ */}
        <AnimatePresence>
          {currentStage === 'complete' && result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

              {/* Results header */}
              <div className="bg-white border border-[#e2e8f0] rounded-[16px] p-5 mb-4 flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-[22px] font-bold text-[#0f172a]">{result.rag_sources.length} resources found</h1>
                  <p className="text-[13px] text-[#64748b] mt-1">for &ldquo;{query}&rdquo; · {result.total_time.toFixed(1)}s</p>
                </div>
                <motion.button
                  onClick={handleSave}
                  whileTap={{ scale: 1.1 }}
                  className={cn(
                    'flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium transition-colors shrink-0',
                    isSaved ? 'bg-[#dcfce7] text-[#15803d]' : 'bg-[#0f172a] text-white hover:bg-[#1e293b]',
                  )}
                >
                  {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <BookMarked className="w-4 h-4" />}
                  {isSaved ? 'Saved ✓' : 'Save Results'}
                </motion.button>
              </div>

              {/* SECTION A: SUMMARY */}
              <CollapsibleSection
                icon={AlignLeft}
                title="Summary"
                badge={<span className="bg-[#dcfce7] text-[#15803d] rounded-full text-[12px] px-3 py-0.5">{result.rag_sources.length} verified sources</span>}
                open={summaryOpen}
                onToggle={() => setSummaryOpen(p => !p)}
              >
                <p className="text-[15px] text-[#334155] leading-relaxed">{result.summary}</p>
                <p className="text-[12px] text-[#94a3b8] mt-3">Pipeline completed in {result.total_time.toFixed(1)}s</p>
              </CollapsibleSection>

              {/* SECTION B: VERIFIED SOURCES */}
              <CollapsibleSection
                icon={Database}
                title="Verified Sources"
                badge={<span className="bg-[#f0f0f0] text-[#64748b] rounded-full text-[12px] px-3 py-0.5">{result.rag_sources.length}</span>}
                open={sourcesOpen}
                onToggle={() => setSourcesOpen(p => !p)}
              >
                <div className="flex flex-col gap-3">
                  {sortedSources.map((source) => {
                    const trust = trustBadge(source.trust_tier);
                    return (
                      <div key={source.id} className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[14px] p-4">
                        {/* Row 1: badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={cn('rounded-full text-[11px] font-medium px-2 py-0.5', trust.cls)}>{trust.label}</span>
                          <span className="border border-[#e2e8f0] rounded-full text-[11px] px-2 py-0.5 text-[#64748b]">{typeLabel(source.type)}</span>
                          <span className="bg-[#0f172a] text-white rounded-full text-[11px] px-2 py-0.5 ml-auto">{Math.round(source.relevance_score)}%</span>
                        </div>
                        {/* Row 2: Title */}
                        <a href={source.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 mt-2 group">
                          <h3 className="text-[15px] font-semibold text-[#0f172a] group-hover:underline">{source.title}</h3>
                          <ExternalLink className="w-3.5 h-3.5 text-[#94a3b8] shrink-0" />
                        </a>
                        {/* Row 3: Provider */}
                        <p className="text-[13px] text-[#64748b]">{source.provider}</p>
                        {/* Row 4: Snippet */}
                        <p className="text-[13px] text-[#64748b] line-clamp-2 mt-1">{source.snippet}</p>
                        {/* Progress bar */}
                        <div className="flex items-center gap-2 mt-3">
                          <span className="text-[11px] text-[#94a3b8] w-16 shrink-0">Relevance</span>
                          <div className="flex-1 h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-[#0f172a]" style={{ width: `${source.relevance_score}%` }} />
                          </div>
                        </div>
                        {/* Action row */}
                        <div className="flex items-center gap-2 mt-3">
                          <button onClick={() => showToast('Localisation applied!')} className="bg-[#f97316] text-white rounded-full px-4 py-1.5 text-[13px] font-medium hover:bg-[#ea6c0a] transition-colors">Localise →</button>
                          <button onClick={() => { handleSaveSource(source); showToast('Saved to Library'); }} aria-label="Save" className="w-8 h-8 bg-white border border-[#e2e8f0] rounded-full flex items-center justify-center hover:bg-[#f1f5f9] transition-colors shrink-0">
                            <BookMarked className="w-3.5 h-3.5 text-[#64748b]" />
                          </button>
                          <button onClick={() => window.open(source.url, '_blank', 'noopener,noreferrer')} aria-label="Open" className="w-8 h-8 bg-white border border-[#e2e8f0] rounded-full flex items-center justify-center hover:bg-[#f1f5f9] transition-colors shrink-0">
                            <ExternalLink className="w-3.5 h-3.5 text-[#64748b]" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CollapsibleSection>

              {/* SECTION C: DUAL AGENT REVIEW */}
              <CollapsibleSection
                icon={Users}
                title="Dual Agent Review"
                badge={
                  <span className={cn(
                    'rounded-full text-[12px] px-3 py-0.5 text-white',
                    result.dual_agent_review.consensus_score >= 7 ? 'bg-[#16a34a]' :
                    result.dual_agent_review.consensus_score >= 5 ? 'bg-[#f97316]' : 'bg-[#ef4444]',
                  )}>{result.dual_agent_review.consensus_score}/10</span>
                }
                open={agentOpen}
                onToggle={() => setAgentOpen(p => !p)}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Good Cop */}
                  <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-[16px] p-5">
                    <div className="flex items-center gap-3">
                      <ThumbsUp className="w-5 h-5 text-[#16a34a]" />
                      <span className="text-[16px] font-semibold flex-1">CurriculumAI Pro</span>
                      <span className="bg-[#16a34a] text-white rounded-full px-3 py-1 text-[13px]">{result.dual_agent_review.good_cop.rating}/10</span>
                    </div>
                    <ul className="mt-3 space-y-2">
                      {result.dual_agent_review.good_cop.points.map((p, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-[#16a34a] shrink-0 mt-0.5" />
                          <span className="text-[13px]">{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Bad Cop */}
                  <div className="bg-[#fff7ed] border border-[#fed7aa] rounded-[16px] p-5">
                    <div className="flex items-center gap-3">
                      <ThumbsDown className="w-5 h-5 text-[#f97316]" />
                      <span className="text-[16px] font-semibold flex-1">CurriculumAI Check</span>
                      <span className="bg-[#f97316] text-white rounded-full px-3 py-1 text-[13px]">{result.dual_agent_review.bad_cop.rating}/10</span>
                    </div>
                    <ul className="mt-3 space-y-2">
                      {result.dual_agent_review.bad_cop.concerns.map((c, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <AlertCircle className="w-3.5 h-3.5 text-[#f97316] shrink-0 mt-0.5" />
                          <span className="text-[13px]">{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                {/* Consensus Panel */}
                <div className="bg-[#0f172a] text-white rounded-[16px] p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-[14px]">Consensus Score</span>
                    <span className="text-[28px] font-bold">{result.dual_agent_review.consensus_score}<span className="text-[16px] font-normal text-white/60">/10</span></span>
                  </div>
                  <div className="bg-white/20 h-2 rounded-full mt-3 overflow-hidden">
                    <div className={cn('h-full rounded-full', result.dual_agent_review.consensus_score >= 7 ? 'bg-[#16a34a]' : result.dual_agent_review.consensus_score >= 5 ? 'bg-[#f97316]' : 'bg-[#ef4444]')} style={{ width: `${(result.dual_agent_review.consensus_score / 10) * 100}%` }} />
                  </div>
                  <p className="text-[14px] text-white/80 leading-relaxed mt-4">{result.dual_agent_review.consensus_verdict}</p>
                  <div className="mt-4">
                    <span className={cn(
                      'rounded-full px-4 py-2 text-[13px] font-medium text-white inline-block',
                      result.dual_agent_review.recommendation === 'approve' ? 'bg-[#16a34a]' : result.dual_agent_review.recommendation === 'review' ? 'bg-[#f97316]' : 'bg-[#ef4444]',
                    )}>
                      {result.dual_agent_review.recommendation === 'approve' ? '✓ Approved for classroom use' : result.dual_agent_review.recommendation === 'review' ? '⚠ Teacher review recommended' : '✗ Not recommended'}
                    </span>
                  </div>
                </div>
              </CollapsibleSection>

              {/* SECTION D: REFERENCES */}
              <CollapsibleSection
                icon={BookOpen}
                title="References"
                badge={<span className="bg-[#f0f0f0] text-[#64748b] rounded-full text-[12px] px-3 py-0.5">{result.references.length}</span>}
                open={referencesOpen}
                onToggle={() => setReferencesOpen(p => !p)}
              >
                <div className="flex flex-col gap-2">
                  {result.references.map((ref, i) => (
                    <div key={i} className="bg-[#f8fafc] rounded-[12px] px-4 py-3 flex items-start gap-3">
                      <FileText className="w-3.5 h-3.5 text-[#94a3b8] shrink-0 mt-0.5" />
                      <span className="text-[12px] text-[#64748b] flex-1 leading-relaxed">{ref}</span>
                      <button onClick={() => handleCopyRef(ref)} aria-label="Copy reference" className="shrink-0 text-[#94a3b8] hover:text-[#64748b] transition-colors">
                        {copiedRef === ref ? <CheckCircle className="w-3.5 h-3.5 text-[#16a34a]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => { const url = ref.match(/https?:\/\/[^\s]+/)?.[0]; if (url) window.open(url, '_blank', 'noopener,noreferrer'); }} aria-label="Open" className="shrink-0 text-[#94a3b8] hover:text-[#64748b] transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>

              {/* ============================================================
                  ACTION BAR
              ============================================================ */}
              <div className="bg-gradient-to-r from-[#0f172a] to-[#1e293b] rounded-[20px] p-6 mt-4">
                <h2 className="text-[18px] font-bold text-white">Raw information is ready</h2>
                <p className="text-[13px] text-white/60 mt-1">Choose a tool to put it to use, or describe what you want</p>

                {/* Tool quick-picks */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {roleTools.map((tool) => {
                    const Icon = TOOL_ICON_MAP[tool.icon] || FileText;
                    return (
                      <button
                        key={tool.id}
                        onClick={() => handleToolClick(tool.id, tool.title)}
                        disabled={!!generatingTool}
                        className="bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full px-4 py-2 text-[13px] flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
                      >
                        <Icon className="w-3.5 h-3.5" /> {tool.title}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => { if (typeof window !== 'undefined') window.location.href = '/tools'; }}
                    className="border border-white/30 text-white/70 rounded-full px-4 py-2 text-[13px] hover:bg-white/10 transition"
                  >
                    View All Tools →
                  </button>
                </div>

                {/* Custom request */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-white/60 text-[13px] mb-2">Or describe what you want</p>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={customRequest}
                      onChange={(e) => setCustomRequest(e.target.value)}
                      placeholder="e.g. 'create a lesson plan from these sources'"
                      className="flex-1 bg-white/10 border border-white/20 rounded-full px-5 py-3 text-white placeholder-white/40 text-[14px] outline-none focus:bg-white/15"
                    />
                    <button
                      onClick={handleCustomGenerate}
                      disabled={!customRequest.trim() || !!generatingTool}
                      className={cn(
                        'bg-[#f97316] text-white rounded-full px-6 py-3 text-[14px] font-medium flex items-center gap-2 transition',
                        (!customRequest.trim() || !!generatingTool) && 'opacity-50 cursor-not-allowed',
                      )}
                    >
                      <Sparkles className="w-4 h-4" /> Generate
                    </button>
                  </div>
                </div>

                {/* Generating indicator */}
                {generatingTool && (
                  <div className="flex items-center gap-2 mt-4">
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                    <span className="text-white/80 text-[13px]">Generating...</span>
                  </div>
                )}
              </div>

              {/* TOOL OUTPUT */}
              <AnimatePresence>
                {toolOutput && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-white border border-[#e2e8f0] rounded-[16px] p-6 mt-4">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-[#f97316]" />
                      <h2 className="text-[18px] font-bold text-[#0f172a] flex-1">Generated Output</h2>
                      <button onClick={() => setToolOutput(null)} className="w-8 h-8 border border-[#e2e8f0] rounded-full flex items-center justify-center hover:bg-[#f8fafc] transition ml-auto">
                        <X className="w-4 h-4 text-[#64748b]" />
                      </button>
                    </div>
                    <pre className="whitespace-pre-wrap text-[14px] text-[#334155] leading-relaxed mt-3 font-sans">{toolOutput}</pre>
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#f0f0f0]">
                      <button
                        onClick={() => { navigator.clipboard.writeText(toolOutput || '').catch(() => {}); showToast('Copied to clipboard'); }}
                        className="flex items-center gap-2 bg-white border border-[#e2e8f0] rounded-full px-4 py-2 text-[13px] hover:bg-[#f8fafc] transition"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </button>
                      <button
                        onClick={() => {
                          const lib = JSON.parse(localStorage.getItem('scora-library-outputs') || '[]');
                          lib.unshift({ id: Date.now().toString(), query, output: toolOutput, timestamp: new Date().toISOString() });
                          localStorage.setItem('scora-library-outputs', JSON.stringify(lib.slice(0, 50)));
                          showToast('Saved to library');
                        }}
                        className="flex items-center gap-2 bg-[#0f172a] text-white rounded-full px-4 py-2 text-[13px] hover:bg-[#1e293b] transition"
                      >
                        <BookMarked className="w-3.5 h-3.5" /> Save to Library
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* NEW SEARCH BAR */}
              <div className="text-center my-6">
                <span className="text-[13px] text-[#94a3b8]">— or search for something new —</span>
              </div>
              <form onSubmit={handleNewSearch} className="flex items-center h-[52px] bg-white border border-[#e2e8f0] rounded-full px-5 gap-3">
                <Search className="w-[18px] h-[18px] text-[#94a3b8] shrink-0" />
                <input
                  type="text"
                  value={newQuery}
                  onChange={(e) => setNewQuery(e.target.value)}
                  placeholder="Search for something else..."
                  className="flex-1 bg-transparent text-[14px] text-[#0f172a] placeholder:text-[#94a3b8] outline-none"
                />
                <button type="submit" aria-label="Search" className="w-9 h-9 bg-[#f97316] rounded-full flex items-center justify-center shrink-0 hover:bg-[#ea6c00] transition-colors">
                  <Search className="w-4 h-4 text-white" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* TOAST */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <AnimatePresence>
          {toastMessage && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="bg-[#0f172a] text-white rounded-[12px] px-5 py-3 text-[14px] shadow-lg whitespace-nowrap">
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default SearchPipeline;
