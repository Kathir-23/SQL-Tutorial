'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import SQLEditor from '@/components/SQLEditor';
import ResultsTable from '@/components/ResultsTable';
import { createDatabase, runQuery, getDatabaseSchema, type QueryResponse } from '@/lib/db';
import { COMPANY_DB, STORE_DB, SCHOOL_DB, type DatabaseName } from '@/lib/databases';
import { useAuth } from '@/lib/auth';
import type { Database as SqlJsDatabase } from 'sql.js';

const databases: Record<DatabaseName, string> = {
  company: COMPANY_DB,
  store: STORE_DB,
  school: SCHOOL_DB,
};

const databaseLabels: Record<DatabaseName, { name: string; description: string }> = {
  company: { name: 'company', description: 'Employees, Projects, Departments' },
  store: { name: 'store', description: 'Products, Orders, Customers' },
  school: { name: 'school', description: 'Students, Courses, Teachers' },
};

export default function PlaygroundPage() {
  const { user } = useAuth();
  const username = user?.certificateName
    ? user.certificateName.trim().split(/\s+/)[0].toLowerCase()
    : 'guest';

  const [selectedDb, setSelectedDb] = useState<DatabaseName>('company');
  const [database, setDatabase] = useState<SqlJsDatabase | null>(null);
  const [schema, setSchema] = useState<Record<string, Array<{ name: string; type: string; pk?: boolean }>>>({});
  const [query, setQuery] = useState('SELECT * FROM employees LIMIT 10;');
  const [result, setResult] = useState<QueryResponse | null>(null);
  const [executionTime, setExecutionTime] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function initDb() {
      setIsLoading(true);
      setDbError(null);
      try {
        const db = await createDatabase(databases[selectedDb]);
        if (mounted) {
          setDatabase(db);
          setSchema(getDatabaseSchema(db));
          setResult(null);
        }
      } catch (error) {
        if (mounted) {
          setDatabase(null);
          setSchema({});
          setDbError(error instanceof Error ? error.message : 'Failed to load database');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    initDb();

    return () => {
      mounted = false;
    };
  }, [selectedDb]);

  const handleRun = useCallback(() => {
    if (!database || !query.trim()) return;

    setIsRunning(true);
    setTimeout(() => {
      const startTime = performance.now();
      const queryResult = runQuery(database, query);
      const endTime = performance.now();
      setExecutionTime(Math.round(endTime - startTime));
      setResult(queryResult);
      setIsRunning(false);
    }, 50);
  }, [database, query]);

  const defaultQueries: Record<DatabaseName, string> = {
    company: 'SELECT * FROM employees LIMIT 10;',
    store: 'SELECT * FROM products LIMIT 10;',
    school: 'SELECT * FROM students LIMIT 10;',
  };

  const handleReset = useCallback(() => {
    setQuery(defaultQueries[selectedDb]);
    setResult(null);
    setExecutionTime(undefined);
  }, [selectedDb]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header />

      <main id="main" tabIndex={-1} className="flex-1 max-w-[1302px] mx-auto w-full px-6 py-8">
        <section className="font-mono text-sm mb-6">
          <p>
            <span className="text-indigo-400">{username}@sql</span>
            <span className="text-slate-500">:</span>
            <span className="text-slate-500">~/playground$</span>{' '}
            <span>sqlite3 {selectedDb}.db</span>
            <span className="ml-1 inline-block w-2 h-4 align-text-bottom bg-slate-100 terminal-cursor" aria-hidden="true" />
          </p>
          <p className="text-xs text-slate-400 mt-1.5 font-sans">
            Practice freely. Your changes reset when you reload, and nothing here counts toward your certificate.
          </p>
        </section>

        <section className="mb-6 font-mono text-xs">
          <p className="text-slate-500 mb-2"># database</p>
          <div className="flex flex-wrap items-center gap-2">
            {(Object.entries(databaseLabels) as [DatabaseName, { name: string; description: string }][]).map(([key, { name }]) => (
              <button
                key={key}
                onClick={() => setSelectedDb(key)}
                className={`px-2 py-1 rounded border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                  selectedDb === key
                    ? 'border-indigo-400 text-indigo-400 bg-indigo-400/10'
                    : 'border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-600'
                }`}
                aria-pressed={selectedDb === key}
              >
                {selectedDb === key && '> '}{name}
              </button>
            ))}
            <span className="text-slate-500 ml-2">{databaseLabels[selectedDb].description}</span>
          </div>
        </section>

        <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">
          <div className="space-y-4 min-w-0">
            {isLoading ? (
              <div className="h-[300px] bg-slate-900 rounded border border-slate-800 flex items-center justify-center font-mono text-xs text-slate-500">
                loading {selectedDb}.db…
              </div>
            ) : dbError ? (
              <div className="h-[300px] bg-slate-900 rounded border border-slate-800 flex flex-col items-start justify-center px-6 font-mono text-xs text-slate-300">
                <p className="text-rose-400">error: could not load {selectedDb}.db</p>
                <p className="mt-2 text-slate-500">{dbError}</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-4 rounded border border-slate-700 px-3 py-1.5 text-slate-200 hover:border-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  refresh
                </button>
              </div>
            ) : (
              <>
                <SQLEditor
                  value={query}
                  onChange={setQuery}
                  onRun={handleRun}
                  onReset={handleReset}
                  isRunning={isRunning}
                  height="200px"
                />
                <ResultsTable result={result} executionTime={executionTime} />
              </>
            )}
          </div>

          <aside className="lg:sticky lg:top-20 lg:self-start space-y-4 font-mono w-full lg:w-[300px]">
            <div className="rounded border border-slate-800 bg-slate-900/40">
              <div className="px-3 py-2 border-b border-slate-800 text-xs text-slate-400">
                # schema · {databaseLabels[selectedDb].name}.db
              </div>
              <div className="p-3 space-y-3 max-h-[calc(100vh-10rem)] overflow-y-auto text-xs">
                {Object.entries(schema).map(([tableName, columns]) => (
                  <div key={tableName}>
                    <p className="text-indigo-400 mb-1">.tables: {tableName}</p>
                    <ul className="space-y-0.5 pl-3 border-l border-slate-800">
                      {columns.map((col) => (
                        <li key={col.name} className="grid grid-cols-[1fr_auto] gap-2 items-baseline">
                          <span className={col.pk ? 'text-[#b45309] font-medium' : 'text-slate-200'}>
                            {col.pk && <span aria-label="primary key" className="text-[#b45309] font-bold">*</span>}
                            {col.name}
                          </span>
                          <span className="text-[10px] text-slate-600">{col.type.toLowerCase()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-500">
              # <kbd className="text-slate-400">⌘↵</kbd> to run · queries run locally via sql.js
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
}
