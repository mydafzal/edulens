'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, Search, Trash2, FolderOpen, LayoutGrid, List, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppShell, ResourceCard } from '@/components/edulens';
import Link from 'next/link';
import type { Resource } from '@/types/edulens';

export default function LibraryPage() {
  const [savedResources, setSavedResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const saved = localStorage.getItem('edulens-library');
    if (saved) {
      setSavedResources(JSON.parse(saved));
    }
    setIsLoading(false);
  }, []);

  const handleRemove = (resourceId: string) => {
    const updated = savedResources.filter(r => r.id !== resourceId);
    setSavedResources(updated);
    localStorage.setItem('edulens-library', JSON.stringify(updated));
  };

  return (
    <AppShell>
      <div className="w-full px-4 sm:px-6 lg:px-8 mx-auto max-w-5xl py-6">
        {/* Header with Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-[22px] font-bold">Saved Library</h1>
            <span className="px-2.5 py-1 rounded-full bg-secondary text-primary text-[13px] font-medium">
              {savedResources.length}
            </span>
          </div>

          {savedResources.length > 0 && (
            <div className="flex items-center gap-2">
              {/* Grid/List Toggle */}
              <div className="flex items-center rounded-[8px] border border-border p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-[6px] transition-colors ${
                    viewMode === 'grid' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-[6px] transition-colors ${
                    viewMode === 'list' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Filter Button */}
              <Button variant="outline" size="sm" className="gap-2 h-9">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-[12px] border border-border p-4 space-y-4">
                <div className="h-32 rounded-[6px] skeleton" />
                <div className="h-5 w-3/4 rounded-[6px] skeleton" />
                <div className="h-4 w-full rounded-[6px] skeleton" />
              </div>
            ))}
          </div>
        ) : savedResources.length === 0 ? (
          /* Empty State - per guidelines: illustration, headline, sub-line, action */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
              <FolderOpen className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-[18px] font-semibold mb-2">No saved resources yet</h2>
            <p className="text-[15px] text-muted-foreground max-w-sm mb-6">
              When you find resources you like, save them here for quick access later.
            </p>
            <Link href="/">
              <Button size="lg" className="gap-2 h-11 rounded-[24px]">
                <Search className="w-5 h-5" />
                Start Searching
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {savedResources.map((resource, index) => (
              <div key={resource.id} className="relative group">
                <ResourceCard
                  resource={resource}
                  index={index}
                  onLocalize={() => {}}
                  onSave={() => handleRemove(resource.id)}
                  onShare={() => navigator.clipboard.writeText(resource.source.url)}
                />
                <button
                  onClick={() => handleRemove(resource.id)}
                  className="absolute top-4 right-4 p-2 rounded-[6px] bg-card/90 backdrop-blur-sm border border-border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
                >
                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
