'use client';

import { GraduationCap, ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function TermsPage() {
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
            <FileText className="w-7 h-7 text-primary" />
            <h1 className="text-[22px] font-bold">Terms of Service</h1>
          </div>

          <div className="bg-card border border-border rounded-[12px] p-6 space-y-6">
            <p className="text-[13px] text-muted-foreground">
              Last updated: January 2025
            </p>

            <div>
              <h2 className="text-[15px] font-semibold mb-2">Hackathon Project</h2>
              <p className="text-[15px] text-muted-foreground">
                EduLens is a prototype developed for the Cambridge University Press & Assessment
                Hackathon 2025. It is provided for demonstration purposes only.
              </p>
            </div>

            <div>
              <h2 className="text-[15px] font-semibold mb-2">Educational Use</h2>
              <p className="text-[15px] text-muted-foreground">
                This tool is designed to assist educators in finding and adapting teaching
                resources. All resource recommendations should be reviewed by teachers before
                use in the classroom.
              </p>
            </div>

            <div>
              <h2 className="text-[15px] font-semibold mb-2">Resource Attribution</h2>
              <p className="text-[15px] text-muted-foreground">
                EduLens displays resources from various trusted sources. Original licensing
                and attribution requirements apply. Users are responsible for complying with
                the license terms of any resources they use.
              </p>
            </div>

            <div>
              <h2 className="text-[15px] font-semibold mb-2">AI-Generated Content</h2>
              <p className="text-[15px] text-muted-foreground">
                Localizations and adaptations are generated using AI. While we strive for
                accuracy, teachers should review all AI-generated content before use.
              </p>
            </div>

            <div>
              <h2 className="text-[15px] font-semibold mb-2">No Warranty</h2>
              <p className="text-[15px] text-muted-foreground">
                This prototype is provided &quot;as is&quot; without warranty of any kind. The
                developers are not liable for any issues arising from its use.
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
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
