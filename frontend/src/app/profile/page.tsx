'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  MapPin,
  BookOpen,
  Users,
  ChevronRight,
  ChevronLeft,
  Check,
  School,
  Search,
  ArrowUpRight,
} from 'lucide-react';
import { AppShell } from '@/components/edulens';
import Link from 'next/link';

// ---------------------------------------------------------------------------
// Data (unchanged)
// ---------------------------------------------------------------------------
const australianStates = [
  { code: 'QLD', name: 'Queensland' },
  { code: 'NSW', name: 'New South Wales' },
  { code: 'VIC', name: 'Victoria' },
  { code: 'SA',  name: 'South Australia' },
  { code: 'WA',  name: 'Western Australia' },
  { code: 'TAS', name: 'Tasmania' },
  { code: 'NT',  name: 'Northern Territory' },
  { code: 'ACT', name: 'Australian Capital Territory' },
];

const yearLevels = [
  { value: '7',  label: 'Year 7' },
  { value: '8',  label: 'Year 8' },
  { value: '9',  label: 'Year 9' },
  { value: '10', label: 'Year 10' },
  { value: '11', label: 'Year 11' },
  { value: '12', label: 'Year 12' },
];

const subjects = [
  'English', 'Mathematics', 'Science', 'Geography', 'History',
  'Art', 'Music', 'Physical Education', 'Technology', 'Languages',
];

const STEP_META = [
  { label: 'School Info',  title: 'School Information',       subtitle: 'Tell us about your school for localised resources.' },
  { label: 'Year Levels',  title: 'Year Levels',              subtitle: 'Select the year levels you teach.' },
  { label: 'Subjects',     title: 'Subjects',                 subtitle: 'Select the subjects you teach.' },
];

