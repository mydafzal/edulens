'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Search,
  Zap,
  Shield,
  Bot,
  Eye,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Copy,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  FileText,
  Sparkles,
  Download,
  Send,
  X,
  Star,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { getMockSearchResult } from '@/data/mockData';
import type { SearchStage, SearchPipelineResult, RAGSource, UserRole, ToolCard } from '@/types/edulens';
import { getToolsForRole } from '@/data/mockData';

// Grade level labels for display
const gradeLevelLabels: Record<string, string> = {
  'early-years': 'Early Years (K–2)',
  'primary': 'Primary (3–6)',
  'middle': 'Middle School (7–9)',
  'senior': 'Senior (10–12)',
  'tertiary': 'Tertiary / Adult',
  'all': 'All Levels',
};

interface SearchPipelineProps {
  query: string;
  onBack: () => void;
  onNewSearch: (q: string) => void;
  userRole: UserRole;
  teachingTo?: string;
}

const stageConfig: { id: SearchStage; label: string; icon: typeof Search; description: string }[] = [
  { id: 'query-expansion', label: 'Query Expansion', icon: Search, description: 'Expanding with HyDE embeddings...' },
  { id: 'rag-retrieval', label: 'RAG Retrieval', icon: Zap, description: 'Hybrid BM25 + vector search across 1.5M+ resources...' },
  { id: 'source-verification', label: 'Source Verification', icon: Shield, description: 'Verifying trust tiers and provenance...' },
  { id: 'dual-agent-review', label: 'Dual-Agent Review', icon: Bot, description: 'CurricuLLM agents evaluating authenticity...' },
  { id: 'scoring', label: 'Quality Scoring', icon: Eye, description: 'Generating 5-dimension quality scorecard...' },
  { id: 'complete', label: 'Complete', icon: CheckCircle2, description: 'Results verified and ready' },
];

