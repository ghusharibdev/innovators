"use client";

import { Suspense, useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle, Eye, EyeOff, Loader2, LogIn, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { fadeUp, stagger, staggerItem, EASE } from "@/lib/motion";
import { ThemeToggle } from "@/components/theme-toggle";

const DEMO_PASSWORD = "Demo123!";

const QUICK_ACCOUNTS = [
  { label: "Admin", email: "admin@novaworks.example", role: "Full access" },
  { label: "Manager", email: "ayesha@novaworks.example", role: "Ayesha Khan" },
  { label: "Agent", email: "ali@novaworks.example", role: "Ali Raza" },
] as const;

function LoginCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const nextParam = searchParams.get("next");
  const destination =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/dashboard";

  const submit = useCallback(
    async (nextEmail: string, nextPassword: string) => {
      if (pending) return;
      setPending(true);
      setError(null);

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: nextEmail, password: nextPassword }),
        });

        const body = (await response.json()) as { error?: string };

        if (!response.ok) {
          setError(body.error ?? "Invalid email or password");
          toast.error(body.error ?? "Invalid email or password");
          setPending(false);
          return;
        }

        toast.success("Welcome back!");
        router.replace(destination);
        router.refresh();
      } catch {
        setError("Network error — please try again.");
        toast.error("Network error — please try again.");
        setPending(false);
      }
    },
    [destination, pending, router],
  );

  return (
    <div className="relative grid min-h-dvh lg:grid-cols-2">
      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>
      {/* Left — brand panel */}
      <div className="relative hidden overflow-hidden border-r border-border lg:block">
        <div
          aria-hidden
          className="absolute -left-24 top-1/4 size-[26rem] rounded-full bg-accent/20 dark:bg-accent/30 blur-3xl animate-drift"
        />
        <div
          aria-hidden
          className="absolute -right-16 bottom-10 size-[22rem] rounded-full bg-accent-2/15 dark:bg-accent-2/25 blur-3xl animate-drift [animation-delay:-9s]"
        />

        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="NovaWorks logo" className="size-10 rounded-xl" />
            <span className="text-sm font-semibold tracking-tight">
              {process.env.NEXT_PUBLIC_APP_NAME ?? "NovaWorks CRM"}
            </span>
          </div>

          <motion.div
            initial="initial"
            animate="animate"
            variants={stagger}
            className="max-w-md space-y-5"
          >
            <motion.h1
              variants={staggerItem}
              className="text-balance text-4xl font-semibold leading-tight tracking-tight"
            >
              Paste a meeting.{" "}
              <span className="accent-gradient-text">Get the projects.</span>
            </motion.h1>
            <motion.p variants={staggerItem} className="text-muted-foreground">
              Gemini turns an agreed client transcript into validated projects, tasks,
              owners and deadlines — saved in one all-or-nothing transaction.
            </motion.p>
            <motion.ul
              variants={staggerItem}
              className="space-y-2 text-sm text-muted-foreground"
            >
              <li className="flex items-center gap-2">
                <Sparkles className="size-3.5 text-accent" /> Structured JSON, forced
                by schema
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="size-3.5 text-accent" /> Two validation gates before
                any row is written
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="size-3.5 text-accent" /> Role scoping enforced in
                data requests
              </li>
            </motion.ul>
          </motion.div>

          <p className="text-xs text-muted-foreground">
            The Infinity Hack &apos;26 · COMSATS University Islamabad, Lahore Campus
          </p>
        </div>
      </div>

      {/* Right — form card */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeUp}
          transition={{ duration: 0.35, ease: EASE }}
          className="glass w-full max-w-md space-y-6 rounded-[var(--radius)] p-7 shadow-glass"
        >
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight">Sign in</h2>
            <p className="text-sm text-muted-foreground">
              Use one of the 10 seeded demo accounts.
            </p>
          </div>

          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void submit(email, password);
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                placeholder="admin@novaworks.example"
                value={email}
                disabled={pending}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  disabled={pending}
                  onChange={(event) => setPassword(event.target.value)}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Signing in…
                </>
              ) : (
                <>
                  <LogIn className="size-4" /> Sign in
                </>
              )}
            </Button>
          </form>

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Quick login
            </p>
            <div className="grid grid-cols-3 gap-2">
              {QUICK_ACCOUNTS.map((account) => (
                <Button
                  key={account.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={pending}
                  onClick={() => {
                    setEmail(account.email);
                    setPassword(DEMO_PASSWORD);
                    void submit(account.email, DEMO_PASSWORD);
                  }}
                >
                  {account.label}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Every demo account uses the password{" "}
              <code className="font-mono text-foreground">Demo123!</code>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-dvh place-items-center">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <LoginCard />
    </Suspense>
  );
}
