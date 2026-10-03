'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { useProgressStore, getRank, getRankLadder } from '@/lib/progress';
import { useProjectProgressStore } from '@/lib/project-progress';
import { useThreadProgressStore } from '@/lib/thread-progress';
import { lessons } from '@/lib/lessons';
import { getAllProjects } from '@/lib/projects';
import { projectChallenges } from '@/lib/project-threads';

export default function StatsPage() {
  const [mounted, setMounted] = useState(false);

  const xp = useProgressStore((s) => s.xp);
  const streak = useProgressStore((s) => s.streak);
  const maxStreak = useProgressStore((s) => s.maxStreak);
  const completedLessons = useProgressStore((s) => s.completedLessons);
  const completedSteps = useProjectProgressStore((s) => s.completedSteps);
  const completedChallenges = useThreadProgressStore((s) => s.completedChallenges);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- mount flag to avoid SSR/hydration mismatch
  useEffect(() => setMounted(true), []);

  const rank = getRank(xp);
  const ladder = getRankLadder();
  const nextRank = ladder.find((r) => r.threshold > xp);
  const xpToNext = nextRank ? nextRank.threshold - xp : 0;
  const rankProgress = nextRank
    ? Math.min(
        100,
        Math.round(
          ((xp - rank.threshold) / (nextRank.threshold - rank.threshold)) * 100,
        ),
      )
    : 100;

  const allProjects = getAllProjects();
  const totalLessons = lessons.length;
  const totalProjectSteps = allProjects.reduce((s, p) => s + p.steps.length, 0);
  const totalChallenges = Object.keys(projectChallenges).length;

  const completedChallengeCount = Object.keys(projectChallenges).filter((k) => completedChallenges[k]).length;
  const completedProjectSteps = allProjects.reduce(
    (sum, p) => sum + (completedSteps[p.slug]?.length ?? 0),
    0,
  );

  const validLessonKeys = new Set(lessons.map((l) => `${l.moduleSlug}/${l.lessonSlug}`));
  const effectiveCompleted = completedLessons.filter((k) => validLessonKeys.has(k));
  const liveCompletedLessonCount = effectiveCompleted.length;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-mono text-sm">
      <Header />

      <main id="main" tabIndex={-1} className="flex-1 max-w-[1200px] mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        <section>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Stats
          </h1>
          <p className="mt-0.5 text-xs text-[#64748b] font-normal">
            Your XP, rank and streak at a glance.
          </p>
        </section>
        <div className="border-b border-border/60" />

        {!mounted ? (
          <p className="mt-8 text-xs text-[#64748b]">loading state from localstorage…</p>
        ) : (
          <div className="space-y-6">
            {/* Top Row: 3 Cards (Rank, XP, Streak) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Rank Card */}
              <div className="p-5 rounded-xl border border-slate-300/80 bg-[#f1f5f9] text-slate-900 flex flex-col justify-between gap-3 shadow-sm">
                <div className="text-[11px] font-bold text-[#0f172a] uppercase tracking-wider">Rank</div>
                <div>
                  <div className="text-xl font-bold text-purple-700">{rank.name}</div>
                </div>
                {nextRank ? (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-[#64748b]">
                      <span>Progress</span>
                      <span className="font-semibold text-slate-800">{xpToNext} XP to {nextRank.name}</span>
                    </div>
                    <div className="h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-600 rounded-full transition-all duration-300"
                        style={{ width: `${rankProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-emerald-700 font-bold pt-1">Highest Rank Achieved 🏆</div>
                )}
              </div>

              {/* XP Card */}
              <div className="p-5 rounded-xl border border-slate-300/80 bg-[#f1f5f9] text-slate-900 flex flex-col justify-between gap-3 shadow-sm">
                <div className="text-[11px] font-bold text-[#0f172a] uppercase tracking-wider">Total XP</div>
                <div className="text-3xl font-bold text-[#0f172a]">
                  {xp.toLocaleString()} <span className="text-xs text-[#64748b] font-semibold">XP</span>
                </div>
                <div className="text-xs text-[#64748b]">Earned from lessons & challenges</div>
              </div>

              {/* Streak Card */}
              <div className="p-5 rounded-xl border border-slate-300/80 bg-[#f1f5f9] text-slate-900 flex flex-col justify-between gap-3 shadow-sm">
                <div className="text-[11px] font-bold text-[#0f172a] uppercase tracking-wider">Streak</div>
                <div className="text-3xl font-bold text-amber-600">
                  {streak} <span className="text-base font-normal text-slate-700">days</span>
                </div>
                <div className="text-xs text-[#64748b]">
                  Best streak: <span className="text-slate-900 font-bold">{maxStreak}d</span>
                </div>
              </div>
            </div>

            {/* Bottom Row: 3 Progress Cards (Lessons, Project Steps, Scenario Steps) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Lessons Card */}
              <div className="p-5 rounded-xl border border-slate-300/80 bg-[#f1f5f9] text-slate-900 space-y-3 shadow-sm">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#0f172a] uppercase tracking-wider">Lessons</span>
                  <span className="font-bold text-[#0f172a]">{liveCompletedLessonCount} / {totalLessons}</span>
                </div>
                <div className="h-[6px] bg-[#e2e8f0] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.round((liveCompletedLessonCount / totalLessons) * 100))}%` }}
                  />
                </div>
                <div className="text-[11px] text-[#64748b] text-right font-medium">
                  {Math.round((liveCompletedLessonCount / totalLessons) * 100)}% complete
                </div>
              </div>

              {/* Project Steps Card */}
              <div className="p-5 rounded-xl border border-slate-300/80 bg-[#f1f5f9] text-slate-900 space-y-3 shadow-sm">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#0f172a] uppercase tracking-wider">Project Steps</span>
                  <span className="font-bold text-[#0f172a]">{completedProjectSteps} / {totalProjectSteps}</span>
                </div>
                <div className="h-[6px] bg-[#e2e8f0] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.round((completedProjectSteps / totalProjectSteps) * 100))}%` }}
                  />
                </div>
                <div className="text-[11px] text-[#64748b] text-right font-medium">
                  {totalProjectSteps > 0 ? Math.round((completedProjectSteps / totalProjectSteps) * 100) : 0}% complete
                </div>
              </div>

              {/* Scenario Steps Card */}
              <div className="p-5 rounded-xl border border-slate-300/80 bg-[#f1f5f9] text-slate-900 space-y-3 shadow-sm">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#0f172a] uppercase tracking-wider">Scenario Steps</span>
                  <span className="font-bold text-[#0f172a]">{completedChallengeCount} / {totalChallenges}</span>
                </div>
                <div className="h-[6px] bg-[#e2e8f0] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.round((completedChallengeCount / totalChallenges) * 100))}%` }}
                  />
                </div>
                <div className="text-[11px] text-[#64748b] text-right font-medium">
                  {totalChallenges > 0 ? Math.round((completedChallengeCount / totalChallenges) * 100) : 0}% complete
                </div>
              </div>
            </div>

            {/* Rank Ladder: Horizontal Row of 5 Steps */}
            <section className="space-y-3 pt-2">
              <div className="text-xs uppercase tracking-widest font-bold text-[#64748b]">Rank ladder</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                {ladder.map((r) => {
                  const reached = xp >= r.threshold;
                  const isCurrent = rank.name === r.name;
                  return (
                    <div
                      key={r.name}
                      className={`p-4 rounded-xl border flex flex-col justify-between gap-2.5 transition-all shadow-sm ${
                        isCurrent
                          ? 'border-purple-400 bg-[#f3e8ff] text-slate-900 ring-2 ring-purple-400/40'
                          : 'border-slate-300/80 bg-[#f1f5f9] text-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-bold ${isCurrent ? 'text-purple-800 font-extrabold' : reached ? 'text-emerald-700' : 'text-[#64748b]'}`}>
                          {isCurrent ? 'Current' : reached ? '✓ Reached' : 'Locked'}
                        </span>
                        <span className="text-[10px] font-mono tabular-nums font-semibold text-[#64748b]">{r.threshold} XP</span>
                      </div>
                      <div>
                        <div className={`text-sm font-bold ${isCurrent ? 'text-purple-950' : 'text-[#0f172a]'}`}>
                          {r.name}
                        </div>
                        <p className="text-[11px] leading-relaxed text-[#475569] mt-1">
                          {r.blurb}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

