'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, UserCheck, AlertCircle, ArrowRight, X } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import ThemeToggle from '@/components/ThemeToggle';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim() || !name.trim()) {
      setError('Please fill in all fields (email, password, and legal certificate name).');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    // Intercept with Legal Name Confirmation Modal
    setShowConfirmModal(true);
  };

  const handleFinalConfirm = () => {
    const res = signup(email, password, name);
    if (!res.success) {
      setError(res.error || 'Failed to create account.');
      setShowConfirmModal(false);
    } else {
      setShowConfirmModal(false);
      router.push('/learn');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-mono text-sm">
      {/* Top Header Nav */}
      <header className="border-b border-border/60">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between gap-3 text-xs">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
          >
            <span className="text-accent">$</span> cd ~/signup
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
            >
              login
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Registration Form */}
      <main id="main" tabIndex={-1} className="flex-1 max-w-md mx-auto w-full px-6 py-12 flex flex-col justify-center">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-accent font-semibold text-xs uppercase tracking-widest">
              <UserCheck className="w-4 h-4" />
              <span>Create Learner Account</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Sign Up for SQL Mastery</h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Register your account to track module progress, earn badges, and lock your legal name for certificate issuance.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded border border-rose-500/40 bg-rose-500/10 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handlePreSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="email" className="block text-xs uppercase tracking-wider text-muted-foreground">
                Email Address:
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full px-3 py-2 rounded border border-border bg-card text-foreground font-mono text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="pass" className="block text-xs uppercase tracking-wider text-muted-foreground">
                Password:
              </label>
              <input
                id="pass"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded border border-border bg-card text-foreground font-mono text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50"
              />
            </div>

            <div className="space-y-1 pt-2 border-t border-border/60">
              <label htmlFor="cert-name" className="block text-xs uppercase tracking-wider text-accent font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Exact Legal Name for Certificate:</span>
              </label>
              <input
                id="cert-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Kathiravan"
                className="w-full px-3 py-2 rounded border border-border bg-card text-foreground font-mono text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50"
              />
              <p className="text-[11px] text-muted-foreground leading-normal">
                This exact name will be printed on your official Verified LinkedIn Certificate.
              </p>
            </div>

            <button
              type="submit"
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded border border-accent bg-accent text-accent-foreground font-semibold text-xs hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <span>Continue to Confirmation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground pt-4 border-t border-border/60">
            Already have an account?{' '}
            <Link href="/login" className="text-accent hover:underline font-semibold">
              Log In
            </Link>
          </p>
        </div>
      </main>

      {/* Mandatory Legal Name Double-Check Modal */}
      {showConfirmModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirm Legal Name for Certificate"
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm p-4 flex items-center justify-center animate-fadeIn"
        >
          <div className="w-full max-w-md p-6 rounded-lg border border-accent/40 bg-card shadow-2xl space-y-5 font-mono text-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-accent font-semibold text-xs uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4" />
                <span>Double-Check Certificate Name</span>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-muted-foreground hover:text-foreground rounded p-1"
                aria-label="Close Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Please check your legal name carefully before creating your account:
            </p>

            <div className="p-4 rounded border border-accent/30 bg-accent/10 text-center">
              <span className="block text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Your Certificate Name:</span>
              <span className="text-xl font-bold tracking-tight text-accent">{name}</span>
            </div>

            <div className="p-3 rounded border border-border/60 bg-muted/20 text-[11px] text-muted-foreground leading-relaxed">
              <strong>Note:</strong> You will be granted 1 free correction credit after registration to fix typos before final certificate lock.
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-3 py-2 rounded border border-border bg-muted/40 text-foreground text-xs hover:bg-muted transition-colors"
              >
                ✏️ Edit Name
              </button>
              <button
                type="button"
                onClick={handleFinalConfirm}
                className="flex-1 px-3 py-2 rounded border border-accent bg-accent text-accent-foreground font-semibold text-xs hover:opacity-90 transition-opacity"
              >
                ✓ Confirm & Register
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
