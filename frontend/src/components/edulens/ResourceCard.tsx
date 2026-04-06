'use client';

import { motion } from 'framer-motion';
import {
  FileText,
  Video,
  Image as ImageIcon,
  Globe,
  Sparkles,
  ExternalLink,
  Bookmark,
  Share2,
  User,
  Scale
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QualityScorecard } from './QualityScorecard';
import type { Resource } from '@/types/edulens';

interface ResourceCardProps {
  resource: Resource;
  onLocalize?: (resource: Resource) => void;
  onSave?: (resource: Resource) => void;
  onShare?: (resource: Resource) => void;
  showFullScorecard?: boolean;
  className?: string;
  index?: number;
}

const typeConfig: Record<Resource['type'], {
  icon: typeof FileText;
  label: string;
}> = {
  article: { icon: FileText, label: 'Article' },
  video: { icon: Video, label: 'Video' },
  pdf: { icon: FileText, label: 'PDF' },
  interactive: { icon: Sparkles, label: 'Interactive' },
  image: { icon: ImageIcon, label: 'Image' },
  website: { icon: Globe, label: 'Website' },
};

const licenseLabels: Record<string, string> = {
  'cc-by': 'CC BY',
  'cc-by-sa': 'CC BY-SA',
  'cc-by-nc': 'CC BY-NC',
  'public-domain': 'Public Domain',
  'copyrighted': 'Copyrighted',
  'unknown': 'Unknown',
};

export function ResourceCard({
  resource,
  onLocalize,
  onSave,
  onShare,
  showFullScorecard = false,
  className,
  index = 0
}: ResourceCardProps) {
  const typeInfo = typeConfig[resource.type];
  const TypeIcon = typeInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
    >
      {/* Card per guidelines: white bg, shadow-sm, radius-md (12px) */}
      <Card className={cn(
        'overflow-hidden bg-card shadow-sm rounded-[12px] border border-border',
        'hover:shadow-md transition-shadow duration-200',
        className
      )}>
        <CardContent className="p-0">
          {/* Thumbnail - no gradient per clean design */}
          {resource.thumbnail && (
            <div className="relative h-32 sm:h-40 bg-muted overflow-hidden">
              <img
                src={resource.thumbnail}
                alt={resource.title}
                className="w-full h-full object-cover"
              />
              {/* Type chip on thumbnail - chip-neutral styling */}
              <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-[13px] font-medium text-foreground">
                <TypeIcon className="w-4 h-4" />
                {typeInfo.label}
              </span>
            </div>
          )}

          <div className="p-4 space-y-4">
            {/* Header */}
            <div className="space-y-2">
              {!resource.thumbnail && (
                <span className="chip-neutral inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium">
                  <TypeIcon className="w-4 h-4" />
                  {typeInfo.label}
                </span>
              )}
              {/* heading-2: 18px/600 */}
              <h3 className="text-[18px] font-semibold leading-tight line-clamp-2">
                {resource.title}
              </h3>
              {/* body: 15px */}
              <p className="text-[15px] text-muted-foreground line-clamp-2 leading-relaxed">
                {resource.description}
              </p>
            </div>

            {/* Source Info - body-sm: 13px */}
            <div className="flex items-center gap-3 text-[13px] text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 flex-shrink-0" />
                <span className="truncate max-w-[150px]">{resource.source.name}</span>
              </div>
              {resource.source.author && (
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate max-w-[120px]">{resource.source.author}</span>
                </div>
              )}
              {resource.source.licenseType && (
                <div className="flex items-center gap-1.5">
                  <Scale className="w-4 h-4 flex-shrink-0" />
                  <span>{licenseLabels[resource.source.licenseType]}</span>
                </div>
              )}
            </div>

            {/* Tags - chip-subject for topics, chip-neutral for others */}
            {resource.tags && resource.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {resource.tags.slice(0, 3).map((tag, i) => (
                  <span
                    key={tag}
                    className={cn(
                      'px-3 py-1 rounded-full text-[13px] font-medium',
                      i === 0 ? 'chip-subject' : 'chip-neutral'
                    )}
                  >
                    {tag}
                  </span>
                ))}
                {resource.tags.length > 3 && (
                  <span className="chip-neutral px-3 py-1 rounded-full text-[13px] font-medium">
                    +{resource.tags.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Quality Scorecard */}
            <div className="pt-3 border-t border-border">
              {showFullScorecard ? (
                <QualityScorecard scorecard={resource.scorecard} />
              ) : (
                <div className="flex items-center justify-between">
                  <QualityScorecard scorecard={resource.scorecard} compact />
                  <span className="text-[15px] font-medium text-muted-foreground">
                    {resource.scorecard.overallScore}/100
                  </span>
                </div>
              )}
            </div>

            {/* Actions - ONE primary button per guidelines, 44px min tap target */}
            <div className="flex items-center gap-2 pt-2">
              {/* Primary CTA - only one per card */}
              <Button
                onClick={() => onLocalize?.(resource)}
                className="flex-1 gap-2 h-11"
                size="default"
              >
                <Sparkles className="w-5 h-5" />
                Localize
              </Button>
              {/* Secondary actions - outline style, 44x44 min */}
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11"
                onClick={() => onSave?.(resource)}
              >
                <Bookmark className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11"
                onClick={() => onShare?.(resource)}
              >
                <Share2 className="w-5 h-5" />
              </Button>
              <a
                href={resource.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-11 w-11 rounded-[6px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default ResourceCard;
