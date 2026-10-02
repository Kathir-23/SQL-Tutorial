'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import SQLEditor from '@/components/SQLEditor';
import ResultsTable from '@/components/ResultsTable';
import { createDatabase, runQuery, getDatabaseSchema, type QueryResponse } from '@/lib/db';
import { COMPANY_DB, STORE_DB, SCHOOL_DB, type DatabaseName } from '@/lib/databases';
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

const defaultQueries: Record<DatabaseName, string> = {
  company: 'SELECT * FROM employees;',
  store: 'SELECT * FROM products;',
  school: 'SELECT * FROM students;',
};

export default function PlaygroundPage() {
  const [selectedDb, setSelectedDb] = useState<DatabaseName>('company');
  const [database, setDatabase] = useState<SqlJsDatabase | null>(null);
  const [schema, setSchema] = useState<Record<string, Array<{ name: string; type: string; pk?: boolean }>>>({});
  const [query, setQuery] = useState('SELECT * FROM employees;');
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
          setQuery(defaultQueries[selectedDb]);
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

  const handleReset = useCallback(() => {
    setQuery(defaultQueries[selectedDb]);
    setResult(null);
    setExecutionTime(undefined);
  }, [selectedDb]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-mono text-sm">
      <Header />

      <main id="main" tabIndex={-1} className="flex-1 max-w-[1302px] mx-auto w-full px-4 sm:px-6 py-4 sm:py-5">
        <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-stretch">
          {/* Left Column: Title, Grey Line, Database Buttons, Editor, Results */}
          <div className="space-y-4 min-w-0 flex flex-col">
            <section className="font-mono">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Playground
              </h1>
              <p className="mt-0.5 text-xs text-[#64748b] font-normal">
                Practice freely. Your changes reset when you reload, and nothing here counts toward your certificate.
              </p>
            </section>

            <section className="font-mono text-xs">
              <p className="text-slate-500 mb-2"># database</p>
              <div className="flex flex-wrap items-center gap-2">
                {(Object.entries(databaseLabels) as [DatabaseName, { name: string; description: string }][]).map(([key, { name }]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedDb(key)}
                    className={`px-2 py-1 rounded border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                      selectedDb === key
                        ? 'border-indigo-400 text-indigo-400 bg-indigo-400/10 font-bold'
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

            <div className="space-y-4">
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
          </div>

          {/* Right Column: Tables Panel (starts at same top as page title, ends at bottom of results) */}
          <aside className="font-mono w-full lg:w-[300px] flex flex-col h-full">
            <div className="flex flex-col h-full rounded-xl border border-border/80 bg-[#f1f5f9] p-4 text-slate-900 shadow-sm min-h-[350px]">
              <div className="pb-2.5 mb-3 border-b border-slate-300 text-xs font-bold text-slate-900">
                Tables · {databaseLabels[selectedDb].name}.db
              </div>
              <div className="flex-1 overflow-y-auto space-y-4 text-xs pr-1 max-h-[450px] lg:max-h-none">
                {Object.entries(schema).map(([tableName, columns]) => (
                  <div key={tableName}>
                    <p className="font-bold text-purple-700 mb-1.5 text-xs">
                      .tables: {tableName}
                    </p>
                    <ul className="space-y-1 pl-3 border-l-2 border-slate-300">
                      {columns.map((col) => (
                        <li key={col.name} className="grid grid-cols-[1fr_auto] gap-2 items-baseline">
                          <span className={col.pk ? 'text-[#b45309] font-bold' : 'text-slate-800 font-medium'}>
                            {col.pk && <span aria-label="primary key" className="text-[#b45309] font-bold mr-0.5">*</span>}
                            {col.name}
                          </span>
                          <span className="text-[11px] text-[#475569] font-normal">{col.type.toLowerCase()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
