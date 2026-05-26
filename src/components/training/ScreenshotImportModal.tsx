"use client";

import { useState, useRef, useCallback } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { SessionForm } from "./SessionForm";
import { Upload, ImageIcon, X } from "lucide-react";
import type { TrainingSession, Race } from "@/types";

interface ScreenshotImportModalProps {
  open: boolean;
  onClose: () => void;
  races?: Race[];
  onAddSession: (data: Omit<TrainingSession, "id" | "user_id" | "created_at">) => Promise<void>;
}

type Stage = "upload" | "parsed" | "error";

export function ScreenshotImportModal({
  open,
  onClose,
  races = [],
  onAddSession,
}: ScreenshotImportModalProps) {
  const [stage, setStage] = useState<Stage>("upload");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [parsedData, setParsedData] = useState<Partial<TrainingSession> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setStage("upload");
    setPreviewUrl(null);
    setFile(null);
    setParsedData(null);
    setError(null);
    onClose();
  };

  const handleFile = (f: File) => {
    if (!f.type.startsWith("image/")) {
      setError("Please upload a JPEG, PNG, or WEBP image.");
      return;
    }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setError(null);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const handleParse = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/training/import-screenshot", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to parse screenshot");
      const data = await res.json();
      setParsedData({
        title: data.title ?? "Imported session",
        session_type: data.session_type ?? "other",
        duration_minutes: data.duration_minutes ?? null,
        distance_km: data.distance_km ?? null,
        notes: data.notes ?? null,
      });
      setStage("parsed");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to parse screenshot");
      setStage("error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: Omit<TrainingSession, "id" | "user_id" | "created_at">) => {
    setSubmitting(true);
    await onAddSession(data);
    setSubmitting(false);
    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Import from screenshot"
      className="max-w-xl"
    >
      {stage === "upload" || stage === "error" ? (
        <div className="space-y-4">
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className="relative rounded-xl border-2 border-dashed cursor-pointer transition-colors flex flex-col items-center justify-center py-12 gap-3"
            style={{
              borderColor: dragging
                ? "var(--color-accent)"
                : "var(--color-border-light)",
              background: dragging
                ? "var(--color-accent-dim)"
                : "var(--color-surface-2)",
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            {previewUrl ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-48 rounded-lg object-contain"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewUrl(null);
                    setFile(null);
                  }}
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full flex items-center justify-center"
                  style={{ background: "var(--color-surface-3)" }}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <>
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center"
                  style={{ background: "var(--color-surface-3)" }}
                >
                  <ImageIcon className="h-6 w-6" style={{ color: "var(--color-text-muted)" }} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Drop image here or click to browse</p>
                  <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                    JPEG, PNG or WEBP
                  </p>
                </div>
              </>
            )}
          </div>

          {error && (
            <p className="text-sm" style={{ color: "var(--color-red)" }}>
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleParse}
              disabled={!file}
              loading={loading}
              className="flex-1"
            >
              <Upload className="h-4 w-4" />
              Parse workout
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div
            className="rounded-lg p-3 border"
            style={{
              background: "var(--color-green-dim)",
              borderColor: "var(--color-green)",
            }}
          >
            <p className="text-xs font-medium" style={{ color: "var(--color-green)" }}>
              Workout parsed! Review and confirm below.
            </p>
          </div>
          <SessionForm
            defaultValues={parsedData ?? undefined}
            races={races}
            onSubmit={handleSubmit}
            onCancel={handleClose}
            loading={submitting}
          />
        </div>
      )}
    </Modal>
  );
}
