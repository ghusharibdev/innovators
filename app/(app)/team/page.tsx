import type { Role } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { UserChip } from "@/components/user-chip";
import { RoleBadge } from "@/components/role-badge";
import { getDirectory } from "@/lib/access";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const GROUP_ORDER: { role: Role; title: string }[] = [
  { role: "ADMIN", title: "Admin" },
  { role: "MANAGER", title: "Managers" },
  { role: "AGENT", title: "Agents" },
];

export default async function TeamPage() {
  await requireUser();
  const users = await getDirectory();

  return (
    <>
      <PageHeader
        title="Team Directory"
        subtitle="Read-only company directory. Projects and tasks are matched against these people by code."
      />

      {GROUP_ORDER.map((group) => {
        const members = users.filter((user) => user.role === group.role);
        if (members.length === 0) return null;

        return (
          <section key={group.role} className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                {group.title}
              </h2>
              <span className="text-xs text-muted-foreground">
                {members.length}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {members.map((member) => {
                const skills = member.skills
                  .split(",")
                  .map((skill) => skill.trim())
                  .filter(Boolean);

                return (
                  <article
                    key={member.id}
                    className="glass space-y-3 rounded-[var(--radius)] p-5 hover-lift"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <UserChip
                        name={member.name}
                        code={member.code}
                        size="md"
                      />
                      <RoleBadge role={member.role} />
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {member.specialization}
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((skill) => (
                        <Badge key={skill} variant="muted">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </>
  );
}
