"use client";

import { useRef, useState } from "react";
import { FlaskConical, Upload, X } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { BloodworkAnalysis } from "@/types";

interface BloodworkUploadProps {
  onAnalysisComplete: (analysis: BloodworkAnalysis) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function BloodworkUpload({ onAnalysisComplete }: BloodworkUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ALLOWED_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  const handleFile = (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Please upload a PDF or image (JPG, PNG, WebP).");
      return;
    }
    setError(null);
    setSelectedFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleAnalyse = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/bloodwork/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }

      const result: BloodworkAnalysis = await res.json();
      setSelectedFile(null);
      if (inputRef.current) inputRef.current.value = "";
      onAnalysisComplete(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FlaskConical
            className="h-4 w-4"
            style={{ color: "var(--color-accent)" }}
          />
          <CardTitle>Bloodwork Analysis</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Drop zone */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => !loading && inputRef.current?.click()}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !loading)
              inputRef.current?.click();
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="rounded-xl border-2 border-dashed p-6 text-center transition-colors cursor-pointer select-none"
          style={{
            borderColor: dragging
              ? "var(--color-accent)"
              : "var(--color-border)",
            background: dragging
              ? "color-mix(in srgb, var(--color-accent) 6%, transparent)"
              : "var(--color-surface-2)",
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={handleInputChange}
            disabled={loading}
          />

          {selectedFile ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm min-w-0">
                <Upload
                  className="h-4 w-4 shrink-0"
                  style={{ color: "var(--color-accent)" }}
                />
                <span
                  className="font-medium truncate"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {selectedFile.name}
                </span>
                <span
                  className="shrink-0 text-xs"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {formatBytes(selectedFile.size)}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile();
                }}
                className="shrink-0 rounded-md p-1 hover:opacity-70 transition-opacity"
                style={{ color: "var(--color-text-muted)" }}
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              <Upload
                className="mx-auto h-8 w-8"
                style={{ color: "var(--color-text-muted)" }}
              />
              <p
                className="text-sm font-medium"
                style={{ color: "var(--color-text-primary)" }}
              >
                Drop your bloodwork here or click to browse
              </p>
              <p
                className="text-xs"
                style={{ color: "var(--color-text-muted)" }}
              >
                PDF or photo of your results
              </p>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <p
            className="text-sm rounded-lg px-3 py-2"
            style={{
              color: "var(--color-red)",
              background:
                "color-mix(in srgb, var(--color-red) 10%, transparent)",
            }}
          >
            {error}
          </p>
        )}

        {/* Analyse button */}
        <Button
          type="button"
          onClick={handleAnalyse}
          disabled={!selectedFile || loading}
          loading={loading}
          className="w-full"
        >
          {loading ? "Reading your bloodwork..." : "Analyse results"}
        </Button>
      </CardContent>
    </Card>
  );
}
