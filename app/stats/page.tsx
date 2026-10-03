'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { useProgressStore, getRank, getRankLadder, isLessonDue, checkpointKey } from '@/lib/progress';
import { MODULE_CHECKPOINTS } from '@/lib/checkpoints';
import { useProjectProgressStore } from '@/lib/project-progress';
import { useThreadProgressStore } from '@/lib/thread-progress';
import { lessons, modules } from '@/lib/lessons';
import { getAllProjects } from '@/lib/projects';
import { projectThreads, projectChallenges } from '@/lib/project-threads';

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-24 sm:w-32 h-[6px] bg-slate-700/60 rounded-full overflow-hidden">
      <div
        className="h-full bg-purple-500 rounded-full transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

function daysAgo(iso: string): string {
  if (!iso) return 'never';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const last = new Date(iso);
  last.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - last.getTime()) / 86_400_000);
  if (diff <= 0) return 'today';
  if (diff === 1) return 'yesterday';
  return `${diff} days ago`;
}

export default function StatsPage() {
  const [mounted, setMounted] = useState(false);
  const [now] = useState(() => Date.now());

  const xp = useProgressStore((s) => s.xp);
  const streak = useProgressStore((s) => s.streak);
  const maxStreak = useProgressStore((s) => s.maxStreak);
  const lastActivity = useProgressStore((s) => s.lastActivity);
  const completedLessons = useProgressStore((s) => s.completedLessons);
  const completedCheckpoints = useProgressStore((s) => s.completedCheckpoints ?? []);
  const reviewedAt = useProgressStore((s) => s.reviewedAt);
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

  const moduleRows = modules.map((m) => {
    const moduleLessons = lessons.filter((l) => l.moduleSlug === m.slug);
    const done = moduleLessons.filter((l) =>
      completedLessons.includes(`${l.moduleSlug}/${l.lessonSlug}`),
    ).length;
    const total = moduleLessons.length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { slug: m.slug, name: m.name, done, total, pct };
  });

  const reviewItems = completedLessons
    .filter((k) => validLessonKeys.has(k))
    .map((k) => {
      const [moduleSlug, lessonSlug] = k.split('/');
      const lesson = lessons.find((l) => l.moduleSlug === moduleSlug && l.lessonSlug === lessonSlug);
      const entry = reviewedAt[k];
      const ts = typeof entry === 'string' ? entry : entry?.at ?? '';
      return {
        key: k,
        moduleSlug,
        lessonSlug,
        title: lesson?.title ?? k,
        ts,
        due: isLessonDue(k, reviewedAt),
      };
    });
  const dueCount = reviewItems.filter((r) => r.due).length;

  const checkpointRows = Object.keys(MODULE_CHECKPOINTS).map((slug) => {
    const done = completedCheckpoints.includes(slug);
    const due = done && isLessonDue(checkpointKey(slug), reviewedAt);
    return { slug, done, due };
  });
  const checkpointsDone = checkpointRows.filter((c) => c.done).length;
  const checkpointsDue = checkpointRows.filter((c) => c.due).length;
  const reviewQueue = reviewItems
    .sort((a, b) => {
      if (a.due !== b.due) return a.due ? -1 : 1;
      return a.ts.localeCompare(b.ts);
    })
    .slice(0, 8);

  const weakModules = moduleRows.filter((m) => m.pct > 0 && m.pct < 50 && m.total > 0).slice(0, 5);

  const daysSince = (iso: string): string => {
    if (!iso) return 'never';
    const days = Math.round((now - new Date(iso).getTime()) / 86_400_000);
    if (days <= 0) return 'today';
    if (days === 1) return '1d ago';
    return `${days}d ago`;
  };

  const projectRows = allProjects.map((p) => {
    const total = p.steps.length;
    const done = completedSteps[p.slug]?.length ?? 0;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { slug: p.slug, title: p.title, done, total, pct };
  });

  const scenarioRows = projectThreads.map((t) => {
    const keys = Object.entries(projectChallenges)
      .filter(([, c]) => c.threadId === t.id)
      .map(([k]) => k);
    const total = keys.length;
    const done = keys.filter((k) => completedChallenges[k]).length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { id: t.id, title: t.title, done, total, pct };
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header />

      <main id="main" tabIndex={-1} className="flex-1 max-w-[1302px] mx-auto w-full px-4 sm:px-6 py-4 sm:py-6 font-mono">
        <section className="font-mono">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Stats
          </h1>
          <p className="mt-0.5 text-xs text-[#64748b] font-normal">
            Your complete learning progress, XP, ranks, and spaced repetition queue
          </p>
        </section>
        <div className="border-b border-border/60 my-4" />

        {!mounted ? (
          <p className="mt-8 text-xs text-[#64748b]">loading state from localstorage…</p>
        ) : (
          <>
            <section className="mt-6">
              <p className="text-xs uppercase tracking-widest text-[#64748b]"># profile</p>
              <div className="mt-3 grid sm:grid-cols-2 gap-x-10 gap-y-2 text-sm">
                <p>
                  <span className="text-[#64748b]">rank</span>
                  {'  '}
                  <span className="text-indigo-400">[{rank.name}]</span>
                </p>
                <p>
                  <span className="text-[#64748b]">xp</span>
                  {'    '}
                  <span className="text-slate-100">{xp.toLocaleString()}</span>
                  {nextRank && (
                    <span className="text-[#64748b]">
                      {' · '}
                      {xpToNext} to <span className="text-indigo-400">{nextRank.name}</span>
                    </span>
                  )}
                </p>
                <p>
                  <span className="text-[#64748b]">streak</span>
                  {' '}
                  <span className="text-amber-400">{streak}d</span>
                  <span className="text-[#64748b]"> · max </span>
                  <span className="text-slate-300">{maxStreak}d</span>
                </p>
                <p>
                  <span className="text-[#64748b]">last seen</span>
                  {' '}
                  <span className="text-slate-300">{daysAgo(lastActivity)}</span>
                </p>
              </div>

              {nextRank && (
                <div className="mt-4 max-w-md">
                  <p className="text-[11px] text-[#64748b] mb-1">
                    progress to {nextRank.name}: {rankProgress}%
                  </p>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-400 rounded-full transition-all duration-300"
                      style={{ width: `${rankProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </section>

            <section className="mt-10">
              <p className="text-xs uppercase tracking-widest text-[#64748b]"># totals</p>
              <div className="mt-2 text-sm text-slate-300 space-y-1">
                <p>
                  lessons{'    '}
                  <span className="text-slate-100">{liveCompletedLessonCount}</span>
                  <span className="text-[#64748b]"> / {totalLessons}</span>
                </p>
                <p>
                  project steps{'  '}
                  <span className="text-slate-100">{completedProjectSteps}</span>
                  <span className="text-[#64748b]"> / {totalProjectSteps}</span>
                </p>
                <p>
                  scenario challenges{'  '}
                  <span className="text-slate-100">{completedChallengeCount}</span>
                  <span className="text-[#64748b]"> / {totalChallenges}</span>
                </p>
              </div>
            </section>

            <section className="mt-10">
              <p className="text-xs uppercase tracking-widest text-[#64748b]"># lessons by module</p>
              <ul className="mt-3 text-xs space-y-2">
                {moduleRows.map((m) => (
                  <li key={m.slug} className="grid grid-cols-[1fr_auto_auto] gap-4 items-center">
                    <span className="text-slate-300 truncate">{m.name}</span>
                    <ProgressBar value={m.pct} />
                    <span className="text-[#64748b] tabular-nums min-w-[3rem] text-right">
                      {m.done}/{m.total}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-10">
              <p className="text-xs uppercase tracking-widest text-[#64748b]">
                # checkpoints <span className="text-slate-500">[{checkpointsDone}/{checkpointRows.length} done{checkpointsDue > 0 ? ` · ${checkpointsDue} due to review` : ''}]</span>
              </p>
              <ul className="mt-3 text-xs grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
                {checkpointRows.map((c) => (
                  <li key={c.slug} className="flex items-baseline justify-between gap-3">
                    <span className="text-slate-300 truncate">{c.slug}</span>
                    {c.due ? (
                      <span className="text-amber-400 tabular-nums shrink-0">due to review</span>
                    ) : c.done ? (
                      <span className="text-emerald-400 tabular-nums shrink-0">✓ done</span>
                    ) : (
                      <span className="text-slate-600 tabular-nums shrink-0">─</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-10">
              <p className="text-xs uppercase tracking-widest text-[#64748b]"># projects</p>
              {projectRows.length === 0 ? (
                <p className="mt-2 text-xs text-[#64748b]">no projects yet</p>
              ) : (
                <ul className="mt-3 text-xs space-y-2">
                  {projectRows.map((p) => (
                    <li key={p.slug} className="grid grid-cols-[1fr_auto_auto] gap-4 items-center">
                      <Link
                        href={`/projects/${p.slug}`}
                        className="text-slate-300 hover:text-slate-100 truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded"
                      >
                        {p.title}
                      </Link>
                      <ProgressBar value={p.pct} />
                      <span className="text-[#64748b] tabular-nums min-w-[3rem] text-right">
                        {p.done}/{p.total}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="mt-10">
              <p className="text-xs uppercase tracking-widest text-[#64748b]"># scenarios</p>
              <ul className="mt-3 text-xs space-y-2">
                {scenarioRows.map((t) => (
                  <li key={t.id} className="grid grid-cols-[1fr_auto_auto] gap-4 items-center">
                    <Link
                      href={`/projects/thread/${t.id}`}
                      className="text-slate-300 hover:text-slate-100 truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded"
                    >
                      {t.title}
                    </Link>
                    <ProgressBar value={t.pct} />
                    <span className="text-[#64748b] tabular-nums min-w-[3rem] text-right">
                      {t.done}/{t.total}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-10">
              <p className="text-xs uppercase tracking-widest text-[#64748b]">
                # review queue
                {dueCount > 0 && (
                  <span className="ml-2 text-amber-400 normal-case tracking-normal">
                    {dueCount} due
                  </span>
                )}
              </p>
              <p className="mt-1 text-[11px] text-[#64748b]">
                Spaced repetition. Re-solving due lessons from memory records your review and pushes the next review further out.
              </p>
              {reviewQueue.length === 0 ? (
                <p className="mt-3 text-xs text-[#64748b]">no completed lessons yet</p>
              ) : (
                <ul className="mt-3 text-xs space-y-1.5">
                  {reviewQueue.map((r) => (
                    <li key={r.key} className="grid grid-cols-[1fr_auto_auto] gap-4 items-baseline">
                      <Link
                        href={`/learn/${r.moduleSlug}/${r.lessonSlug}`}
                        className="text-slate-300 hover:text-slate-100 truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded"
                      >
                        {r.moduleSlug}/{r.lessonSlug}
                      </Link>
                      <span className="text-[#64748b] truncate hidden md:inline">{r.title}</span>
                      <span className={`tabular-nums ${r.due ? "text-amber-400" : "text-[#64748b]"}`}>
                        {r.due ? "due now" : daysSince(r.ts)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-[11px] text-[#64748b]">
                <Link href="/review" className="text-indigo-400 hover:underline">
                  start mixed review →
                </Link>{' '}
                · interleaved across modules, due first.
              </p>
            </section>

            {weakModules.length > 0 && (
              <section className="mt-10">
                <p className="text-xs uppercase tracking-widest text-[#64748b]"># weak modules</p>
                <p className="mt-1 text-[11px] text-[#64748b]">
                  over 0% and under 50% complete. worth a pass.
                </p>
                <ul className="mt-3 text-xs space-y-1.5">
                  {weakModules.map((m) => (
                    <li key={m.slug} className="grid grid-cols-[1fr_auto] gap-4 items-baseline">
                      <span className="text-slate-300 truncate">{m.name}</span>
                      <span className="text-rose-400 tabular-nums">{m.pct}%</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="mt-10 mb-8">
              <p className="text-xs uppercase tracking-widest text-[#64748b]"># rank ladder</p>
              <ul className="mt-3 text-xs space-y-2">
                {ladder.map((r) => {
                  const reached = xp >= r.threshold;
                  return (
                    <li key={r.name} className="grid grid-cols-[1.25rem_1fr_auto] gap-3 items-baseline">
                      <span className={reached ? 'text-emerald-400' : 'text-slate-600'}>
                        {reached ? '✓' : '·'}
                      </span>
                      <span className={reached ? 'text-slate-200' : 'text-[#64748b]'}>
                        <span>{r.name}</span>
                        <span className="ml-2 text-[#64748b]">{r.blurb}</span>
                      </span>
                      <span className="text-[#64748b] tabular-nums">
                        {r.threshold} xp
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

