import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock3, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DeadlineBadge } from "@/components/deadline-badge";
import { EmptyState } from "@/components/empty-state";
import { RoleBadge } from "@/components/role-badge";
import { UserChip } from "@/components/user-chip";
import { TaskTable, type TaskRow } from "@/components/task-table";
import { TaskList } from "@/components/task-list";
import { getProjectForUser } from "@/lib/access";
import { requireUser } from "@/lib/auth";
import { formatHours, pluralize } from "@/lib/format";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await requireUser();

  const project = await getProjectForUser(user, id);
  if (!project) notFound();

  const taskRows: TaskRow[] = project.tasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    deadline: task.deadline.toISOString(),
    estimatedHours: task.estimatedHours,
    assignee: task.assignee,
  }));

  const totalHours = project.tasks.reduce(
    (sum, task) => sum + task.estimatedHours,
    0,
  );

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link href="/dashboard">
          <ArrowLeft className="size-4" /> Back to dashboard
        </Link>
      </Button>

      <header className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {project.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Client · {project.clientName}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <UserChip
            name={project.manager.name}
            code={project.manager.code}
            specialization={project.manager.specialization}
            size="sm"
          />
          <RoleBadge role="MANAGER" />
          <DeadlineBadge date={project.deadline.toISOString()} />
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <ListChecks className="size-3.5" />
            {project.tasks.length} {pluralize(project.tasks.length, "task")}
          </span>
          <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
            <Clock3 className="size-3.5" />
            {formatHours(totalHours)}
          </span>
        </div>

        {project.description ? (
          <>
            <Separator />
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {project.description}
            </p>
          </>
        ) : null}
      </header>

      <section className="space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          {user.role === "AGENT" ? "Your tasks on this project" : "Tasks"}
        </h2>

        {taskRows.length === 0 ? (
          <EmptyState
            icon={ListChecks}
            title={
              user.role === "AGENT"
                ? "No tasks assigned to you in this project."
                : "This project has no tasks yet."
            }
            hint="Tasks are created together with their project from a meeting transcript."
          />
        ) : (
          <>
            <TaskTable tasks={taskRows} className="hidden md:block" />
            <TaskList
              className="md:hidden"
              groups={[
                {
                  project: {
                    id: project.id,
                    name: project.name,
                    clientName: project.clientName,
                  },
                  tasks: taskRows.map((task) => ({
                    id: task.id,
                    title: task.title,
                    description: task.description,
                    deadline: task.deadline,
                    estimatedHours: task.estimatedHours,
                    assigneeName: task.assignee.name,
                    project: { id: project.id, name: project.name },
                  })),
                },
              ]}
            />
          </>
        )}
      </section>
    </>
  );
}