export function SearchPipeline({ query, onBack, onNewSearch, userRole, teachingTo = 'all' }: SearchPipelineProps) {
  const [currentStage, setCurrentStage] = useState<SearchStage>('query-expansion');
  const [result, setResult] = useState<SearchPipelineResult | null>(null);
  const [newQuery, setNewQuery] = useState('');
  const [showToolPicker, setShowToolPicker] = useState(false);
  const [customRequest, setCustomRequest] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['summary', 'sources', 'dual-review']));
  const resultsRef = useRef<HTMLDivElement>(null);

  // Simulate pipeline stages
  useEffect(() => {
    const stages: SearchStage[] = ['query-expansion', 'rag-retrieval', 'source-verification', 'dual-agent-review', 'scoring', 'complete'];
    const delays = [600, 800, 600, 900, 500, 0]; // ms per stage
    let timeout: ReturnType<typeof setTimeout>;
    let idx = 0;

    const advance = () => {
      if (idx < stages.length) {
        setCurrentStage(stages[idx]);
        if (idx < stages.length - 1) {
          timeout = setTimeout(() => {
            idx++;
            advance();
          }, delays[idx]);
        } else {
          // Complete — set results
          setResult(getMockSearchResult(query));
        }
      }
    };

    advance();
    return () => clearTimeout(timeout);
  }, [query]);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = () => {
    setIsSaved(true);
    // Persist to localStorage
    const saved = JSON.parse(localStorage.getItem('edulens-saved-searches') || '[]');
    saved.push({ query, timestamp: new Date().toISOString(), result });
    localStorage.setItem('edulens-saved-searches', JSON.stringify(saved));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleNewSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuery.trim()) {
      setCurrentStage('query-expansion');
      setResult(null);
      setIsSaved(false);
      onNewSearch(newQuery.trim());
      setNewQuery('');
    }
  };

  const stageIndex = stageConfig.findIndex(s => s.id === currentStage);
  const isComplete = currentStage === 'complete' && result;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full px-4 sm:px-6 lg:px-8 mx-auto max-w-4xl py-4 sm:py-6 space-y-6"
    >
      {/* Top bar */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold truncate">{query}</h2>
            {teachingTo && teachingTo !== 'all' && (
              <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
                {gradeLevelLabels[teachingTo] || teachingTo}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {isComplete ? `Completed in ${result.totalTime}s` : 'Searching...'}
            {teachingTo && teachingTo !== 'all' && (
              <span className="ml-1">· Filtered for age-appropriate content</span>
            )}
          </p>
        </div>
        {isComplete && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => handleCopy(result.summary)}
            >
              <Copy className="w-3.5 h-3.5" /> Copy
            </Button>
            <Button
              variant={isSaved ? 'secondary' : 'outline'}
              size="sm"
              className="gap-1.5"
              onClick={handleSave}
              disabled={isSaved}
            >
              {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              {isSaved ? 'Saved' : 'Save'}
            </Button>
          </div>
        )}
      </div>

      {/* Pipeline Progress */}
      <div className="bg-card rounded-2xl border border-border p-4 sm:p-5">
        <div className="flex items-center gap-1.5 flex-wrap">
          {stageConfig.map((stage, i) => {
            const isPast = i < stageIndex;
            const isCurrent = stage.id === currentStage;
            const Icon = stage.icon;

            return (
              <div key={stage.id} className="flex items-center gap-1.5">
                {i > 0 && (
                  <div className={cn(
                    'w-6 h-px',
                    isPast || isCurrent ? 'bg-emerald-400' : 'bg-slate-200'
                  )} />
                )}
                <div className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                  isCurrent && !isComplete && 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
                  isPast && 'bg-emerald-50 text-emerald-600',
                  isCurrent && isComplete && 'bg-emerald-500 text-white',
                  !isPast && !isCurrent && 'text-slate-400',
                )}>
                  {isCurrent && !isComplete ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : isPast || (isCurrent && isComplete) ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline">{stage.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Current stage description */}
        {!isComplete && (
          <motion.p
            key={currentStage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-muted-foreground mt-3 flex items-center gap-2"
          >
            <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
            {stageConfig[stageIndex]?.description}
          </motion.p>
        )}
      </div>

      {/* ========== RESULTS ========== */}
      <AnimatePresence>
        {isComplete && result && (
          <motion.div
            ref={resultsRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {/* --- Summary Section --- */}
            <CollapsibleSection
              id="summary"
              title="Summary"
              icon={<Sparkles className="w-4 h-4 text-emerald-500" />}
              badge={`${result.ragSources.length} sources verified`}
              expanded={expandedSections.has('summary')}
              onToggle={() => toggleSection('summary')}
            >
              <div className="prose prose-sm max-w-none text-[15px] leading-relaxed text-foreground whitespace-pre-line">
                {result.summary}
              </div>
            </CollapsibleSection>

            {/* --- Sources / Resources Section --- */}
            <CollapsibleSection
              id="sources"
              title="Verified Sources"
              icon={<Shield className="w-4 h-4 text-blue-500" />}
              badge={`${result.ragSources.length} resources`}
              expanded={expandedSections.has('sources')}
              onToggle={() => toggleSection('sources')}
            >
              <div className="space-y-3">
                {result.ragSources.map((source, i) => (
                  <SourceCard key={source.id} source={source} index={i} onCopy={handleCopy} />
                ))}
              </div>
            </CollapsibleSection>

            {/* --- Dual-Agent Review Section --- */}
            <CollapsibleSection
              id="dual-review"
              title="Dual-Agent Authenticity Review"
              icon={<Bot className="w-4 h-4 text-violet-500" />}
              badge={`Consensus: ${result.dualAgentReview.consensusScore}/10`}
              expanded={expandedSections.has('dual-review')}
              onToggle={() => toggleSection('dual-review')}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Good Cop */}
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 space-y-3">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-semibold text-emerald-800">Good Cop</span>
                    <span className="ml-auto text-lg font-bold text-emerald-600">
                      {result.dualAgentReview.goodCop.rating}/10
                    </span>
                  </div>
                  <p className="text-sm text-emerald-700 leading-relaxed">
                    {result.dualAgentReview.goodCop.summary}
                  </p>
                  <ul className="space-y-1.5">
                    {result.dualAgentReview.goodCop.positivePoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-emerald-500" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bad Cop */}
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 space-y-3">
                  <div className="flex items-center gap-2">
                    <ThumbsDown className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-semibold text-amber-800">Bad Cop</span>
                    <span className="ml-auto text-lg font-bold text-amber-600">
                      {result.dualAgentReview.badCop.rating}/10
                    </span>
                  </div>
                  <p className="text-sm text-amber-700 leading-relaxed">
                    {result.dualAgentReview.badCop.summary}
                  </p>
                  <ul className="space-y-1.5">
                    {result.dualAgentReview.badCop.concerns.map((concern, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-amber-700">
                        <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-500" />
                        {concern}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Consensus bar */}
              <div className="mt-4 p-3 rounded-lg bg-muted flex items-center gap-4">
                <span className="text-sm font-medium">Consensus Score</span>
                <div className="flex-1 h-2 rounded-full bg-slate-200">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${result.dualAgentReview.consensusScore * 10}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={cn(
                      'h-full rounded-full',
                      result.dualAgentReview.consensusScore >= 7 ? 'bg-emerald-500' :
                      result.dualAgentReview.consensusScore >= 5 ? 'bg-amber-500' : 'bg-red-500'
                    )}
                  />
                </div>
                <span className="text-sm font-bold">
                  {result.dualAgentReview.consensusScore}/10
                </span>
              </div>
            </CollapsibleSection>

            {/* --- References Section --- */}
            <CollapsibleSection
              id="references"
              title="References & Citations"
              icon={<FileText className="w-4 h-4 text-slate-500" />}
              badge={`${result.references.length} citations`}
              expanded={expandedSections.has('references')}
              onToggle={() => toggleSection('references')}
            >
              <div className="space-y-3">
                {result.references.map((ref) => (
                  <div key={ref.id} className="p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight">{ref.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {ref.authors.join(', ')} ({new Date(ref.publishDate).getFullYear()})
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          {ref.citationAPA}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleCopy(ref.citationAPA)}
                          className="p-1.5 rounded hover:bg-muted transition-colors"
                          title="Copy citation"
                        >
                          <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded hover:bg-muted transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* ========== ACTION BAR — "Raw Info Ready" ========== */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-5 space-y-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-indigo-900">
                    Raw information is ready for research and analysis
                  </h3>
                  <p className="text-xs text-indigo-600 mt-0.5">
                    Choose a tool to put it to use, or tell us how you want it formatted.
                  </p>
                </div>
              </div>

              {/* Quick tools */}
              <div className="flex flex-wrap gap-2">
                {getToolsForRole(userRole).slice(0, 6).map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => setShowToolPicker(true)}
                    className="px-3 py-1.5 rounded-full bg-white border border-indigo-200 text-[13px] font-medium text-indigo-700 hover:bg-indigo-50 transition-colors"
                  >
                    {tool.title}
                  </button>
                ))}
                <button
                  onClick={() => setShowToolPicker(true)}
                  className="px-3 py-1.5 rounded-full bg-indigo-600 text-white text-[13px] font-medium hover:bg-indigo-700 transition-colors"
                >
                  View All Tools
                </button>
              </div>

              {/* Custom request */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customRequest}
                  onChange={e => setCustomRequest(e.target.value)}
                  placeholder="Or describe what you want — 'create a lesson plan from these sources'"
                  className="flex-1 h-10 px-4 rounded-full border border-indigo-200 bg-white text-sm outline-none focus:border-indigo-400 placeholder:text-indigo-300"
                />
                <Button
                  size="sm"
                  className="rounded-full h-10 px-4 gap-1.5 bg-indigo-600 hover:bg-indigo-700"
                  disabled={!customRequest.trim()}
                >
                  <Send className="w-3.5 h-3.5" /> Generate
                </Button>
              </div>
            </motion.div>

            {/* New search bar at bottom */}
            <form onSubmit={handleNewSearch} className="flex items-center gap-2">
              <div className="flex-1 flex items-center h-11 px-4 rounded-full border border-border bg-card">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={newQuery}
                  onChange={e => setNewQuery(e.target.value)}
                  placeholder="Search for something else..."
                  className="flex-1 h-full px-3 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <Button type="submit" size="sm" className="rounded-full h-11 px-5" disabled={!newQuery.trim()}>
                Search
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading state before results */}
      {!isComplete && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl border border-border p-5 space-y-3">
              <div className="h-4 w-1/3 rounded skeleton" />
              <div className="h-3 w-full rounded skeleton" />
              <div className="h-3 w-2/3 rounded skeleton" />
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ---------- Collapsible Section ----------
function CollapsibleSection({
  id,
  title,
  icon,
  badge,
  expanded,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  icon: React.ReactNode;
  badge?: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 sm:p-5 hover:bg-muted/30 transition-colors text-left"
      >
        {icon}
        <span className="text-sm font-semibold flex-1">{title}</span>
        {badge && (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 pb-4 sm:pb-5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------- Source Card ----------
function SourceCard({ source, index, onCopy }: { source: RAGSource; index: number; onCopy: (t: string) => void }) {
  const tierColors: Record<string, string> = {
    gold: 'bg-amber-50 text-amber-700 border-amber-200',
    silver: 'bg-slate-50 text-slate-600 border-slate-200',
    bronze: 'bg-orange-50 text-orange-700 border-orange-200',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-4 rounded-xl bg-muted/30 border border-border hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-start gap-3">
        <span className="text-xs font-bold text-muted-foreground mt-0.5 w-5 flex-shrink-0">
          {index + 1}.
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h4 className="text-sm font-semibold">{source.title}</h4>
            <span className={cn(
              'text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border',
              tierColors[source.trustTier]
            )}>
              {source.trustTier}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{source.snippet}</p>
          <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
            <span className="font-medium">{source.provider}</span>
            <span>Relevance: {Math.round(source.relevanceScore * 100)}%</span>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center gap-1"
            >
              View <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
