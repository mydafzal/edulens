'use client';

import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QualityScorecard as QualityScorecardType, QualityDimension, QualityLevel } from '@/types/edulens';
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
  index
}: {
  dimension: QualityDimension;
  index: number;
}) {
  const config = levelConfig[dimension.level];
  // Calculate filled dots based on score (0-100 -> 0-5 dots)
  const filledDots = Math.round((dimension.score / 100) * 5);

  return (
    <Tooltip>
      <TooltipTrigger>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
          className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg bg-muted/50 cursor-help transition-all hover:bg-muted"
        >
          <span className="text-[15px] font-medium text-foreground">
            {dimensionLabels[dimension.name]}
          </span>
          <DotIndicator filled={filledDots} colorClass={config.dotColor} />
        </motion.div>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-xs p-3 bg-card border"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={cn('font-semibold', config.dotColor)}>{config.label}</span>
            <span className="text-muted-foreground text-sm">
              ({dimension.score}/100)
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {dimension.rationale}
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

function CompactScorecard({ scorecard }: { scorecard: QualityScorecardType }) {
  const dimensions = [
    scorecard.accuracy,
    scorecard.bias,
    scorecard.ageAppropriateness,
    scorecard.culturalSensitivity,
    scorecard.safety,
  ];

  return (
    <div className="flex items-center gap-2">
      {dimensions.map((dim, i) => {
        const config = levelConfig[dim.level];
        const filledDots = Math.round((dim.score / 100) * 5);
        return (
          <Tooltip key={dim.name}>
            <TooltipTrigger>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="cursor-help"
              >
                <span className={cn('text-xs', config.dotColor)}>
                  {'●'.repeat(filledDots)}{'○'.repeat(5 - filledDots)}
                </span>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              <span className="font-medium">{dimensionLabels[dim.name]}</span>: {dim.rationale}
            </TooltipContent>
          </Tooltip>
        );
      })}
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
  className
}: QualityScorecardProps) {
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
                Hover over each indicator for details.
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {dimensions.map((dim, i) => (
              <QualityIndicator
                key={dim.name}
                dimension={dim}
                index={i}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QualityScorecard;
