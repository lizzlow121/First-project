import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Ruler, Pill, Plus, Check, Heart } from "lucide-react";
import { format, subDays } from "date-fns";

export default function PreviewRecovery() {
  const today = new Date();
  const week = Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i));
  const energy = [7, 6, 8, 5, 8, 9, 8];

  return (
    <div className="min-h-screen bg-[var(--color-surface-0)]">
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold">Recovery</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">{format(today, "EEEE, MMMM d")}</p>
        </div>

        {/* 7-day trend */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-[var(--color-orange)]" />
              <CardTitle>7-day energy trend</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {week.map((day, i) => {
                const val = energy[i];
                const color = val >= 7 ? "var(--color-green)" : val >= 4 ? "var(--color-amber)" : "var(--color-red)";
                return (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="w-full flex items-end justify-center h-20">
                      <div className="w-full rounded-md" style={{ height: `${(val / 10) * 100}%`, background: color }} />
                    </div>
                    <span className="text-xs text-[var(--color-text-muted)]">{format(day, "EEE")[0]}</span>
                    <span className="text-xs font-semibold tabular-nums">{val}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Daily check-in */}
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s check-in</CardTitle>
          </CardHeader>
          <CardContent className="pt-3 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Slider label="Sleep (hours)" value={7.5} max={12} />
              <Slider label="Soreness" value={4} max={10} color="orange" />
              <Slider label="Energy" value={8} max={10} color="green" />
              <div className="grid grid-cols-2 gap-2">
                <NumberStat label="HRV" value="58 ms" />
                <NumberStat label="Resting HR" value="52" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Body measurements */}
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-[var(--color-accent)]" />
                <h3 className="text-sm font-semibold">Body Measurements</h3>
              </div>
              <Button size="sm" variant="secondary">Update</Button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { l: "Weight", v: "72.4kg", t: "-0.6kg" },
                { l: "Body Fat", v: "14.2%" },
                { l: "Waist", v: "78cm" },
                { l: "Chest", v: "102cm" },
                { l: "Arm", v: "36cm" },
                { l: "Thigh", v: "58cm" },
              ].map((m) => (
                <div key={m.l}>
                  <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">{m.l}</span>
                  <p className="text-base font-semibold tabular-nums mt-0.5">{m.v}</p>
                  {m.t && <p className="text-xs text-[var(--color-green)]">{m.t}</p>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Supplements */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Pill className="h-4 w-4 text-[var(--color-accent)]" />
              <CardTitle>Supplements</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-3 space-y-2">
            {[
              { name: "Creatine", dose: "5g", timing: "Morning", taken: true },
              { name: "Vitamin D3", dose: "2000 IU", timing: "With breakfast", taken: true },
              { name: "Magnesium Glycinate", dose: "400mg", timing: "Before bed", taken: false },
              { name: "Omega-3", dose: "2g EPA/DHA", timing: "With lunch", taken: true },
              { name: "Electrolytes (LMNT)", dose: "1 packet", timing: "Pre-workout", taken: false },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)]/40">
                <button className={`h-5 w-5 rounded-md flex items-center justify-center transition-colors ${s.taken ? "bg-[var(--color-green)]" : "border border-[var(--color-border-light)]"}`}>
                  {s.taken && <Check className="h-3 w-3 text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{s.dose} · {s.timing}</p>
                </div>
              </div>
            ))}
            <Button variant="secondary" size="sm" className="w-full mt-2">
              <Plus className="h-4 w-4" /> Add supplement
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Slider({ label, value, max, color = "blue" }: { label: string; value: number; max: number; color?: "blue" | "orange" | "green" }) {
  const pct = (value / max) * 100;
  const c = color === "orange" ? "var(--color-orange)" : color === "green" ? "var(--color-green)" : "var(--color-accent)";
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-[var(--color-text-secondary)] font-medium">{label}</span>
        <span className="font-semibold tabular-nums">{value}{max === 10 ? "/10" : ""}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-[var(--color-surface-3)] overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: c }} />
      </div>
    </div>
  );
}

function NumberStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-[var(--color-text-secondary)] font-medium">{label}</span>
      <span className="text-base font-semibold tabular-nums">{value}</span>
    </div>
  );
}
