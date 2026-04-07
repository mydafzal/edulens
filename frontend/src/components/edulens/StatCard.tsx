'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

type CardVariant = 'default' | 'green' | 'indigo' | 'sky';

interface StatCardProps {
  label: string;
  value: string | number;
  subLabel?: string;
  change?: {
    value: string;
    positive?: boolean;
  };
  progress?: {
    current: number;
    total: number;
  };
  variant?: CardVariant;
  icon?: LucideIcon;
  className?: string;
  index?: number;
}

const variantStyles: Record<CardVariant, {
  bg: string;
  border: string;
  labelColor: string;
  valueColor: string;
  subLabelColor: string;
  progressBg: string;
  progressFill: string;
}> = {
  default: {
    bg: 'bg-card',
    border: 'border border-border',
    labelColor: 'text-muted-foreground',
    valueColor: 'text-foreground',
    subLabelColor: 'text-muted-foreground',
    progressBg: 'bg-border',
    progressFill: 'bg-primary',
  },
  green: {
    bg: 'bg-primary',
    border: '',
    labelColor: 'text-primary-foreground/70',
    valueColor: 'text-primary-foreground',
    subLabelColor: 'text-primary-foreground/70',
    progressBg: 'bg-primary-foreground/30',
    progressFill: 'bg-primary-foreground',
  },
  indigo: {
    bg: 'bg-sidebar',
    border: '',
    labelColor: 'text-sidebar-foreground',
    valueColor: 'text-sidebar-accent-foreground',
    subLabelColor: 'text-sidebar-foreground',
    progressBg: 'bg-sidebar-accent/30',
    progressFill: 'bg-sidebar-accent-foreground',
  },
  sky: {
    bg: 'bg-info',
    border: '',
    labelColor: 'text-white/70',
    valueColor: 'text-white',
    subLabelColor: 'text-white/70',
    progressBg: 'bg-white/30',
    progressFill: 'bg-white',
  },
};

export function StatCard({
  label,
  value,
  subLabel,
  change,
  progress,
  variant = 'default',
  icon: Icon,
  className,
  index = 0
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={cn(
        'rounded-[12px] p-4',
        styles.bg,
        styles.border,
        className
      )}
    >
      {/* Label */}
      <p className={cn(
        'text-[11px] font-medium uppercase tracking-[0.06em] mb-1',
        styles.labelColor
      )}>
        {label}
      </p>

      {/* Value */}
      <div className="flex items-center gap-2">
        {Icon && (
          <Icon className={cn('w-5 h-5', styles.valueColor)} />
        )}
        <p className={cn(
          'text-[24px] font-medium',
          styles.valueColor
        )}>
          {value}
        </p>
      </div>

      {/* Sub-label */}
      {subLabel && (
        <p className={cn(
          'text-[11px] mt-1',
          styles.subLabelColor
        )}>
          {subLabel}
        </p>
      )}

      {/* Change indicator */}
      {change && (
        <p className={cn(
          'text-[11px] mt-1.5',
          variant === 'default'
            ? change.positive !== false ? 'text-primary' : 'text-destructive'
            : styles.valueColor
        )}>
          {change.positive !== false ? '↑' : '↓'} {change.value}
        </p>
      )}

      {/* Progress bar */}
      {progress && (
        <div className="mt-3">
          <div className={cn('h-1 rounded-full', styles.progressBg)}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(progress.current / progress.total) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={cn('h-full rounded-full', styles.progressFill)}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default StatCard;
