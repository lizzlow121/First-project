import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "glass";
}

export function Card({ className, variant = "default", ...props }: CardProps) {
  const variants = {
    default: "bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl",
    elevated: "bg-[var(--color-surface-2)] border border-[var(--color-border-light)] rounded-xl shadow-lg",
    glass: "bg-[var(--color-surface-1)]/80 backdrop-blur-sm border border-[var(--color-border)] rounded-xl",
  };
  return <div className={cn(variants[variant], className)} {...props} />;
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1.5 p-5 pb-0", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}
