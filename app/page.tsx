"use client";

import Link from "next/link";
import { useState } from "react";
import HomeTerminal from "@/components/HomeTerminal";
import ModeToggle from "@/components/ModeToggle";
import DownloadNotesButton from "@/components/DownloadNotesButton";
import { getAllModules, getModuleBySlug, getModuleLessons } from "@/lib/lessons";
import { useShowcase } from "@/lib/mode";
import { useAuth } from "@/lib/auth";
import {
  Sparkles,
  Terminal,
  Database,
  Award,
  Bot,
  ArrowRight,
  CheckCircle2,
  LogIn,
  UserPlus,
  User,
  BookOpen,
} from "lucide-react";

const MODULE_DESCRIPTIONS: Record<string, string> = {
  "start-here": "New to all this? Start at zero.",
  "getting-started": "SELECT, WHERE, ORDER BY.",
  "data-analysis": "Aggregates, GROUP BY, HAVING.",
  "joining-tables": "INNER, LEFT, self-joins.",
  "subqueries-ctes": "Nested queries and WITH clauses.",
  "modifying-data": "INSERT, UPDATE, DELETE.",
  "functions": "String, date, math.",
  "window-functions": "RANK, LAG, running totals.",
  "database-objects": "Views, indexes, constraints.",
  "advanced": "Recursive CTEs, pivot, optimization.",
  "school-advanced": "Course notes: procs, dynamic SQL, JSON.",
  "set-design": "UNION/INTERSECT/EXCEPT, normalization, keys.",
  "window-advanced": "Frames, NTILE, FIRST_VALUE.",
  "recursive-queries": "Walk hierarchies and trees.",
  "performance-indexing": "EXPLAIN plans and useful indexes.",
  "capstone": "Put every piece together.",
};

const modules = getAllModules().map((m, i) => {
  const lessons = getModuleLessons(m.slug);
  return {
    num: String(i + 1).padStart(2, "0"),
    slug: m.slug,
    firstLesson: lessons[0]?.lessonSlug ?? "",
    title: m.slug,
    name: m.name,
    desc: MODULE_DESCRIPTIONS[m.slug] ?? "",
    lessons: lessons.length,
  };
});

interface PersistedProgress {
  state?: { completedLessons?: string[] };
}

function loadCompletedLessons(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem("sql-mastery-progress");
    if (!raw) return new Set();
    const parsed: PersistedProgress = JSON.parse(raw);
    return new Set(parsed.state?.completedLessons ?? []);
  } catch {
    return new Set();
  }
}

