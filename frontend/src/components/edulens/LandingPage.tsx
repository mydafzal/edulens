'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Search,
  Shield,
  MapPin,
  Sparkles,
  Eye,
  Scale,
  ArrowRight,
  ChevronRight,
  X,
  Loader2,
  Lock,
  Mail,
  Zap,
  Bot,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';

export function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/30 overflow-hidden">
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">EduLens</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="hidden sm:inline-flex" onClick={() => setShowLogin(true)}>
              Sign In
            </Button>
            <Button onClick={() => setShowLogin(true)} className="gap-2 rounded-full px-5">
              Get Started <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-16 sm:pt-24 pb-20 px-4 sm:px-6">
        {/* Decorative blobs */}
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl -z-10" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Cambridge University Press & Assessment Hackathon 2025
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
              AI-Powered Resource
              <br />
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Discovery for Educators
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Search across trusted sources. Every result verified by dual AI agents.
              Adapted to your classroom in one click.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex items-center justify-center gap-3 flex-wrap"
          >
            <Button size="lg" onClick={() => setShowLogin(true)} className="gap-2 rounded-full h-12 px-8 text-base">
              Start Searching <Search className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg" className="gap-2 rounded-full h-12 px-8 text-base">
              Watch Demo <ChevronRight className="w-5 h-5" />
            </Button>
          </motion.div>

          {/* Trusted by */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="pt-8"
          >
            <p className="text-xs text-slate-400 uppercase tracking-widest font-medium mb-4">
              Powered by trusted educational sources
            </p>
            <div className="flex items-center justify-center gap-8 text-sm text-slate-400 font-medium flex-wrap">
              {['ERIC (1.5M+ records)', 'OER Commons', 'AIATSIS', 'CSIRO', 'ABC Education', 'Bureau of Meteorology'].map(s => (
                <span key={s}>{s}</span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search Pipeline Visual */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-white border-y border-slate-100">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              How EduLens Search Works
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              A 3-phase AI pipeline — search, evaluate, synthesize — delivers verified results in under 4 seconds.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Search,
                step: '01',
                title: 'Search',
                description: 'Query expansion via HyDE, hybrid BM25 + vector retrieval across 1.5M+ resources, ColBERT reranking, and rule-based trust-tier tagging — all in a single server round-trip.',
                color: 'bg-blue-50 text-blue-600',
                sub: ['HyDE Expansion', 'Hybrid RAG', 'ColBERT Rerank', 'Trust Tiers'],
              },
              {
                icon: Shield,
                step: '02',
                title: 'Evaluate',
                description: 'Dual-agent authenticity filter: Bad Cop removes weak or unreliable sources, Good Cop validates curriculum alignment. If consensus falls below threshold, the search automatically retries.',
                color: 'bg-amber-50 text-amber-600',
                sub: ['Bad Cop Filter', 'Good Cop Validate', 'Consensus Score', 'Auto-Retry'],
              },
              {
                icon: Sparkles,
                step: '03',
                title: 'Synthesize',
                description: 'Citation-grounded summary generated only from sources that survived dual-agent review. Every claim is traceable to a verified source with APA citations.',
                color: 'bg-emerald-50 text-emerald-600',
                sub: ['Filtered Sources Only', 'APA Citations', 'Streaming Output'],
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl border border-slate-100 bg-white hover:shadow-lg hover:border-slate-200 transition-all duration-300 group"
              >
                <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-slate-300 mb-2">PHASE {item.step}</div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-3">{item.description}</p>
                {'sub' in item && (item as { sub: string[] }).sub && (
                  <div className="flex flex-wrap gap-1.5">
                    {(item as { sub: string[] }).sub.map(s => (
                      <span key={s} className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-500">{s}</span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Built for Every Education Role
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Personalized tools appear based on your role — teacher, publisher, specialist, designer, or coach.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                icon: Search,
                title: 'Resource Discovery & Smart Search',
                description: 'Natural language search across trusted source pools. Results ranked by curriculum relevance, not just keywords.',
                tag: 'Core',
              },
              {
                icon: Shield,
                title: 'Quality & Safety Evaluation',
                description: 'Every resource scored on accuracy, bias, age appropriateness, cultural sensitivity, and safety.',
                tag: 'Core',
              },
              {
                icon: MapPin,
                title: 'Localisation & Adaptation',
                description: 'One-click adaptation to your classroom context. Generic examples replaced with local references.',
                tag: 'Core',
              },
              {
                icon: Scale,
                title: 'Trust, Transparency & IP',
                description: 'Full source attribution, license checking, and citation generation. Nothing is a black box.',
                tag: 'Core',
              },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl border border-slate-100 bg-white"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <f.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    {f.tag}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to transform resource discovery?</h2>
            <p className="text-emerald-100 text-lg mb-8 max-w-lg mx-auto">
              Join educators using AI-verified, curriculum-aligned resources. Zero training required.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="gap-2 rounded-full h-12 px-8 text-base text-emerald-700 hover:text-emerald-800"
              onClick={() => setShowLogin(true)}
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            <span>EduLens 2025</span>
          </div>
          <span>Cambridge Hackathon 2025</span>
        </div>
      </footer>

      {/* Login Modal */}
      <AnimatePresence>
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      </AnimatePresence>
    </div>
  );
}

function LoginModal({ onClose }: { onClose: () => void }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await login(email, password);
      onClose();
    } catch {
      setError('Login failed');
    }
    setIsLoading(false);
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
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-0 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold">Sign in to EduLens</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-slate-500">
            Enter any email and password to continue.
          </p>

          <div className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="email"
                placeholder="you@school.edu.au"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="pl-10 h-11 rounded-xl"
                autoFocus
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="pl-10 h-11 rounded-xl"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <Button type="submit" className="w-full h-11 rounded-xl gap-2" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>

          <p className="text-xs text-center text-slate-400">
            Demo mode — any credentials will work
          </p>
        </form>
      </motion.div>
    </motion.div>
  );
}
