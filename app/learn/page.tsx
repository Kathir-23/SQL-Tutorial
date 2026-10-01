'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import ModuleCard from '@/components/ModuleCard';
import { getAllModules, getModuleLessons, lessons } from '@/lib/lessons';
import { useProgressStore, getDueLessons, getRankByLessons } from '@/lib/progress';
import { useAuth } from '@/lib/auth';
import { BookOpen, ArrowRight, ShieldCheck, Flame, Trophy, Award } from 'lucide-react';

export default function LearnPage() {
  const modules = getAllModules();
  const { completedLessons, reviewedAt, streak } = useProgressStore();
  const { user, isAuthenticated } = useAuth();

  const totalLessons = lessons.length;
  const completedCount = completedLessons.length;
  const overallPercentage = Math.round((completedCount / totalLessons) * 100);
  const dueCount = getDueLessons(completedLessons, reviewedAt).length;

  const currentRank = getRankByLessons(completedCount);

  // Find next lesson to continue or all completed message
  const firstIncomplete = lessons.find((l) => !completedLessons.includes(l.slug));
  const continueHref = firstIncomplete
    ? `/learn/${firstIncomplete.moduleSlug}/${firstIncomplete.lessonSlug}`
    : `/next-steps`;
  const continueTitle = firstIncomplete
    ? firstIncomplete.title
    : 'All done! Get your certificate';

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-mono text-sm">
      {/* Unified Shared Sticky Header */}
      <Header />

      <main id="main" tabIndex={-1} className="flex-1 max-w-[1302px] mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
        {/* PERSONALIZED WELCOME BANNER */}
        <section className="p-6 md:p-8 rounded-lg border border-border/80 bg-card space-y-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-accent">
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-accent" />
                  <span className="uppercase font-bold tracking-wider">{currentRank.name} · RANK</span>
                </div>
                <span className="text-muted-foreground/60 font-normal">|</span>
                <Link
                  href="/next-steps"
                  className="inline-flex items-center gap-1 text-accent font-bold tracking-wider hover:opacity-80 transition-opacity uppercase"
                >
                  <Award className="w-4 h-4 text-accent" />
                  <span>CERTIFICATE</span>
                </Link>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                {isAuthenticated && user ? `Welcome back, ${user.certificateName} 👋` : 'Welcome to SQL Mastery 👋'}
              </h1>
              <p className="text-xs text-muted-foreground max-w-lg leading-relaxed">
                {isAuthenticated
                  ? 'Pick up right where you left off. Complete all 16 core modules to lock your official LinkedIn certificate.'
                  : 'You are currently studying in Guest Mode. Create a free account anytime to persist progress and lock your certificate name.'}
              </p>
            </div>

            {/* Quick Stats Pill Box */}
            <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-secondary/40 border border-border/40 text-center min-w-[240px]">
              <div>
                <span className="block text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Cleared</span>
                <span className="text-lg font-bold text-foreground">{completedCount}/{totalLessons}</span>
              </div>
              <div>
                <span className="block text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Streak</span>
                <span className="text-lg font-bold text-amber-500 flex items-center justify-center gap-0.5">
                  <Flame className="w-4 h-4 fill-amber-500" />
                  <span>{streak}d</span>
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Progress</span>
                <span className="text-lg font-bold text-accent">{overallPercentage}%</span>
              </div>
            </div>
          </div>

          {/* Continue Learning CTA Banner */}
          <div className="p-4 rounded-lg border border-accent/30 bg-accent/5 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-accent font-semibold">Next Up</span>
              <div className="text-sm font-bold text-foreground">{continueTitle}</div>
            </div>

            <Link
              href={continueHref}
              style={{ color: '#ffffff', backgroundColor: '#7c3aed' }}
              className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-lg font-bold text-xs hover:opacity-90 transition-opacity shadow-sm"
            >
              {firstIncomplete ? <BookOpen className="w-4 h-4" style={{ color: '#ffffff' }} /> : <Award className="w-4 h-4" style={{ color: '#ffffff' }} />}
              <span style={{ color: '#ffffff' }}>{firstIncomplete ? 'Continue Learning' : 'Claim Certificate'}</span>
              <ArrowRight className="w-4 h-4" style={{ color: '#ffffff' }} />
            </Link>
          </div>
        </section>

        {/* REVIEW DUE ALERT BANNER */}
        {dueCount > 0 && (
          <section aria-label="reviews due">
            <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-xs font-bold uppercase tracking-wider">Spaced Review Due</span>
                <p className="text-xs text-amber-200/80">You have {dueCount} lesson{dueCount === 1 ? '' : 's'} ready for review today.</p>
              </div>
              <Link
                href="/review"
                className="px-3.5 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:opacity-90 transition-opacity"
              >
                Start Review ({dueCount})
              </Link>
            </div>
          </section>
        )}

        {/* MODULE CARDS GRID */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <span className="text-accent">$</span> All Curriculum Modules ({modules.length})
            </h2>
            <span className="text-xs text-muted-foreground font-semibold">{completedCount} of {totalLessons} lessons completed</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules.map((m) => {
              const modLessons = getModuleLessons(m.slug);
              return (
                <ModuleCard
                  key={m.slug}
                  module={m}
                  lessonCount={modLessons.length}
                  firstLessonSlug={modLessons[0]?.lessonSlug || ''}
                />
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