// ---------------------------------------------------------------------------
// Shared input style
// ---------------------------------------------------------------------------
const inputCls =
  'w-full h-[52px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[12px] px-4 text-[14px] text-[#0f172a] placeholder:text-[#94a3b8] outline-none focus:border-[#cbd5e1] transition-colors';

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------
function Stepper({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center mb-8">
      {STEP_META.map((s, i) => {
        const num       = i + 1;
        const isActive  = num === step;
        const isDone    = num < step;
        const isLast    = i === STEP_META.length - 1;

        return (
          <div key={s.label} className="flex items-center">
            {/* Circle + label */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                style={{
                  background:  isDone ? '#dcfce7' : isActive ? '#0f172a' : '#fff',
                  border:      isDone ? '2px solid #16a34a' : isActive ? 'none' : '2px solid #e2e8f0',
                }}
              >
                {isDone ? (
                  <Check className="w-4 h-4 text-[#16a34a]" />
                ) : (
                  <span
                    className="text-[14px] font-bold"
                    style={{ color: isActive ? '#fff' : '#94a3b8' }}
                  >
                    {num}
                  </span>
                )}
              </div>
              <span
                className="text-[12px] font-semibold whitespace-nowrap"
                style={{ color: isDone ? '#16a34a' : isActive ? '#0f172a' : '#94a3b8' }}
              >
                {s.label}
              </span>
            </div>

            {/* Connector */}
            {!isLast && (
              <div
                className="flex-1 h-[2px] mx-3 rounded-full transition-colors"
                style={{
                  width: 56,
                  background: isDone ? '#16a34a' : '#e2e8f0',
                  marginBottom: 22, // align with circle centres, offset for label below
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function ProfileSetup() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    schoolName: '',
    state: '',
    suburb: '',
    yearLevels: [] as string[],
    subjects:   [] as string[],
  });

  // Pre-fill from saved profile
  useEffect(() => {
    const saved = localStorage.getItem('edulens-profile');
    const completed = localStorage.getItem('edulens-profile-completed') === 'true';
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProfile(parsed);
        if (completed) setStep(4);
      } catch { /* ignore */ }
    }
  }, []);

  // --- unchanged logic ---
  const toggleYearLevel = (year: string) =>
    setProfile(prev => ({
      ...prev,
      yearLevels: prev.yearLevels.includes(year)
        ? prev.yearLevels.filter(y => y !== year)
        : [...prev.yearLevels, year],
    }));

  const toggleSubject = (subject: string) =>
    setProfile(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject],
    }));

  const handleComplete = () => {
    localStorage.setItem('edulens-profile', JSON.stringify(profile));
    localStorage.setItem('edulens-profile-completed', 'true');
    setStep(4);
    // Auto-redirect after 2 seconds if this is first-time setup
    setTimeout(() => router.push('/'), 2000);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return Boolean(profile.schoolName && profile.state);
      case 2: return profile.yearLevels.length > 0;
      case 3: return profile.subjects.length > 0;
      default: return false;
    }
  };

  const getPersonalizedSuggestions = () => {
    const s: string[] = [];
    const yr = profile.yearLevels[0] ? `Year ${profile.yearLevels[0]}` : '';
    if (profile.subjects.includes('Geography'))  s.push(`Water scarcity ${yr} Geography`);
    if (profile.subjects.includes('History'))    s.push(`First Nations perspectives ${yr} History`);
    if (profile.subjects.includes('Science'))    s.push('Climate change data analysis Science');
    if (profile.subjects.includes('English'))    s.push('Australian poetry analysis English');
    if (s.length === 0)                          s.push(`Educational resources for ${profile.subjects[0]}`);
    return s.slice(0, 3);
  };
  // --- end unchanged logic ---

  const meta = STEP_META[step - 1];

  return (
    <AppShell>
      <div className="px-4 sm:px-8 py-8 max-w-[720px] mx-auto">

        {/* Page header */}
        <h1 className="text-[32px] font-bold text-[#0f172a] leading-tight">Curriculum</h1>
        <p className="text-[14px] text-[#64748b] mt-1 mb-6">
          Manage your classroom profile and curriculum settings
        </p>

        {/* Stepper — only on steps 1-3 */}
        {step < 4 && <Stepper step={step} />}

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          {/* ----------------------------------------------------------------
              Step 4: Success
          ---------------------------------------------------------------- */}
          {step === 4 ? (
            <div className="bg-white border border-[#e2e8f0] rounded-[20px] p-10 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-16 h-16 mx-auto rounded-full bg-[#dcfce7] flex items-center justify-center mb-5"
              >
                <Check className="w-8 h-8 text-[#16a34a]" />
              </motion.div>

              <h2 className="text-[24px] font-bold text-[#0f172a]">Profile Complete!</h2>
              <p className="text-[14px] text-[#64748b] mt-2 mb-6">
                Scora will personalise resources for{' '}
                <span className="font-semibold text-[#0f172a]">{profile.schoolName}</span> in{' '}
                <span className="font-semibold text-[#0f172a]">{profile.state}</span>.
              </p>

              {/* Suggestion pills */}
              <div className="bg-[#f8fafc] rounded-[12px] p-4 mb-6">
                <p className="text-[12px] font-medium text-[#94a3b8] mb-3">Try searching for:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {getPersonalizedSuggestions().map((suggestion) => (
                    <Link
                      key={suggestion}
                      href={`/?q=${encodeURIComponent(suggestion)}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#e2e8f0] hover:border-[#0f172a] transition-colors text-[13px] text-[#0f172a]"
                    >
                      <Search className="w-3.5 h-3.5 text-[#94a3b8]" />
                      {suggestion}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Link
                  href="/"
                  className="flex items-center justify-between h-11 bg-[#0f172a] text-white rounded-full pl-5 pr-2 gap-3 hover:bg-[#1e293b] transition-colors"
                >
                  <span className="text-[14px] font-medium">Start Searching</span>
                  <span className="w-7 h-7 bg-white rounded-full flex items-center justify-center shrink-0">
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#0f172a]" />
                  </span>
                </Link>
                <button
                  onClick={() => setStep(1)}
                  className="h-11 px-5 rounded-full border border-[#e2e8f0] text-[14px] text-[#64748b] hover:border-[#cbd5e1] transition-colors"
                >
                  Edit Profile
                </button>
              </div>
            </div>

          ) : (
            /* ----------------------------------------------------------------
                Steps 1–3
            ---------------------------------------------------------------- */
            <div className="bg-white border border-[#e2e8f0] rounded-[20px] overflow-hidden">

              {/* Card header */}
              <div className="px-6 py-5 border-b border-[#f0f0f0]">
                <h2 className="text-[20px] font-semibold text-[#0f172a]">{meta.title}</h2>
                <p className="text-[13px] text-[#64748b] mt-1">{meta.subtitle}</p>
              </div>

              {/* Card content */}
              <div className="p-6 space-y-5">

                {/* ---- Step 1 ---- */}
                {step === 1 && (
                  <>
                    {/* School Name */}
                    <div>
                      <label className="text-[13px] font-medium text-[#0f172a] block mb-2">
                        School Name
                      </label>
                      <div className="relative">
                        <School className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                        <input
                          type="text"
                          placeholder="e.g. Toowoomba Grammar School"
                          value={profile.schoolName}
                          onChange={(e) => setProfile(prev => ({ ...prev, schoolName: e.target.value }))}
                          className={`${inputCls} pl-11`}
                        />
                      </div>
                    </div>

                    {/* State */}
                    <div>
                      <label className="text-[13px] font-medium text-[#0f172a] block mb-2">
                        State / Territory
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {australianStates.map((state) => {
                          const selected = profile.state === state.code;
                          return (
                            <button
                              key={state.code}
                              onClick={() => setProfile(prev => ({ ...prev, state: state.code }))}
                              className="h-11 rounded-full border text-[14px] font-medium transition-colors"
                              style={{
                                background:   selected ? '#0f172a' : '#fff',
                                borderColor:  selected ? '#0f172a' : '#e2e8f0',
                                color:        selected ? '#fff'    : '#0f172a',
                              }}
                            >
                              {state.code}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Suburb */}
                    <div>
                      <label className="text-[13px] font-medium text-[#0f172a] block mb-2">
                        Suburb <span className="text-[#94a3b8] font-normal">(Optional)</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                        <input
                          type="text"
                          placeholder="e.g. Toowoomba"
                          value={profile.suburb}
                          onChange={(e) => setProfile(prev => ({ ...prev, suburb: e.target.value }))}
                          className={`${inputCls} pl-11`}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* ---- Step 2 ---- */}
                {step === 2 && (
                  <div className="grid grid-cols-3 gap-3">
                    {yearLevels.map((year) => {
                      const selected = profile.yearLevels.includes(year.value);
                      return (
                        <button
                          key={year.value}
                          onClick={() => toggleYearLevel(year.value)}
                          className="p-4 rounded-[16px] border text-center transition-colors"
                          style={{
                            background:  selected ? '#0f172a' : '#fff',
                            borderColor: selected ? '#0f172a' : '#e2e8f0',
                          }}
                        >
                          <Users
                            className="w-5 h-5 mx-auto mb-2"
                            style={{ color: selected ? '#fff' : '#94a3b8' }}
                          />
                          <span
                            className="text-[15px] font-medium"
                            style={{ color: selected ? '#fff' : '#0f172a' }}
                          >
                            {year.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* ---- Step 3 ---- */}
                {step === 3 && (
                  <div className="grid grid-cols-2 gap-3">
                    {subjects.map((subject) => {
                      const selected = profile.subjects.includes(subject);
                      return (
                        <button
                          key={subject}
                          onClick={() => toggleSubject(subject)}
                          className="p-4 rounded-[16px] border text-center transition-colors"
                          style={{
                            background:  selected ? '#0f172a' : '#fff',
                            borderColor: selected ? '#0f172a' : '#e2e8f0',
                          }}
                        >
                          <BookOpen
                            className="w-5 h-5 mx-auto mb-2"
                            style={{ color: selected ? '#fff' : '#94a3b8' }}
                          />
                          <span
                            className="text-[15px] font-medium"
                            style={{ color: selected ? '#fff' : '#0f172a' }}
                          >
                            {subject}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Card footer */}
              <div className="px-6 py-4 border-t border-[#f0f0f0] flex items-center justify-between">
                <button
                  onClick={() => step > 1 ? setStep(step - 1) : router.push('/')}
                  className="flex items-center gap-1.5 h-11 px-4 rounded-full text-[14px] text-[#64748b] hover:bg-[#f8fafc] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {step > 1 ? 'Back' : 'Cancel'}
                </button>

                {step < 3 ? (
                  <button
                    onClick={() => setStep(step + 1)}
                    disabled={!canProceed()}
                    className="flex items-center gap-1.5 h-11 px-6 rounded-full bg-[#0f172a] text-white text-[14px] font-medium transition-opacity disabled:opacity-40"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleComplete}
                    disabled={!canProceed()}
                    className="flex items-center gap-1.5 h-11 px-6 rounded-full bg-[#0f172a] text-white text-[14px] font-medium transition-opacity disabled:opacity-40"
                  >
                    Complete Setup
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AppShell>
  );
}
