'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import ProjectCard from '@/components/ProjectCard';
import { getAllProjects } from '@/lib/projects';
import { useProjectProgressStore } from '@/lib/project-progress';
import { projectThreads, projectChallenges } from '@/lib/project-threads';
import { useThreadProgressStore } from '@/lib/thread-progress';

export default function ProjectsPage() {
  const projects = getAllProjects();
  const getProjectProgress = useProjectProgressStore((state) => state.getProjectProgress);
  const { isChallengeCompleted } = useThreadProgressStore();

  // 1. Standalone projects steps calculation
  const totalProjectSteps = projects.reduce((sum, p) => sum + p.steps.length, 0);
  const completedProjectSteps = projects.reduce((sum, p) => {
    const progress = getProjectProgress(p.slug, p.steps.length);
    return sum + Math.round((progress / 100) * p.steps.length);
  }, 0);

  // 2. Guided Scenarios steps calculation
  const getThreadProgress = (threadId: string) => {
    const threadChallengeKeys = Object.entries(projectChallenges)
      .filter(([, c]) => c.threadId === threadId)
      .map(([key]) => key);
    const completed = threadChallengeKeys.filter((key) => isChallengeCompleted(key)).length;
    return { completed, total: threadChallengeKeys.length };
  };

  const totalScenarioSteps = projectThreads.reduce((sum, thread) => {
    return sum + getThreadProgress(thread.id).total;
  }, 0);

  const completedScenarioSteps = projectThreads.reduce((sum, thread) => {
    return sum + getThreadProgress(thread.id).completed;
  }, 0);

  // 3. Combined total steps across all scenarios and projects (58 total steps)
  const totalStepsCombined = totalScenarioSteps + totalProjectSteps;
  const completedStepsCombined = completedScenarioSteps + completedProjectSteps;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-mono text-sm">
      {/* Shared Sticky Header */}
      <Header />

      <main id="main" tabIndex={-1} className="flex-1 max-w-[1302px] mx-auto w-full px-4 sm:px-6 py-10">
        <section className="font-mono text-sm">
          <p>
            <span className="text-accent font-bold">$</span>{' '}
            <span>ls ~/projects</span>
            <span className="ml-1 inline-block w-2 h-4 align-text-bottom bg-accent terminal-cursor" aria-hidden="true" />
          </p>
          <p className="mt-2 text-xs text-muted-foreground font-semibold">
            {completedStepsCombined} of {totalStepsCombined} steps done across 3 guided scenarios and 3 standalone projects
          </p>
        </section>

        {/* GUIDED SCENARIOS SECTION */}
        <section className="mt-10">
          <p className="text-xs uppercase tracking-widest text-accent font-bold font-mono"># Guided Scenarios</p>
          <p className="mt-1 text-xs text-muted-foreground font-mono">
            Longer running scenarios that span multiple modules.
          </p>
          <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectThreads.map((thread) => {
              const { completed, total } = getThreadProgress(thread.id);
              const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
              const done = percent === 100;
              const statusText = done ? '✓ complete' : percent > 0 ? 'in progress' : 'not started';
              const statusClass = done
                ? 'text-emerald-500 font-bold'
                : percent > 0
                ? 'text-accent font-semibold'
                : 'text-muted-foreground font-medium';

              return (
                <Link
                  key={thread.id}
                  href={`/projects/thread/${thread.id}`}
                  className="group block font-mono p-4 rounded-lg border border-border/80 bg-card hover:border-accent/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  aria-label={`Open scenario ${thread.title}`}
                >
                  <p className="text-sm font-bold text-foreground">scenarios/{thread.id}/</p>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {thread.description}
                  </p>
                  <p className="mt-3 text-[11px] text-muted-foreground font-semibold">
                    [{thread.databaseLabel}] · modules {thread.modules[0]}-{thread.modules[thread.modules.length - 1]}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">{completed} of {total} done</span>
                    <span className={statusClass}>{statusText}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* STANDALONE PROJECTS SECTION */}
        <section className="mt-10">
          <p className="text-xs uppercase tracking-widest text-accent font-bold font-mono"># Standalone Projects</p>
          <p className="mt-1 text-xs text-muted-foreground font-mono">
            Standalone guided projects against a real SQLite database.
          </p>
          <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 py-5 font-mono text-xs">
        <div className="max-w-[1302px] mx-auto px-6 flex flex-wrap items-center justify-between gap-3 text-muted-foreground">
          <span>
            <span className="text-emerald-500 font-bold">exit 0</span> · SQL Mastery Projects
          </span>
          <Link
            href="/"
            className="hover:text-foreground transition-colors font-semibold"
          >
            ~ home
          </Link>
        </div>
      </footer>
    </div>
  );
}
