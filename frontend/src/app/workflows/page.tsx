'use client';

import { useState, useEffect } from 'react';
import { Zap, BookMarked, Clock, RefreshCw, Bell, Plus, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '@/components/edulens';
import { showToast } from '@/lib/toast';

// ---------------------------------------------------------------------------
// Toggle switch component
// ---------------------------------------------------------------------------
function Toggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={active ? 'Disable' : 'Enable'}
      className="relative shrink-0 transition-colors"
      style={{
        width: 40, height: 24,
        borderRadius: 9999,
        background: active ? 'rgba(255,255,255,0.30)' : '#e2e8f0',
      }}
    >
      <span
        className="absolute top-0.5 left-0 bg-white rounded-full transition-transform"
        style={{
          width: 20, height: 20,
          transform: active ? 'translateX(18px)' : 'translateX(2px)',
        }}
      />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Add Workflow Modal
// ---------------------------------------------------------------------------
const WORKFLOW_TEMPLATES = [
  {
    icon: Clock,
    name: 'Scheduled Digest',
    description: 'Get a curated list of resources on a schedule',
    trigger: 'Every Monday 8am',
  },
  {
    icon: RefreshCw,
    name: 'Auto-Localise New Saves',
    description: 'Automatically localise resources when saved',
    trigger: 'When resource saved',
  },
  {
    icon: Bell,
    name: 'Safety Alert Monitor',
    description: 'Get notified when flagged content is detected',
    trigger: 'Continuous',
  },
];

function AddWorkflowModal({ onClose, onAdd }: { onClose: () => void; onAdd: (name: string, trigger: string) => void }) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-black/40"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[20px] w-full max-w-md shadow-xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#f0f0f0]">
          <h2 className="text-[18px] font-bold text-[#0f172a]">Add Workflow</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#f0f0f0] transition-colors">
            <X className="w-4 h-4 text-[#64748b]" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {WORKFLOW_TEMPLATES.map((tpl, i) => {
            const isSelected = selected === i;
            return (
              <button
                key={tpl.name}
                onClick={() => setSelected(i)}
                className="w-full flex items-center gap-4 rounded-[14px] border p-4 text-left transition-colors"
                style={{
                  borderColor: isSelected ? '#0f172a' : '#e2e8f0',
                  background: isSelected ? '#f8fafc' : '#fff',
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: isSelected ? '#0f172a' : '#f0f0f0' }}
                >
                  <tpl.icon className="w-[18px] h-[18px]" style={{ color: isSelected ? '#fff' : '#64748b' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[#0f172a]">{tpl.name}</p>
                  <p className="text-[12px] text-[#94a3b8] mt-0.5">{tpl.description}</p>
                  <p className="text-[11px] text-[#64748b] mt-1">Trigger: {tpl.trigger}</p>
                </div>
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                  style={{ borderColor: isSelected ? '#0f172a' : '#e2e8f0' }}
                >
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#0f172a]" />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-11 border border-[#e2e8f0] rounded-full text-[14px] text-[#64748b] hover:border-[#cbd5e1] transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={selected === null}
            onClick={() => {
              if (selected === null) return;
              const tpl = WORKFLOW_TEMPLATES[selected];
              onAdd(tpl.name, tpl.trigger);
              onClose();
            }}
            className="flex-1 h-11 bg-[#0f172a] text-white rounded-full text-[14px] font-medium hover:bg-[#1e293b] transition-colors disabled:opacity-40"
          >
            Add Workflow
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Static activity log
// ---------------------------------------------------------------------------
const activityLog = [
  { dot: '#16a34a', text: 'Prep My Week completed',      detail: '23 resources', time: '2h ago' },
  { dot: '#16a34a', text: 'Auto-Localise triggered',     detail: '1 resource',   time: 'Yesterday' },
  { dot: '#16a34a', text: 'Weekly Digest completed',     detail: '18 resources', time: 'Mon' },
  { dot: '#f59e0b', text: 'Safety Monitor alert',        detail: '1 flagged',    time: 'Mon' },
];

type CustomWorkflow = {
  id: string;
  icon: typeof Clock;
  name: string;
  trigger: string;
  active: boolean;
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function WorkflowsPage() {
  const [prepActive, setPrepActive] = useState(true);
  const [auditActive, setAuditActive] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [customWorkflows, setCustomWorkflows] = useState<CustomWorkflow[]>([
    { id: 'geo', icon: Clock,     name: 'Weekly Geography Digest', trigger: 'Every Monday 8am',  active: true },
    { id: 'loc', icon: RefreshCw, name: 'Auto-Localise New Saves', trigger: 'When resource saved', active: true },
    { id: 'saf', icon: Bell,      name: 'Safety Alert Monitor',    trigger: 'Continuous',         active: false },
  ]);

  // Persist toggle states
  useEffect(() => {
    const saved = localStorage.getItem('scora-workflows');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.prepActive !== undefined) setPrepActive(parsed.prepActive);
        if (parsed.auditActive !== undefined) setAuditActive(parsed.auditActive);
        if (parsed.custom) {
          setCustomWorkflows((prev) =>
            prev.map((wf) => {
              const savedWf = parsed.custom.find((s: { id: string; active: boolean }) => s.id === wf.id);
              return savedWf ? { ...wf, active: savedWf.active } : wf;
            })
          );
        }
      } catch { /* ignore */ }
    }
  }, []);

  const persist = (prep: boolean, audit: boolean, custom: CustomWorkflow[]) => {
    localStorage.setItem('scora-workflows', JSON.stringify({
      prepActive: prep,
      auditActive: audit,
      custom: custom.map(({ id, active }) => ({ id, active })),
    }));
  };

  const togglePrep = () => {
    const next = !prepActive;
    setPrepActive(next);
    persist(next, auditActive, customWorkflows);
    showToast(`Prep My Week ${next ? 'enabled' : 'paused'}.`);
  };

  const toggleAudit = () => {
    const next = !auditActive;
    setAuditActive(next);
    persist(prepActive, next, customWorkflows);
    showToast(`Audit My Library ${next ? 'enabled' : 'paused'}.`);
  };

  const toggleCustom = (id: string) => {
    const updated = customWorkflows.map((wf) =>
      wf.id === id ? { ...wf, active: !wf.active } : wf
    );
    setCustomWorkflows(updated);
    persist(prepActive, auditActive, updated);
    const wf = updated.find((w) => w.id === id)!;
    showToast(`${wf.name} ${wf.active ? 'enabled' : 'paused'}.`);
  };

  const handleAddWorkflow = (name: string, trigger: string) => {
    const iconMap: Record<string, typeof Clock> = {
      'Scheduled Digest': Clock,
      'Auto-Localise New Saves': RefreshCw,
      'Safety Alert Monitor': Bell,
    };
    const newWf: CustomWorkflow = {
      id: Date.now().toString(),
      icon: iconMap[name] ?? Clock,
      name,
      trigger,
      active: true,
    };
    const updated = [...customWorkflows, newWf];
    setCustomWorkflows(updated);
    persist(prepActive, auditActive, updated);
    showToast(`"${name}" workflow added!`);
  };

  const activeCount = customWorkflows.filter((w) => w.active).length + (prepActive ? 1 : 0) + (auditActive ? 1 : 0);

  return (
    <AppShell>
      <div className="px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ================================================================
              LEFT COLUMN
          ================================================================ */}
          <div className="flex-[13] min-w-0">

            <h1 className="text-[32px] font-bold text-[#0f172a] leading-tight">Automation</h1>
            <p className="text-[14px] text-[#64748b] mt-1 mb-6">
              Set up workflows to automate your resource discovery and prep
            </p>

            {/* Pre-built Workflows */}
            <h2 className="text-[18px] font-bold text-[#0f172a] mb-3">Pre-built Workflows</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-[16px] p-5 flex flex-col" style={{ background: '#4338ca' }}>
                <div className="flex items-center justify-between">
                  <Zap className="w-6 h-6 text-white" />
                  <Toggle active={prepActive} onToggle={togglePrep} />
                </div>
                <p className="text-[16px] font-semibold text-white mt-3">Prep My Week</p>
                <p className="text-[12px] text-white/70 mt-1 flex-1">
                  Auto-discover and evaluate resources for next week&apos;s topics
                </p>
                <p className="text-[11px] text-white/50 mt-4">Runs every Monday 7am</p>
              </div>

              <div className="rounded-[16px] p-5 flex flex-col" style={{ background: '#f97316' }}>
                <div className="flex items-center justify-between">
                  <BookMarked className="w-6 h-6 text-white" />
                  <Toggle active={auditActive} onToggle={toggleAudit} />
                </div>
                <p className="text-[16px] font-semibold text-white mt-3">Audit My Library</p>
                <p className="text-[12px] text-white/70 mt-1 flex-1">
                  Review saved resources for expired licences and quality drops
                </p>
                <p className="text-[11px] text-white/50 mt-4">Runs every Sunday 9pm</p>
              </div>
            </div>

            {/* My Workflows */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[18px] font-bold text-[#0f172a]">My Workflows</h2>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 border border-[#e2e8f0] rounded-full px-4 py-2 text-[13px] text-[#64748b] hover:border-[#cbd5e1] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Workflow
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <AnimatePresence>
                  {customWorkflows.map((wf) => (
                    <motion.div
                      key={wf.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-4 bg-white border border-[#e2e8f0] rounded-[12px] px-5 py-4"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#f8fafc] flex items-center justify-center shrink-0">
                        <wf.icon className="w-[18px] h-[18px] text-[#64748b]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-semibold text-[#0f172a] leading-tight">{wf.name}</p>
                        <p className="text-[12px] text-[#94a3b8] mt-0.5">{wf.trigger}</p>
                      </div>
                      <span
                        className="rounded-full text-[11px] px-2 py-0.5 shrink-0"
                        style={
                          wf.active
                            ? { background: '#dcfce7', color: '#16a34a' }
                            : { background: '#f1f5f9', color: '#64748b' }
                        }
                      >
                        {wf.active ? 'Active' : 'Paused'}
                      </span>
                      <div
                        className="relative shrink-0 transition-colors cursor-pointer"
                        style={{
                          width: 40, height: 24,
                          borderRadius: 9999,
                          background: wf.active ? '#0f172a' : '#e2e8f0',
                        }}
                        onClick={() => toggleCustom(wf.id)}
                      >
                        <span
                          className="absolute top-0.5 left-0 bg-white rounded-full transition-transform"
                          style={{
                            width: 20, height: 20,
                            transform: wf.active ? 'translateX(18px)' : 'translateX(2px)',
                          }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* ================================================================
              RIGHT COLUMN
          ================================================================ */}
          <div className="flex-[7] min-w-0 lg:sticky lg:top-6 lg:h-fit flex flex-col gap-4">

            {/* Workflow Stats */}
            <div className="bg-white border border-[#e2e8f0] rounded-[16px] p-5">
              <h3 className="text-[18px] font-bold text-[#0f172a] mb-4">This Week</h3>
              {[
                { label: 'Workflows Run',   value: '12' },
                { label: 'Resources Found', value: '47' },
                { label: 'Active Workflows', value: String(activeCount) },
                { label: 'Time Saved',      value: '3.2h' },
              ].map((stat, i, arr) => (
                <div
                  key={stat.label}
                  className={`flex items-center justify-between py-3 ${i < arr.length - 1 ? 'border-b border-[#f0f0f0]' : ''}`}
                >
                  <span className="text-[13px] text-[#64748b]">{stat.label}</span>
                  <span className="text-[20px] font-bold text-[#0f172a]">{stat.value}</span>
                </div>
              ))}
            </div>

            {/* Activity Log */}
            <div className="bg-white border border-[#e2e8f0] rounded-[16px] p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[16px] font-bold text-[#0f172a]">Recent Runs</h3>
                <button className="text-[12px] text-[#64748b] hover:text-[#0f172a] transition-colors">
                  View All <ArrowRight className="w-3 h-3 inline" />
                </button>
              </div>
              <div className="flex flex-col gap-0">
                {activityLog.map((row, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 py-2 ${i < activityLog.length - 1 ? 'border-b border-[#f8fafc]' : ''}`}
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: row.dot }} />
                    <div className="flex-1 min-w-0">
                      <span className="text-[13px] text-[#0f172a]">{row.text}</span>
                      <span className="text-[11px] text-[#94a3b8] ml-1">· {row.detail}</span>
                    </div>
                    <span className="text-[11px] text-[#94a3b8] shrink-0">{row.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Workflow Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddWorkflowModal
            onClose={() => setShowAddModal(false)}
            onAdd={handleAddWorkflow}
          />
        )}
      </AnimatePresence>
    </AppShell>
  );
}