export default function HomePage() {
  const [completed] = useState(loadCompletedLessons);
  const showcase = useShowcase();
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-mono text-sm selection:bg-accent/20">
      {/* Sticky Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/95 backdrop-blur support-[backdrop-filter]:bg-background/60">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between gap-4 text-xs">
          <Link href="/" className="flex items-center gap-2 font-bold text-foreground hover:opacity-90 transition-opacity">
            <span className="px-2 py-0.5 rounded bg-accent/15 text-accent border border-accent/30">$ sql-mastery</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-muted-foreground">
            <a href="#curriculum" className="hover:text-foreground transition-colors">modules</a>
            <Link href="/playground" className="hover:text-foreground transition-colors">playground</Link>
            <Link href="/projects" className="hover:text-foreground transition-colors">projects</Link>
            <Link href="/glossary" className="hover:text-foreground transition-colors">glossary</Link>
          </nav>

          <div className="flex items-center gap-3">
            <ModeToggle />
            {isAuthenticated && user ? (
              <Link
                href="/learn"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-accent text-accent-foreground font-semibold hover:opacity-90 transition-opacity"
              >
                <User className="w-3.5 h-3.5" />
                <span>Dashboard →</span>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-border/80 text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5 text-accent" />
                  <span>Log In</span>
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-accent text-accent-foreground font-semibold hover:opacity-90 transition-opacity shadow-sm"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Start Free</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="flex-1 max-w-5xl mx-auto w-full px-6 py-12 space-y-16">
        {/* HERO SECTION */}
        <section className="text-center space-y-6 pt-6 md:pt-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>100% In-Browser SQLite WASM · 52 Interactive Lessons</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15] max-w-3xl mx-auto">
            Master SQL by Writing Real Queries in Your Browser.
          </h1>

          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Learn database engineering through 52 hands-on lessons with instant SQLite execution, zero setup, AI query assistance, and official LinkedIn-verified credentials.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            {isAuthenticated ? (
              <Link
                href="/learn"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-accent text-accent-foreground font-bold text-sm hover:opacity-90 transition-all shadow-md"
              >
                <BookOpen className="w-4 h-4" />
                <span>Continue to Learning Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-accent text-accent-foreground font-bold text-sm hover:opacity-90 transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create Free Account</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/learn/start-here/welcome"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-md border border-border bg-card text-foreground font-medium text-sm hover:bg-secondary/60 transition-colors"
                >
                  <Terminal className="w-4 h-4 text-accent" />
                  <span>Try Lesson 1 as Guest →</span>
                </Link>
              </>
            )}
          </div>

          {/* Feature Trust Chips */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 52 Core Lessons</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> In-Browser SQLite</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> AI Tutor Dock</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> LinkedIn Verified Certificate</span>
          </div>
        </section>

        {/* FEATURE SPOTLIGHT GRID */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-lg border border-border/80 bg-card/60 space-y-3">
            <div className="w-9 h-9 rounded bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Interactive SQLite Engine</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Write queries directly against real company, store, and school databases using WebAssembly. No database server configuration required.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border/80 bg-card/60 space-y-3">
            <div className="w-9 h-9 rounded bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <Terminal className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">10 Structured Modules</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              From SELECT basics and multi-table JOINs to Window Functions, CTEs, Stored Procedures, and Query Execution Performance Tuning.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border/80 bg-card/60 space-y-3">
            <div className="w-9 h-9 rounded bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">AI-Powered Tutor</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Stuck on a query? The integrated Google Gemini AI tutor provides contextual hints and guides you to the correct syntax without giving away answers.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border/80 bg-card/60 space-y-3">
            <div className="w-9 h-9 rounded bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">LinkedIn-Verified Credentials</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Complete all 10 modules to unlock your official Certificate of Completion with permanent legal name binding and 1-click LinkedIn profile integration.
            </p>
          </div>
        </section>

        {/* EMBEDDED INTERACTIVE TERMINAL PROMPT */}
        <section className="p-6 rounded-lg border border-border/80 bg-card space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-accent uppercase tracking-wider"># Interactive Command Shell</span>
            <span className="text-xs text-muted-foreground">// type `help` or module slug</span>
          </div>
          <HomeTerminal modules={modules} />
        </section>

        {/* CURRICULUM OVERVIEW SECTION */}
        <section id="curriculum" className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <span className="text-accent">$</span> Curriculum Modules ({modules.length})
            </h2>
            <span className="text-xs text-muted-foreground">Select any module to start learning</span>
          </div>

          <ul className="border-y border-border/60 divide-y divide-border/40">
            {modules.map((m) => {
              const doneCount = showcase
                ? m.lessons
                : Array.from(completed).filter((k) =>
                    k === m.slug || k.startsWith(`${m.slug}/`)
                  ).length;
              const status = doneCount === 0
                ? "─"
                : doneCount >= m.lessons
                ? "✓ complete"
                : `${doneCount}/${m.lessons}`;
              const statusClass = doneCount >= m.lessons
                ? "text-emerald-500"
                : doneCount > 0
                ? "text-accent"
                : "text-muted-foreground";
              return (
                <li key={m.slug} className="flex items-center gap-1">
                  <Link
                    href={`/learn/${m.slug}/${m.firstLesson}`}
                    className="group grid flex-1 grid-cols-[2.5rem_minmax(0,1fr)_5rem_7rem_1rem] gap-3 items-center py-3 px-2 -ml-2 rounded hover:bg-card/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    aria-label={`Open module: ${m.name}`}
                  >
                    <span className="text-muted-foreground font-bold">{m.num}</span>
                    <span className="min-w-0 truncate">
                      <span className="text-foreground font-semibold">modules/{m.title}/</span>
                      <span className="text-muted-foreground hidden md:inline"> {m.desc}</span>
                    </span>
                    <span className="text-muted-foreground text-xs">{m.lessons} lessons</span>
                    <span className={`text-xs ${statusClass}`}>{status}</span>
                    <span className="text-muted-foreground group-hover:text-accent transition-colors">→</span>
                  </Link>
                  {(() => {
                    const mi = getModuleBySlug(m.slug);
                    const ml = getModuleLessons(m.slug);
                    return mi ? (
                      <DownloadNotesButton moduleInfo={mi} lessons={ml} compact />
                    ) : null;
                  })()}
                </li>
              );
            })}
          </ul>
        </section>
      </main>

      <footer className="border-t border-border/60 py-6 text-xs mt-12">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4 text-muted-foreground">
          <span>
            <span className="text-emerald-500 font-bold">exit 0</span> · SQL Mastery LMS · Next.js + SQLite WASM
          </span>
          <span className="flex flex-wrap gap-x-4 gap-y-1">
            <Link href="/learn" className="hover:text-foreground transition-colors">dashboard</Link>
            <Link href="/glossary" className="hover:text-foreground transition-colors">glossary</Link>
            <Link href="/next-steps" className="hover:text-foreground transition-colors">certificate</Link>
            <Link href="/playground" className="hover:text-foreground transition-colors">playground</Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
