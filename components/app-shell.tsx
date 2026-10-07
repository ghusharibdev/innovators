"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  FilePlus2,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
  X,
} from "lucide-react";
import type { Role } from "@prisma/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RoleBadge, RoleDot } from "@/components/role-badge";
import { UserChip } from "@/components/user-chip";
import { ThemeToggle } from "@/components/theme-toggle";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type AppShellUser = {
  id: string;
  name: string;
  code: string;
  email: string;
  role: Role;
};

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: Role[];
};

const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "MANAGER", "AGENT"],
  },
  {
    href: "/transcript",
    label: "Create from Transcript",
    icon: FilePlus2,
    roles: ["ADMIN"],
  },
  { href: "/team", label: "Team", icon: Users, roles: ["ADMIN", "MANAGER", "AGENT"] },
];

function BrandMark() {
  return (
    <span className="grid size-9 place-items-center rounded-xl bg-accent-gradient text-sm font-bold text-primary-foreground">
      NW
    </span>
  );
}

function NavLink({
  item,
  active,
  showLabel,
  onNavigate,
  labelClassName,
}: {
  item: NavItem;
  active: boolean;
  showLabel: boolean;
  onNavigate?: () => void;
  labelClassName?: string;
}) {
  const reduced = useReducedMotion();
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {active && !reduced ? (
        <motion.span
          layoutId="nav-underline"
          className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-accent-gradient"
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        />
      ) : null}
      <Icon className={cn("size-4 shrink-0", active && "text-accent")} />
      {showLabel ? (
        <span className={labelClassName ?? "truncate"}>{item.label}</span>
      ) : (
        <span className="sr-only">{item.label}</span>
      )}
    </Link>
  );
}

export function AppShell({
  user,
  children,
}: {
  user: AppShellUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = NAV_ITEMS.filter((item) => item.roles.includes(user.role));
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "NovaWorks CRM";

  async function signOut(): Promise<void> {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Signed out.");
      router.replace("/login");
      router.refresh();
    } catch {
      toast.error("Could not sign out. Please try again.");
      setSigningOut(false);
    }
  }

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <BrandMark />
            <span className="hidden text-sm font-semibold tracking-tight sm:inline">
              {appName}
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />
            <div className="hidden items-center gap-2 sm:flex">
              <UserChip name={user.name} code={user.code} size="sm" />
              <RoleBadge role={user.role} />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              disabled={signingOut}
              className="hidden sm:inline-flex"
            >
              <LogOut className="size-4" />
              {signingOut ? "Signing out…" : "Sign out"}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop / tablet sidebar — icon rail below lg, full labels at lg+ */}
        <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-16 shrink-0 flex-col gap-2 border-r border-border bg-card p-3 md:flex lg:w-60">
          <nav className="flex flex-1 flex-col gap-1">
            {items.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                showLabel={true}
                labelClassName="hidden truncate lg:inline"
              />
            ))}
          </nav>
          <div className="hidden border-t border-border pt-3 lg:block">
            <div className="flex items-center gap-3 px-1 pb-3">
              <span className="relative">
                <UserChip name={user.name} code={user.code} size="sm" />
                <RoleDot
                  role={user.role}
                  className="absolute -bottom-0.5 -right-0.5 ring-2 ring-background"
                />
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={signOut}
              disabled={signingOut}
            >
              <LogOut className="size-4" />
              {signingOut ? "Signing out…" : "Sign out"}
            </Button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 pb-24 sm:px-6 md:pb-10">
          <div className="mx-auto w-full max-w-6xl space-y-8">{children}</div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {items.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[10px]",
                  active ? "text-accent" : "text-muted-foreground",
                )}
              >
                <Icon className="size-4" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="glass-strong mt-16 space-y-2 rounded-[var(--radius)] p-4"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2">
                <UserChip name={user.name} code={user.code} size="sm" />
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Close navigation"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="size-4" />
                </Button>
              </div>
              {items.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  active={
                    pathname === item.href || pathname.startsWith(`${item.href}/`)
                  }
                  showLabel
                  onNavigate={() => setMobileOpen(false)}
                />
              ))}
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={signOut}
                disabled={signingOut}
              >
                <LogOut className="size-4" />
                {signingOut ? "Signing out…" : "Sign out"}
              </Button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
