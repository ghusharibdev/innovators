"use client";

import { motion } from "framer-motion";
import { FolderKanban } from "lucide-react";
import { ProjectCard, type ProjectCardData } from "@/components/project-card";
import { EmptyState } from "@/components/empty-state";
import { stagger, staggerItem } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function ProjectGrid({
  projects,
  emptyTitle = "No projects yet",
  emptyHint,
  emptyAction,
  className,
}: {
  projects: readonly ProjectCardData[];
  emptyTitle?: string;
  emptyHint?: string;
  emptyAction?: React.ReactNode;
  className?: string;
}) {
  if (projects.length === 0) {
    return (
      <EmptyState
        icon={FolderKanban}
        title={emptyTitle}
        hint={emptyHint}
        action={emptyAction}
        className={className}
      />
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={stagger}
      className={cn("grid gap-5 md:grid-cols-2 xl:grid-cols-3", className)}
    >
      {projects.map((project) => (
        <motion.div key={project.id} variants={staggerItem} className="h-full">
          <ProjectCard project={project} className="h-full" />
        </motion.div>
      ))}
    </motion.div>
  );
}
