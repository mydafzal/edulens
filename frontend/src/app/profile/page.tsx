'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  MapPin,
  BookOpen,
  Users,
  ChevronRight,
  ChevronLeft,
  Check,
  School,
  Sparkles,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

const australianStates = [
  { code: 'QLD', name: 'Queensland' },
  { code: 'NSW', name: 'New South Wales' },
  { code: 'VIC', name: 'Victoria' },
  { code: 'SA', name: 'South Australia' },
  { code: 'WA', name: 'Western Australia' },
  { code: 'TAS', name: 'Tasmania' },
  { code: 'NT', name: 'Northern Territory' },
  { code: 'ACT', name: 'Australian Capital Territory' },
];

const yearLevels = [
  { value: '7', label: 'Year 7' },
  { value: '8', label: 'Year 8' },
  { value: '9', label: 'Year 9' },
  { value: '10', label: 'Year 10' },
  { value: '11', label: 'Year 11' },
  { value: '12', label: 'Year 12' },
];

const subjects = [
  'English', 'Mathematics', 'Science', 'Geography', 'History',
  'Art', 'Music', 'Physical Education', 'Technology', 'Languages'
];

export default function ProfileSetup() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    schoolName: '',
    state: '',
    suburb: '',
    yearLevels: [] as string[],
    subjects: [] as string[],
  });

  const toggleYearLevel = (year: string) => {
    setProfile(prev => ({
      ...prev,
      yearLevels: prev.yearLevels.includes(year)
        ? prev.yearLevels.filter(y => y !== year)
        : [...prev.yearLevels, year]
    }));
  };

  const toggleSubject = (subject: string) => {
    setProfile(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleComplete = () => {
    localStorage.setItem('edulens-profile', JSON.stringify(profile));
    localStorage.setItem('edulens-profile-completed', 'true');
    setStep(4);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return profile.schoolName && profile.state;
      case 2: return profile.yearLevels.length > 0;
      case 3: return profile.subjects.length > 0;
      default: return false;
    }
  };

  const getPersonalizedSuggestions = () => {
    const suggestions = [];
    if (profile.subjects.includes('Geography')) {
      suggestions.push('Water scarcity ' + (profile.yearLevels[0] ? `Year ${profile.yearLevels[0]}` : '') + ' Geography');
    }
    if (profile.subjects.includes('History')) {
      suggestions.push('First Nations perspectives ' + (profile.yearLevels[0] ? `Year ${profile.yearLevels[0]}` : '') + ' History');
    }
    if (profile.subjects.includes('Science')) {
      suggestions.push('Climate change data analysis Science');
    }
    if (profile.subjects.includes('English')) {
      suggestions.push('Australian poetry analysis English');
    }
    if (suggestions.length === 0) {
      suggestions.push('Educational resources for ' + profile.subjects[0]);
    }
    return suggestions.slice(0, 3);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header - Simple */}
      <header className="border-b">
        <div className="w-full px-4 sm:px-6 lg:px-8 mx-auto max-w-6xl">
          <div className="h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] bg-primary flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-[22px] font-bold tracking-tight">EduLens</span>
            </Link>
            <span className="text-[13px] text-muted-foreground">Profile Setup</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-xl">
          {/* Progress Steps */}
          {step < 4 && (
            <div className="flex items-center justify-center gap-2 mb-8">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[15px] font-medium transition-colors ${
                    s === step ? 'bg-primary text-primary-foreground' :
                    s < step ? 'bg-secondary text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    {s < step ? <Check className="w-5 h-5" /> : s}
                  </div>
                  {s < 3 && (
                    <div className={`w-12 h-[2px] mx-2 rounded-full transition-colors ${
                      s < step ? 'bg-primary' : 'bg-border'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          )}

          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {/* Step 4: Success */}
            {step === 4 ? (
              <div className="bg-card border border-border rounded-[12px] p-8 text-center space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="w-16 h-16 mx-auto rounded-full bg-secondary flex items-center justify-center"
                >
                  <Check className="w-8 h-8 text-primary" />
                </motion.div>

                <div className="space-y-2">
                  <h2 className="text-[22px] font-bold">You&apos;re All Set!</h2>
                  <p className="text-[15px] text-muted-foreground">
                    EduLens will personalize resources for{' '}
                    <span className="font-medium text-foreground">{profile.schoolName}</span> in{' '}
                    <span className="font-medium text-foreground">{profile.state}</span>.
                  </p>
                </div>

                <div className="bg-muted rounded-[12px] p-5 space-y-3">
                  <p className="text-[13px] font-medium text-muted-foreground">Try searching for:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {getPersonalizedSuggestions().map((suggestion) => (
                      <Link
                        key={suggestion}
                        href={`/?q=${encodeURIComponent(suggestion)}`}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-card border border-border hover:border-primary/50 transition-colors text-[13px]"
                      >
                        <Search className="w-4 h-4 text-muted-foreground" />
                        {suggestion}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Link href="/">
                    <Button size="lg" className="gap-2 h-11 px-6">
                      <Sparkles className="w-5 h-5" />
                      Start Searching
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setStep(1)}
                    className="h-11 px-6"
                  >
                    Edit Profile
                  </Button>
                </div>
              </div>
            ) : (
              /* Steps 1-3 */
              <div className="bg-card border border-border rounded-[12px] overflow-hidden">
                {/* Card Header */}
                <div className="p-6 border-b border-border">
                  <h2 className="text-[18px] font-semibold">
                    {step === 1 && 'School Information'}
                    {step === 2 && 'Year Levels'}
                    {step === 3 && 'Subjects'}
                  </h2>
                  <p className="text-[15px] text-muted-foreground mt-1">
                    {step === 1 && 'Tell us about your school for localized resources.'}
                    {step === 2 && 'Select the year levels you teach.'}
                    {step === 3 && 'Select the subjects you teach.'}
                  </p>
                </div>

                {/* Card Content */}
                <div className="p-6 space-y-5">
                  {step === 1 && (
                    <>
                      <div className="space-y-2">
                        <label className="text-[15px] font-medium">School Name</label>
                        <div className="relative">
                          <School className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            placeholder="e.g., Toowoomba Grammar School"
                            value={profile.schoolName}
                            onChange={(e) => setProfile(prev => ({ ...prev, schoolName: e.target.value }))}
                            className="pl-12 h-12 text-[15px]"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[15px] font-medium">State/Territory</label>
                        <div className="grid grid-cols-4 gap-2">
                          {australianStates.map((state) => (
                            <button
                              key={state.code}
                              onClick={() => setProfile(prev => ({ ...prev, state: state.code }))}
                              className={`h-11 rounded-[6px] border text-[15px] font-medium transition-colors ${
                                profile.state === state.code
                                  ? 'border-primary bg-secondary text-primary'
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              {state.code}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[15px] font-medium">Suburb <span className="text-muted-foreground">(Optional)</span></label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            placeholder="e.g., Toowoomba"
                            value={profile.suburb}
                            onChange={(e) => setProfile(prev => ({ ...prev, suburb: e.target.value }))}
                            className="pl-12 h-12 text-[15px]"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <div className="grid grid-cols-3 gap-3">
                      {yearLevels.map((year) => (
                        <button
                          key={year.value}
                          onClick={() => toggleYearLevel(year.value)}
                          className={`p-4 rounded-[12px] border text-center transition-colors ${
                            profile.yearLevels.includes(year.value)
                              ? 'border-primary bg-secondary text-primary'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <Users className={`w-6 h-6 mx-auto mb-2 ${
                            profile.yearLevels.includes(year.value) ? 'text-primary' : 'text-muted-foreground'
                          }`} />
                          <span className="text-[15px] font-medium">{year.label}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {step === 3 && (
                    <div className="grid grid-cols-2 gap-3">
                      {subjects.map((subject) => (
                        <button
                          key={subject}
                          onClick={() => toggleSubject(subject)}
                          className={`p-4 rounded-[12px] border text-center transition-colors ${
                            profile.subjects.includes(subject)
                              ? 'border-primary bg-secondary text-primary'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <BookOpen className={`w-5 h-5 mx-auto mb-2 ${
                            profile.subjects.includes(subject) ? 'text-primary' : 'text-muted-foreground'
                          }`} />
                          <span className="text-[15px] font-medium">{subject}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="p-6 border-t border-border flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="default"
                    onClick={() => step > 1 ? setStep(step - 1) : router.push('/')}
                    className="gap-2 h-11"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    {step > 1 ? 'Back' : 'Cancel'}
                  </Button>

                  {step < 3 ? (
                    <Button
                      onClick={() => setStep(step + 1)}
                      disabled={!canProceed()}
                      size="default"
                      className="gap-2 h-11"
                    >
                      Next
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleComplete}
                      disabled={!canProceed()}
                      size="default"
                      className="gap-2 h-11"
                    >
                      Complete Setup
                      <Check className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
