import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { User, Target, Droplets, LogOut } from "lucide-react";

export default function PreviewSettings() {
  return (
    <div className="min-h-screen bg-[var(--color-surface-0)]">
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold">Settings</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">Your profile and preferences</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-[var(--color-accent)]" />
              <CardTitle>Profile</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-3 space-y-4">
            <Input id="email" label="Email" defaultValue="elizabeth@example.com" disabled />
            <Input id="full_name" label="Full name" defaultValue="Elizabeth Low" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-[var(--color-orange)]" />
              <CardTitle>Training Preferences</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-3 space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text-secondary)]">Pace unit</label>
              <div className="flex gap-2">
                <button className="flex-1 h-10 rounded-lg border border-[var(--color-accent)] bg-[var(--color-accent-dim)] text-[var(--color-accent)] text-sm font-medium">Per km</button>
                <button className="flex-1 h-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] text-sm font-medium">Per mile</button>
              </div>
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="mt-0.5 h-4 w-4 rounded accent-[var(--color-accent)]" />
              <div>
                <p className="text-sm font-medium">Auto carb-load mode</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Adjust macro targets when a race is within 3 days</p>
              </div>
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-[var(--color-accent)]" />
              <CardTitle>Daily Goals</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-3 space-y-4">
            <Input id="hyd" label="Hydration goal (ml)" type="number" defaultValue={3000} hint="Recommended: 3000-4000ml for active athletes" />
            <Input id="wg" label="Weight goal (kg, optional)" type="number" defaultValue={72} hint="Used for body composition tracking" />
          </CardContent>
        </Card>

        <Button>Save changes</Button>

        <Card>
          <CardContent>
            <Button variant="ghost" className="text-[var(--color-red)]"><LogOut className="h-4 w-4" /> Sign out</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
