"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Upload } from "lucide-react";

export function GarminUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setResult(null);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/training/import-gpx", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setResult(`Imported: ${data.title ?? "Activity"}`);
      setFile(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <input
        ref={inputRef}
        type="file"
        accept=".gpx"
        className="hidden"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <Button
        variant="secondary"
        size="sm"
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-4 w-4" />
        {file ? file.name : "Choose GPX file"}
      </Button>
      {file && (
        <Button size="sm" onClick={handleUpload} loading={uploading}>
          Upload
        </Button>
      )}
      {result && (
        <span className="text-xs" style={{ color: "var(--color-green)" }}>
          {result}
        </span>
      )}
      {error && (
        <span className="text-xs" style={{ color: "var(--color-red)" }}>
          {error}
        </span>
      )}
    </div>
  );
}
