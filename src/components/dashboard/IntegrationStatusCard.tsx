import type { Integration, IntegrationProvider } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface IntegrationStatusCardProps {
  integrations: Integration[];
}

interface IntegrationDisplay {
  provider: IntegrationProvider;
  icon: string;
  label: string;
}

const INTEGRATION_META: IntegrationDisplay[] = [
  { provider: "strava", icon: "🏃", label: "Strava" },
  { provider: "whoop", icon: "💚", label: "Whoop" },
  { provider: "google_calendar", icon: "📅", label: "Calendar" },
  { provider: "gmail", icon: "✉️", label: "Gmail" },
];

export function IntegrationStatusCard({ integrations }: IntegrationStatusCardProps) {
  const connectedProviders = new Set(integrations.map((i) => i.provider));

  // Find most recently synced integration
  const lastSynced = integrations
    .filter((i) => i.last_synced_at)
    .sort(
      (a, b) =>
        new Date(b.last_synced_at!).getTime() -
        new Date(a.last_synced_at!).getTime()
    )[0];

  const lastSyncedText = lastSynced?.last_synced_at
    ? `Last synced ${formatDistanceToNow(new Date(lastSynced.last_synced_at), { addSuffix: true })}`
    : null;

  return (
    <div className="rounded-xl bg-[var(--color-surface-1)] border border-[var(--color-border)] p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
          Integrations
        </span>
        {lastSyncedText && (
          <span className="text-xs text-[var(--color-text-muted)]">
            {lastSyncedText}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {INTEGRATION_META.map(({ provider, icon, label }) => {
          const connected = connectedProviders.has(provider);
          return (
            <div key={provider} className="flex flex-col items-center gap-1">
              <div className="relative">
                <span className="text-xl leading-none" title={label}>
                  {icon}
                </span>
                <span
                  className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-[var(--color-surface-1)]"
                  style={{
                    backgroundColor: connected
                      ? "var(--color-green)"
                      : "var(--color-text-muted)",
                    opacity: connected ? 1 : 0.4,
                  }}
                />
              </div>
              <span className="text-[10px] text-[var(--color-text-muted)]">
                {label}
              </span>
            </div>
          );
        })}

        {/* Garmin — always shows GPX badge */}
        <div className="flex flex-col items-center gap-1">
          <div className="relative">
            <span className="text-xl leading-none" title="Garmin">
              ⌚
            </span>
            <span
              className="absolute -bottom-1 -right-2 rounded px-0.5 text-[8px] font-bold leading-tight"
              style={{
                backgroundColor: "var(--color-amber)",
                color: "#000",
              }}
            >
              GPX
            </span>
          </div>
          <span className="text-[10px] text-[var(--color-text-muted)]">
            Garmin
          </span>
        </div>
      </div>
    </div>
  );
}
