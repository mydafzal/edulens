'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Search,
  Plus,
  Wand2,
  ChevronRight,
  X,
  FileText,
  ClipboardList,
  ListChecks,
  PenLine,
  BarChart3,
  Table,
  MessageSquare,
  Award,
  Presentation,
  AlignLeft,
  Map,
  ShieldCheck,
  Users,
  Languages,
  Layers,
  Scale,
  GraduationCap,
  PlayCircle,
  Target,
  BookOpen,
  Sparkles,
  ArrowRight,
  Cpu,
  Workflow,
  Puzzle,
  Save,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { allTools, getToolsForRole } from '@/data/mockData';
import type { UserRole, ToolCard } from '@/types/edulens';

const toolIconMap: Record<string, typeof FileText> = {
  FileText, ClipboardList, ListChecks, PenLine, BarChart3,
  Table, MessageSquare, Award, Presentation, AlignLeft,
  Map, ShieldCheck, Users, Languages, Layers, Scale,
  GraduationCap, PlayCircle, Target, BookOpen,
};

const roleLabels: Record<UserRole, string> = {
  teacher: 'Classroom Teacher',
  publisher: 'Education Publisher',
  specialist: 'Subject Specialist',
  'curriculum-designer': 'Curriculum Designer',
  'instructional-coach': 'Instructional Coach',
};

