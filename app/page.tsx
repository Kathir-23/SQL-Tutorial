"use client";

import Link from "next/link";
import ModeToggle from "@/components/ModeToggle";
import { useAuth } from "@/lib/auth";
import {
  Database,
  Terminal,
  Bot,
  Award,
  ArrowRight,
  CheckCircle2,
  LogIn,
  UserPlus,
  User,
  BookOpen,
} from "lucide-react";

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-mono text-sm selection:bg-accent/20">
      {/* Sticky Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/95 backdrop-blur support-[backdrop-filter]:bg-background/60">
        <div className="max-w-[1240px] mx-auto px-6 md:px-10 h-16 flex items-center justify-between gap-4 text-xs">
          <Link href="/" className="flex items-center gap-2 font-bold text-foreground hover:opacity-90 transition-opacity">
            <span className="px-3 py-1 rounded-lg bg-accent/15 text-accent border border-accent/30 font-bold text-xs">$ sql-mastery</span>
          </Link>

          <div className="flex items-center gap-3">
            <ModeToggle />
            {isAuthenticated && user ? (
              <Link
                href="/learn"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-accent-foreground font-semibold hover:opacity-90 transition-opacity text-xs"
              >
                <User className="w-3.5 h-3.5" />
                <span>Dashboard →</span>
              </Link>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border/80 text-foreground hover:bg-secondary/60 transition-colors font-semibold text-xs"
                >
                  <LogIn className="w-3.5 h-3.5 text-accent" />
                  <span>Log In</span>
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-lg bg-accent text-accent-foreground font-bold hover:opacity-90 transition-opacity shadow-sm text-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Start Free</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 100% ZOOM EXACT VIEWPORT CONTAINER */}
      <main id="main" tabIndex={-1} className="flex-1 max-w-[1240px] mx-auto w-full px-6 md:px-10 py-10 md:py-16 flex flex-col justify-center">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* LEFT COLUMN: Headline, Subheadline, CTAs & Checkmarks */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
              <span>100% In-Browser SQLite · 52 Interactive Lessons</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-tight text-foreground leading-[1.16]">
              Master SQL by Writing Real Queries in Your Browser.
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-lg">
              Hands-on lessons, instant execution, zero setup, and an AI tutor to get you unstuck.
            </p>

            {/* CTAs */}
            <div className="pt-1">
              {isAuthenticated ? (
                <Link
                  href="/learn"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-accent text-accent-foreground font-bold text-xs hover:opacity-90 transition-all shadow-sm"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Continue to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3.5 items-stretch sm:items-center">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-accent text-accent-foreground font-bold text-xs hover:opacity-90 transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <span>Create Free Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/learn"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg border border-border bg-card text-foreground font-semibold text-xs hover:bg-secondary/60 transition-colors shadow-sm"
                  >
                    <span>Browse Modules</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>

            {/* Checkmark Grid */}
            <div className="grid grid-cols-2 gap-y-2.5 gap-x-6 pt-3 text-xs text-muted-foreground font-medium">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> 52 Lessons</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> In-Browser SQLite</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> AI Tutor</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Verified Certificate</span>
            </div>
          </div>

          {/* RIGHT COLUMN: 2x2 Feature Grid (Matching Screenshot Layout) */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
            {/* Card 1 */}
            <div className="p-5 md:p-6 rounded-2xl border border-border/80 bg-card hover:border-accent/40 transition-all space-y-3 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                <Database className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-xs font-bold text-foreground tracking-tight">Interactive SQLite Engine</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Write queries against real company, store and school databases. No server setup.
              </p>
            </div>

            {/* Card 2 (Highlighted border matching screenshot) */}
            <div className="p-5 md:p-6 rounded-2xl border border-accent/60 bg-card ring-1 ring-accent/30 hover:border-accent transition-all space-y-3 shadow-md">
              <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold text-xs">
                <Terminal className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-xs font-bold text-foreground tracking-tight">10 Structured Modules</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                From SELECT basics and JOINs to Window Functions and CTEs.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-5 md:p-6 rounded-2xl border border-border/80 bg-card hover:border-accent/40 transition-all space-y-3 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                <Bot className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-xs font-bold text-foreground tracking-tight">AI-Powered Tutor</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Stuck? Get hints that guide you to the answer without giving it away.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-5 md:p-6 rounded-2xl border border-border/80 bg-card hover:border-accent/40 transition-all space-y-3 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                <Award className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-xs font-bold text-foreground tracking-tight">Verified Credentials</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Finish all modules to unlock your Certificate of Completion.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 py-5 text-xs">
        <div className="max-w-[1240px] mx-auto px-6 md:px-10 flex flex-wrap items-center justify-between gap-4 text-muted-foreground">
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
