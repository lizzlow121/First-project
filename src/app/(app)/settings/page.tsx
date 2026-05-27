"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { User, Target, Droplets, Ruler, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProfileForm {
  full_name: string;
  pace_unit: "km" | "mile";
  hydration_goal_ml: number;
  weight_goal_kg: number | null;
  carb_load_enabled: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileForm>({
    full_name: "",
    pace_unit: "km",
    hydration_goal_ml: 3000,
    weight_goal_kg: null,
    carb_load_enabled: true,
  });
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? "");
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        setProfile({
          full_name: data.full_name ?? "",
          pace_unit: data.pace_unit ?? "km",
          hydration_goal_ml: data.hydration_goal_ml ?? 3000,
          weight_goal_kg: data.weight_goal_kg,
          carb_load_enabled: data.carb_load_enabled ?? true,
        });
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("profiles").update(profile).eq("id", user.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold">Settings</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">Your profile and preferences</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-[var(--color-accent)]" />
              <CardTitle>Profile</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-3 space-y-4">
            <Input id="email" label="Email" value={email} disabled />
            <Input
              id="full_name"
              label="Full name"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
            />
          </CardContent>
        </Card>

        {/* Preferences */}
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
                {(["km", "mile"] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setProfile({ ...profile, pace_unit: u })}
                    className={`flex-1 h-10 rounded-lg border text-sm font-medium transition-colors ${
                      profile.pace_unit === u
                        ? "border-[var(--color-accent)] bg-[var(--color-accent-dim)] text-[var(--color-accent)]"
                        : "border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)]"
                    }`}
                  >
                    Per {u}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={profile.carb_load_enabled}
                onChange={(e) => setProfile({ ...profile, carb_load_enabled: e.target.checked })}
                className="mt-0.5 h-4 w-4 rounded border-[var(--color-border)] bg-[var(--color-surface-2)] accent-[var(--color-accent)]"
              />
              <div>
                <p className="text-sm font-medium">Auto carb-load mode</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  Adjust macro targets when a race is within 3 days
                </p>
              </div>
            </label>
          </CardContent>
        </Card>

        {/* Goals */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-[var(--color-accent)]" />
              <CardTitle>Daily Goals</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-3 space-y-4">
            <Input
              id="hydration"
              label="Hydration goal (ml)"
              type="number"
              value={profile.hydration_goal_ml}
              onChange={(e) => setProfile({ ...profile, hydration_goal_ml: parseInt(e.target.value) || 3000 })}
              hint="Recommended: 3000-4000ml for active athletes"
            />
            <Input
              id="weight_goal"
              label="Weight goal (kg, optional)"
              type="number"
              step="0.1"
              value={profile.weight_goal_kg ?? ""}
              onChange={(e) => setProfile({ ...profile, weight_goal_kg: e.target.value ? parseFloat(e.target.value) : null })}
              hint="Used for body composition tracking"
            />
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" loading={saving}>
            {saved ? "Saved ✓" : "Save changes"}
          </Button>
        </div>
      </form>

      {/* Account actions */}
      <Card>
        <CardContent>
          <Button variant="ghost" onClick={handleSignOut} className="text-[var(--color-red)]">
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
