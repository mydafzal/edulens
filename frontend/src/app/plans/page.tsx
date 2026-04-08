'use client';

import { useState } from 'react';
import { FileText, ArrowRight, ChevronDown, Check, Download, Share2, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '@/components/edulens';
import { demoPlanSections } from '@/lib/demoData';
import { showToast } from '@/lib/toast';
import { useRouter } from 'next/navigation';

// ---------------------------------------------------------------------------
// Static demo data
// ---------------------------------------------------------------------------
const recentPlans = [
  { title: 'Water Scarcity', subject: 'Geography', year: 'Year 9', age: '2 days ago' },
  { title: 'Poetry Analysis', subject: 'English',   year: 'Year 8', age: '1 week ago' },
  { title: 'Climate Change',  subject: 'Science',   year: 'Year 10', age: '2 weeks ago' },
];

const quickTools = [
  { emoji: '📝', name: 'Worksheet Generator', description: 'Create printable worksheets', action: 'worksheet' },
  { emoji: '🎯', name: 'Quiz Builder',         description: 'Generate assessment questions', action: 'quiz' },
  { emoji: '📊', name: 'Rubric Creator',       description: 'Build assessment rubrics', action: 'rubric' },
  { emoji: '🔍', name: 'Resource Finder',      description: 'Search curated resources', action: 'search' },
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
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [outcome, setOutcome] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<{ topic: string; yearLevel: string; outcome: string } | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>('Learning Objectives');

  const handleGenerate = async () => {
    if (!topic.trim()) {
      showToast('Please enter a topic first.');
      return;
    }
    setIsGenerating(true);
    setGeneratedPlan(null);
    await new Promise((r) => setTimeout(r, 2000));
    setIsGenerating(false);
    setGeneratedPlan({ topic, yearLevel: yearLevel || 'Year 9', outcome });
    showToast('Lesson plan generated!');
  };

  const handleQuickTool = (action: string) => {
    if (action === 'search') { router.push('/'); return; }
    showToast(`${quickTools.find((t) => t.action === action)?.name} coming soon!`);
  };

  const inputClass =
    'w-full h-[52px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[12px] px-4 text-[14px] text-[#0f172a] placeholder:text-[#94a3b8] outline-none focus:border-[#cbd5e1] transition-colors';

  return (
    <AppShell>
      <div className="px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ================================================================
              LEFT COLUMN
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
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Water Scarcity in Australia"
                  className={inputClass}
                />
                <div className="relative">
                  <select
                    value={yearLevel}
                    onChange={(e) => setYearLevel(e.target.value)}
                    className={`${inputClass} appearance-none pr-10 cursor-pointer`}
                  >
                    <option value="" disabled>Year Level</option>
                    {yearLevels.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                </div>
                <input
                  type="text"
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  placeholder="e.g. ACHGK051 (optional)"
                  className={inputClass}
                />
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full h-[52px] bg-[#f97316] text-white rounded-[12px] font-medium text-[15px] mt-2 hover:bg-[#ea6c0a] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Lesson Plan'
                  )}
                </button>
              </div>
            </div>

            {/* Generated Plan */}
            <AnimatePresence>
              {generatedPlan && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  className="mt-6"
                >
                  {/* Plan header */}
                  <div className="bg-white border border-[#e2e8f0] rounded-t-[16px] px-6 py-5 border-b-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-[20px] font-bold text-[#0f172a]">{generatedPlan.topic}</h2>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="bg-[#f0f0f0] text-[#64748b] rounded-full text-[12px] px-3 py-1">
                            {generatedPlan.yearLevel}
                          </span>
                          {generatedPlan.outcome && (
                            <span className="bg-[#f0f0f0] text-[#64748b] rounded-full text-[12px] px-3 py-1">
                              {generatedPlan.outcome}
                            </span>
                          )}
                          <span className="bg-[#dcfce7] text-[#16a34a] rounded-full text-[12px] px-3 py-1 font-medium">
                            AI Generated
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sections */}
                  <div className="bg-white border border-[#e2e8f0] rounded-b-[16px] overflow-hidden divide-y divide-[#f0f0f0]">
                    {demoPlanSections.map((section) => (
                      <div key={section.title}>
                        <button
                          onClick={() => setExpandedSection(expandedSection === section.title ? null : section.title)}
                          className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-[#f8fafc] transition-colors"
                        >
                          <p className="text-[15px] font-semibold text-[#0f172a]">{section.title}</p>
                          {expandedSection === section.title ? (
                            <ChevronUp className="w-4 h-4 text-[#94a3b8]" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-[#94a3b8]" />
                          )}
                        </button>
                        <AnimatePresence>
                          {expandedSection === section.title && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: 'auto' }}
                              exit={{ height: 0 }}
                              className="overflow-hidden"
                            >
                              <ul className="px-6 pb-5 space-y-2">
                                {section.content.map((line, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#f97316] shrink-0 mt-2" />
                                    <p className="text-[14px] text-[#64748b] leading-relaxed">{line}</p>
                                  </li>
                                ))}
                              </ul>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>

                  {/* Export bar */}
                  <div className="flex items-center gap-3 mt-4 flex-wrap">
                    <button
                      onClick={() => showToast('Plan exported as PDF!')}
                      className="flex items-center gap-2 bg-[#0f172a] text-white rounded-full px-5 py-2.5 text-[13px] font-medium hover:bg-[#1e293b] transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Export PDF
                    </button>
                    <button
                      onClick={() => showToast('Link copied to clipboard!')}
                      className="flex items-center gap-2 border border-[#e2e8f0] rounded-full px-5 py-2.5 text-[13px] text-[#64748b] hover:border-[#cbd5e1] transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                    <button
                      onClick={() => { showToast('Plan saved to library!'); }}
                      className="flex items-center gap-2 border border-[#e2e8f0] rounded-full px-5 py-2.5 text-[13px] text-[#64748b] hover:border-[#cbd5e1] transition-colors"
                    >
                      Save to Library
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Recent Plans */}
            <div className="mt-6">
              <h2 className="text-[18px] font-bold text-[#0f172a] mb-3">Recent Plans</h2>
              <div className="flex flex-col gap-3">
                {recentPlans.map((plan) => (
                  <button
                    key={plan.title}
                    onClick={() => {
                      setTopic(plan.title);
                      setYearLevel(plan.year);
                    }}
                    className="flex items-center gap-4 bg-white border border-[#e2e8f0] rounded-[12px] px-5 py-4 hover:border-[#cbd5e1] transition-colors text-left"
                  >
                    <FileText className="w-5 h-5 text-[#94a3b8] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-semibold text-[#0f172a] leading-tight">{plan.title}</p>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        {[plan.subject, plan.year].map((tag) => (
                          <span key={tag} className="border border-[#e2e8f0] rounded-full text-[11px] px-2 py-0.5 text-[#64748b]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-[12px] text-[#94a3b8] shrink-0 mr-2">{plan.age}</span>
                    <div className="w-9 h-9 border border-[#e2e8f0] rounded-full flex items-center justify-center hover:bg-[#f8fafc] transition-colors shrink-0">
                      <ArrowRight className="w-4 h-4 text-[#64748b]" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ================================================================
              RIGHT COLUMN
          ================================================================ */}
          <div className="flex-[7] min-w-0 lg:sticky lg:top-6 lg:h-fit flex flex-col gap-4">

            {/* Quick Tools */}
            <div className="bg-white border border-[#e2e8f0] rounded-[16px] p-5">
              <h3 className="text-[18px] font-bold text-[#0f172a] mb-4">Quick Tools</h3>
              <div className="flex flex-col gap-2">
                {quickTools.map((tool) => (
                  <button
                    key={tool.name}
                    onClick={() => handleQuickTool(tool.action)}
                    className="w-full flex items-center gap-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[12px] px-4 py-[14px] text-left hover:border-[#cbd5e1] transition-colors"
                  >
                    <span className="text-[20px] leading-none shrink-0">{tool.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-[#0f172a] leading-tight">{tool.name}</p>
                      <p className="text-[12px] text-[#94a3b8] mt-0.5">{tool.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#94a3b8] shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Pro Tips */}
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
    </AppShell>
  );
}
