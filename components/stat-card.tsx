"use client";

import { useEffect, useState } from "react";
import { animate, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { EASE, staggerItem } from "@/lib/motion";

export function StatCard({
  label,
  value,
  suffix,
  icon,
  className,
}: {
  label: string;
  value: number;
  suffix?: string;
  icon: React.ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(reduced ? value : 0);

  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 0.9,
      ease: EASE,
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    return () => controls.stop();
  }, [value, reduced]);

  return (
    <motion.div
      variants={staggerItem}
      className={cn(
        "glass flex items-center justify-between gap-4 rounded-[var(--radius)] p-5 hover-lift",
        className,
      )}
    >
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="font-mono text-3xl font-semibold tabular-nums">
          {display}
          {suffix ? (
            <span className="ml-1 text-base text-muted-foreground">{suffix}</span>
          ) : null}
        </p>
      </div>
      <span className="grid size-11 place-items-center rounded-full border border-border bg-surface-2">
        {icon}
      </span>
    </motion.div>
  );
}

export function StatRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerStatRow}
      className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}
    >
      {children}
    </motion.div>
  );
}

const staggerStatRow = {
  initial: {},
  animate: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};
