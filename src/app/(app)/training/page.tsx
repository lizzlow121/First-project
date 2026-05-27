"use client";

import { useState } from "react";
import { useTrainingSessions } from "@/hooks/useTrainingSessions";
import { useRaces } from "@/hooks/useRaces";
import { WeekCalendar } from "@/components/training/WeekCalendar";
import { SessionForm } from "@/components/training/SessionForm";
import { ScreenshotImportModal } from "@/components/training/ScreenshotImportModal";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, ChevronRight, Camera, Plus } from "lucide-react";
import { format, addWeeks, subWeeks } from "date-fns";
import type { TrainingSession } from "@/types";

export default function TrainingPage() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const { sessions, weekStart, addSession, updateSession, deleteSession } =
    useTrainingSessions(currentWeek);
  const { races } = useRaces();

  const [showAdd, setShowAdd] = useState(false);
  const [editSession, setEditSession] = useState<TrainingSession | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const handleAddSession = (dateStr: string) => {
    setSelectedDate(dateStr);
    setShowAdd(true);
  };

  const handleSubmitAdd = async (
    data: Omit<TrainingSession, "id" | "user_id" | "created_at">
  ) => {
    setFormLoading(true);
    await addSession({ ...data, session_date: selectedDate ?? data.session_date });
    setFormLoading(false);
    setShowAdd(false);
    setSelectedDate(null);
  };

  const handleSubmitEdit = async (
    data: Omit<TrainingSession, "id" | "user_id" | "created_at">
  ) => {
    if (!editSession) return;
    setFormLoading(true);
    await updateSession(editSession.id, data);
    setFormLoading(false);
    setEditSession(null);
  };

  const handleDelete = async (id: string) => {
    await deleteSession(id);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold">Training</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
            Plan and log your weekly training
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowImport(true)}>
            <Camera className="h-4 w-4" />
            Import
          </Button>
          <Button size="sm" onClick={() => { setSelectedDate(null); setShowAdd(true); }}>
            <Plus className="h-4 w-4" />
            Add session
          </Button>
        </div>
      </div>

      {/* Week nav */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setCurrentWeek((w) => subWeeks(w, 1))}
          className="p-2 rounded-lg transition-colors hover:bg-[var(--color-surface-2)]"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 text-center">
          <p className="text-sm font-semibold">
            {format(weekStart, "d MMM")} &ndash;{" "}
            {format(addWeeks(weekStart, 1), "d MMM yyyy")}
          </p>
        </div>
        <button
          onClick={() => setCurrentWeek((w) => addWeeks(w, 1))}
          className="p-2 rounded-lg transition-colors hover:bg-[var(--color-surface-2)]"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <button
          onClick={() => setCurrentWeek(new Date())}
          className="text-xs px-3 py-1.5 rounded-lg border transition-colors hover:bg-[var(--color-surface-2)]"
          style={{
            borderColor: "var(--color-border)",
            color: "var(--color-text-secondary)",
          }}
        >
          Today
        </button>
      </div>

      {/* Calendar */}
      <WeekCalendar
        weekStart={weekStart}
        sessions={sessions}
        onAddSession={handleAddSession}
        onEditSession={(s) => setEditSession(s)}
        onDeleteSession={handleDelete}
      />

      {/* Add session modal */}
      <Modal
        open={showAdd}
        onClose={() => { setShowAdd(false); setSelectedDate(null); }}
        title="Add session"
      >
        <SessionForm
          defaultValues={selectedDate ? { session_date: selectedDate } : undefined}
          races={races}
          onSubmit={handleSubmitAdd}
          onCancel={() => { setShowAdd(false); setSelectedDate(null); }}
          loading={formLoading}
        />
      </Modal>

      {/* Edit session modal */}
      <Modal
        open={!!editSession}
        onClose={() => setEditSession(null)}
        title="Edit session"
      >
        {editSession && (
          <SessionForm
            defaultValues={editSession}
            races={races}
            onSubmit={handleSubmitEdit}
            onCancel={() => setEditSession(null)}
            loading={formLoading}
          />
        )}
      </Modal>

      {/* Screenshot import modal */}
      <ScreenshotImportModal
        open={showImport}
        onClose={() => setShowImport(false)}
        races={races}
        onAddSession={async (data) => {
          await addSession(data);
          setShowImport(false);
        }}
      />
    </div>
  );
}
