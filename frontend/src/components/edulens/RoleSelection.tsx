'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  BookOpen,
  Languages,
  Map,
  Target,
  ArrowRight,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { roles } from '@/data/mockData';
import type { UserRole } from '@/types/edulens';

const iconMap: Record<string, typeof GraduationCap> = {
  GraduationCap,
  BookOpen,
  Languages,
  Map,
  Target,
};

export function RoleSelection() {
  const { user, setRole } = useAuth();
  const [selected, setSelected] = useState<UserRole | null>(null);

  const handleContinue = () => {
    if (selected) {
      setRole(selected);
      localStorage.setItem('edulens-role-selected', 'true');
      // Trigger re-render by dispatching storage event
      window.dispatchEvent(new Event('storage'));
      // Force page re-evaluation
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center mx-auto">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome, {user?.name || 'Educator'}
          </h1>
          <p className="text-slate-500 text-base max-w-md mx-auto">
            Which role best describes you? This personalizes your tools and search experience.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid gap-3">
          {roles.map((role, i) => {
            const Icon = iconMap[role.icon] || GraduationCap;
            const isSelected = selected === role.id;

            return (
              <motion.button
                key={role.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => setSelected(role.id)}
                className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-200 text-left group ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                    : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                  isSelected ? 'bg-emerald-500 text-white' : `${role.color} text-white`
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold">{role.title}</h3>
                  <p className="text-sm text-slate-500 mt-0.5">{role.description}</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500'
                    : 'border-slate-200'
                }`}>
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Continue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: selected ? 1 : 0.5 }}
          className="flex justify-center"
        >
          <Button
            size="lg"
            className="gap-2 rounded-full h-12 px-10 text-base"
            disabled={!selected}
            onClick={handleContinue}
          >
            Continue <ArrowRight className="w-5 h-5" />
          </Button>
        </motion.div>

        <p className="text-xs text-center text-slate-400">
          You can change your role anytime in Settings
        </p>
      </motion.div>
    </div>
  );
}
