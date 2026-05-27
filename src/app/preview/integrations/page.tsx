import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Activity, Heart, Calendar, Mail, Upload, Check } from "lucide-react";

export default function PreviewIntegrations() {
  return (
    <div className="min-h-screen bg-[var(--color-surface-0)]">
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold">Integrations</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">Connect your wearables and apps</p>
        </div>

        {/* Strava (connected) */}
        <Card>
          <CardContent className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-[var(--color-orange-dim)]/40 p-2.5">
                <Activity className="h-5 w-5 text-[var(--color-orange)]" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold">Strava</h3>
                  <Badge variant="green"><Check className="h-3 w-3 mr-1" />Connected</Badge>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)]">Auto-imports your runs, rides, and swims</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">Last synced 12 minutes ago · 47 activities imported this month</p>
              </div>
            </div>
            <Button size="sm" variant="secondary">Sync now</Button>
          </CardContent>
        </Card>

        {/* Whoop (not connected) */}
        <Card>
          <CardContent className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-[var(--color-red-dim)]/30 p-2.5">
                <Heart className="h-5 w-5 text-[var(--color-red)]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-1">WHOOP</h3>
                <p className="text-xs text-[var(--color-text-secondary)]">Recovery score, HRV, sleep performance</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">Pulls daily recovery cycles into your dashboard</p>
              </div>
            </div>
            <Button size="sm">Connect</Button>
          </CardContent>
        </Card>

        {/* Google Calendar */}
        <Card>
          <CardContent className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-[var(--color-accent-dim)] p-2.5">
                <Calendar className="h-5 w-5 text-[var(--color-accent)]" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold">Google Calendar</h3>
                  <Badge variant="green"><Check className="h-3 w-3 mr-1" />Connected</Badge>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)]">Two-way sync: training plan ↔ &quot;Training&quot; calendar</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">Pushing this week&apos;s 5 sessions · pulling 2 events</p>
              </div>
            </div>
            <Button size="sm" variant="secondary">Settings</Button>
          </CardContent>
        </Card>

        {/* Gmail */}
        <Card>
          <CardContent className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-[var(--color-red-dim)]/30 p-2.5">
                <Mail className="h-5 w-5 text-[var(--color-red)]" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold">Gmail</h3>
                  <Badge variant="green"><Check className="h-3 w-3 mr-1" />Connected</Badge>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)]">Scans supplement order confirmations</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">3 new orders found from iHerb &amp; Bulk Supplements</p>
              </div>
            </div>
            <Button size="sm" variant="secondary">Review</Button>
          </CardContent>
        </Card>

        {/* Garmin */}
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-[var(--color-amber-dim)]/40 p-2.5">
                <Activity className="h-5 w-5 text-[var(--color-amber)]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold">Garmin</h3>
                  <Badge variant="amber">Manual import</Badge>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Garmin doesn&apos;t offer a public API. Export a .GPX file from Garmin Connect to import workouts.
                </p>
              </div>
            </div>
            <div className="rounded-lg border-2 border-dashed border-[var(--color-border)] p-6 text-center hover:border-[var(--color-border-light)] transition-colors">
              <Upload className="h-6 w-6 mx-auto text-[var(--color-text-muted)] mb-2" />
              <p className="text-sm font-medium">Drop a .GPX file here</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">or click to browse</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
