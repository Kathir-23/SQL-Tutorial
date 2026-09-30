'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import ThemeToggle from '@/components/ThemeToggle';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    const res = login(email, password);
    if (!res.success) {
      setError(res.error || 'Invalid credentials.');
    } else {
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
            <span className="text-accent">$</span> cd ~/login
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/signup"
              className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
            >
              signup
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Login Form */}
      <main id="main" tabIndex={-1} className="flex-1 max-w-md mx-auto w-full px-6 py-12 flex flex-col justify-center">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-accent font-semibold text-xs uppercase tracking-widest">
              <LogIn className="w-4 h-4" />
              <span>Learner Authentication</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Log In to Your Account</h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Enter your credentials to continue your SQL learning progress and access your locked certificate options.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded border border-rose-500/40 bg-rose-500/10 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded border border-border bg-card text-foreground font-mono text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded border border-accent bg-accent text-accent-foreground font-semibold text-xs hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <span>Log In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground pt-4 border-t border-border/60">
            Don&apos;t have an account yet?{' '}
            <Link href="/signup" className="text-accent hover:underline font-semibold">
              Sign Up
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
