'use client';

import { motion } from 'framer-motion';
import { FileText, Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppShell } from '@/components/edulens';

export default function PlansPage() {
  return (
    <AppShell>
      <div className="w-full px-4 sm:px-6 lg:px-8 mx-auto max-w-5xl py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[22px] font-bold">Lesson Plans</h1>
            <p className="text-[13px] text-muted-foreground">
              AI-generated lesson plans from your saved resources
            </p>
          </div>
        </div>

        {/* Empty State */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
            <FileText className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-[18px] font-semibold mb-2">No lesson plans yet</h2>
          <p className="text-[15px] text-muted-foreground max-w-sm mb-6">
            Create AI-powered lesson plans from your saved resources.
            Each plan is customized for your classroom context.
          </p>
          <Button size="lg" className="gap-2 h-11 rounded-[24px]" disabled>
            <Sparkles className="w-5 h-5" />
            Create Lesson Plan
            <span className="text-[11px] ml-1 opacity-70">Coming Soon</span>
          </Button>
        </motion.div>

        {/* Feature Preview */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              title: 'Auto-Generated',
              description: 'Plans created from your saved resources and localization preferences'
            },
            {
              title: 'Curriculum Aligned',
              description: 'Automatically mapped to Australian Curriculum codes'
            },
            {
              title: 'Differentiated',
              description: 'Multiple versions for different learning needs'
            }
          ].map((feature) => (
            <div
              key={feature.title}
              className="p-5 rounded-[12px] border border-border bg-muted/30"
            >
              <h3 className="text-[15px] font-semibold mb-1">{feature.title}</h3>
              <p className="text-[13px] text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
