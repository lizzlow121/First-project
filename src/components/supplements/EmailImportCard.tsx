"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface SupplementSuggestion {
  name: string;
  quantity: string | null;
  brand: string | null;
}

interface EmailImportCardProps {
  gmailConnected: boolean;
}

export function EmailImportCard({ gmailConnected }: EmailImportCardProps) {
  const [scanning, setScanning] = useState(false);
  const [suggestions, setSuggestions] = useState<SupplementSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [addingId, setAddingId] = useState<string | null>(null);

  if (!gmailConnected) {
    return (
      <div className="rounded-xl bg-[var(--color-surface-1)] border border-[var(--color-border)] p-4 flex flex-col gap-3">
        <span className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
          Import from Email
        </span>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Connect Gmail to scan supplement orders
        </p>
        <Link
          href="/integrations"
          className="inline-block rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-opacity w-fit"
        >
          Connect Gmail
        </Link>
      </div>
    );
  }

  const handleScan = async () => {
    setScanning(true);
    setError(null);
    setSuggestions([]);
    try {
      const res = await fetch("/api/gmail/scan-supplements", {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Scan failed");
      }
      const data = await res.json();
      setSuggestions(data.suggestions ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setScanning(false);
    }
  };

  const handleAdd = async (suggestion: SupplementSuggestion, index: number) => {
    const key = `${index}-${suggestion.name}`;
    setAddingId(key);
    try {
      const supabase = createClient();
      const { error: insertError } = await supabase.from("supplements").insert({
        name: suggestion.name,
        dose: suggestion.quantity ?? null,
        notes: suggestion.brand ? `Brand: ${suggestion.brand}` : null,
        active: true,
      });
      if (!insertError) {
        setAdded((prev) => new Set(prev).add(key));
      }
    } finally {
      setAddingId(null);
    }
  };

  const visibleSuggestions = suggestions.filter(
    (s, i) => !added.has(`${i}-${s.name}`)
  );

  return (
    <div className="rounded-xl bg-[var(--color-surface-1)] border border-[var(--color-border)] p-4 flex flex-col gap-3">
      <span className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
        Import from Email
      </span>

      <button
        onClick={handleScan}
        disabled={scanning}
        className="rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50 hover:opacity-90 transition-opacity w-fit"
      >
        {scanning ? "Scanning…" : "Scan emails"}
      </button>

      {error && (
        <p className="text-xs text-[var(--color-red)]">{error}</p>
      )}

      {suggestions.length > 0 && visibleSuggestions.length === 0 && (
        <p className="text-sm text-[var(--color-green)]">
          All suggestions added!
        </p>
      )}

      {visibleSuggestions.length > 0 && (
        <ul className="space-y-2">
          {suggestions.map((s, i) => {
            const key = `${i}-${s.name}`;
            if (added.has(key)) return null;
            return (
              <li
                key={key}
                className="flex items-center justify-between gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                    {s.name}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {[s.brand, s.quantity].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <button
                  onClick={() => handleAdd(s, i)}
                  disabled={addingId === key}
                  className="shrink-0 rounded-md border border-[var(--color-border)] px-2 py-1 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)] disabled:opacity-50 transition-colors"
                >
                  {addingId === key ? "Adding…" : "Add"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