export default function ToolsPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'my-tools' | 'all' | 'custom'>('my-tools');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreator, setShowCreator] = useState(false);

  const userRole = user?.role || 'teacher';
  const myTools = getToolsForRole(userRole);

  const filteredTools = (() => {
    let tools: ToolCard[] = [];
    if (filter === 'my-tools') tools = myTools;
    else if (filter === 'all') tools = allTools;
    else tools = []; // custom tools would come from localStorage

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      tools = tools.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    }
    return tools;
  })();

  // Load custom tools from localStorage
  const [customTools, setCustomTools] = useState<CustomTool[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('edulens-custom-tools') || '[]');
    } catch { return []; }
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-50 h-14 bg-card border-b border-border flex items-center gap-4 px-4 sm:px-6">
        <a href="/" className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </a>
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold">All Tools</h1>
        </div>
        <div className="flex-1" />
        <Button
          onClick={() => setShowCreator(true)}
          className="gap-2 rounded-full"
          size="sm"
        >
          <Wand2 className="w-4 h-4" /> Create Custom Tool
        </Button>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Filters + Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            {[
              { id: 'my-tools' as const, label: `My Tools (${myTools.length})` },
              { id: 'all' as const, label: `All Tools (${allTools.length})` },
              { id: 'custom' as const, label: `Custom (${customTools.length})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                  filter === tab.id
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex-1 sm:max-w-xs relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tools..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 rounded-full"
            />
          </div>
        </div>

        {/* Tools Grid */}
        {filter !== 'custom' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTools.map((tool, i) => {
              const Icon = toolIconMap[tool.icon] || FileText;
              const isMyTool = myTools.some(t => t.id === tool.id);
              return (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className={cn(
                    'flex flex-col gap-3 p-5 rounded-2xl border bg-card hover:shadow-lg transition-all duration-200 group cursor-pointer',
                    isMyTool && filter === 'all' ? 'border-primary/30 bg-emerald-50/30' : 'border-border'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    {filter === 'all' && (
                      <div className="flex flex-wrap gap-1">
                        {tool.roles.slice(0, 2).map(r => (
                          <span key={r} className="text-[9px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            {r === 'curriculum-designer' ? 'designer' : r === 'instructional-coach' ? 'coach' : r}
                          </span>
                        ))}
                        {tool.roles.length > 2 && (
                          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            +{tool.roles.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold leading-tight">{tool.title}</h3>
                    <p className="text-[13px] text-muted-foreground mt-1 leading-relaxed">{tool.description}</p>
                  </div>
                  <div className="mt-auto pt-2">
                    <Button variant="outline" size="sm" className="w-full gap-2 rounded-lg">
                      Use Tool <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Custom Tools */}
        {filter === 'custom' && (
          <div className="space-y-6">
            {customTools.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
                  <Puzzle className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold">No custom tools yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Create a custom workflow tool to process your data exactly the way you want.
                  Define input, steps, and output format.
                </p>
                <Button onClick={() => setShowCreator(true)} className="gap-2 rounded-full">
                  <Wand2 className="w-4 h-4" /> Create Your First Tool
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {customTools.map((tool, i) => (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex flex-col gap-3 p-5 rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/30 group cursor-pointer hover:border-violet-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
                        <Workflow className="w-6 h-6" />
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-100 text-violet-600">
                        Custom
                      </span>
                    </div>
                    <div>
                      <h3 className="text-[15px] font-semibold">{tool.name}</h3>
                      <p className="text-[13px] text-muted-foreground mt-1">{tool.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tool.steps.map((step, si) => (
                        <span key={si} className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-medium">
                          {step}
                        </span>
                      ))}
                    </div>
                    <div className="mt-auto pt-2">
                      <Button variant="outline" size="sm" className="w-full gap-2 rounded-lg">
                        Run Tool <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </motion.div>
                ))}

                {/* Add new card */}
                <button
                  onClick={() => setShowCreator(true)}
                  className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:border-primary hover:bg-emerald-50/30 transition-all min-h-[200px]"
                >
                  <Plus className="w-8 h-8 text-slate-300" />
                  <span className="text-sm font-medium text-slate-400">Create New Tool</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Empty search state */}
        {filter !== 'custom' && filteredTools.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No tools matching &ldquo;{searchQuery}&rdquo;</p>
          </div>
        )}
      </div>

      {/* Custom Tool Creator Modal */}
      <AnimatePresence>
        {showCreator && (
          <CustomToolCreator
            onClose={() => setShowCreator(false)}
            onSave={(tool) => {
              const updated = [...customTools, tool];
              setCustomTools(updated);
              localStorage.setItem('edulens-custom-tools', JSON.stringify(updated));
              setShowCreator(false);
              setFilter('custom');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ---- Custom Tool Type ----
interface CustomTool {
  id: string;
  name: string;
  description: string;
  inputType: string;
  steps: string[];
  outputFormat: string;
  createdAt: string;
}

// ---- Custom Tool Creator ----
function CustomToolCreator({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (tool: CustomTool) => void;
}) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [inputType, setInputType] = useState('');
  const [steps, setSteps] = useState<string[]>(['']);
  const [outputFormat, setOutputFormat] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleAddStep = () => setSteps([...steps, '']);
  const handleUpdateStep = (i: number, val: string) => {
    const updated = [...steps];
    updated[i] = val;
    setSteps(updated);
  };
  const handleRemoveStep = (i: number) => {
    if (steps.length > 1) setSteps(steps.filter((_, idx) => idx !== i));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 800));
    onSave({
      id: `custom-${Date.now()}`,
      name,
      description,
      inputType,
      steps: steps.filter(s => s.trim()),
      outputFormat,
      createdAt: new Date().toISOString(),
    });
  };

  const canProceed = () => {
    if (step === 0) return name.trim() && description.trim();
    if (step === 1) return inputType.trim() && steps.some(s => s.trim());
    if (step === 2) return outputFormat.trim();
    return false;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-0 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold">Create Custom Tool</span>
              <p className="text-xs text-muted-foreground">Step {step + 1} of 3</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 pt-4">
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <div key={i} className={cn('h-1 flex-1 rounded-full transition-colors', i <= step ? 'bg-violet-500' : 'bg-slate-100')} />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Tool Name</label>
                  <Input
                    placeholder="e.g., Weekly Resource Digest Generator"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Description</label>
                  <textarea
                    placeholder="What does this tool do? e.g., Takes my saved resources from the week and generates a formatted digest email for my department..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={3}
                    className="w-full p-3 rounded-xl border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Input Type</label>
                  <p className="text-xs text-muted-foreground mb-2">What data does this tool take in?</p>
                  <div className="flex flex-wrap gap-2">
                    {['Search Results', 'Saved Library', 'Pasted Text', 'URL', 'Uploaded File', 'Google Drive Doc', 'Canva Design'].map(t => (
                      <button
                        key={t}
                        onClick={() => setInputType(t)}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors border',
                          inputType === t ? 'bg-violet-100 border-violet-300 text-violet-700' : 'bg-muted border-transparent text-muted-foreground hover:bg-muted/80'
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Workflow Steps</label>
                  <p className="text-xs text-muted-foreground mb-2">What should the AI do with the input? Add steps in order.</p>
                  <div className="space-y-2">
                    {steps.map((s, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-xs font-bold text-violet-400 w-5 flex-shrink-0">{i + 1}.</span>
                        <Input
                          placeholder={i === 0 ? 'e.g., Summarize key findings' : 'e.g., Format as lesson plan'}
                          value={s}
                          onChange={e => handleUpdateStep(i, e.target.value)}
                          className="rounded-lg flex-1"
                        />
                        {steps.length > 1 && (
                          <button onClick={() => handleRemoveStep(i)} className="p-1.5 rounded hover:bg-muted">
                            <X className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={handleAddStep}
                      className="text-[13px] text-violet-600 font-medium flex items-center gap-1 hover:text-violet-700"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Step
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Output Format</label>
                  <p className="text-xs text-muted-foreground mb-2">How should the result be formatted?</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {['Lesson Plan', 'Email Digest', 'Worksheet', 'Report', 'Slide Deck Outline', 'Markdown', 'Custom Format'].map(t => (
                      <button
                        key={t}
                        onClick={() => setOutputFormat(t)}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors border',
                          outputFormat === t ? 'bg-violet-100 border-violet-300 text-violet-700' : 'bg-muted border-transparent text-muted-foreground hover:bg-muted/80'
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div className="p-4 rounded-xl bg-violet-50 border border-violet-100 space-y-2">
                  <h4 className="text-sm font-semibold text-violet-800">Tool Preview</h4>
                  <div className="text-[13px] text-violet-700 space-y-1">
                    <p><span className="font-medium">Name:</span> {name}</p>
                    <p><span className="font-medium">Input:</span> {inputType}</p>
                    <p><span className="font-medium">Steps:</span> {steps.filter(s => s.trim()).join(' → ')}</p>
                    <p><span className="font-medium">Output:</span> {outputFormat}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 flex items-center justify-between">
          {step > 0 ? (
            <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          ) : (
            <div />
          )}
          {step < 2 ? (
            <Button
              size="sm"
              className="gap-2 rounded-full bg-violet-600 hover:bg-violet-700"
              disabled={!canProceed()}
              onClick={() => setStep(step + 1)}
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              size="sm"
              className="gap-2 rounded-full bg-violet-600 hover:bg-violet-700"
              disabled={!canProceed() || isSaving}
              onClick={handleSave}
            >
              {isSaving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
              ) : (
                <><Save className="w-4 h-4" /> Create Tool</>
              )}
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
