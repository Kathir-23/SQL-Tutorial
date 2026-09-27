'use client';

import { useTheme } from '@/lib/theme';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="inline-flex items-center gap-0 font-mono text-xs px-2 py-1 rounded border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
      style={{
        borderColor: theme === 'dark' ? '#334155' : '#cbd5e1',
        background: theme === 'dark' ? 'transparent' : 'transparent',
        color: theme === 'dark' ? '#64748b' : '#64748b',
      }}
    >
      <span style={{ color: theme === 'dark' ? '#6366f1' : '#7c3aed' }}>--</span>
      <span>&nbsp;</span>
      <span style={{ color: theme === 'dark' ? '#94a3b8' : '#475569' }}>
        {theme === 'dark' ? 'dark' : 'light'}
      </span>
    </button>
  );
}
