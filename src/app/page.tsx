import Link from "next/link";
import { Trophy, CalendarDays, Utensils, Heart, Zap, Activity } from "lucide-react";

const features = [
  {
    icon: Trophy,
    title: "Race Management",
    description: "Track upcoming races, set goal times, and visualize your pace targets.",
  },
  {
    icon: CalendarDays,
    title: "Training Calendar",
    description: "Plan and log every session. Import from Strava or screenshot your workout.",
  },
  {
    icon: Utensils,
    title: "Nutrition Tracking",
    description: "Search millions of foods and hit your daily macro targets with ease.",
  },
  {
    icon: Heart,
    title: "Recovery Monitoring",
    description: "Log sleep, HRV, and soreness to keep your body performing at its best.",
  },
  {
    icon: Zap,
    title: "AI Training Plans",
    description: "Generate personalized training plans tailored to your goal race and fitness.",
  },
  {
    icon: Activity,
    title: "Integrations",
    description: "Connect Strava, Whoop, Garmin, and more to sync your data automatically.",
  },
];

export default function LandingPage() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--color-surface-0)", color: "var(--color-text-primary)" }}
    >
      {/* Nav */}
      <nav
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5" style={{ color: "var(--color-accent)" }} />
          <span className="text-base font-semibold tracking-tight">Athlete HQ</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm px-4 py-2 rounded-lg transition-colors"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm px-4 py-2 rounded-lg font-medium transition-opacity hover:opacity-90"
            style={{ background: "var(--color-accent)", color: "#fff" }}
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-24 pb-20">
        <div
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium mb-6 border"
          style={{
            background: "var(--color-accent-dim)",
            color: "var(--color-accent)",
            borderColor: "var(--color-accent-dim)",
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full inline-block" style={{ background: "var(--color-accent)" }} />
          Built for everyday athletes
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight max-w-3xl">
          Your training
          <br />
          <span style={{ color: "var(--color-accent)" }}>command center</span>
        </h1>

        <p className="mt-6 text-lg max-w-xl leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
          Athlete HQ brings together race planning, training logs, nutrition, recovery, and AI coaching in one
          clean dashboard — so you can focus on training, not juggling apps.
        </p>

        <div className="flex items-center gap-4 mt-10">
          <Link
            href="/signup"
            className="px-6 py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
            style={{ background: "var(--color-accent)", color: "#fff" }}
          >
            Start for free
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 rounded-xl font-semibold text-sm border transition-colors"
            style={{
              borderColor: "var(--color-border-light)",
              color: "var(--color-text-primary)",
              background: "var(--color-surface-2)",
            }}
          >
            Log in
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-24 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl p-5 border"
              style={{
                background: "var(--color-surface-1)",
                borderColor: "var(--color-border)",
              }}
            >
              <div
                className="inline-flex items-center justify-center h-10 w-10 rounded-lg mb-4"
                style={{ background: "var(--color-surface-3)" }}
              >
                <f.icon className="h-5 w-5" style={{ color: "var(--color-accent)" }} />
              </div>
              <h3 className="text-sm font-semibold mb-1">{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        className="mt-auto border-t px-6 py-6 text-center text-xs"
        style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
      >
        &copy; {new Date().getFullYear()} Athlete HQ. Built for athletes who train with purpose.
      </footer>
    </div>
  );
}
