import type { Role } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ROLE_STYLES: Record<Role, string> = {
  ADMIN: "border-accent/40 bg-accent/15 text-accent",
  MANAGER: "border-accent-2/40 bg-accent-2/15 text-accent-2",
  AGENT: "border-success/40 bg-success/15 text-success",
};

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  AGENT: "Agent",
};

export function RoleBadge({
  role,
  className,
}: {
  role: Role;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn(ROLE_STYLES[role], className)}>
      {ROLE_LABELS[role]}
    </Badge>
  );
}

export function RoleDot({ role, className }: { role: Role; className?: string }) {
  const color: Record<Role, string> = {
    ADMIN: "bg-accent",
    MANAGER: "bg-accent-2",
    AGENT: "bg-success",
  };
  return (
    <span
      aria-hidden
      className={cn("inline-block size-2 rounded-full", color[role], className)}
    />
  );
}
