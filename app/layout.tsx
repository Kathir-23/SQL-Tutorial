import type { Metadata } from 'next';
import './globals.css';
import CommandPalette from '@/components/CommandPalette';
import PopQuiz from '@/components/PopQuiz';
import { ThemeProvider } from '@/lib/theme';
import { AuthProvider } from '@/lib/auth';

const geistSans = { variable: '--font-geist-sans' };
const geistMono = { variable: '--font-geist-mono' };

export const metadata: Metadata = {
  metadataBase: new URL('https://sql-tutorial.vercel.app'),
  title: 'sql-mastery',
  description:
    "Personal SQL practice. Lessons I built while taking Advanced SQL at WCTC, kept here as reference. SQLite runs in the browser via sql.js.",
  authors: [{ name: 'Kathir' }],
  robots: { index: false, follow: false },
  openGraph: {
    title: 'sql-mastery',
    description: 'Personal SQL practice. SQLite runs in the browser via sql.js.',
    type: 'website',
    url: 'https://sql-tutorial.vercel.app',
  },
  twitter: {
    card: 'summary',
    title: 'sql-mastery',
    description: 'Personal SQL practice. SQLite runs in the browser via sql.js.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[70] focus:rounded focus:bg-slate-900 focus:px-3 focus:py-2 focus:text-indigo-400 focus:ring-2 focus:ring-indigo-400"
        >
          skip to content
        </a>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <CommandPalette />
            <PopQuiz />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
