"use client";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Trophy,
  CalendarDays,
  Utensils,
  Heart,
  Zap,
  BookOpen,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/races", label: "Races", icon: Trophy },
  { href: "/training", label: "Training", icon: CalendarDays },
  { href: "/nutrition", label: "Nutrition", icon: Utensils },
  { href: "/recovery", label: "Recovery", icon: Heart },
  { href: "/integrations", label: "Integrations", icon: Zap },
  { href: "/journal", label: "Journal", icon: BookOpen },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-[var(--color-surface-1)] border-r border-[var(--color-border)] shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold tracking-tight">Athlete HQ</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                active
                  ? "bg-[var(--color-accent-dim)] text-[var(--color-accent)] font-medium"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)]"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="px-3 py-4 border-t border-[var(--color-border)]">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors"
        >
          <Settings className="h-4 w-4 shrink-0" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
