'use client';

import { Shield } from 'lucide-react';
import { AppShell } from '@/components/edulens';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <AppShell>
      <div className="w-full px-4 sm:px-6 lg:px-8 mx-auto max-w-2xl py-6">
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

        {/* Footer links */}
        <div className="flex items-center justify-center gap-6 text-[13px] text-muted-foreground mt-6">
          <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
        </div>
      </div>
    </AppShell>
  );
}
