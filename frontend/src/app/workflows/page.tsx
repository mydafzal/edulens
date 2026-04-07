'use client';

import { motion } from 'framer-motion';
import { Workflow, Plus, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppShell } from '@/components/edulens';

export default function WorkflowsPage() {
  return (
    <AppShell>
      <div className="w-full px-4 sm:px-6 lg:px-8 mx-auto max-w-5xl py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[22px] font-bold">Automation Workflows</h1>
            <p className="text-[13px] text-muted-foreground">
              Automated resource discovery and lesson prep
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
            <Workflow className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-[18px] font-semibold mb-2">No workflows configured</h2>
          <p className="text-[15px] text-muted-foreground max-w-sm mb-6">
            Set up automated workflows to receive fresh resources for your subjects
            every week, pre-evaluated and localized.
          </p>
          <Button size="lg" className="gap-2 h-11 rounded-[24px]" disabled>
            <Plus className="w-5 h-5" />
            Create Workflow
            <span className="text-[11px] ml-1 opacity-70">Coming Soon</span>
          </Button>
        </motion.div>

        {/* Workflow Types Preview */}
        <div className="mt-12 space-y-4">
          <h3 className="text-[15px] font-semibold text-muted-foreground">Available Workflow Types</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: Clock,
                title: 'Weekly Resource Digest',
                description: 'Get fresh resources for your subjects every Monday morning'
              },
              {
                icon: RefreshCw,
                title: 'Auto-Localize',
                description: 'Automatically adapt new resources to your classroom context'
              }
            ].map((workflow) => (
              <div
                key={workflow.title}
                className="p-5 rounded-[12px] border border-border bg-muted/30 flex gap-4"
              >
                <div className="w-10 h-10 rounded-[12px] bg-muted flex items-center justify-center flex-shrink-0">
                  <workflow.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="text-[15px] font-semibold mb-1">{workflow.title}</h4>
                  <p className="text-[13px] text-muted-foreground">{workflow.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
