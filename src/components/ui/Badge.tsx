import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "green" | "amber" | "red" | "blue" | "orange";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-[var(--color-surface-3)] text-[var(--color-text-secondary)]",
    green: "bg-[var(--color-green-dim)] text-[var(--color-green)]",
    amber: "bg-[var(--color-amber-dim)] text-[var(--color-amber)]",
    red: "bg-[var(--color-red-dim)] text-[var(--color-red)]",
    blue: "bg-[var(--color-accent-dim)] text-[var(--color-accent)]",
    orange: "bg-[var(--color-orange-dim)] text-[var(--color-orange)]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export function RAGDot({ status }: { status: "green" | "amber" | "red" | "none" }) {
  const colors = {
    green: "bg-[var(--color-green)]",
    amber: "bg-[var(--color-amber)]",
    red: "bg-[var(--color-red)]",
    none: "bg-[var(--color-text-muted)]",
  };
  return <span className={cn("inline-block h-2.5 w-2.5 rounded-full", colors[status])} />;
}
