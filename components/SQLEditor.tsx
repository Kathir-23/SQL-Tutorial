'use client';

import { useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/lib/theme';
import type { Monaco } from '@monaco-editor/react';

// Dynamic import Monaco to prevent SSR issues
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then(mod => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="h-[200px] bg-slate-900 rounded flex items-center justify-center font-mono text-xs text-slate-500">
        loading editor…
      </div>
    ),
  }
);

interface SQLEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun: () => void;
  onReset?: () => void;
  readOnly?: boolean;
  height?: string;
  initialValue?: string;
  isRunning?: boolean;
}

// Register a premium light theme that matches the mockup
function registerLightTheme(monaco: Monaco) {
  monaco.editor.defineTheme('sql-light', {
    base: 'vs',
    inherit: true,
    rules: [
      // SQL keywords — deep indigo/purple
      { token: 'keyword', foreground: '4f46e5', fontStyle: 'bold' },
      { token: 'keyword.sql', foreground: '4f46e5', fontStyle: 'bold' },
      // Identifiers / table names — royal blue
      { token: 'identifier', foreground: '0369a1' },
      // Strings — forest green
      { token: 'string', foreground: '15803d' },
      { token: 'string.sql', foreground: '15803d' },
      // Numbers — amber
      { token: 'number', foreground: 'b45309' },
      // Comments — muted gray-blue italic
      { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
      // Operators
      { token: 'operator', foreground: '7c3aed' },
      // Default text — dark slate
      { token: '', foreground: '1e293b' },
    ],
    colors: {
      // Pure white crisp background
      'editor.background': '#ffffff',
      'editor.foreground': '#1e293b',
      // Current line highlight — disabled text row background/border (Option 1)
      'editor.lineHighlightBackground': '#00000000',
      'editor.lineHighlightBorder': '#00000000',
      // Hide overview ruler marks (removes dark dash on right margin)
      'editorOverviewRuler.currentLineForeground': '#00000000',
      'editorOverviewRuler.border': '#00000000',
      'editorOverviewRuler.background': '#00000000',
      // Selection
      'editor.selectionBackground': '#c7d2fe',
      'editor.inactiveSelectionBackground': '#e0e7ff',
      // Cursor
      'editorCursor.foreground': '#4f46e5',
      // Line numbers (Option 1: line number highlight only)
      'editorLineNumber.foreground': '#94a3b8',
      'editorLineNumber.activeForeground': '#4f46e5',
      // Gutter / margin
      'editorGutter.background': '#ffffff',
      // Scrollbar
      'scrollbarSlider.background': '#c7d2fe80',
      'scrollbarSlider.hoverBackground': '#a5b4fc',
      'scrollbarSlider.activeBackground': '#818cf8',
      // Indentation guides
      'editorIndentGuide.background': '#e2e8f0',
      'editorIndentGuide.activeBackground': '#a5b4fc',
      // Widget (autocomplete) background
      'editorWidget.background': '#ffffff',
      'editorWidget.border': '#e2e8f0',
      // Focus border
      'focusBorder': '#4f46e5',
    },
  });
}

export default function SQLEditor({
  value,
  onChange,
  onRun,
  onReset,
  readOnly = false,
  height = '200px',
  initialValue,
  isRunning = false,
}: SQLEditorProps) {
  const { theme } = useTheme();
  const monacoTheme = theme === 'light' ? 'sql-light' : 'vs-dark';

  const handleEditorChange = useCallback(
    (newValue: string | undefined) => {
      onChange(newValue ?? '');
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Ctrl/Cmd + Enter to run query
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        onRun();
      }
    },
    [onRun]
  );

  const handleReset = useCallback(() => {
    if (onReset) {
      onReset();
    } else if (initialValue !== undefined) {
      onChange(initialValue);
    }
  }, [onReset, initialValue, onChange]);

  const handleEditorMount = useCallback((_editor: unknown, monaco: Monaco) => {
    registerLightTheme(monaco);
    monaco.editor.setTheme(monacoTheme);
  }, [monacoTheme]);

  return (
    <div
      className="rounded-lg overflow-hidden border border-slate-800"
      style={{
        borderColor: theme === 'light' ? '#e2e8f0' : '#1e293b',
        background: theme === 'light' ? '#ffffff' : undefined,
      }}
    >
      <div onKeyDown={handleKeyDown}>
        <MonacoEditor
          height={height}
          language="sql"
          theme={monacoTheme}
          value={value}
          onChange={handleEditorChange}
          onMount={handleEditorMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            readOnly,
            padding: { top: 12, bottom: 12 },
            renderLineHighlight: 'gutter',
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            overviewRulerBorder: false,
            cursorBlinking: 'smooth',
            folding: false,
            lineDecorationsWidth: 8,
            lineNumbersMinChars: 3,
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto',
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
            },
          }}
        />
      </div>

      <div
        className="flex items-center gap-2 px-3 py-2 border-t border-slate-800 font-mono text-xs"
        style={{
          background: theme === 'light' ? '#f8fafc' : undefined,
          borderColor: theme === 'light' ? '#e2e8f0' : '#1e293b',
        }}
      >
        <button
          onClick={onRun}
          disabled={isRunning || readOnly}
          style={{ color: '#ffffff', backgroundColor: '#7c3aed' }}
          className="px-3 py-1 rounded font-medium hover:bg-[#6d28d9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          {isRunning ? 'running…' : 'run'}
        </button>

        {(onReset || initialValue !== undefined) && (
          <button
            onClick={handleReset}
            disabled={readOnly}
            className="px-2 py-1 rounded border border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            reset
          </button>
        )}

        <span className="ml-auto text-slate-500">
          <kbd className="opacity-70">⌘↵</kbd> to run
        </span>
      </div>
    </div>
  );
}
