import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SyncStravaButton } from "@/components/integrations/SyncStravaButton";
import { GarminUpload } from "@/components/integrations/GarminUpload";
import type { Integration, IntegrationProvider } from "@/types";
import { format } from "date-fns";
import Link from "next/link";

interface IntegrationCardProps {
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  lastSynced?: string | null;
  connectHref: string;
  children?: React.ReactNode;
}

function IntegrationCard({
  name,
  description,
  icon,
  connected,
  lastSynced,
  connectHref,
  children,
}: IntegrationCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start gap-4">
        <div
          className="flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ background: "var(--color-surface-3)" }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-sm font-semibold">{name}</h3>
            {connected ? (
              <Badge variant="green">Connected</Badge>
            ) : (
              <Badge variant="default">Not connected</Badge>
            )}
          </div>
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            {description}
          </p>
          {lastSynced && (
            <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
              Last synced:{" "}
              {format(new Date(lastSynced), "d MMM yyyy, HH:mm")}
            </p>
          )}
        </div>
        {!connected && (
          <Link href={connectHref}>
            <Button size="sm" variant="secondary">
              Connect
            </Button>
          </Link>
        )}
      </div>
      {connected && children && (
        <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
          {children}
        </div>
      )}
    </Card>
  );
}

export default async function IntegrationsPage() {
  const supabase = await createClient();
  const { data: integrationsData } = await supabase
    .from("integrations")
    .select("*");

  const integrations = (integrationsData ?? []) as Integration[];

  const getIntegration = (provider: IntegrationProvider) =>
    integrations.find((i) => i.provider === provider) ?? null;

  const strava = getIntegration("strava");
  const whoop = getIntegration("whoop");
  const gcal = getIntegration("google_calendar");
  const gmail = getIntegration("gmail");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">Integrations</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
          Connect your fitness apps and devices
        </p>
      </div>

      <div className="space-y-4">
        {/* Strava */}
        <IntegrationCard
          name="Strava"
          description="Sync your activities automatically from Strava"
          icon="🏃"
          connected={!!strava}
          lastSynced={strava?.last_synced_at}
          connectHref="/api/auth/strava"
        >
          {strava && <SyncStravaButton />}
        </IntegrationCard>

        {/* Whoop */}
        <IntegrationCard
          name="Whoop"
          description="Import recovery scores, HRV, and sleep data from Whoop"
          icon="💚"
          connected={!!whoop}
          lastSynced={whoop?.last_synced_at}
          connectHref="/api/auth/whoop"
        />

        {/* Google Calendar */}
        <IntegrationCard
          name="Google Calendar"
          description="Sync training sessions with your Google Calendar"
          icon="📅"
          connected={!!gcal}
          lastSynced={gcal?.last_synced_at}
          connectHref="/api/auth/google-calendar"
        >
          {gcal && (
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              Calendar ID: {gcal.gcal_calendar_id ?? "Primary calendar"}
            </p>
          )}
        </IntegrationCard>

        {/* Garmin */}
        <Card className="p-5">
          <div className="flex items-start gap-4">
            <div
              className="flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ background: "var(--color-surface-3)" }}
            >
              ⌚
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-sm font-semibold">Garmin</h3>
                <Badge variant="amber">GPX Import</Badge>
              </div>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                Garmin does not offer a public API. Export your activity as a GPX file
                from Garmin Connect and upload it here.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
            <GarminUpload />
          </div>
        </Card>

        {/* Gmail */}
        <IntegrationCard
          name="Gmail"
          description="Scan emails for supplement orders and nutrition receipts"
          icon="✉️"
          connected={!!gmail}
          lastSynced={gmail?.last_synced_at}
          connectHref="/api/auth/gmail"
        >
          {gmail && (
            <Button variant="secondary" size="sm">
              Scan for supplements
            </Button>
          )}
        </IntegrationCard>
      </div>
    </div>
  );
}
