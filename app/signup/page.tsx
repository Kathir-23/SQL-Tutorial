'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, UserCheck, AlertCircle, ArrowRight, CheckCircle2, ArrowLeft, LogIn } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import ModeToggle from '@/components/ModeToggle';

export default function SignUpPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const router = useRouter();

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim() || !displayName.trim()) {
      setError('Please fill in your email, password, and display name.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    // Default legal name to display name initially
    setLegalName(displayName);
    setStep(2);
  };

  const handleStep2FinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!legalName.trim()) {
      setError('Please enter your exact legal/professional name for the certificate.');
      return;
    }

    const res = signup(email, password, legalName);
    if (!res.success) {
      setError(res.error || 'Failed to create account.');
    } else {
      router.push('/learn');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-mono text-sm selection:bg-accent/20">
      {/* Top Header Nav matching Home Page */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/95 backdrop-blur support-[backdrop-filter]:bg-background/60">
        <div className="max-w-[1302px] mx-auto px-4 h-16 flex items-center justify-between gap-4 text-xs">
          <Link href="/" className="flex items-center gap-2 font-bold text-foreground hover:opacity-90 transition-opacity">
            <span className="px-3 py-1 rounded-lg bg-accent/15 text-accent border border-accent/30 font-bold text-xs">$ sql-mastery</span>
          </Link>

          <div className="flex items-center gap-3">
            <ModeToggle />
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border/80 text-foreground hover:bg-secondary/60 transition-colors font-semibold text-xs"
            >
              <LogIn className="w-3.5 h-3.5 text-accent" />
              <span>Log In</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Wizard Form Container */}
      <main id="main" tabIndex={-1} className="flex-1 max-w-md mx-auto w-full px-6 py-12 flex flex-col justify-center">
        <div className="space-y-6">
          {/* Step Indicator Badges */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <div className={`flex-1 p-2 rounded-lg border text-center font-bold ${step === 1 ? 'bg-accent/15 border-accent text-accent' : 'bg-card border-border/60 text-muted-foreground'}`}>
              1. Account Details
            </div>
            <div className={`flex-1 p-2 rounded-lg border text-center font-bold ${step === 2 ? 'bg-accent/15 border-accent text-accent' : 'bg-card border-border/60 text-muted-foreground'}`}>
              2. Certificate Name
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Quick Account Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-accent font-semibold text-xs uppercase tracking-widest">
                  <UserCheck className="w-4 h-4" />
                  <span>Step 1 of 2 · Account Creation</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Create Your Free Account</h1>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Join SQL Mastery to save progress, track streaks, and earn official certificates.
                </p>
              </div>

              <form onSubmit={handleStep1Submit} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="name" className="block text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Display name:
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Kathiravan"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground font-mono text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="email" className="block text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Email Address:
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground font-mono text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="pass" className="block text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Password (min. 8 characters):
                  </label>
                  <input
                    id="pass"
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground font-mono text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </div>

                <button
                  type="submit"
                  style={{ color: '#ffffff', backgroundColor: '#7c3aed', borderColor: '#7c3aed' }}
                  className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold text-xs hover:opacity-90 transition-opacity shadow-sm"
                >
                  <span style={{ color: '#ffffff' }} className="font-bold">Continue to Certificate Setup</span>
                  <ArrowRight className="w-4 h-4" style={{ color: '#ffffff' }} />
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: Dedicated Certificate Name Binding */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-accent font-semibold text-xs uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Step 2 of 2 · Certificate Identity</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Certificate Legal Name Setup</h1>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Specify the exact legal or professional name that should be permanently bound to your official Certificate of Completion.
                </p>
              </div>

              <form onSubmit={handleStep2FinalSubmit} className="space-y-5">
                <div className="space-y-1">
                  <label htmlFor="legal-name" className="block text-xs uppercase tracking-wider text-accent font-semibold">
                    Legal / Certificate Name:
                  </label>
                  <input
                    id="legal-name"
                    type="text"
                    required
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    placeholder="e.g. Kathiravan"
                    className="w-full px-3 py-2 rounded-lg border border-accent bg-card text-foreground font-mono text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </div>

                {/* Preview Box */}
                <div className="p-4 rounded-xl border border-accent/30 bg-accent/10 text-center space-y-1">
                  <span className="block text-[10px] text-muted-foreground uppercase tracking-widest">Certificate Preview</span>
                  <span className="text-xl font-bold text-accent tracking-tight">{legalName || 'Your Name'}</span>
                </div>

                <div className="p-3 rounded-lg border border-border/60 bg-muted/20 text-[11px] text-muted-foreground leading-relaxed">
                  💡 <strong>Note:</strong> You will receive 1 free correction credit after registration to fix any typo before permanent certificate lock.
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-xs font-semibold hover:bg-muted transition-colors flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    style={{ color: '#ffffff', backgroundColor: '#7c3aed', borderColor: '#7c3aed' }}
                    className="flex-1 px-3 py-2.5 rounded-lg font-bold text-xs hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" style={{ color: '#ffffff' }} />
                    <span style={{ color: '#ffffff' }} className="font-bold">Confirm & Create Account</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          <p className="text-center text-xs text-muted-foreground pt-4 border-t border-border/60">
            Already have an account?{' '}
            <Link href="/login" className="text-accent hover:underline font-semibold">
              Log In
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
