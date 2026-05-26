import type { DimensionStatus } from "@/types";
import { RAGDot } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface DimensionCardProps extends DimensionStatus {
  icon?: React.ReactNode;
  href?: string;
}

export function DimensionCard({ status, label, value, icon }: DimensionCardProps) {
  const borderColor = {
    green: "border-[var(--color-green)]/20",
    amber: "border-[var(--color-amber)]/20",
    red: "border-[var(--color-red)]/20",
    none: "border-[var(--color-border)]",
  }[status];

  return (
    <div className={cn(
      "rounded-xl bg-[var(--color-surface-1)] border p-4 flex flex-col gap-3",
      borderColor
    )}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
          {label}
        </span>
        <div className="flex items-center gap-1.5">
          <RAGDot status={status} />
        </div>
      </div>
      {icon && <div className="text-[var(--color-text-muted)]">{icon}</div>}
      <p className="text-sm font-medium text-[var(--color-text-primary)]">{value}</p>
    </div>
  );
}
