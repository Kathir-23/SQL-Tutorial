'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ModeToggle from '@/components/ModeToggle';
import { useAuth } from '@/lib/auth';
import { User, LogIn, UserPlus } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  const navLinks = [
    { name: 'dashboard', href: '/learn' },
    { name: 'projects', href: '/projects' },
    { name: 'playground', href: '/playground' },
    { name: 'stats', href: '/stats' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/95 backdrop-blur support-[backdrop-filter]:bg-background/60">
      <div className="max-w-[1302px] mx-auto px-4 h-16 flex items-center justify-between gap-4 text-xs font-mono">
        {/* Left: Logo linking to /learn when authenticated, or / when guest */}
        <Link
          href={isAuthenticated ? '/learn' : '/'}
          className="flex items-center gap-2 font-bold text-foreground hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg"
        >
          <span className="px-3 py-1 rounded-lg bg-accent/15 text-accent border border-accent/30 font-bold text-xs">
            $ sql-mastery
          </span>
        </Link>

        {/* Right Nav */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-4">
              {/* Logged-In Nav Links */}
              <nav className="flex items-center gap-3 text-xs">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href || (link.href === '/learn' && pathname.startsWith('/learn'));
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`transition-colors hover:text-foreground ${
                        isActive
                          ? 'font-bold text-foreground text-accent'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {isActive ? `> ${link.name}` : link.name}
                    </Link>
                  );
                })}
              </nav>

              {/* Profile Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/15 text-accent border border-accent/30 font-bold text-xs">
                <User className="w-3.5 h-3.5" />
                <span>{user.certificateName}</span>
              </div>

              <ModeToggle />
            </div>
          ) : (
            /* Logged-Out Nav */
            <div className="flex items-center gap-3">
              <ModeToggle />
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border/80 text-foreground hover:bg-secondary/60 transition-colors font-semibold text-xs"
              >
                <LogIn className="w-3.5 h-3.5 text-accent" />
                <span>Log In</span>
              </Link>
              <Link
                href="/signup"
                style={{ color: '#ffffff', backgroundColor: '#7c3aed' }}
                className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-lg font-bold hover:opacity-90 transition-opacity shadow-sm text-xs"
              >
                <UserPlus className="w-3.5 h-3.5" style={{ color: '#ffffff' }} />
                <span style={{ color: '#ffffff' }}>Start Free</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
