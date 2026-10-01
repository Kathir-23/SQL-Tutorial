"use client";

import Link from "next/link";
import { useProgressStore } from "@/lib/progress";
import { modules, lessons } from "@/lib/lessons";
import { CheckCircle2, Lock, ArrowRight, BookOpen, ShieldAlert } from "lucide-react";

export default function CertificateLockGate() {
  const { completedLessons } = useProgressStore();

  // Core curriculum lessons (all lessons in our curriculum)
  const totalLessonsCount = lessons.length;
  const completedCount = lessons.filter((l) => completedLessons.includes(l.slug)).length;
  const overallPercentage = Math.round((completedCount / totalLessonsCount) * 100);

  // Find first incomplete lesson to jump to
  const firstIncompleteLesson = lessons.find((l) => !completedLessons.includes(l.slug));
  const continueHref = firstIncompleteLesson
    ? `/learn/${firstIncompleteLesson.moduleSlug}/${firstIncompleteLesson.lessonSlug}`
    : "/learn";

  return (
    <div className="space-y-8 font-mono">
      {/* Locked Header Card */}
      <div className="relative overflow-hidden rounded-lg border border-border/80 bg-card p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Lock className="w-3.5 h-3.5" />
              <span>Pillar 2 · Locked Completion Gate</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Official Certificate Locked
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
              To guarantee 100% proof-of-work credibility for recruiters and employers, official certificates of completion require clearing all 16 core modules.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end justify-center min-w-[200px] p-4 rounded-md bg-secondary/40 border border-border/40">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Overall Progress</span>
            <span className="text-3xl font-extrabold text-foreground mt-1">
              {overallPercentage}%
            </span>
            <span className="text-xs text-muted-foreground mt-0.5">
              {completedCount} of {totalLessonsCount} lessons cleared
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 space-y-2">
          <div className="w-full bg-secondary h-3 rounded-full overflow-hidden p-0.5 border border-border/40">
            <div
              className="bg-accent h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.max(overallPercentage, 2)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0% (Enrolled)</span>
            <span>50% (Intermediate)</span>
            <span>100% (Certificate Unlocked)</span>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-6 pt-6 border-t border-border/60 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Complete {totalLessonsCount - completedCount} more lesson{totalLessonsCount - completedCount === 1 ? '' : 's'} to unlock your certificate</span>
          </div>

          <Link
            href={continueHref}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded text-xs font-semibold bg-accent text-accent-foreground hover:opacity-90 transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <BookOpen className="w-4 h-4" />
            <span>Continue Learning</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 10-Module Progression Matrix */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <span className="text-accent">$</span> Module Completion Roadmap
          </h3>
          <span className="text-xs text-muted-foreground">{modules.length} Modules Total</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {modules.map((mod, idx) => {
            // Find lessons belonging to this module
            const modLessons = lessons.filter((l) => l.moduleSlug === mod.slug);
            const modTotal = modLessons.length;
            const modCompleted = modLessons.filter((l) => completedLessons.includes(l.slug)).length;
            const isFinished = modTotal > 0 && modCompleted === modTotal;
            const isInProgress = modCompleted > 0 && !isFinished;

            return (
              <div
                key={mod.slug}
                className={`p-4 rounded border transition-colors flex items-start justify-between gap-3 ${
                  isFinished
                    ? "bg-emerald-500/5 border-emerald-500/20"
                    : isInProgress
                    ? "bg-accent/5 border-accent/30"
                    : "bg-card border-border/60 text-muted-foreground"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground">
                      M{idx + 1}
                    </span>
                    <h4 className="text-sm font-medium text-foreground">
                      {mod.name}
                    </h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {modCompleted} / {modTotal} lessons completed
                  </p>
                </div>

                <div>
                  {isFinished ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Done</span>
                    </span>
                  ) : isInProgress ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                      <span>In Progress</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded border border-border/40">
                      <Lock className="w-3 h-3" />
                      <span>Locked</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
