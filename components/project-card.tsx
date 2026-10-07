"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Clock3, ListChecks, UserRound } from "lucide-react";
import { DeadlineBadge } from "@/components/deadline-badge";
import { hoverLift, EASE } from "@/lib/motion";
import { formatHours, pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";

export type ProjectCardData = {
  id: string;
  name: string;
  clientName: string;
  description: string;
  deadline: string;
  manager: { id: string; name: string; code: string; specialization: string };
  taskCount: number;
  totalHours: number;
};

/** Reference cap for the thin hours bar so the bar reads meaningfully across cards. */
const HOURS_BAR_CAP = 60;

export function ProjectCard({
  project,
  className,
}: {
  project: ProjectCardData;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const width = Math.min(100, Math.round((project.totalHours / HOURS_BAR_CAP) * 100));

  return (
    <motion.article
      variants={hoverLift}
      initial="rest"
      whileHover={reduced ? undefined : "hover"}
      className={cn(
        "glass group relative flex h-full flex-col gap-4 rounded-[var(--radius)] p-6 shadow-glass transition-colors hover:border-accent/40",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <Link
            href={`/projects/${project.id}`}
            className="line-clamp-1 font-semibold tracking-tight after:absolute after:inset-0 after:content-[''] hover:text-accent"
          >
            {project.name}
          </Link>
          <p className="truncate text-xs text-muted-foreground">
            Client · {project.clientName}
          </p>
        </div>
        <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
      </div>

      {project.description ? (
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {project.description}
        </p>
      ) : null}

      <div className="mt-auto space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <UserRound className="size-3.5" />
            {project.manager.name}
            <span className="font-mono text-[10px] opacity-70">
              {project.manager.code}
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ListChecks className="size-3.5" />
            {project.taskCount} {pluralize(project.taskCount, "task")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="size-3.5" />
            {formatHours(project.totalHours)}
          </span>
        </div>

        <div className="h-1 w-full overflow-hidden rounded-full bg-surface-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${width}%` }}
            transition={{ duration: 0.5, ease: EASE }}
            className="h-full rounded-full bg-accent-gradient"
          />
        </div>

        <DeadlineBadge date={project.deadline} />
      </div>
    </motion.article>
  );
}
