import Link from "next/link";
import { Clock3, FolderKanban, ListChecks, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { StatCard, StatRow } from "@/components/stat-card";
import { ProjectGrid } from "@/components/project-grid";
import { TaskList, type TaskGroup } from "@/components/task-list";
import type { ProjectCardData } from "@/components/project-card";
import { getDirectory, getTasksForAgent, getVisibleProjects } from "@/lib/access";
import { requireUser } from "@/lib/auth";
import { pluralize } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const projects = await getVisibleProjects(user);

  const cards: ProjectCardData[] = projects.map((project) => ({
    id: project.id,
    name: project.name,
    clientName: project.clientName,
    description: project.description,
    deadline: project.deadline.toISOString(),
    manager: project.manager,
    taskCount: project.tasks.length,
    totalHours: project.tasks.reduce((sum, task) => sum + task.estimatedHours, 0),
  }));

  if (user.role === "AGENT") {
    const tasks = await getTasksForAgent(user.id);
    const groups = new Map<string, TaskGroup>();

    for (const task of tasks) {
      const existing = groups.get(task.project.id);
      const item = {
        id: task.id,
        title: task.title,
        description: task.description,
        deadline: task.deadline.toISOString(),
        estimatedHours: task.estimatedHours,
        assigneeName: user.name,
        project: task.project,
      };
      if (existing) {
        existing.tasks.push(item);
      } else {
        groups.set(task.project.id, { project: task.project, tasks: [item] });
      }
    }

    const grouped = Array.from(groups.values());

    return (
      <>
        <PageHeader
          title="My Tasks"
          subtitle={
            tasks.length === 0
              ? "Nothing assigned to you yet."
              : `${tasks.length} ${pluralize(tasks.length, "task")} across ${grouped.length} ${pluralize(grouped.length, "project")}, sorted by deadline.`
          }
        />
        <TaskList
          groups={grouped}
          className={tasks.length === 0 ? "hidden" : undefined}
        />
        {tasks.length === 0 ? (
          <ProjectGrid
            projects={[]}
            emptyTitle="No tasks assigned"
            emptyHint="Once an admin creates projects from a transcript, your assigned tasks appear here."
          />
        ) : null}
      </>
    );
  }

  const isAdmin = user.role === "ADMIN";
  const taskCount = cards.reduce((sum, card) => sum + card.taskCount, 0);
  const totalHours = cards.reduce((sum, card) => sum + card.totalHours, 0);
  const teamMembers = isAdmin ? (await getDirectory()).length : 0;

  return (
    <>
      <PageHeader
        title={isAdmin ? "All Projects" : "My Projects"}
        subtitle={
          isAdmin
            ? "Every project created from meeting transcripts, scoped for administrators."
            : "Projects where you are the assigned manager."
        }
        actions={
          isAdmin ? (
            <Button asChild>
              <Link href="/transcript">
                <Plus className="size-4" /> Create from Transcript
              </Link>
            </Button>
          ) : null
        }
      />

      <StatRow>
        <StatCard
          label="Projects"
          value={cards.length}
          icon={<FolderKanban className="size-5 text-accent" />}
        />
        <StatCard label="Tasks" value={taskCount} icon={<ListChecks className="size-5 text-accent" />} />
        <StatCard label="Total hours" value={totalHours} suffix="h" icon={<Clock3 className="size-5 text-accent" />} />
        <StatCard
          label={isAdmin ? "Team members" : "Visible projects"}
          value={isAdmin ? teamMembers : cards.length}
          icon={<Users className="size-5 text-accent" />}
        />
      </StatRow>

      <ProjectGrid
        projects={cards}
        emptyTitle={isAdmin ? "No projects yet" : "No projects assigned to you"}
        emptyHint={
          isAdmin
            ? "Create your first set of projects from a client meeting transcript."
            : "Projects appear here once a transcript assigns you as the manager."
        }
        emptyAction={
          isAdmin ? (
            <Button asChild>
              <Link href="/transcript">
                <Plus className="size-4" /> Create from Transcript
              </Link>
            </Button>
          ) : null
        }
      />
    </>
  );
}
