"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import CertificateCard from "@/components/CertificateCard";
import { useProgressStore } from "@/lib/progress";
import { modules, lessons } from "@/lib/lessons";
import { ShieldCheck, ArrowRight, BookOpen, CheckCircle2 } from "lucide-react";

export default function NextStepsPage() {
  const { completedLessons } = useProgressStore();

  // Dynamically compute valid lesson completion count against lib/lessons.ts
  const totalLessonsCount = lessons.length;
  const validLessonSlugs = new Set(lessons.map((l) => l.slug));
  const completedCount = new Set(
    completedLessons.filter((slug) => validLessonSlugs.has(slug))
  ).size;
  const overallPercentage = Math.round((completedCount / totalLessonsCount) * 100);
  const isCompleted100 = completedCount >= totalLessonsCount;

  // Server-issued certificate state
  const [serverCertificateId, setServerCertificateId] = useState<string | null>(null);
  const [issuedAtDate, setIssuedAtDate] = useState<string | null>(null);

  useEffect(() => {
    // Read saved server cert ID if available
    const savedCertId = localStorage.getItem("sql-mastery-issued-cert-id");
    const savedCertDate = localStorage.getItem("sql-mastery-issued-cert-date");
    if (savedCertId) {
      setServerCertificateId(savedCertId);
      if (savedCertDate) setIssuedAtDate(savedCertDate);
    }

    // Attempt server certificate issuance if requirements are met
    if (isCompleted100) {
      const savedName = localStorage.getItem("sql-mastery-cert-name") || "KATHIRAVAN V";
      fetch("/api/certificate/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completedLessons,
          certificateName: savedName,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.certificateId) {
            setServerCertificateId(data.certificateId);
            const formattedDate = new Date(data.issuedAt || Date.now()).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            });
            setIssuedAtDate(formattedDate);
            try {
              localStorage.setItem("sql-mastery-issued-cert-id", data.certificateId);
              localStorage.setItem("sql-mastery-issued-cert-date", formattedDate);
            } catch {}
          }
        })
        .catch((err) => {
          console.error("Failed to fetch server issued certificate:", err);
        });
    }
  }, [completedLessons, isCompleted100]);

  // First incomplete lesson for "Continue Learning" CTA link
  const firstIncompleteLesson = lessons.find((l) => !completedLessons.includes(l.slug));
  const continueHref = firstIncompleteLesson
    ? `/learn/${firstIncompleteLesson.moduleSlug}/${firstIncompleteLesson.lessonSlug}`
    : "/learn";

  const hasServerIssuedCert = !!serverCertificateId;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-mono text-sm">
      {/* Shared Sticky Header */}
      <Header />

      <main id="main" tabIndex={-1} className="flex-1 max-w-3xl mx-auto w-full px-6 py-12 space-y-12">
        {/* Certificate Section */}
        <section className="space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-accent"># Course Completion & Credential</span>
            <h1 className="text-2xl font-semibold">Your Verified Certificate</h1>
            <p className="text-xs text-muted-foreground">
              Official SQL Mastery Credential of Completion and LinkedIn Integration.
            </p>
          </div>

          {/* Status & Progress Strip Above Certificate */}
          <div className="p-4 sm:p-5 rounded-lg border border-border/80 bg-card space-y-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {hasServerIssuedCert ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Certificate Unlocked</span>
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground font-semibold">
                    {completedCount} of {totalLessonsCount} lessons cleared
                  </span>
                )}
              </div>

              <Link
                href={continueHref}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-accent text-accent-foreground hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{hasServerIssuedCert ? "Review Lessons" : "Continue Learning"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Progress Bar: 8px tall track with light grey background (#e2e8f0 / dark:bg-slate-800) */}
            <div className="w-full bg-[#e2e8f0] dark:bg-slate-800 h-2 rounded-full overflow-hidden border border-border/30">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  hasServerIssuedCert ? "bg-emerald-500" : "bg-accent"
                }`}
                style={{ width: `${overallPercentage}%` }}
              />
            </div>
          </div>

          {/* Single Unified Certificate Display */}
          <CertificateCard
            serverCertificateId={serverCertificateId || undefined}
            issuedAtDate={issuedAtDate || undefined}
          />
        </section>

        {/* Module Completion Roadmap Section using Dashboard's exact status labels */}
        <section className="space-y-4 pt-4 border-t border-border/60">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="text-accent">$</span> Module Completion Roadmap
            </h2>
            <span className="text-xs text-muted-foreground">{modules.length} Modules Total</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {modules.map((mod, idx) => {
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
                      <h3 className="text-sm font-medium text-foreground">
                        {mod.name}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {modCompleted} / {modTotal} lessons completed
                    </p>
                  </div>

                  <div>
                    {isFinished ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>complete</span>
                      </span>
                    ) : isInProgress ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        <span>in progress</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded border border-border/40">
                        <span>not started</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="pt-6 border-t border-border/60">
          <h2 className="text-2xl font-semibold">Where this leads</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            This site teaches SQL and gives you a lot of practice against realistic data. To use SQL for real
            you connect to a real database with real tools. Here is the honest bridge from “I know the queries”
            to “I can work with a production database.”
          </p>
        </section>

        <section className="mt-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground"># what this browser sandbox cannot do</p>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            The database here is SQLite running in your browser, which is perfect for learning the language.
            But it resets on reload, holds only the sample data, and is not the engine most jobs use (that is
            usually PostgreSQL, MySQL, or SQL Server). The SQL you learned transfers almost completely; the
            setup and a few functions differ.
          </p>
        </section>

        <section className="mt-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground"># 1 · get a real database on your machine</p>
          <ul className="mt-4 space-y-2 text-muted-foreground leading-relaxed">
            <li>Easiest start: <a href="https://www.sqlite.org/download.html" className="text-accent hover:underline">SQLite</a>. It is a single file, no server, and the same dialect you used here.</li>
            <li>The most common job database: <a href="https://www.postgresql.org/download/" className="text-accent hover:underline">PostgreSQL</a>. Free, powerful, everywhere.</li>
            <li>A free, friendly client to run queries against either: <a href="https://dbeaver.io/" className="text-accent hover:underline">DBeaver</a>.</li>
          </ul>
        </section>

        <section className="mt-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground"># 2 · load some real data</p>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Grab a CSV you care about (a public dataset, your bank export, anything) and import it as a table in
            DBeaver, then query it. Running your own questions against data you actually care about is where it
            clicks.
          </p>
        </section>

        <section className="mt-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground"># 3 · learn what changes on a real engine</p>
          <ul className="mt-4 space-y-2 text-muted-foreground leading-relaxed">
            <li>Connecting: a host, port, username, and password instead of a file in your browser.</li>
            <li>Transactions and concurrency: many people writing at once, which the in-browser toy never has to handle.</li>
            <li>Performance at scale: indexes and query plans matter for real once a table has millions of rows (the Performance module is your starting point).</li>
            <li>Small dialect differences in date and string functions. The core (SELECT, JOIN, GROUP BY, window functions) is identical.</li>
          </ul>
        </section>

        <section className="mt-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground"># 4 · build something with it</p>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Design a small database for something you know (a book collection, a budget, a side project), create
            the tables, put data in, and answer real questions with queries. Pair it with a bit of Python and you
            can pull data, store it, and report on it. You learn ten times more from one real project than from
            another tutorial.
          </p>
        </section>

        <section className="mt-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground"># free places to keep going</p>
          <ul className="mt-4 space-y-2 text-muted-foreground leading-relaxed">
            <li><a href="https://pgexercises.com/" className="text-accent hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">PostgreSQL Exercises</a>, practice problems against a real Postgres dataset.</li>
            <li><a href="https://www.postgresql.org/docs/current/tutorial.html" className="text-accent hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">The PostgreSQL tutorial</a>, official, accurate, the source of truth.</li>
            <li><a href="https://roadmap.sh/sql" className="text-accent hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">roadmap.sh/sql</a>, a visual map of what to learn next.</li>
            <li>Also learning Python? <a href="https://damato-python.vercel.app" className="text-accent hover:underline">the Python version of this site</a>. The two pair up well.</li>
          </ul>
        </section>

        <p className="mt-12 text-muted-foreground leading-relaxed">
          Becoming genuinely good at this takes months of querying real data and getting stuck. That is normal.
          The language you learned here is the hard part and you already have it. Keep going.
        </p>
      </main>

      <footer className="border-t border-border/60 py-5 text-xs">
        <div className="max-w-3xl mx-auto px-6 flex flex-wrap items-center justify-between gap-3 text-muted-foreground">
          <span><span className="text-success">exit 0</span> · keep querying</span>
          <Link href="/learn" className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded">back to lessons</Link>
        </div>
      </footer>
    </div>
  );
}
