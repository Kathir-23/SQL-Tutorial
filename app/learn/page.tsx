'use client';

import Link from 'next/link';
import XPBadge from '@/components/XPBadge';
import ModuleCard from '@/components/ModuleCard';
import { getAllModules, getModuleLessons, lessons } from '@/lib/lessons';
import { useProgressStore, getDueLessons, getRank } from '@/lib/progress';
import { useShowcase } from '@/lib/mode';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/lib/auth';
import { User, LogIn, UserPlus, BookOpen, ArrowRight, ShieldCheck, Flame, Trophy } from 'lucide-react';

export default function LearnPage() {
  const modules = getAllModules();
  const { completedLessons, reviewedAt, xp, streak } = useProgressStore();
  const showcase = useShowcase();
  const { user, isAuthenticated } = useAuth();

  const totalLessons = lessons.length;
  const completedCount = showcase ? totalLessons : completedLessons.length;
  const overallPercentage = Math.round((completedCount / totalLessons) * 100);
  const dueCount = showcase
    ? 0
    : getDueLessons(completedLessons, reviewedAt).length;

  const currentRank = getRank(xp);

  // Find next lesson to continue
  const firstIncomplete = lessons.find((l) => !completedLessons.includes(l.slug));
  const continueHref = firstIncomplete
    ? `/learn/${firstIncomplete.moduleSlug}/${firstIncomplete.lessonSlug}`
    : `/learn/${lessons[0].moduleSlug}/${lessons[0].lessonSlug}`;
  const continueTitle = firstIncomplete ? firstIncomplete.title : 'All Lessons Cleared!';

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-mono text-sm">
      {/* Dashboard Top Header */}
      <header className="border-b border-border/60 bg-card/40">
        <div className="max-w-5xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded">
            <span className="text-accent">$</span> cd ~/dashboard
          </Link>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="text-foreground font-semibold">&gt; dashboard</span>
            <Link href="/projects" className="text-muted-foreground hover:text-foreground transition-colors">projects</Link>
            <Link href="/playground" className="text-muted-foreground hover:text-foreground transition-colors">playground</Link>
            <Link href="/stats" className="text-muted-foreground hover:text-foreground transition-colors">stats</Link>

            {isAuthenticated && user ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-accent/10 border border-accent/20 text-accent font-semibold">
                <User className="w-3.5 h-3.5" />
                <span>{user.certificateName}</span>
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                  <LogIn className="w-3 h-3 text-accent" />
                  <span>login</span>
                </Link>
                <Link href="/signup" className="text-accent font-semibold hover:underline flex items-center gap-1">
                  <UserPlus className="w-3 h-3" />
                  <span>signup</span>
                </Link>
              </div>
            )}
            <XPBadge />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="flex-1 max-w-5xl mx-auto w-full px-6 py-8 space-y-8">
        {/* PERSONALIZED WELCOME BANNER */}
        <section className="p-6 md:p-8 rounded-lg border border-border/80 bg-card space-y-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-accent">
                <Trophy className="w-4 h-4" />
                <span>{currentRank.name.toUpperCase()} · RANK</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                {isAuthenticated && user ? `Welcome back, ${user.certificateName} 👋` : 'Welcome to SQL Mastery 👋'}
              </h1>
              <p className="text-xs text-muted-foreground max-w-lg leading-relaxed">
                {isAuthenticated
                  ? 'Pick up right where you left off. Complete all 10 core modules to lock your official LinkedIn certificate.'
                  : 'You are currently studying in Guest Mode. Create a free account anytime to persist progress and lock your certificate name.'}
              </p>
            </div>

            {/* Quick Stats Pill Box */}
            <div className="grid grid-cols-3 gap-3 p-3 rounded bg-secondary/40 border border-border/40 text-center min-w-[240px]">
              <div>
                <span className="block text-[10px] text-muted-foreground uppercase">Cleared</span>
                <span className="text-lg font-bold text-foreground">{completedCount}/{totalLessons}</span>
              </div>
              <div>
                <span className="block text-[10px] text-muted-foreground uppercase">Streak</span>
                <span className="text-lg font-bold text-amber-500 flex items-center justify-center gap-0.5">
                  <Flame className="w-4 h-4 fill-amber-500" />
                  <span>{streak}d</span>
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-muted-foreground uppercase">Progress</span>
                <span className="text-lg font-bold text-accent">{overallPercentage}%</span>
              </div>
            </div>
          </div>

          {/* Continue Learning CTA Banner */}
          <div className="p-4 rounded border border-accent/30 bg-accent/5 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-accent font-semibold">Next Up</span>
              <div className="text-sm font-bold text-foreground">{continueTitle}</div>
            </div>

            <Link
              href={continueHref}
              className="inline-flex items-center gap-2 px-4 py-2 rounded bg-accent text-accent-foreground font-semibold text-xs hover:opacity-90 transition-opacity shadow-sm"
            >
              <BookOpen className="w-4 h-4" />
              <span>Continue Learning</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* REVIEW DUE ALERT BANNER */}
        {dueCount > 0 && (
          <section aria-label="reviews due">
            <div className="p-4 rounded border border-amber-500/30 bg-amber-500/10 text-amber-300 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-xs font-bold uppercase tracking-wider">Spaced Review Due</span>
                <p className="text-xs text-amber-200/80">You have {dueCount} lesson{dueCount === 1 ? '' : 's'} ready for review today.</p>
              </div>
              <Link
                href="/review"
                className="px-3 py-1.5 rounded bg-amber-500 text-slate-950 font-bold text-xs hover:opacity-90 transition-opacity"
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
            <span className="text-xs text-muted-foreground">{completedCount} of {totalLessons} lessons completed</span>
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

      <footer className="border-t border-border/60 py-5 text-xs">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap items-center justify-between gap-3 text-muted-foreground">
          <span><span className="text-emerald-500">exit 0</span> · SQL Mastery Dashboard</span>
          <Link href="/next-steps" className="hover:text-foreground transition-colors flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-accent" />
            <span>Certificate Status</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
