'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  ArrowRight,
  FolderOpen,
  Search,
  ChevronDown,
  X,
} from 'lucide-react';
import { AppShell } from '@/components/edulens';
import Link from 'next/link';
import type { Resource } from '@/types/edulens';

// ---------------------------------------------------------------------------
// Static demo folders
// ---------------------------------------------------------------------------
const FOLDERS = [
  { name: 'Ecosystem', count: 12 },
  { name: 'Climate Change', count: 9 },
  { name: 'Mass communication', count: 3 },
];

const FILTER_TABS = ['All', 'Articles', 'Lessons', 'Videos', 'Collections'] as const;
type FilterTab = (typeof FILTER_TABS)[number];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function LibraryPage() {
  const [savedResources, setSavedResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('All');

  // right-column filter state
  const [tags, setTags] = useState<string[]>(['Water Scarcity', 'Water', 'Sustainability']);

  useEffect(() => {
    const saved = localStorage.getItem('edulens-library');
    if (saved) {
      try {
        setSavedResources(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
    setIsLoading(false);
  }, []);

  const handleRemove = (resourceId: string) => {
    const updated = savedResources.filter((r) => r.id !== resourceId);
    setSavedResources(updated);
    localStorage.setItem('edulens-library', JSON.stringify(updated));
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  // Simple client-side filter by type
  const filteredResources =
    activeTab === 'All'
      ? savedResources
      : savedResources.filter((r) => {
          if (activeTab === 'Articles') return r.type === 'article';
          if (activeTab === 'Videos') return r.type === 'video';
          if (activeTab === 'Lessons') return r.type === 'pdf';
          return true;
        });

  return (
    <AppShell>
      <div className="px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ================================================================
              LEFT COLUMN — 65%
          ================================================================ */}
          <div className="flex-[13] min-w-0">
            {/* Header */}
            <div className="mb-5">
              <h1 className="text-[32px] font-bold text-[#0f172a] leading-tight">Library</h1>
              <p className="text-[14px] text-[#64748b] mt-0.5">Your saved Resources</p>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 flex-wrap mb-6">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={
                    tab === activeTab
                      ? 'bg-[#f97316] text-white rounded-full px-4 py-2 text-[13px] font-medium transition-colors'
                      : 'bg-white border border-[#e2e8f0] text-[#64748b] rounded-full px-4 py-2 text-[13px] hover:border-[#cbd5e1] transition-colors'
                  }
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Collection folders */}
            <div className="space-y-3 mb-8">
              {FOLDERS.map((folder) => (
                <div
                  key={folder.name}
                  className="flex items-center justify-between bg-white border border-[#e2e8f0] rounded-[12px] px-5 py-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#3b82f6] rounded-full flex items-center justify-center shrink-0">
                      <Plus className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[15px] font-semibold text-[#0f172a]">{folder.name}</span>
                    <span className="border border-[#e2e8f0] rounded-full text-[12px] px-3 py-1 text-[#64748b]">
                      {String(folder.count).padStart(2, '0')} resources
                    </span>
                  </div>
                  <button className="w-10 h-10 border border-[#e2e8f0] rounded-full flex items-center justify-center hover:bg-[#f8fafc] transition-colors">
                    <ArrowRight className="w-4 h-4 text-[#64748b]" />
                  </button>
                </div>
              ))}
            </div>

            {/* Recently Saved Resources */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[18px] font-bold text-[#0f172a]">Recently Saved Resources</h2>
                <button className="flex items-center gap-1.5 border border-[#e2e8f0] rounded-full px-3 py-1.5 text-[13px] text-[#64748b] hover:border-[#cbd5e1] transition-colors">
                  Most Recent
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-[100px] rounded-[12px] bg-[#f0f0f0] animate-pulse"
                    />
                  ))}
                </div>
              ) : filteredResources.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-[#f0f0f0] flex items-center justify-center mb-4">
                    <FolderOpen className="w-8 h-8 text-[#94a3b8]" />
                  </div>
                  <h3 className="text-[16px] font-semibold text-[#0f172a] mb-1">
                    No saved resources yet
                  </h3>
                  <p className="text-[13px] text-[#64748b] max-w-xs mb-5">
                    When you find resources you like, save them here for quick access later.
                  </p>
                  <Link
                    href="/"
                    className="flex items-center gap-2 bg-[#0f172a] text-white rounded-full px-5 py-2.5 text-[13px] font-medium hover:bg-[#1e293b] transition-colors"
                  >
                    <Search className="w-4 h-4" />
                    Start Searching
                  </Link>
                </motion.div>
              ) : (
                <div>
                  {filteredResources.map((resource, i) => (
                    <ResourceRow
                      key={resource.id}
                      resource={resource}
                      isLast={i === filteredResources.length - 1}
                      onRemove={handleRemove}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ================================================================
              RIGHT COLUMN — 35%
          ================================================================ */}
          <div className="flex-[7] min-w-0 lg:sticky lg:top-6 lg:self-start">
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5">
              <h3 className="text-[16px] font-bold text-[#0f172a]">Search Resources</h3>
              <p className="text-[13px] text-[#64748b] mt-0.5 mb-4">
                Find the resources more easily by using filters
              </p>

              {/* Dropdowns */}
              <div className="space-y-3 mb-4">
                {(['Year Level', 'Course', 'Saved in last month'] as const).map((label) => (
                  <button
                    key={label}
                    className="w-full flex items-center justify-between border border-[#e2e8f0] rounded-[12px] px-4 py-3 text-[14px] text-[#64748b] hover:border-[#cbd5e1] transition-colors"
                  >
                    {label}
                    <ChevronDown className="w-4 h-4 shrink-0" />
                  </button>
                ))}
              </div>

              {/* Tags */}
              <div className="mb-5">
                <p className="text-[13px] font-semibold text-[#0f172a] mb-0.5">Tags</p>
                <p className="text-[12px] text-[#64748b] mb-3">
                  Add the tags to get perfect results.
                </p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1.5 bg-[#dbeafe] text-[#1d4ed8] rounded-full text-[12px] px-3 py-1"
                    >
                      {tag}
                      <button onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <button className="border border-dashed border-[#e2e8f0] rounded-full px-3 py-1 text-[13px] text-[#64748b] hover:border-[#cbd5e1] transition-colors">
                    + Add Tags
                  </button>
                </div>
              </div>

              {/* Footer actions */}
              <div className="flex items-center gap-2">
                <button className="bg-[#0f172a] text-white rounded-full px-5 py-2 text-[13px] font-medium hover:bg-[#1e293b] transition-colors">
                  Search →
                </button>
                <button className="flex items-center gap-1.5 border border-[#e2e8f0] rounded-full px-4 py-2 text-[13px] text-[#64748b] hover:border-[#cbd5e1] transition-colors">
                  Clear All
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

// ---------------------------------------------------------------------------
// Resource row component
// ---------------------------------------------------------------------------
function ResourceRow({
  resource,
  isLast,
  onRemove,
}: {
  resource: Resource;
  isLast: boolean;
  onRemove: (id: string) => void;
}) {
  return (
    <div
      className={`flex items-start gap-4 py-5 ${isLast ? '' : 'border-b border-[#f0f0f0]'}`}
    >
      {/* Text side */}
      <div className="flex-1 min-w-0">
        <h4 className="text-[16px] font-semibold text-[#0f172a] leading-snug">{resource.title}</h4>
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {resource.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="border border-[#e2e8f0] rounded-full text-[11px] px-2 py-1 text-[#64748b]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <p className="text-[13px] text-[#64748b] mt-2 line-clamp-2">{resource.description}</p>
      </div>

      {/* Thumbnail + action */}
      <div className="relative shrink-0">
        {resource.thumbnail ? (
          <img
            src={resource.thumbnail}
            alt={resource.title}
            className="w-[100px] h-[80px] rounded-[12px] object-cover"
          />
        ) : (
          <div className="w-[100px] h-[80px] rounded-[12px] bg-[#f0f0f0] flex items-center justify-center">
            <FolderOpen className="w-6 h-6 text-[#94a3b8]" />
          </div>
        )}
        <button
          onClick={() => onRemove(resource.id)}
          aria-label="Remove resource"
          className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#0f172a] rounded-full flex items-center justify-center hover:bg-[#1e293b] transition-colors shadow"
        >
          <ArrowRight className="w-3.5 h-3.5 text-white" />
        </button>
      </div>
    </div>
  );
}
