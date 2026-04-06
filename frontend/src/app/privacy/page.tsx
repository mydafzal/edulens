'use client';

import { GraduationCap, ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="w-full px-4 sm:px-6 lg:px-8 mx-auto max-w-6xl">
          <div className="h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] bg-primary flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-[22px] font-bold tracking-tight">EduLens</span>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="default" className="gap-2 h-10">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="w-full px-4 sm:px-6 lg:px-8 mx-auto max-w-2xl py-10">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-7 h-7 text-primary" />
            <h1 className="text-[22px] font-bold">Privacy Policy</h1>
          </div>

          <div className="bg-card border border-border rounded-[12px] p-6 space-y-6">
            <p className="text-[13px] text-muted-foreground">
              Last updated: January 2025
            </p>

            <div>
              <h2 className="text-[15px] font-semibold mb-2">Data We Collect</h2>
              <p className="text-[15px] text-muted-foreground mb-3">
                EduLens collects minimal data to provide personalized resource recommendations:
              </p>
              <ul className="list-disc pl-5 text-[15px] text-muted-foreground space-y-1">
                <li>School name and location (for localization)</li>
                <li>Year levels and subjects you teach</li>
                <li>Search queries (to improve results)</li>
              </ul>
            </div>

            <div>
              <h2 className="text-[15px] font-semibold mb-2">How We Use Your Data</h2>
              <p className="text-[15px] text-muted-foreground mb-3">
                Your data is used solely to:
              </p>
              <ul className="list-disc pl-5 text-[15px] text-muted-foreground space-y-1">
                <li>Personalize search results for your context</li>
                <li>Generate locally-relevant adaptations</li>
                <li>Improve the quality of our recommendations</li>
              </ul>
            </div>

            <div>
              <h2 className="text-[15px] font-semibold mb-2">Data Storage</h2>
              <p className="text-[15px] text-muted-foreground">
                Profile data is stored locally in your browser. Search data is processed
                securely and not shared with third parties.
              </p>
            </div>

            <div>
              <h2 className="text-[15px] font-semibold mb-2">Your Rights</h2>
              <p className="text-[15px] text-muted-foreground">
                You can clear your profile data at any time by clearing your browser&apos;s
                local storage. For questions, contact the hackathon team.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="w-full px-4 sm:px-6 lg:px-8 mx-auto max-w-6xl py-6">
          <div className="flex items-center justify-between text-[13px] text-muted-foreground">
            <p>Cambridge Hackathon 2025</p>
            <div className="flex items-center gap-6">
              <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
