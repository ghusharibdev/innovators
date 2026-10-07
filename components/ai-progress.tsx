"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";
import { EASE, stagger } from "@/lib/motion";
import { cn } from "@/lib/utils";

export const AI_STEPS = [
  "Reading transcript…",
  "Extracting with Gemini…",
  "Validating & saving…",
] as const;

export type ProgressState = "idle" | "running" | "success" | "invalid" | "error";

function CheckDraw({ className }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      className={className}
      initial="hidden"
      animate="visible"
      aria-hidden
    >
      <motion.path
        d="M4 12.5l5 5L20 6.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: {
            pathLength: 1,
            opacity: 1,
            transition: { duration: 0.5, ease: EASE },
          },
        }}
      />
    </motion.svg>
  );
}

export function AiProgress({
  state,
  step,
  className,
}: {
  state: ProgressState;
  step: number;
  className?: string;
}) {
  const finished = state === "success";
  const failed = state === "invalid" || state === "error";

  return (
    <motion.ol
      initial="initial"
      animate="animate"
      variants={stagger}
      className={cn("space-y-3", className)}
    >
      {AI_STEPS.map((label, index) => {
        const isDone = finished || (state === "running" && index < step);
        const isActive = state === "running" && index === step;
        const isFailedStep = failed && index === step;

        return (
          <motion.li
            key={label}
            variants={{
              initial: { opacity: 0, x: -8 },
              animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: EASE } },
            }}
            className="flex items-center gap-3 text-sm"
          >
            <span
              className={cn(
                "grid size-6 shrink-0 place-items-center rounded-full border",
                isDone &&
                  "border-success/50 bg-success/15 text-success",
                isActive && "border-accent/50 bg-accent/15 text-accent",
                isFailedStep &&
                  "border-destructive/50 bg-destructive/15 text-destructive",
                !isDone &&
                  !isActive &&
                  !isFailedStep &&
                  "border-border bg-card text-muted-foreground",
              )}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isDone ? (
                  <CheckDraw key="check" className="size-3.5" />
                ) : isActive ? (
                  <motion.span
                    key="spinner"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Loader2 className="size-3.5 animate-spin" />
                  </motion.span>
                ) : isFailedStep ? (
                  <motion.span
                    key="warning"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <AlertTriangle className="size-3.5" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[10px] font-semibold"
                  >
                    {index + 1}
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
            <span
              className={cn(
                isDone || isActive || isFailedStep
                  ? "text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {label}
            </span>
          </motion.li>
        );
      })}
    </motion.ol>
  );
}

/** Big animated success check used by the result panel. */
export function SuccessCheck({ className }: { className?: string }) {
  return (
    <CheckDraw
      className={cn("size-10 text-success", className)}
    />
  );
}
