"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        aria-hidden
        className={cn(
          "flex items-center gap-1 rounded-full border border-border bg-surface-2 p-1",
          className,
        )}
      >
        <span className="grid size-7 place-items-center rounded-full">
          <Sun className="size-4 text-muted-foreground" />
        </span>
      </div>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={cn(
        "flex items-center gap-1 rounded-full border border-border bg-surface-2 p-1",
        className,
      )}
    >
      {OPTIONS.map((option) => {
        const active = theme === option.value;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${option.label} theme`}
            onClick={() => setTheme(option.value)}
            className={cn(
              "relative grid size-7 place-items-center rounded-full transition-colors",
              active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active ? (
              <motion.span
                layoutId="theme-pill"
                className="absolute inset-0 rounded-full border border-border bg-card shadow-sm"
                transition={
                  reduced ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }
                }
              />
            ) : null}
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={option.value}
                initial={reduced ? false : { rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={reduced ? undefined : { rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative z-10 grid place-items-center"
              >
                <Icon className="size-4" />
              </motion.span>
            </AnimatePresence>
          </button>
        );
      })}
    </div>
  );
}
