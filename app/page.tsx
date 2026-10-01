"use client";

import Link from "next/link";
import Header from "@/components/Header";
import { useAuth } from "@/lib/auth";
import {
  Database,
  Terminal,
  Bot,
  Award,
  ArrowRight,
  CheckCircle2,
  BookOpen,
} from "lucide-react";

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-mono selection:bg-accent/20">
      {/* Shared Sticky Header */}
      <Header />

      {/* HERO SECTION CONTAINER: max-w 1302px, 16px padding (px-4), pt-[84px] below header */}
      <main id="main" tabIndex={-1} className="flex-1 max-w-[1302px] mx-auto w-full px-4 pt-[84px] pb-16">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-[56px] items-start">
          {/* LEFT COLUMN: Badge, Headline, Paragraph, Buttons, Checkmarks */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
              <span>100% In-Browser SQLite · 68 Interactive Lessons</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[54px] font-extrabold tracking-tight text-foreground leading-[1.18]">
              Master SQL by Writing Real Queries in Your Browser.
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-lg">
              Hands-on lessons, instant execution, zero setup, and an AI tutor to get you unstuck.
            </p>

            {/* Buttons: height 58px, horizontal padding 30px, font size 15px */}
            <div className="pt-1">
              {isAuthenticated ? (
                <Link
                  href="/learn"
                  style={{ color: '#ffffff', backgroundColor: '#7c3aed' }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-[58px] px-[30px] text-[15px] rounded-lg font-bold hover:opacity-90 transition-all shadow-sm"
                >
                  <BookOpen className="w-4 h-4" style={{ color: '#ffffff' }} />
                  <span style={{ color: '#ffffff' }}>Continue to Dashboard</span>
                  <ArrowRight className="w-4 h-4" style={{ color: '#ffffff' }} />
                </Link>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3.5 items-stretch sm:items-center">
                  <Link
                    href="/signup"
                    style={{ color: '#ffffff', backgroundColor: '#7c3aed' }}
                    className="inline-flex items-center justify-center gap-2 h-[58px] px-[30px] text-[15px] rounded-lg font-bold hover:opacity-90 transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <span style={{ color: '#ffffff' }}>Create Free Account</span>
                    <ArrowRight className="w-4 h-4" style={{ color: '#ffffff' }} />
                  </Link>

                  <Link
                    href="/learn"
                    className="inline-flex items-center justify-center gap-2 h-[58px] px-[30px] text-[15px] rounded-lg border border-border bg-card text-foreground font-semibold hover:bg-secondary/60 transition-colors shadow-sm"
                  >
                    <span>Browse Modules</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>

            {/* Checkmarks: 2 columns, 14px row gap, 40px column gap, 14px font */}
            <div className="grid grid-cols-2 gap-y-[14px] gap-x-[40px] pt-3 text-[14px] text-muted-foreground font-medium">
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> 68 Lessons</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> In-Browser SQLite</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> AI Tutor</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Verified Certificate</span>
            </div>
          </div>

          {/* RIGHT COLUMN: 2x2 Feature Boxes (17px gap, 24px padding, min-height 198px, 14px rounded corners) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[17px]">
            {/* Box 1 */}
            <div className="p-[24px] min-h-[198px] rounded-[14px] border border-border/80 bg-card hover:border-accent/40 transition-all space-y-3 shadow-sm">
              <div className="w-[42px] h-[42px] rounded-[10px] bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-[14px] font-bold text-foreground tracking-tight">Interactive SQLite Engine</h3>
              <p className="text-[13px] leading-[1.8] text-muted-foreground">
                Write queries against real company, store and school databases. No server setup.
              </p>
            </div>

            {/* Box 2 (Highlighted border matching screenshot) */}
            <div className="p-[24px] min-h-[198px] rounded-[14px] border border-accent/60 bg-card ring-1 ring-accent/30 hover:border-accent transition-all space-y-3 shadow-md">
              <div className="w-[42px] h-[42px] rounded-[10px] bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold text-xs">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="text-[14px] font-bold text-foreground tracking-tight">16 Structured Modules</h3>
              <p className="text-[13px] leading-[1.8] text-muted-foreground">
                From SELECT basics and JOINs to Window Functions and CTEs.
              </p>
            </div>

            {/* Box 3 */}
            <div className="p-[24px] min-h-[198px] rounded-[14px] border border-border/80 bg-card hover:border-accent/40 transition-all space-y-3 shadow-sm">
              <div className="w-[42px] h-[42px] rounded-[10px] bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-[14px] font-bold text-foreground tracking-tight">AI-Powered Tutor</h3>
              <p className="text-[13px] leading-[1.8] text-muted-foreground">
                Stuck? Get hints that guide you to the answer without giving it away.
              </p>
            </div>

            {/* Box 4 */}
            <div className="p-[24px] min-h-[198px] rounded-[14px] border border-border/80 bg-card hover:border-accent/40 transition-all space-y-3 shadow-sm">
              <div className="w-[42px] h-[42px] rounded-[10px] bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-[14px] font-bold text-foreground tracking-tight">Verified Credentials</h3>
              <p className="text-[13px] leading-[1.8] text-muted-foreground">
                Finish all modules to unlock your Certificate of Completion.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
