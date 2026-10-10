"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SuccessCheck } from "@/components/ai-progress";
import { EASE, stagger, staggerItem } from "@/lib/motion";
import { formatHours, pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";

export type TranscriptError = { path: string; message: string };

export type TranscriptResult =
  | {
      status: "ok";
      created: {
        projects: number;
        tasks: number;
        hours: number;
        projectIds: string[];
      };
      projects: { id: string; name: string; taskCount: number }[];
    }
  | { status: "invalid"; errors: TranscriptError[] }
  | { status: "error"; error: string };

export function ResultPanel({
  result,
  onRetry,
  className,
}: {
  result: TranscriptResult;
  onRetry: () => void;
  className?: string;
}) {
  if (result.status === "ok") {
    const { created, projects } = result;
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: EASE }}
        className={cn(
          "glass space-y-5 rounded-[var(--radius)] border-success/30 p-6",
          className,
        )}
      >
        <div className="flex items-center gap-3">
          <SuccessCheck />
          <div>
            <p className="flex items-center gap-2 font-medium text-success">
              <CheckCircle2 className="size-4" /> Import complete
            </p>
            <p className="text-sm text-muted-foreground">
              {created.projects} {pluralize(created.projects, "project")} ·{" "}
              {created.tasks} {pluralize(created.tasks, "task")} ·{" "}
              {formatHours(created.hours)} created
            </p>
          </div>
        </div>

        <motion.ul
          initial="initial"
          animate="animate"
          variants={stagger}
          className="space-y-2"
        >
          {projects.map((project) => (
            <motion.li key={project.id} variants={staggerItem}>
              <Link
                href={`/projects/${project.id}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2 text-sm transition-colors hover:border-accent/40 hover:bg-surface-2"
              >
                <span className="truncate">{project.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {project.taskCount} {pluralize(project.taskCount, "task")}
                </span>
              </Link>
            </motion.li>
          ))}
        </motion.ul>

        <Button asChild className="w-full">
          <Link href="/dashboard">
            View Dashboard <ArrowRight className="size-4" />
          </Link>
        </Button>
      </motion.div>
    );
  }

  if (result.status === "invalid") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: EASE }}
        className={cn(
          "glass space-y-4 rounded-[var(--radius)] border-warn/30 bg-warn/[0.04] p-6",
          className,
        )}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 size-5 text-warn" />
          <div className="space-y-1">
            <p className="font-medium">The AI output needs correction.</p>
            <p className="text-sm text-muted-foreground">
              Nothing was saved. Fix the transcript and try again.
            </p>
          </div>
        </div>

        <ul className="space-y-2">
          {result.errors.map((error, index) => (
            <li
              key={`${error.path}-${index}`}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
            >
              <code className="font-mono text-[11px] text-warn">{error.path}</code>
              <p className="text-muted-foreground">{error.message}</p>
            </li>
          ))}
        </ul>

        <Button variant="outline" className="w-full" onClick={onRetry}>
          <RefreshCw className="size-4" /> Try again
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
      className={cn(
        "glass space-y-4 rounded-[var(--radius)] border-destructive/30 bg-destructive/[0.05] p-6",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <XCircle className="mt-0.5 size-5 text-destructive" />
        <div className="space-y-1">
          <p className="font-medium">The import could not be completed.</p>
          <p className="text-sm text-muted-foreground">{result.error}</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Nothing was saved — the database is unchanged.
      </p>
      <Button variant="outline" className="w-full" onClick={onRetry}>
        <RefreshCw className="size-4" /> Retry
      </Button>
    </motion.div>
  );
}
