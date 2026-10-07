import { CalendarClock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { dueLabel, formatDate, type DateInput } from "@/lib/format";

export function DeadlineBadge({
  date,
  withLabel = true,
  className,
}: {
  date: DateInput;
  withLabel?: boolean;
  className?: string;
}) {
  const days = dueLabel(date);
  const overdue = days.startsWith("Overdue");
  const soon = days === "Due today" || days === "Due tomorrow";

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 whitespace-nowrap font-normal",
        overdue && "border-destructive/40 bg-destructive/10 text-destructive",
        !overdue && soon && "border-warn/40 bg-warn/10 text-warn",
        !overdue && !soon && "border-border text-muted-foreground",
        className,
      )}
    >
      <CalendarClock className="size-3" />
      {formatDate(date)}
      {withLabel ? <span className="opacity-80">· {days}</span> : null}
    </Badge>
  );
}

export function StatusDot({ date }: { date: DateInput }) {
  const label = dueLabel(date);
  const color = label.startsWith("Overdue")
    ? "bg-destructive"
    : label === "Due today" || label === "Due tomorrow"
      ? "bg-warn"
      : "bg-success";
  return (
    <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
      <span className={cn("size-2 rounded-full", color)} aria-hidden />
      {label}
    </span>
  );
}
