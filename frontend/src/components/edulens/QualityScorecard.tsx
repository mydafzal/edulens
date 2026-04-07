'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, ChevronDown, ChevronUp, MessageSquarePlus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QualityScorecard as QualityScorecardType, QualityDimension, QualityLevel } from '@/types/edulens';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface QualityScorecardProps {
  scorecard: QualityScorecardType;
  compact?: boolean;
  showRationale?: boolean;
  className?: string;
  onOverride?: (dimension: string, note: string) => void;
}

// Semantic colors per guidelines - ONLY for scorecard
const levelConfig: Record<QualityLevel, {
  dotColor: string;
  label: string;
  filledDots: number;
}> = {
  safe: {
    dotColor: 'text-success',
    label: 'Good',
    filledDots: 5,
  },
  caution: {
    dotColor: 'text-warning',
    label: 'Review',
    filledDots: 3,
  },
  warning: {
    dotColor: 'text-danger',
    label: 'Concern',
    filledDots: 1,
  },
};

const dimensionLabels: Record<string, string> = {
  accuracy: 'Accuracy',
  bias: 'Bias',
  ageAppropriateness: 'Age Appropriate',
  culturalSensitivity: 'Cultural Sensitivity',
  safety: 'Safety',
};

// Dot indicator component - uses ● for filled and ○ for empty
function DotIndicator({
  filled,
  total = 5,
  colorClass
}: {
  filled: number;
  total?: number;
  colorClass: string;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'text-sm',
            i < filled ? colorClass : 'text-muted-foreground/30'
          )}
        >
          ●
        </span>
      ))}
    </div>
  );
}

