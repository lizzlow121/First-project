import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "glass";
}

export function Card({ className, variant = "default", ...props }: CardProps) {
  const variants = {
    default: "bg-white rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)]",
    elevated: "bg-white rounded-2xl shadow-[var(--shadow-card-hover)] border border-[var(--color-border)]",
    glass: "bg-white/80 backdrop-blur-sm rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)]",
  };
  return <div className={cn(variants[variant], "hover:shadow-[var(--shadow-card-hover)] transition-shadow duration-200", className)} {...props} />;
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
