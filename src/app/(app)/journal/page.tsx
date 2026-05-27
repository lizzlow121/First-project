"use client";

import { useState } from "react";
import { useJournal } from "@/hooks/useJournal";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Sparkles, Sun, Moon, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { todayISO } from "@/lib/utils";

export default function JournalPage() {
  const { entries, todayMorning, todayEvening, loading, upsertEntry } = useJournal();

  const [morningIntention, setMorningIntention] = useState(
    todayMorning?.intention ?? ""
  );
  const [eveningContent, setEveningContent] = useState(
    todayEvening?.content ?? ""
  );
  const [prompts, setPrompts] = useState<string[]>(
    todayEvening?.ai_prompts ?? []
  );
  const [savingMorning, setSavingMorning] = useState(false);
  const [savingEvening, setSavingEvening] = useState(false);
  const [loadingPrompts, setLoadingPrompts] = useState(false);

  const handleSaveMorning = async () => {
    setSavingMorning(true);
    await upsertEntry({
      entry_date: todayISO(),
      entry_type: "morning",
      intention: morningIntention,
      content: todayMorning?.content ?? null,
      ai_prompts: todayMorning?.ai_prompts ?? null,
    });
    setSavingMorning(false);
  };

  const handleSaveEvening = async () => {
    setSavingEvening(true);
    await upsertEntry({
      entry_date: todayISO(),
      entry_type: "evening",
      intention: todayEvening?.intention ?? null,
      content: eveningContent,
      ai_prompts: prompts.length > 0 ? prompts : null,
    });
    setSavingEvening(false);
  };

  const handleGetPrompts = async () => {
    setLoadingPrompts(true);
    try {
      const res = await fetch("/api/journal/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessions: [],
          raceName: null,
          daysToRace: null,
          recoveryScore: null,
          energyLevel: null,
          morningIntention: morningIntention || null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPrompts(data.prompts ?? []);
      }
    } catch {
      // ignore
    } finally {
      setLoadingPrompts(false);
    }
  };

  const pastEntries = entries.filter(
    (e) => e.entry_date !== todayISO()
  );

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">Journal</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
          {format(new Date(), "EEEE, d MMMM yyyy")}
        </p>
      </div>

      {/* Morning check-in */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4" style={{ color: "var(--color-amber)" }} />
            <CardTitle>Morning intention</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <Textarea
            id="morning_intention"
            placeholder="What's your intention for today? What do you want to focus on?"
            value={morningIntention}
            onChange={(e) => setMorningIntention(e.target.value)}
            className="min-h-[100px]"
          />
          <Button
            onClick={handleSaveMorning}
            loading={savingMorning}
            size="sm"
            disabled={!morningIntention.trim()}
          >
            {todayMorning ? "Update intention" : "Save intention"}
          </Button>
        </CardContent>
      </Card>

      {/* Evening reflection */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4" style={{ color: "var(--color-accent)" }} />
            <CardTitle>Evening reflection</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {/* AI prompts */}
          {prompts.length > 0 && (
            <div
              className="rounded-xl p-4 space-y-2 border"
              style={{
                background: "var(--color-accent-dim)",
                borderColor: "var(--color-accent)",
              }}
            >
              <p
                className="text-xs font-medium flex items-center gap-1.5"
                style={{ color: "var(--color-accent)" }}
              >
                <Sparkles className="h-3.5 w-3.5" />
                AI journal prompts
              </p>
              <ul className="space-y-1.5">
                {prompts.map((p, i) => (
                  <li
                    key={i}
                    className="text-sm cursor-pointer"
                    style={{ color: "var(--color-text-primary)" }}
                    onClick={() =>
                      setEveningContent(
                        eveningContent ? `${eveningContent}\n\n${p}` : p
                      )
                    }
                  >
                    {i + 1}. {p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Textarea
            id="evening_content"
            placeholder="Reflect on your day — training, nutrition, mindset, wins and challenges..."
            value={eveningContent}
            onChange={(e) => setEveningContent(e.target.value)}
            className="min-h-[140px]"
          />

          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleGetPrompts}
              loading={loadingPrompts}
            >
              <Sparkles className="h-4 w-4" />
              Get AI prompts
            </Button>
            <Button
              onClick={handleSaveEvening}
              loading={savingEvening}
              size="sm"
              disabled={!eveningContent.trim()}
            >
              {todayEvening ? "Update reflection" : "Save reflection"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Past entries */}
      {!loading && pastEntries.length > 0 && (
        <div className="space-y-3">
          <h2
            className="text-sm font-medium uppercase tracking-wider"
            style={{ color: "var(--color-text-muted)" }}
          >
            Recent entries
          </h2>
          {pastEntries.slice(0, 10).map((entry) => (
            <Card key={entry.id} className="p-4">
              <div className="flex items-start gap-3">
                <div
                  className="flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center"
                  style={{ background: "var(--color-surface-3)" }}
                >
                  {entry.entry_type === "morning" ? (
                    <Sun className="h-4 w-4" style={{ color: "var(--color-amber)" }} />
                  ) : (
                    <Moon className="h-4 w-4" style={{ color: "var(--color-accent)" }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-medium capitalize" style={{ color: "var(--color-text-muted)" }}>
                      {entry.entry_type} · {format(new Date(entry.entry_date + "T00:00:00"), "d MMM yyyy")}
                    </p>
                  </div>
                  {entry.intention && (
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                      <span style={{ color: "var(--color-text-muted)" }}>Intention: </span>
                      {entry.intention}
                    </p>
                  )}
                  {entry.content && (
                    <p
                      className="text-sm mt-1 line-clamp-3"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {entry.content}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
