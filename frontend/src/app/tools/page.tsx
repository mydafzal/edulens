'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/edulens';
import { ALL_TOOLS, getToolsForRole } from '@/data/mockData';
import type { ToolDefinition } from '@/data/mockData';
import { cn } from '@/lib/utils';
import {
  Search,
  ArrowLeft,
  FileText,
  ClipboardList,
  HelpCircle,
  RefreshCw,
  BarChart2,
  CheckSquare,
  MessageSquare,
  Monitor,
  AlignLeft,
  Map,
  Shield,
  GitMerge,
  Lock,
  Users,
  Globe,
  FileCheck,
  BookOpen,
  Play,
  Sparkles,
} from 'lucide-react';

const TOOL_ICON_MAP: Record<string, React.ElementType> = {
  FileText, ClipboardList, HelpCircle, RefreshCw, BarChart2,
  CheckSquare, MessageSquare, Monitor, AlignLeft, Map,
  Shield, GitMerge, Lock, Users, Globe, FileCheck, BookOpen, Youtube: Play,
};

function ToolCard({
  tool,
  selected,
  onSelect,
}: {
  tool: ToolDefinition;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = TOOL_ICON_MAP[tool.icon] || FileText;
  return (
    <button
      onClick={onSelect}
      className={cn(
        'bg-white border rounded-[16px] p-5 text-left transition-all hover:shadow-md cursor-pointer',
        selected ? 'border-[#0f172a] shadow-md ring-2 ring-[#0f172a]/10' : 'border-[#e2e8f0] hover:border-[#cbd5e1]',
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          'w-10 h-10 rounded-[12px] flex items-center justify-center',
          selected ? 'bg-[#0f172a] text-white' : 'bg-[#f8fafc] text-[#0f172a]',
        )}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-[#0f172a]">{tool.title}</p>
          <p className="text-[13px] text-[#64748b] mt-0.5 line-clamp-1">{tool.description}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {tool.roles.map((r) => (
          <span key={r} className="bg-[#f0f0f0] text-[#64748b] rounded-full text-[11px] px-2.5 py-0.5 capitalize">
            {r}
          </span>
        ))}
      </div>
    </button>
  );
}

function ToolsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselected = searchParams.get('tool');

  const [tab, setTab] = useState<'my' | 'all'>('my');
  const [selectedTool, setSelectedTool] = useState<string | null>(preselected);
  const [filterQuery, setFilterQuery] = useState('');
  const [role, setRole] = useState('teacher');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRole(localStorage.getItem('scora-role') || 'teacher');
    }
  }, []);

  const myTools = getToolsForRole(role);
  const displayTools = tab === 'my' ? myTools : ALL_TOOLS;
  const filtered = filterQuery.trim()
    ? displayTools.filter(
        (t) =>
          t.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(filterQuery.toLowerCase()),
      )
    : displayTools;

  const selected = ALL_TOOLS.find((t) => t.id === selectedTool);

  const handleUse = () => {
    if (selected) {
      router.push(`/?tool=${selected.id}`);
    }
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-[#f5f5f5]">
        <div className="max-w-6xl mx-auto px-6 py-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-[14px] text-[#64748b] hover:text-[#0f172a] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </button>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-[28px] font-bold text-[#0f172a]">Tools</h1>
              <p className="text-[14px] text-[#64748b] mt-1">AI-powered tools to transform your search results into classroom-ready materials</p>
            </div>
            <span className="bg-[#ede9fe] text-[#6d28d9] rounded-full text-[13px] px-4 py-1.5 capitalize font-medium">
              {role}
            </span>
          </div>

          {/* Tabs + Search */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div className="flex gap-1 bg-[#f0f0f0] rounded-full p-1">
              {([
                { id: 'my' as const, label: `My Tools (${myTools.length})` },
                { id: 'all' as const, label: `All Tools (${ALL_TOOLS.length})` },
              ]).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    'px-5 py-2 text-[13px] rounded-full transition-colors',
                    tab === t.id
                      ? 'bg-white text-[#0f172a] font-medium shadow-sm'
                      : 'text-[#64748b] hover:text-[#0f172a]',
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="flex items-center bg-white border border-[#e2e8f0] rounded-full px-4 py-2 gap-2 flex-1 max-w-sm">
              <Search className="w-4 h-4 text-[#94a3b8]" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Search tools..."
                className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-[#94a3b8]"
              />
            </div>
          </div>

          {/* Grid + Detail */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tool grid */}
            <div className="lg:col-span-2">
              {filtered.length === 0 ? (
                <div className="bg-white border border-[#e2e8f0] rounded-[16px] p-12 text-center">
                  <p className="text-[16px] text-[#64748b]">No tools match your search</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filtered.map((tool) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      selected={selectedTool === tool.id}
                      onSelect={() => setSelectedTool(tool.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Detail panel */}
            <div className="lg:col-span-1">
              {selected ? (
                <div className="bg-white border border-[#e2e8f0] rounded-[20px] p-6 sticky top-6">
                  {(() => {
                    const Icon = TOOL_ICON_MAP[selected.icon] || FileText;
                    return (
                      <div className="w-14 h-14 bg-[#0f172a] rounded-[16px] flex items-center justify-center mb-4">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                    );
                  })()}
                  <h2 className="text-[22px] font-bold text-[#0f172a]">{selected.title}</h2>
                  <p className="text-[14px] text-[#64748b] mt-2 leading-relaxed">{selected.description}</p>

                  <div className="mt-4">
                    <p className="text-[12px] text-[#94a3b8] uppercase tracking-wide font-medium mb-2">Available for</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.roles.map((r) => (
                        <span key={r} className={cn(
                          'rounded-full text-[12px] px-3 py-1 capitalize',
                          r === role ? 'bg-[#0f172a] text-white' : 'bg-[#f0f0f0] text-[#64748b]',
                        )}>
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleUse}
                    className="w-full bg-[#f97316] text-white rounded-full h-[48px] text-[15px] font-medium mt-6 hover:bg-[#ea6c0a] transition-colors flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" /> Use {selected.title}
                  </button>
                  <p className="text-[12px] text-[#94a3b8] text-center mt-2">Opens search with this tool pre-selected</p>
                </div>
              ) : (
                <div className="bg-[#f8fafc] border border-dashed border-[#e2e8f0] rounded-[20px] p-8 text-center">
                  <Sparkles className="w-8 h-8 text-[#94a3b8] mx-auto mb-3" />
                  <p className="text-[16px] font-semibold text-[#64748b]">Select a tool</p>
                  <p className="text-[13px] text-[#94a3b8] mt-1">Click any tool card to see details and start using it</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function ToolsPage() {
  return (
    <Suspense fallback={
      <AppShell>
        <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
          <p className="text-[#64748b]">Loading tools...</p>
        </div>
      </AppShell>
    }>
      <ToolsPageContent />
    </Suspense>
  );
}
