import Link from "next/link";
import { Clock3, CornerDownRight } from "lucide-react";
import { DeadlineBadge } from "@/components/deadline-badge";
import { formatHours } from "@/lib/format";
import { cn } from "@/lib/utils";

export type TaskListItem = {
  id: string;
  title: string;
  description: string;
  deadline: string;
  estimatedHours: number;
  assigneeName?: string;
  project: { id: string; name: string; clientName?: string };
};

export type TaskGroup = {
  project: { id: string; name: string; clientName?: string };
  tasks: TaskListItem[];
};

export function TaskList({
  groups,
  className,
}: {
  groups: readonly TaskGroup[];
  className?: string;
}) {
  return (
    <div className={cn("space-y-6", className)}>
      {groups.map((group) => (
        <section key={group.project.id} className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 font-medium">
              <CornerDownRight className="size-4 text-accent" />
              <Link
                href={`/projects/${group.project.id}`}
                className="hover:text-accent"
              >
                {group.project.name}
              </Link>
            </h3>
            <span className="text-xs text-muted-foreground">
              {group.tasks.length} task{group.tasks.length === 1 ? "" : "s"}
            </span>
          </div>

          <ul className="grid gap-3 md:grid-cols-2">
            {group.tasks.map((task) => (
              <li
                key={task.id}
                className="glass space-y-3 rounded-[var(--radius)] p-4 hover-lift"
              >
                <div className="space-y-1">
                  <p className="font-medium leading-snug">{task.title}</p>
                  {task.description ? (
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {task.description}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <DeadlineBadge date={task.deadline} />
                  <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                    <Clock3 className="size-3.5" />
                    {formatHours(task.estimatedHours)}
                  </span>
                </div>
                {task.assigneeName ? (
                  <p className="text-xs text-muted-foreground">{task.assigneeName}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
