'use client';

import Link from 'next/link';
import { useProjectProgressStore } from '@/lib/project-progress';
import { type Project } from '@/lib/projects';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const getProjectProgress = useProjectProgressStore((state) => state.getProjectProgress);
  const progress = getProjectProgress(project.slug, project.steps.length);
  const completedStepsCount = Math.round((progress / 100) * project.steps.length);
  const isComplete = progress === 100;

  const statusText = isComplete ? '✓ complete' : progress > 0 ? 'in progress' : 'not started';
  const statusClass = isComplete
    ? 'text-emerald-500 font-bold'
    : progress > 0
    ? 'text-accent font-semibold'
    : 'text-muted-foreground font-medium';

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex flex-col justify-between h-full font-mono p-5 rounded-xl border border-border/80 bg-[#f1f5f9] hover:border-accent/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent shadow-sm text-slate-900"
      aria-label={`Open project ${project.title}`}
    >
      <div className="flex-1 space-y-3">
        <div className="text-sm">
          <span className="font-bold text-slate-900">projects/{project.slug}/</span>
        </div>
        <p className="text-xs leading-relaxed text-slate-600">{project.description}</p>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500 font-semibold pt-1">
          <span>[{project.difficulty}]</span>
          <span>·</span>
          <span>{project.estimatedTime}</span>
          <span>·</span>
          <span>{project.databaseLabel}</span>
          <span>·</span>
          <span>{project.steps.length} steps</span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-300 flex items-center justify-between text-xs">
        <span className="text-slate-600 font-medium">{completedStepsCount} of {project.steps.length} done</span>
        <span className={statusClass}>{statusText}</span>
      </div>
    </Link>
  );
}