function QualityIndicator({
  dimension,
  index,
  isExpanded,
  onToggle,
  onOverride
}: {
  dimension: QualityDimension;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onOverride?: (dimension: string, note: string) => void;
}) {
  const [showOverrideInput, setShowOverrideInput] = useState(false);
  const [overrideNote, setOverrideNote] = useState('');
  const config = levelConfig[dimension.level];
  // Calculate filled dots based on score (0-100 -> 0-5 dots)
  const filledDots = Math.round((dimension.score / 100) * 5);

  const handleOverrideSubmit = () => {
    if (overrideNote.trim() && onOverride) {
      onOverride(dimension.name, overrideNote.trim());
      setOverrideNote('');
      setShowOverrideInput(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="rounded-[12px] bg-muted/50 overflow-hidden"
    >
      {/* Tappable row header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-4 py-3 cursor-pointer transition-colors hover:bg-muted active:bg-muted/80"
      >
        <span className="text-[15px] font-medium text-foreground">
          {dimensionLabels[dimension.name]}
        </span>
        <div className="flex items-center gap-3">
          <DotIndicator filled={filledDots} colorClass={config.dotColor} />
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expandable content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className={cn('font-semibold text-[13px]', config.dotColor)}>{config.label}</span>
                <span className="text-muted-foreground text-[13px]">
                  ({dimension.score}/100)
                </span>
              </div>
              <p className="text-[15px] text-muted-foreground leading-relaxed">
                {dimension.rationale}
              </p>

              {/* Override button */}
              {onOverride && !showOverrideInput && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-[13px] h-8 px-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowOverrideInput(true);
                  }}
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  Add Note / Override
                </Button>
              )}

              {/* Override input */}
              {showOverrideInput && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <textarea
                    value={overrideNote}
                    onChange={(e) => setOverrideNote(e.target.value)}
                    placeholder="Add your note or reason for override..."
                    className="w-full p-3 rounded-[6px] border border-border bg-card text-[15px] resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={2}
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="h-8 px-4 rounded-[24px]"
                      onClick={handleOverrideSubmit}
                      disabled={!overrideNote.trim()}
                    >
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3"
                      onClick={() => {
                        setShowOverrideInput(false);
                        setOverrideNote('');
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CompactScorecard({ scorecard }: { scorecard: QualityScorecardType }) {
  const [expandedDim, setExpandedDim] = useState<string | null>(null);
  const dimensions = [
    scorecard.accuracy,
    scorecard.bias,
    scorecard.ageAppropriateness,
    scorecard.culturalSensitivity,
    scorecard.safety,
  ];

  return (
    <div className="space-y-2">
      {/* Dots row - tappable on mobile */}
      <div className="flex items-center gap-2 flex-wrap">
        {dimensions.map((dim, i) => {
          const config = levelConfig[dim.level];
          const filledDots = Math.round((dim.score / 100) * 5);
          const isExpanded = expandedDim === dim.name;
          return (
            <button
              key={dim.name}
              type="button"
              onClick={() => setExpandedDim(isExpanded ? null : dim.name)}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1 rounded-[6px] transition-colors min-h-[32px]',
                isExpanded ? 'bg-muted' : 'hover:bg-muted/50'
              )}
            >
              <span className="text-[11px] text-muted-foreground hidden sm:inline">
                {dimensionLabels[dim.name].slice(0, 3)}
              </span>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={cn('text-xs', config.dotColor)}
              >
                {'●'.repeat(filledDots)}{'○'.repeat(5 - filledDots)}
              </motion.span>
            </button>
          );
        })}
      </div>

      {/* Expanded detail - shown when tapped */}
      <AnimatePresence>
        {expandedDim && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            {dimensions.filter(d => d.name === expandedDim).map(dim => {
              const config = levelConfig[dim.level];
              return (
                <div key={dim.name} className="p-2 rounded-[6px] bg-muted text-[13px]">
                  <span className={cn('font-medium', config.dotColor)}>
                    {dimensionLabels[dim.name]}
                  </span>
                  <span className="text-muted-foreground ml-1">({dim.score}/100)</span>
                  <p className="text-muted-foreground mt-1 leading-relaxed">{dim.rationale}</p>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OverallScore({ score }: { score: number }) {
  // Use semantic colors per guidelines
  const getScoreColor = (s: number) => {
    if (s >= 70) return 'text-success';
    if (s >= 40) return 'text-warning';
    return 'text-danger';
  };

  const getScoreLabel = (s: number) => {
    if (s >= 80) return 'Excellent';
    if (s >= 60) return 'Good';
    if (s >= 40) return 'Fair';
    return 'Review Needed';
  };

  const getStrokeColor = (s: number) => {
    if (s >= 70) return 'stroke-success';
    if (s >= 40) return 'stroke-warning';
    return 'stroke-danger';
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center justify-center p-4 rounded-xl bg-muted/50"
    >
      <div className="relative">
        <svg className="w-16 h-16 -rotate-90">
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className="text-muted"
          />
          <motion.circle
            cx="32"
            cy="32"
            r="28"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            className={getStrokeColor(score)}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: score / 100 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{
              strokeDasharray: `${2 * Math.PI * 28}`,
              strokeDashoffset: `${2 * Math.PI * 28 * (1 - score / 100)}`,
            }}
          />
        </svg>
        <span className={cn(
          'absolute inset-0 flex items-center justify-center text-xl font-bold',
          getScoreColor(score)
        )}>
          {score}
        </span>
      </div>
      <span className="text-[13px] font-medium text-muted-foreground mt-2">
        {getScoreLabel(score)}
      </span>
    </motion.div>
  );
}

export function QualityScorecard({
  scorecard,
  compact = false,
  className,
  onOverride
}: QualityScorecardProps) {
  const [expandedDimension, setExpandedDimension] = useState<string | null>(null);

  if (compact) {
    return <CompactScorecard scorecard={scorecard} />;
  }

  const dimensions = [
    scorecard.accuracy,
    scorecard.bias,
    scorecard.ageAppropriateness,
    scorecard.culturalSensitivity,
    scorecard.safety,
  ];

  const toggleDimension = (name: string) => {
    setExpandedDimension(expandedDimension === name ? null : name);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-start gap-4">
        <OverallScore score={scorecard.overallScore} />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-[18px] font-semibold">Quality Scorecard</h3>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                Every resource is evaluated across 5 dimensions.
                Tap each row for details.
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {dimensions.map((dim, i) => (
              <QualityIndicator
                key={dim.name}
                dimension={dim}
                index={i}
                isExpanded={expandedDimension === dim.name}
                onToggle={() => toggleDimension(dim.name)}
                onOverride={onOverride}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QualityScorecard;
