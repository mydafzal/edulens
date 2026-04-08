'use client';

import { useState } from 'react';
import { Zap, BookMarked, Clock, RefreshCw, Bell, Plus, ArrowRight } from 'lucide-react';
import { AppShell } from '@/components/edulens';

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
// Static data
// ---------------------------------------------------------------------------
const activityLog = [
  { dot: '#16a34a', text: 'Prep My Week completed',      detail: '23 resources', time: '2h ago' },
  { dot: '#16a34a', text: 'Auto-Localise triggered',     detail: '1 resource',   time: 'Yesterday' },
  { dot: '#16a34a', text: 'Weekly Digest completed',     detail: '18 resources', time: 'Mon' },
  { dot: '#f59e0b', text: 'Safety Monitor alert',        detail: '1 flagged',    time: 'Mon' },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function WorkflowsPage() {
  const [prepActive,     setPrepActive]     = useState(true);
  const [auditActive,    setAuditActive]    = useState(true);
  const [geoActive,      setGeoActive]      = useState(true);
  const [localiseActive, setLocaliseActive] = useState(true);
  const [safetyActive,   setSafetyActive]   = useState(false);

  const customWorkflows = [
    {
      icon: Clock,
      name: 'Weekly Geography Digest',
      trigger: 'Every Monday 8am',
      active: geoActive,
      onToggle: () => setGeoActive((p) => !p),
    },
    {
      icon: RefreshCw,
      name: 'Auto-Localise New Saves',
      trigger: 'When resource saved',
      active: localiseActive,
      onToggle: () => setLocaliseActive((p) => !p),
    },
    {
      icon: Bell,
      name: 'Safety Alert Monitor',
      trigger: 'Continuous',
      active: safetyActive,
      onToggle: () => setSafetyActive((p) => !p),
    },
  ];

  return (
    <AppShell>
      <div className="px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ================================================================
              LEFT COLUMN — 65%
          ================================================================ */}
          <div className="flex-[13] min-w-0">

            {/* Header */}
            <h1 className="text-[32px] font-bold text-[#0f172a] leading-tight">Automation</h1>
            <p className="text-[14px] text-[#64748b] mt-1 mb-6">
              Set up workflows to automate your resource discovery and prep
            </p>

            {/* Pre-built Workflows */}
            <h2 className="text-[18px] font-bold text-[#0f172a] mb-3">Pre-built Workflows</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Card 1 — Prep My Week */}
              <div className="rounded-[16px] p-5 flex flex-col" style={{ background: '#4338ca' }}>
                <div className="flex items-center justify-between">
                  <Zap className="w-6 h-6 text-white" />
                  <Toggle active={prepActive} onToggle={() => setPrepActive((p) => !p)} />
                </div>
                <p className="text-[16px] font-semibold text-white mt-3">Prep My Week</p>
                <p className="text-[12px] text-white/70 mt-1 flex-1">
                  Auto-discover and evaluate resources for next week&apos;s topics
                </p>
                <p className="text-[11px] text-white/50 mt-4">Runs every Monday 7am</p>
              </div>

              {/* Card 2 — Audit My Library */}
              <div className="rounded-[16px] p-5 flex flex-col" style={{ background: '#f97316' }}>
                <div className="flex items-center justify-between">
                  <BookMarked className="w-6 h-6 text-white" />
                  <Toggle active={auditActive} onToggle={() => setAuditActive((p) => !p)} />
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
                <button className="flex items-center gap-2 border border-[#e2e8f0] rounded-full px-4 py-2 text-[13px] text-[#64748b] hover:border-[#cbd5e1] transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                  Add Workflow
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {customWorkflows.map((wf) => (
                  <div
                    key={wf.name}
                    className="flex items-center gap-4 bg-white border border-[#e2e8f0] rounded-[12px] px-5 py-4"
                  >
                    {/* Icon circle */}
                    <div className="w-10 h-10 rounded-full bg-[#f8fafc] flex items-center justify-center shrink-0">
                      <wf.icon className="w-[18px] h-[18px] text-[#64748b]" />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-semibold text-[#0f172a] leading-tight">{wf.name}</p>
                      <p className="text-[12px] text-[#94a3b8] mt-0.5">{wf.trigger}</p>
                    </div>

                    {/* Status chip */}
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

                    {/* Toggle */}
                    <div
                      className="relative shrink-0 transition-colors cursor-pointer"
                      style={{
                        width: 40, height: 24,
                        borderRadius: 9999,
                        background: wf.active ? '#0f172a' : '#e2e8f0',
                      }}
                      onClick={wf.onToggle}
                    >
                      <span
                        className="absolute top-0.5 left-0 bg-white rounded-full transition-transform"
                        style={{
                          width: 20, height: 20,
                          transform: wf.active ? 'translateX(18px)' : 'translateX(2px)',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ================================================================
              RIGHT COLUMN — 35%
          ================================================================ */}
          <div className="flex-[7] min-w-0 lg:sticky lg:top-6 lg:h-fit flex flex-col gap-4">

            {/* Workflow Stats */}
            <div className="bg-white border border-[#e2e8f0] rounded-[16px] p-5">
              <h3 className="text-[18px] font-bold text-[#0f172a] mb-4">This Week</h3>
              {[
                { label: 'Workflows Run',   value: '12' },
                { label: 'Resources Found', value: '47' },
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
              <h3 className="text-[16px] font-bold text-[#0f172a] mb-3">Recent Runs</h3>
              <div className="flex flex-col gap-0">
                {activityLog.map((row, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 py-2 ${i < activityLog.length - 1 ? 'border-b border-[#f8fafc]' : ''}`}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: row.dot }}
                    />
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
    </AppShell>
  );
}
