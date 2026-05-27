"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { RefreshCw } from "lucide-react";

export function SyncStravaButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/strava/sync", { method: "POST" });
      if (!res.ok) throw new Error("Sync failed");
      const data = await res.json();
      setResult(`Synced ${data.synced} activities`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Button variant="secondary" size="sm" onClick={handleSync} loading={loading}>
        <RefreshCw className="h-4 w-4" />
        Sync now
      </Button>
      {result && (
        <span className="text-xs" style={{ color: "var(--color-green)" }}>
          {result}
        </span>
      )}
      {error && (
        <span className="text-xs" style={{ color: "var(--color-red)" }}>
          {error}
        </span>
      )}
    </div>
  );
}
