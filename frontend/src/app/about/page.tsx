'use client';

import { GraduationCap, Shield, MapPin, BookOpen, Users, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AboutPage() {
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
        <div className="w-full px-4 sm:px-6 lg:px-8 mx-auto max-w-3xl py-10">
          {/* Hero */}
          <div className="text-center mb-10">
            <p className="text-[11px] uppercase tracking-wide font-medium text-primary mb-3">
              Cambridge Hackathon 2025
            </p>
            <h1 className="text-[28px] font-bold mb-3">About EduLens</h1>
            <p className="text-[15px] text-muted-foreground max-w-xl mx-auto">
              AI-powered resource discovery for Australian educators.
              Find, evaluate, and adapt teaching resources for your local classroom context.
            </p>
          </div>

          {/* The Challenge */}
          <div className="bg-card border border-border rounded-[12px] p-6 mb-6">
            <h2 className="text-[18px] font-semibold mb-3">The Challenge</h2>
            <p className="text-[15px] text-muted-foreground mb-3">
              Teachers spend countless hours searching for quality resources, often struggling to find
              content that is both academically rigorous and relevant to their students&apos; local context.
            </p>
            <p className="text-[15px] text-muted-foreground">
              EduLens addresses this by combining AI-powered search with quality evaluation and
              one-click localization, helping teachers find resources that work for their specific classroom.
            </p>
          </div>

          {/* Features */}
          <h2 className="text-[18px] font-semibold mb-4">Key Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {[
              {
                icon: Shield,
                title: 'Quality Scorecard',
                description: 'Every resource evaluated on accuracy, bias, age-appropriateness, cultural sensitivity, and safety.'
              },
              {
                icon: MapPin,
                title: 'Local Adaptation',
                description: 'One-click localization that adapts content with references from your region and community.'
              },
              {
                icon: BookOpen,
                title: 'Curriculum Alignment',
                description: 'Resources mapped to Australian Curriculum codes and state-specific frameworks.'
              },
              {
                icon: Users,
                title: 'Student Context',
                description: 'Adaptations consider your students interests, reading levels, and cultural backgrounds.'
              }
            ].map((feature) => (
              <div key={feature.title} className="bg-card border border-border rounded-[12px] p-5">
                <feature.icon className="w-6 h-6 text-primary mb-3" />
                <h3 className="text-[15px] font-semibold mb-1">{feature.title}</h3>
                <p className="text-[13px] text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Team */}
          <div className="bg-muted rounded-[12px] p-6 text-center">
            <h2 className="text-[18px] font-semibold mb-2">Built for Educators</h2>
            <p className="text-[15px] text-muted-foreground">
              Created by a team passionate about making quality education accessible to every classroom in Australia.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="w-full px-4 sm:px-6 lg:px-8 mx-auto max-w-6xl py-6">
          <div className="flex items-center justify-between text-[13px] text-muted-foreground">
            <p>Cambridge Hackathon 2025</p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
