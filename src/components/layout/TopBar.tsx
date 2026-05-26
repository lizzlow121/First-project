"use client";

import { createClient } from "@/lib/supabase/client";
import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface TopBarProps {
  userEmail?: string | null;
  pageTitle?: string;
}

export function TopBar({ userEmail, pageTitle }: TopBarProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface-0)] px-6 shrink-0">
      {pageTitle && (
        <h1 className="text-sm font-semibold text-[var(--color-text-primary)]">{pageTitle}</h1>
      )}
      <div className="ml-auto relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors"
        >
          <div className="h-6 w-6 rounded-full bg-[var(--color-accent-dim)] flex items-center justify-center">
            <User className="h-3.5 w-3.5 text-[var(--color-accent)]" />
          </div>
          <span className="hidden sm:block">{userEmail ?? "Account"}</span>
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full mt-1 z-20 w-48 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] shadow-lg overflow-hidden">
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-3)] transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
