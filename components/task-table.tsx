import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusDot } from "@/components/deadline-badge";
import { formatDate, formatHours, initials } from "@/lib/format";
import { cn } from "@/lib/utils";

export type TaskRow = {
  id: string;
  title: string;
  description: string;
  deadline: string;
  estimatedHours: number;
  assignee: { id: string; name: string; code: string; specialization: string };
};

export function TaskTable({
  tasks,
  className,
}: {
  tasks: readonly TaskRow[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "glass overflow-hidden rounded-[var(--radius)] shadow-glass",
        className,
      )}
    >
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Task</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead className="text-right">Est. hours</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell className="max-w-[22rem]">
                <div className="space-y-0.5">
                  <p className="font-medium">{task.title}</p>
                  {task.description ? (
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {task.description}
                    </p>
                  ) : null}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="grid size-7 place-items-center rounded-full border border-border bg-surface-2 text-[10px] font-semibold">
                    {initials(task.assignee.name)}
                  </span>
                  <span className="leading-tight">
                    <span className="block text-sm">{task.assignee.name}</span>
                    <span className="block font-mono text-[10px] text-muted-foreground">
                      {task.assignee.code}
                    </span>
                  </span>
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap text-sm">
                {formatDate(task.deadline)}
              </TableCell>
              <TableCell className="whitespace-nowrap text-right font-mono text-sm">
                {formatHours(task.estimatedHours)}
              </TableCell>
              <TableCell className="whitespace-nowrap text-right">
                <StatusDot date={task.deadline} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
