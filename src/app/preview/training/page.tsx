import { Button } from "@/components/ui/Button";
import { Plus, Upload, ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, format, startOfWeek } from "date-fns";
import { sessionTypeColor } from "@/lib/utils";

const today = new Date();
const weekStart = startOfWeek(today, { weekStartsOn: 1 });
const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

const sessions: Record<number, { title: string; type: string; duration: number; distance?: number; effort: number }[]> = {
  0: [{ title: "Easy run", type: "run", duration: 45, distance: 7.5, effort: 4 }],
  1: [{ title: "Strength A", type: "strength", duration: 60, effort: 7 }],
  3: [{ title: "6×400m intervals", type: "run", duration: 50, distance: 8, effort: 9 }],
  5: [{ title: "Hyrox simulation", type: "hyrox", duration: 75, effort: 8 }],
  6: [{ title: "Long run", type: "run", duration: 90, distance: 15, effort: 5 }],
};

export default function PreviewTraining() {
  return (
    <div className="min-h-screen bg-[var(--color-surface-0)]">
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Training</h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">Week of {format(weekStart, "MMM d")}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm"><Upload className="h-4 w-4" /> Import screenshot</Button>
            <Button size="sm"><Plus className="h-4 w-4" /> Add session</Button>
          </div>
        </div>

        {/* Week nav */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
          <button className="p-1.5 rounded-lg hover:bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium">{format(weekStart, "MMM d")} – {format(addDays(weekStart, 6), "MMM d, yyyy")}</span>
          <button className="p-1.5 rounded-lg hover:bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Week grid */}
        <div className="grid grid-cols-7 gap-3">
          {days.map((day, i) => {
            const isToday = format(day, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
            const daySessions = sessions[i] ?? [];
            return (
              <div key={i} className={`rounded-xl border p-3 min-h-[160px] ${isToday ? "border-[var(--color-accent)] bg-[var(--color-accent-dim)]/20" : "border-[var(--color-border)] bg-[var(--color-surface-1)]"}`}>
                <div className="flex items-baseline justify-between mb-3">
                  <span className="text-xs text-[var(--color-text-muted)] uppercase">{format(day, "EEE")}</span>
                  <span className={`text-base font-semibold ${isToday ? "text-[var(--color-accent)]" : ""}`}>{format(day, "d")}</span>
                </div>
                <div className="space-y-2">
                  {daySessions.map((s, j) => (
                    <div key={j} className="rounded-lg bg-[var(--color-surface-2)] p-2 border border-[var(--color-border)]">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`h-1.5 w-1.5 rounded-full ${sessionTypeColor(s.type)}`} />
                        <span className="text-xs font-medium truncate">{s.title}</span>
                      </div>
                      <div className="text-[10px] text-[var(--color-text-muted)]">
                        {s.duration}min{s.distance ? ` · ${s.distance}km` : ""}
                      </div>
                      <div className="text-[10px] mt-0.5 text-[var(--color-orange)]">Effort {s.effort}/10</div>
                    </div>
                  ))}
                  {daySessions.length === 0 && (
                    <button className="w-full rounded-lg border border-dashed border-[var(--color-border)] py-2 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:border-[var(--color-border-light)] transition-colors">
                      <Plus className="h-3 w-3 inline mr-1" /> Add
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
