import type { Transition, Variants } from "motion/react";

/** Shared easing curve — DESIGN.md §12.2. */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const baseTransition: Transition = {
  duration: 0.35,
  ease: EASE,
};

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const stagger: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
  exit: {},
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: baseTransition },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: EASE } },
};

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: baseTransition },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: EASE } },
};

export const hoverLift = {
  rest: { y: 0 },
  hover: { y: -4, transition: { duration: 0.18, ease: EASE } },
} as const;

export const tapScale = { scale: 0.97 } as const;

/** Fade-up applied to a page section wrapper. */
export const sectionMotion = {
  initial: "initial",
  animate: "animate",
  variants: fadeUp,
  transition: baseTransition,
} as const;
