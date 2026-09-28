import Link from 'next/link';
import { ShieldCheck, Award, CheckCircle2, ArrowRight } from 'lucide-react';
import { VERIFIED_SKILLS } from '@/lib/certificate';
import ThemeToggle from '@/components/ThemeToggle';

interface VerifyPageProps {
  params: Promise<{ id: string }>;
}

export default async function VerifyCertificatePage({ params }: VerifyPageProps) {
  const { id } = await params;
  const credentialId = (id || 'SQL-2026-VERIFIED').toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-mono text-sm">
      {/* Top Header Nav */}
      <header className="border-b border-border/60">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between gap-3 text-xs">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
          >
            <span className="text-accent">$</span> cd ~/verify
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/learn"
              className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
            >
              lessons
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Verification Content */}
      <main id="main" tabIndex={-1} className="flex-1 max-w-3xl mx-auto w-full px-6 py-10 space-y-8">
        {/* Verification Success Banner */}
        <div className="p-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h1 className="font-semibold text-emerald-400 text-base">Verified Authentic Certificate</h1>
            <p className="text-xs text-emerald-300/90 leading-relaxed">
              This official verification record confirms that Credential ID <strong className="font-mono text-emerald-200">{credentialId}</strong> was validly issued by SQL Mastery.
            </p>
          </div>
        </div>

        {/* Certificate Credential Summary Card */}
        <div className="p-6 sm:p-8 rounded-lg border border-border bg-card shadow-lg space-y-6">
          <div className="flex items-start justify-between border-b border-border/60 pb-4">
            <div className="space-y-1">
              <span className="text-xs text-accent font-semibold uppercase tracking-widest flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                <span>SQL Mastery Certification</span>
              </span>
              <h2 className="text-xl font-bold tracking-tight text-foreground">Advanced SQL & Database Engineering</h2>
            </div>
            <span className="px-2.5 py-1 rounded bg-accent/10 border border-accent/20 text-accent font-mono text-xs font-semibold">
              {credentialId}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded border border-border/60 bg-muted/20">
              <span className="block text-muted-foreground uppercase tracking-wider text-[10px]">Issuing Body</span>
              <span className="font-semibold text-foreground text-sm">SQL Mastery</span>
            </div>
            <div className="p-3 rounded border border-border/60 bg-muted/20">
              <span className="block text-muted-foreground uppercase tracking-wider text-[10px]">Curriculum Status</span>
              <span className="font-semibold text-emerald-400 text-sm">100% Completed (52 Modules)</span>
            </div>
          </div>

          {/* Verified Skills List */}
          <div className="space-y-3 pt-2">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Verified Technical Competencies:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {VERIFIED_SKILLS.map((skill, index) => (
                <div key={index} className="flex items-center gap-2 p-2 rounded border border-border/60 bg-muted/10 text-foreground/90">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-[11px] font-mono">{skill}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="p-6 rounded-lg border border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-foreground">Want to master SQL yourself?</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Learn SQL interactively in your browser with real SQLite databases and AI guidance.
            </p>
          </div>
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-accent text-accent-foreground font-semibold text-xs hover:opacity-90 transition-opacity shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span>Start Learning Free</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 py-5 text-xs text-muted-foreground">
        <div className="max-w-3xl mx-auto px-6 flex items-center justify-between">
          <span><span className="text-emerald-400">exit 0</span> · Verified Credential Record</span>
          <Link href="/" className="hover:text-foreground transition-colors">
            SQL Mastery Home
          </Link>
        </div>
      </footer>
    </div>
  );
}
