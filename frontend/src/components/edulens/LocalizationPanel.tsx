'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Check,
  X,
  Sparkles,
  MapPin,
  RefreshCw,
  Copy,
  Download,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Adaptation, LocalContext, Resource } from '@/types/edulens';

interface LocalizationPanelProps {
  resource: Resource;
  adaptations: Adaptation[];
  localContext: LocalContext;
  onAccept: (adaptations: Adaptation[]) => void;
  onReject: () => void;
  onRegenerate?: () => void;
  isGenerating?: boolean;
  className?: string;
}

const adaptationTypeConfig: Record<Adaptation['type'], {
  label: string;
  description: string;
}> = {
  example: {
    label: 'Local Example',
    description: 'Generic example replaced with local reference'
  },
  reference: {
    label: 'Local Reference',
    description: 'Reference updated for local context'
  },
  language: {
    label: 'Language',
    description: 'Language simplified for readability'
  },
  cultural: {
    label: 'Cultural',
    description: 'Cultural context incorporated'
  },
  'reading-level': {
    label: 'Reading Level',
    description: 'Adjusted for target reading level'
  },
};

function AdaptationItem({
  adaptation,
  index,
  isSelected,
  onToggle
}: {
  adaptation: Adaptation;
  index: number;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const config = adaptationTypeConfig[adaptation.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        'border rounded-xl overflow-hidden transition-all',
        isSelected ? 'border-primary bg-primary/5' : 'border-border'
      )}
    >
      <div
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className={cn(
            'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0',
            isSelected
              ? 'bg-primary border-primary text-primary-foreground'
              : 'border-muted-foreground/30'
          )}
        >
          {isSelected && <Check className="w-4 h-4" />}
        </button>
        <Badge variant="secondary" className="text-sm px-3 py-1">{config.label}</Badge>
        <span className="flex-1 text-base text-muted-foreground truncate">
          {adaptation.rationale}
        </span>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-5 pt-0 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Original */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Original
                  </p>
                  <div className="p-4 rounded-lg bg-muted text-base leading-relaxed">
                    <span className="line-through text-muted-foreground">
                      {adaptation.original}
                    </span>
                  </div>
                </div>

                {/* Adapted */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-primary uppercase tracking-wide flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    Adapted
                  </p>
                  <div className="p-4 rounded-lg bg-secondary text-base leading-relaxed border border-primary/20">
                    {adaptation.adapted}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function LocalizationPanel({
  resource,
  adaptations,
  localContext,
  onAccept,
  onReject,
  onRegenerate,
  isGenerating = false,
  className
}: LocalizationPanelProps) {
  const [selectedAdaptations, setSelectedAdaptations] = useState<Set<number>>(
    new Set(adaptations.map((_, i) => i))
  );

  const toggleAdaptation = (index: number) => {
    const newSelected = new Set(selectedAdaptations);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedAdaptations(newSelected);
  };

  const handleAccept = () => {
    const accepted = adaptations.filter((_, i) => selectedAdaptations.has(i));
    onAccept(accepted);
  };

  const selectAll = () => {
    setSelectedAdaptations(new Set(adaptations.map((_, i) => i)));
  };

  const selectNone = () => {
    setSelectedAdaptations(new Set());
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="border-b bg-muted/30 p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="w-6 h-6 text-primary" />
              Localization Preview
            </CardTitle>
            <p className="text-base text-muted-foreground">
              Review and accept adaptations for your classroom context
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-2 px-4 py-2 text-sm">
              <MapPin className="w-4 h-4" />
              {localContext.suburb || localContext.region || localContext.state}, {localContext.country}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Context Summary */}
        <div className="flex items-center gap-4 p-5 rounded-xl bg-muted text-base">
          <Info className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <p className="text-muted-foreground leading-relaxed">
            Adapting <span className="font-medium text-foreground">{resource.title}</span> for{' '}
            <span className="font-medium text-foreground">Year {localContext.yearLevel}</span>{' '}
            <span className="font-medium text-foreground">{localContext.subject}</span> in{' '}
            <span className="font-medium text-foreground">
              {localContext.suburb || localContext.region || localContext.state}
            </span>
          </p>
        </div>

        {/* Selection Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-base text-muted-foreground">
              {selectedAdaptations.size} of {adaptations.length} selected
            </span>
            <Button variant="ghost" size="sm" onClick={selectAll}>
              Select All
            </Button>
            <Button variant="ghost" size="sm" onClick={selectNone}>
              Clear
            </Button>
          </div>
          {onRegenerate && (
            <Button
              variant="outline"
              size="default"
              onClick={onRegenerate}
              disabled={isGenerating}
              className="gap-2"
            >
              <RefreshCw className={cn('w-5 h-5', isGenerating && 'animate-spin')} />
              Regenerate
            </Button>
          )}
        </div>

        {/* Adaptations List */}
        <div className="space-y-3">
          {adaptations.map((adaptation, index) => (
            <AdaptationItem
              key={index}
              adaptation={adaptation}
              index={index}
              isSelected={selectedAdaptations.has(index)}
              onToggle={() => toggleAdaptation(index)}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-5 border-t">
          <Button variant="outline" size="default" onClick={onReject} className="gap-2">
            <X className="w-5 h-5" />
            Cancel
          </Button>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="default" className="gap-2">
              <Copy className="w-5 h-5" />
              Copy
            </Button>
            <Button variant="outline" size="default" className="gap-2">
              <Download className="w-5 h-5" />
              Export
            </Button>
            <Button
              onClick={handleAccept}
              disabled={selectedAdaptations.size === 0}
              size="lg"
              className="gap-2"
            >
              <Check className="w-5 h-5" />
              Accept {selectedAdaptations.size} Changes
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default LocalizationPanel;
