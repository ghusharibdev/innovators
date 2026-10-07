import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { AuthError, requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser().catch((error: unknown) => {
    if (error instanceof AuthError) return null;
    throw error;
  });

  if (!user) redirect("/login");

  return (
    <AppShell
      user={{
        id: user.id,
        name: user.name,
        code: user.code,
        email: user.email,
        role: user.role,
      }}
    >
      {children}
    </AppShell>
  );
}
