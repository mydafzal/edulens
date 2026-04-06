'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  ChevronDown,
  Loader2,
  Mic
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { ScopeLevel } from '@/types/edulens';

interface SearchBarProps {
  onSearch: (query: string, scope: ScopeLevel) => void;
  isSearching?: boolean;
  placeholder?: string;
  className?: string;
  initialQuery?: string;
  suggestions?: string[];
}

const scopeConfig: Record<ScopeLevel, {
  label: string;
  shortLabel: string;
  description: string;
}> = {
  country: { label: 'Australia', shortLabel: 'AU', description: 'Australia-wide' },
  state: { label: 'State', shortLabel: 'State', description: 'State curriculum' },
  region: { label: 'Region', shortLabel: 'Region', description: 'Regional context' },
  suburb: { label: 'Local', shortLabel: 'Local', description: 'Local community' },
  school: { label: 'School', shortLabel: 'School', description: 'School-specific' },
  class: { label: 'Class', shortLabel: 'Class', description: 'Class profile' },
  individual: { label: 'Student', shortLabel: 'Student', description: 'Individual learner' },
};

const scopeLevels: ScopeLevel[] = ['country', 'state', 'region', 'suburb', 'school', 'class', 'individual'];

const exampleQueries = [
  'Water scarcity Year 9 Geography Queensland',
  'First Nations perspectives colonisation Year 10',
  'Climate change data Year 11 Science',
  'Australian poetry Year 8 English',
];

export function SearchBar({
  onSearch,
  isSearching = false,
  placeholder = 'Find resources for Year 9 Geography in Queensland...',
  className,
  initialQuery = '',
  suggestions = exampleQueries,
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [scope, setScope] = useState<ScopeLevel>('state');
  const [isFocused, setIsFocused] = useState(false);
  const [showScopeSelector, setShowScopeSelector] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), scope);
      setIsFocused(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion, scope);
    setIsFocused(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
        setShowScopeSelector(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn('relative w-full max-w-3xl mx-auto', className)}>
      <form onSubmit={handleSubmit}>
        {/* Search bar - 52px tall, radius-full per guidelines */}
        <div
          className={cn(
            'relative flex items-center h-[52px] px-4 rounded-full border bg-white transition-all duration-200',
            isFocused
              ? 'border-primary shadow-md'
              : 'border-border hover:border-muted-foreground/50',
          )}
        >
          {/* Search Icon */}
          <div className="flex-shrink-0">
            {isSearching ? (
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-muted-foreground" />
            )}
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholder}
            className="flex-1 h-full px-3 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
          />

          {/* Clear button */}
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                type="button"
                onClick={() => setQuery('')}
                className="flex-shrink-0 p-2 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Voice input - mobile */}
          <button
            type="button"
            className="flex-shrink-0 p-2 rounded-full hover:bg-muted transition-colors sm:hidden"
          >
            <Mic className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Scope Selector */}
          <div className="relative flex-shrink-0 hidden sm:block">
            <button
              type="button"
              onClick={() => setShowScopeSelector(!showScopeSelector)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <span>{scopeConfig[scope].shortLabel}</span>
              <ChevronDown className={cn(
                'w-4 h-4 transition-transform duration-200',
                showScopeSelector && 'rotate-180'
              )} />
            </button>

            {/* Scope Dropdown */}
            <AnimatePresence>
              {showScopeSelector && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-white border border-border rounded-[12px] shadow-md z-50 overflow-hidden"
                >
                  <div className="p-2">
                    {scopeLevels.map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => {
                          setScope(level);
                          setShowScopeSelector(false);
                        }}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-[6px] text-left transition-colors',
                          scope === level
                            ? 'bg-accent text-primary'
                            : 'hover:bg-muted'
                        )}
                      >
                        <div>
                          <p className="text-[15px] font-medium">{scopeConfig[level].label}</p>
                          <p className="text-[13px] text-muted-foreground">
                            {scopeConfig[level].description}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Search Button - Primary, radius-xl */}
          <Button
            type="submit"
            disabled={!query.trim() || isSearching}
            className="flex-shrink-0 h-10 px-6 ml-2 rounded-full"
          >
            Search
          </Button>
        </div>
      </form>

      {/* Smart Suggestions - chips in primary-100 */}
      <AnimatePresence>
        {isFocused && !query && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 top-full mt-3 bg-white border border-border rounded-[12px] shadow-md z-40 overflow-hidden"
          >
            <div className="p-4">
              <p className="text-[13px] font-medium text-muted-foreground mb-3">
                Try searching for...
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-2 rounded-full bg-secondary text-secondary-foreground text-[13px] hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter chips below search */}
      <div className="flex items-center gap-2 mt-4 flex-wrap">
        <span className="chip-neutral px-3 py-1.5 rounded-full text-[13px]">
          {scopeConfig[scope].label}
        </span>
        <span className="chip-neutral px-3 py-1.5 rounded-full text-[13px]">
          Year 7-12
        </span>
        <span className="chip-neutral px-3 py-1.5 rounded-full text-[13px]">
          All Subjects
        </span>
      </div>
    </div>
  );
}

export default SearchBar;
