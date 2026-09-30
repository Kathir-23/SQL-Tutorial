'use client';

import { useState } from 'react';
import Link from 'next/link';
import { UserPlus, LogIn, X, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface GuestConversionModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonTitle?: string;
}

export default function GuestConversionModal({ isOpen, onClose, lessonTitle }: GuestConversionModalProps) {
  const { isAuthenticated } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  // If user is already authenticated or user dismissed modal, do not show
  if (isAuthenticated || !isOpen || dismissed) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm p-4 flex items-center justify-center animate-fadeIn font-mono text-sm"
    >
      <div className="w-full max-w-md p-6 rounded-lg border border-accent/40 bg-card shadow-2xl space-y-5 relative">
        <button
          onClick={() => {
            setDismissed(true);
            onClose();
          }}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground rounded p-1"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Lesson Completed!</span>
          </div>

          <h2 className="text-xl font-bold text-foreground tracking-tight">
            Save Your Progress & Earn Certificate
          </h2>

          <p className="text-xs text-muted-foreground leading-relaxed">
            {lessonTitle ? `Great job completing "${lessonTitle}"!` : 'Great job completing this lesson!'} Create a free account now to save your streak, track completed modules, and lock your certificate name.
          </p>
        </div>

        <div className="p-3 rounded border border-border/60 bg-muted/20 text-[11px] text-muted-foreground space-y-1">
          <div className="font-semibold text-foreground">Why create an account?</div>
          <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
            <li>Save progress across 52 core lessons</li>
            <li>Unlock daily AI Tutor query credits</li>
            <li>Official LinkedIn-verified certificate</li>
          </ul>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Link
            href="/signup"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-accent text-accent-foreground font-bold text-xs hover:opacity-90 transition-opacity shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Free Account</span>
          </Link>

          <div className="flex items-center justify-between gap-2 pt-1 text-xs">
            <Link href="/login" className="text-accent hover:underline flex items-center gap-1">
              <LogIn className="w-3.5 h-3.5" />
              <span>Already have an account? Log In</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setDismissed(true);
                onClose();
              }}
              className="text-muted-foreground hover:text-foreground text-[11px]"
            >
              Continue as Guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
