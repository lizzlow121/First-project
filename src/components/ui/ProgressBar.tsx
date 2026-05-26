import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  sublabel?: string;
  color?: "blue" | "green" | "orange" | "red" | "amber";
  className?: string;
}

export function ProgressBar({ value, max, label, sublabel, color = "blue", className }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;

  const colors = {
    blue: "bg-[var(--color-accent)]",
    green: "bg-[var(--color-green)]",
    orange: "bg-[var(--color-orange)]",
    red: "bg-[var(--color-red)]",
    amber: "bg-[var(--color-amber)]",
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {(label || sublabel) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="font-medium text-[var(--color-text-secondary)]">{label}</span>}
          {sublabel && <span className="text-[var(--color-text-muted)]">{sublabel}</span>}
        </div>
      )}
      <div className="h-2 w-full rounded-full bg-[var(--color-surface-3)] overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", colors[color])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
