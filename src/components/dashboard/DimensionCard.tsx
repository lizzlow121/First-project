import type { DimensionStatus } from "@/types";
import { RAGDot } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface DimensionCardProps extends DimensionStatus {
  icon?: React.ReactNode;
  href?: string;
}

export function DimensionCard({ status, label, value, icon }: DimensionCardProps) {
  const cardBg = {
    green: "bg-[var(--color-green-dim)]",
    amber: "bg-[var(--color-amber-dim)]",
    red: "bg-[var(--color-red-dim)]",
    none: "bg-white",
  }[status];

  const borderColor = {
    green: "border-[var(--color-green)]/20",
    amber: "border-[var(--color-amber)]/20",
    red: "border-[var(--color-red)]/20",
    none: "border-[var(--color-border)]",
  }[status];

  return (
    <div className={cn(
      "rounded-2xl border p-5 flex flex-col gap-3 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow duration-200",
      cardBg,
      borderColor
    )}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
          {label}
        </span>
        <div className="flex items-center gap-1.5">
          <RAGDot status={status} />
        </div>
      </div>
      {icon && <div className="text-[var(--color-text-muted)]">{icon}</div>}
      <p className="text-2xl font-bold text-[var(--color-text-primary)] leading-tight">{value}</p>
    </div>
  );
}
