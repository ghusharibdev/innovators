import { format } from "date-fns";

/** Accepts a Date or an ISO string. */
export type DateInput = Date | string;

function toDate(input: DateInput): Date {
  return input instanceof Date ? input : new Date(input);
}

/**
 * Deadlines are stored at UTC midnight. Projecting to a local noon-time date
 * before formatting keeps the calendar day stable in every timezone.
 */
function toCalendarDate(input: DateInput): Date {
  const d = toDate(input);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12, 0, 0);
}

export function formatDate(input: DateInput): string {
  return format(toCalendarDate(input), "d MMM yyyy");
}

export function formatDateShort(input: DateInput): string {
  return format(toCalendarDate(input), "d MMM");
}

export function formatWeekday(input: DateInput): string {
  return format(toCalendarDate(input), "EEE");
}

export function formatHours(hours: number): string {
  return `${hours} h`;
}

/** Whole days from today (local midnight) to the deadline's calendar day. */
export function daysUntil(input: DateInput): number {
  const due = toCalendarDate(input);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
  const ms = due.getTime() - today.getTime();
  return Math.round(ms / 86_400_000);
}

export function isOverdue(input: DateInput): boolean {
  return daysUntil(input) < 0;
}

export function isDueSoon(input: DateInput): boolean {
  const days = daysUntil(input);
  return days >= 0 && days <= 2;
}

/** Human label for a deadline: "Overdue by 3 days", "Due today", "Due in 5 days". */
export function dueLabel(input: DateInput): string {
  const days = daysUntil(input);
  if (days < 0) {
    const overdue = Math.abs(days);
    return overdue === 1 ? "Overdue by 1 day" : `Overdue by ${overdue} days`;
  }
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Deterministic accent hue (0-359) derived from a stable code such as "DEV01". */
export function gradientFromCode(code: string): { from: string; to: string } {
  let hash = 0;
  for (let i = 0; i < code.length; i += 1) {
    hash = (hash * 31 + code.charCodeAt(i)) % 360;
  }
  const hue = hash;
  return {
    from: `hsl(${hue} 75% 60%)`,
    to: `hsl(${(hue + 48) % 360} 80% 52%)`,
  };
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}
