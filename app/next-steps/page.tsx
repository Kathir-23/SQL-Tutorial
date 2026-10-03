"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import CertificateCard from "@/components/CertificateCard";
import { useProgressStore } from "@/lib/progress";
import { lessons } from "@/lib/lessons";
import { useAuth } from "@/lib/auth";

export default function NextStepsPage() {
  const { completedLessons } = useProgressStore();
  const { user, isAuthenticated } = useAuth();

  const totalLessonsCount = lessons.length;
  const validLessonSlugs = new Set(lessons.map((l) => l.slug));
  const completedCount = new Set(
    completedLessons.filter((slug) => validLessonSlugs.has(slug))
  ).size;
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

    // Attempt server certificate issuance ONLY if student is authenticated and has finished 100%
    if (isCompleted100 && isAuthenticated && user) {
      fetch("/api/certificate/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completedLessons,
          userId: user.id,
          email: user.email,
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
  }, [completedLessons, isCompleted100, isAuthenticated, user]);

  const hasServerIssuedCert = !!serverCertificateId;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-mono text-sm">
      {/* Shared Sticky Header */}
      <Header />

      <main id="main" tabIndex={-1} className="flex-1 max-w-3xl mx-auto w-full px-6 pt-4 pb-8 space-y-6">
        {/* Certificate Section */}
        <section className="space-y-3">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-accent"># Course Completion & Credential</span>
            <h1 className="text-2xl font-semibold">Your Verified Certificate</h1>
            <p className="text-xs text-muted-foreground">
              {hasServerIssuedCert
                ? "Congratulations, your certificate is unlocked."
                : "Finish all 16 modules to unlock your official certificate."}
            </p>
          </div>

          {/* Single Unified Certificate Display */}
          <CertificateCard
            serverCertificateId={serverCertificateId || undefined}
            issuedAtDate={issuedAtDate || undefined}
          />
        </section>

        {/* "Where this leads" Section — shown ONLY after student has completed all 16 modules & has a real certificate */}
        {hasServerIssuedCert && (
          <div className="space-y-10 pt-6 border-t border-border/60">
            <section>
              <h2 className="text-2xl font-semibold">Where this leads</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                This site teaches SQL and gives you a lot of practice against realistic data. To use SQL for real
                you connect to a real database with real tools. Here is the honest bridge from “I know the queries”
                to “I can work with a production database.”
              </p>
            </section>

            <section>
              <p className="text-xs uppercase tracking-widest text-muted-foreground"># what this browser sandbox cannot do</p>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                The database here is SQLite running in your browser, which is perfect for learning the language.
                But it resets on reload, holds only the sample data, and is not the engine most jobs use (that is
                usually PostgreSQL, MySQL, or SQL Server). The SQL you learned transfers almost completely; the
                setup and a few functions differ.
              </p>
            </section>

            <section>
              <p className="text-xs uppercase tracking-widest text-muted-foreground"># 1 · get a real database on your machine</p>
              <ul className="mt-4 space-y-2 text-muted-foreground leading-relaxed">
                <li>
                  Easiest start:{" "}
                  <a
                    href="https://www.sqlite.org/download.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    SQLite
                  </a>
                  . It is a single file, no server, and the same dialect you used here.
                </li>
                <li>
                  The most common job database:{" "}
                  <a
                    href="https://www.postgresql.org/download/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    PostgreSQL
                  </a>
                  . Free, powerful, everywhere.
                </li>
                <li>
                  A free, friendly client to run queries against either:{" "}
                  <a
                    href="https://dbeaver.io/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    DBeaver
                  </a>
                  .
                </li>
              </ul>
            </section>

            <section>
              <p className="text-xs uppercase tracking-widest text-muted-foreground"># 2 · load some real data</p>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Grab a CSV you care about (a public dataset, your bank export, anything) and import it as a table in
                DBeaver, then query it. Running your own questions against data you actually care about is where it
                clicks.
              </p>
            </section>

            <section>
              <p className="text-xs uppercase tracking-widest text-muted-foreground"># 3 · learn what changes on a real engine</p>
              <ul className="mt-4 space-y-2 text-muted-foreground leading-relaxed">
                <li>Connecting: a host, port, username, and password instead of a file in your browser.</li>
                <li>Transactions and concurrency: many people writing at once, which the in-browser toy never has to handle.</li>
                <li>Performance at scale: indexes and query plans matter for real once a table has millions of rows (the Performance module is your starting point).</li>
                <li>Small dialect differences in date and string functions. The core (SELECT, JOIN, GROUP BY, window functions) is identical.</li>
              </ul>
            </section>

            <section>
              <p className="text-xs uppercase tracking-widest text-muted-foreground"># 4 · build something with it</p>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Design a small database for something you know (a book collection, a budget, a side project), create
                the tables, put data in, and answer real questions with queries. Pair it with a bit of Python and you
                can pull data, store it, and report on it. You learn ten times more from one real project than from
                another tutorial.
              </p>
            </section>

            <section>
              <p className="text-xs uppercase tracking-widest text-muted-foreground"># free places to keep going</p>
              <ul className="mt-4 space-y-2 text-muted-foreground leading-relaxed">
                <li>
                  <a
                    href="https://pgexercises.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    PostgreSQL Exercises
                  </a>
                  , practice problems against a real Postgres dataset.
                </li>
                <li>
                  <a
                    href="https://www.postgresql.org/docs/current/tutorial.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    The PostgreSQL tutorial
                  </a>
                  , official, accurate, the source of truth.
                </li>
                <li>
                  <a
                    href="https://roadmap.sh/sql"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    roadmap.sh/sql
                  </a>
                  , a visual map of what to learn next.
                </li>
                <li>
                  Also learning Python?{" "}
                  <a
                    href="https://damato-python.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    the Python version of this site
                  </a>
                  . The two pair up well.
                </li>
              </ul>
            </section>

            <p className="mt-12 text-muted-foreground leading-relaxed">
              Becoming genuinely good at this takes months of querying real data and getting stuck. That is normal.
              The language you learned here is the hard part and you already have it. Keep going.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
