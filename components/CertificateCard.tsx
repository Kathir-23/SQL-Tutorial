'use client';

import { useState, useEffect, useTransition } from 'react';
import { Award, Share2, Printer, Check, ExternalLink, Sparkles } from 'lucide-react';
import { generateCredentialId, buildLinkedInCertUrl, VERIFIED_SKILLS } from '@/lib/certificate';
import { useTheme } from '@/lib/theme';

interface CertificateCardProps {
  initialName?: string;
}

export default function CertificateCard({ initialName = '' }: CertificateCardProps) {
  const [learnerName, setLearnerName] = useState(initialName);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');
  const { theme } = useTheme();
  const [, startTransition] = useTransition();

  useEffect(() => {
    // Read saved learner name from localStorage if available
    const savedName = localStorage.getItem('sql-mastery-cert-name');
    if (savedName) {
      setLearnerName(savedName);
    }
    if (typeof window !== 'undefined') {
      startTransition(() => {
        setOrigin(window.location.origin);
      });
    }
  }, []);

  const handleNameChange = (newName: string) => {
    setLearnerName(newName);
    try {
      localStorage.setItem('sql-mastery-cert-name', newName);
    } catch {
      // ignore
    }
  };

  const isSample = !initialName && typeof window !== 'undefined' && !localStorage.getItem('sql-mastery-cert-name');
  
  // Format learner name: CAPITAL letters, default to user/prop or KATHIRAVAN V
  const rawName = learnerName || initialName || 'KATHIRAVAN V';
  const displayName = rawName.trim().toUpperCase();

  const credentialId = isSample ? 'SQL-PREVIEW-000000 (sample)' : generateCredentialId(displayName);
  const issueDate = isSample
    ? 'Issued when you complete all 16 modules'
    : new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

  const verificationUrl = isSample
    ? 'Sample, not valid. Cannot be verified.'
    : origin
    ? `${origin}/verify/${credentialId}`
    : `/verify/${credentialId}`;

  const linkedInUrl = buildLinkedInCertUrl({
    learnerName: displayName,
    credentialId: isSample ? 'SQL-PREVIEW-000000' : credentialId,
    verificationUrl: isSample ? 'https://sql-tutorial.vercel.app' : verificationUrl,
  });

  const handleCopyLink = async () => {
    if (isSample) return;
    try {
      await navigator.clipboard.writeText(verificationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy verification URL:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full space-y-6">
      {/* Main Certificate Display Frame */}
      <div
        id="certificate-print-area"
        className={`relative overflow-hidden rounded-lg border p-6 sm:p-10 font-mono transition-all duration-200 ${
          theme === 'light'
            ? 'bg-white border-slate-300 text-slate-900 shadow-xl'
            : 'bg-slate-950 border-slate-800 text-slate-100 shadow-2xl'
        }`}
      >
        {/* Subtle Decorative Accent Background Lines */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Certificate Header */}
        <div className="flex items-start justify-between border-b border-border/60 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-accent font-semibold uppercase tracking-widest">
              <Award className="w-4 h-4" />
              <span>Official Certificate of Completion</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">SQL Mastery</h2>
          </div>
          <div className="text-right">
            <span
              className={`inline-block px-2.5 py-1 rounded text-xs font-mono font-semibold ${
                isSample
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                  : 'bg-accent/10 text-accent border border-accent/20'
              }`}
            >
              ID: {credentialId}
            </span>
          </div>
        </div>

        {/* Recipient Body */}
        <div className="py-8 space-y-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">This certifies that</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground border-b border-border/40 pb-2 inline-block min-w-[200px] uppercase">
            {displayName}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
            has successfully completed the <strong className="text-foreground font-semibold">SQL Mastery</strong> curriculum, demonstrating hands-on proficiency in executing relational queries, optimization, and database architecture.
          </p>
        </div>

        {/* Verified Skills Grid */}
        <div className="py-4 border-t border-border/60 space-y-3">
          <p className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Verified Core Competencies:</span>
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {VERIFIED_SKILLS.map((skill, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded border border-purple-400/30 bg-purple-500/10 text-purple-900 dark:text-purple-300 font-mono text-[11px] font-medium"
              >
                ✓ {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Info & Credentials */}
        <div className="pt-6 border-t border-border/60 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
          <div>
            <span className="block font-semibold text-foreground">Issued On:</span>
            <span className={isSample ? 'text-amber-600 dark:text-amber-400 font-bold' : ''}>
              {issueDate}
            </span>
          </div>
          <div>
            <span className="block font-semibold text-foreground">Verification URL:</span>
            <span className={isSample ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-accent'}>
              {verificationUrl}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons Toolbar */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <a
          href={linkedInUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded border border-indigo-500 bg-indigo-600 text-white font-mono text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          <Share2 className="w-4 h-4" />
          <span>Add to LinkedIn Profile</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-80" />
        </a>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded border border-border bg-card text-foreground font-mono text-xs hover:bg-muted/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save PDF</span>
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded border border-border bg-card text-foreground font-mono text-xs hover:bg-muted/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">Copied Link!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              <span>Copy Verification Link</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
