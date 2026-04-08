'use client';

import { useState } from 'react';
import { FileText, ArrowRight, ChevronDown, Check } from 'lucide-react';
import { AppShell } from '@/components/edulens';

// ---------------------------------------------------------------------------
// Static demo data
// ---------------------------------------------------------------------------
const recentPlans = [
  { title: 'Water Scarcity', subject: 'Geography', year: 'Year 9', age: '2 days ago' },
  { title: 'Poetry Analysis', subject: 'English',   year: 'Year 8', age: '1 week ago' },
  { title: 'Climate Change',  subject: 'Science',   year: 'Year 10', age: '2 weeks ago' },
];

const quickTools = [
  { emoji: '📝', name: 'Worksheet Generator', description: 'Create printable worksheets' },
  { emoji: '🎯', name: 'Quiz Builder',         description: 'Generate assessment questions' },
  { emoji: '📊', name: 'Rubric Creator',       description: 'Build assessment rubrics' },
  { emoji: '🔍', name: 'Resource Finder',      description: 'Search curated resources' },
];

const proTips = [
  'Add curriculum codes for aligned plans',
  'Specify student interests for engagement',
  'Include local context for better results',
];

const yearLevels = ['Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11', 'Year 12'];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function PlansPage() {
  const [topic, setTopic] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [outcome, setOutcome] = useState('');
  const [toast, setToast] = useState(false);

  const handleGenerate = () => {
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  const inputClass =
    'w-full h-[52px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[12px] px-4 text-[14px] text-[#0f172a] placeholder:text-[#94a3b8] outline-none focus:border-[#cbd5e1] transition-colors';

  return (
    <AppShell>
      <div className="px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ================================================================
              LEFT COLUMN — 65%
          ================================================================ */}
          <div className="flex-[13] min-w-0">
            {/* Header */}
            <h1 className="text-[32px] font-bold text-[#0f172a] leading-tight">Create</h1>
            <p className="text-[14px] text-[#64748b] mt-1 mb-6">
              Generate AI-powered lesson plans and resources
            </p>

            {/* Generate form card */}
            <div className="bg-white border border-[#e2e8f0] rounded-[16px] p-6">
              <h2 className="text-[18px] font-semibold text-[#0f172a] mb-4">✨ New Lesson Plan</h2>

              <div className="flex flex-col gap-3">
                {/* Topic */}
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Water Scarcity in Australia"
                  className={inputClass}
                />

                {/* Year Level */}
                <div className="relative">
                  <select
                    value={yearLevel}
                    onChange={(e) => setYearLevel(e.target.value)}
                    className={`${inputClass} appearance-none pr-10 cursor-pointer`}
                  >
                    <option value="" disabled>Year Level ∨</option>
                    {yearLevels.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                </div>

                {/* Curriculum Outcome */}
                <input
                  type="text"
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  placeholder="e.g. ACHGK051"
                  className={inputClass}
                />

                {/* Generate button */}
                <button
                  onClick={handleGenerate}
                  className="w-full h-[52px] bg-[#f97316] text-white rounded-[12px] font-medium text-[15px] mt-2 hover:bg-[#ea6c0a] transition-colors"
                >
                  Generate Lesson Plan
                </button>
              </div>
            </div>

            {/* Recent Plans */}
            <div className="mt-6">
              <h2 className="text-[18px] font-bold text-[#0f172a] mb-3">Recent Plans</h2>
              <div className="flex flex-col gap-3">
                {recentPlans.map((plan) => (
                  <div
                    key={plan.title}
                    className="flex items-center gap-4 bg-white border border-[#e2e8f0] rounded-[12px] px-5 py-4"
                  >
                    <FileText className="w-5 h-5 text-[#94a3b8] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-semibold text-[#0f172a] leading-tight">
                        {plan.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        {[plan.subject, plan.year].map((tag) => (
                          <span
                            key={tag}
                            className="border border-[#e2e8f0] rounded-full text-[11px] px-2 py-0.5 text-[#64748b]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-[12px] text-[#94a3b8] shrink-0 mr-2">{plan.age}</span>
                    <button className="w-9 h-9 border border-[#e2e8f0] rounded-full flex items-center justify-center hover:bg-[#f8fafc] transition-colors shrink-0">
                      <ArrowRight className="w-4 h-4 text-[#64748b]" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ================================================================
              RIGHT COLUMN — 35%
          ================================================================ */}
          <div className="flex-[7] min-w-0 lg:sticky lg:top-6 lg:h-fit flex flex-col gap-4">

            {/* Quick Tools card */}
            <div className="bg-white border border-[#e2e8f0] rounded-[16px] p-5">
              <h3 className="text-[18px] font-bold text-[#0f172a] mb-4">Quick Tools</h3>
              <div className="flex flex-col gap-2">
                {quickTools.map((tool) => (
                  <button
                    key={tool.name}
                    className="w-full flex items-center gap-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[12px] px-4 py-[14px] text-left hover:border-[#cbd5e1] transition-colors"
                  >
                    <span className="text-[20px] leading-none shrink-0">{tool.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-[#0f172a] leading-tight">
                        {tool.name}
                      </p>
                      <p className="text-[12px] text-[#94a3b8] mt-0.5">{tool.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#94a3b8] shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Pro Tips card */}
            <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-[16px] p-5">
              <h3 className="text-[16px] font-semibold text-[#15803d] mb-3">💡 Pro Tips</h3>
              <div className="flex flex-col gap-2">
                {proTips.map((tip) => (
                  <div key={tip} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#16a34a] shrink-0 mt-0.5" />
                    <p className="text-[13px] text-[#374151] leading-snug">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-white border border-[#e2e8f0] rounded-[12px] px-4 py-3 shadow-md">
          <div className="w-2 h-2 rounded-full bg-[#f97316] animate-pulse" />
          <p className="text-[14px] text-[#0f172a] font-medium">Generating your lesson plan...</p>
        </div>
      )}
    </AppShell>
  );
}
