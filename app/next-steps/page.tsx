"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import CertificateCard from "@/components/CertificateCard";
import CertificateLockGate from "@/components/CertificateLockGate";
import { useProgressStore } from "@/lib/progress";
import { lessons } from "@/lib/lessons";
import { useShowcase } from "@/lib/mode";
import { ShieldCheck, Lock } from "lucide-react";

export default function NextStepsPage() {
  const { completedLessons } = useProgressStore();
  const showcase = useShowcase();

  const totalLessonsCount = lessons.length;
  const validLessonSlugs = new Set(lessons.map((l) => l.slug));
  const completedCount = new Set(completedLessons.filter((slug) => validLessonSlugs.has(slug))).size;
  const isCompleted100 = completedCount >= totalLessonsCount;

  // Allow manual override toggle for demonstration / testing in development
  const [overrideUnlocked, setOverrideUnlocked] = useState(false);

  const isUnlocked = isCompleted100 || showcase || overrideUnlocked;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-mono text-sm">
      {/* Shared Sticky Header */}
      <Header />

      <main id="main" tabIndex={-1} className="flex-1 max-w-3xl mx-auto w-full px-6 py-12 space-y-12">
        {/* Certificate Section */}
        <section>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-widest text-accent"># Course Completion & Credential</span>
              <h1 className="text-2xl font-semibold">Your Verified Certificate</h1>
              <p className="text-xs text-muted-foreground">
                Official SQL Mastery Credential of Completion and LinkedIn Integration.
              </p>
            </div>

            {/* Dev / Showcase Testing Toggle */}
            {!showcase && !isCompleted100 && (
              <button
                onClick={() => setOverrideUnlocked(!overrideUnlocked)}
                className="text-[11px] px-2.5 py-1 rounded bg-secondary text-muted-foreground hover:text-foreground border border-border/60 transition-colors flex items-center gap-1.5"
                title="Toggle unlocked preview mode"
              >
                {overrideUnlocked ? (
                  <>
                    <Lock className="w-3 h-3 text-amber-500" />
                    <span>Back to locked view</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    <span>Preview Unlocked Certificate</span>
                  </>
                )}
              </button>
            )}
          </div>

          {isUnlocked ? <CertificateCard /> : <CertificateLockGate />}
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
