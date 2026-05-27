import { SandTimer } from "@/components/dashboard/SandTimer";
import { addDays, format } from "date-fns";

const states = [
  { label: "12+ weeks out", days: 100, progress: "Full" },
  { label: "8 weeks out", days: 56, progress: "33% drained" },
  { label: "4 weeks out", days: 28, progress: "67% drained" },
  { label: "2 weeks out", days: 14, progress: "83% drained" },
  { label: "3 days out", days: 3, progress: "96% drained" },
];

export default function PreviewSandStates() {
  return (
    <div className="min-h-screen bg-[var(--color-surface-0)] p-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <h1 className="text-2xl font-bold">Sand timer states</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Sand drains over the 12 weeks leading up to the race
          </p>
        </div>
        <div className="grid grid-cols-5 gap-6">
          {states.map(({ label, days, progress }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-3 rounded-2xl bg-[var(--color-surface-1)] border border-[var(--color-border)] p-6"
            >
              <SandTimer raceDate={format(addDays(new Date(), days), "yyyy-MM-dd")} size={88} />
              <div className="text-center">
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{progress}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
