import { gradientFromCode, initials } from "@/lib/format";
import { cn } from "@/lib/utils";

export type UserChipProps = {
  name: string;
  code: string;
  specialization?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const SIZES = {
  sm: { box: "size-7 text-[10px]", name: "text-xs", code: "text-[10px]" },
  md: { box: "size-9 text-xs", name: "text-sm", code: "text-[11px]" },
  lg: { box: "size-12 text-sm", name: "text-base", code: "text-xs" },
} as const;

export function UserChip({
  name,
  code,
  specialization,
  className,
  size = "md",
}: UserChipProps) {
  const { from, to } = gradientFromCode(code);
  const sizing = SIZES[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span
        aria-hidden
        className={cn(
          "grid shrink-0 place-items-center rounded-full font-semibold text-primary-foreground",
          sizing.box,
        )}
        style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
      >
        {initials(name)}
      </span>
      <span className="min-w-0">
        <span className={cn("block truncate font-medium leading-tight", sizing.name)}>
          {name}
        </span>
        <span
          className={cn(
            "block truncate font-mono text-muted-foreground leading-tight",
            sizing.code,
          )}
        >
          {code}
          {specialization ? ` · ${specialization}` : ""}
        </span>
      </span>
    </div>
  );
}
