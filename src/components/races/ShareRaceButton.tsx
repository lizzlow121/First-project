"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { Share2, Check, Copy } from "lucide-react";
import type { Race } from "@/types";
import { useRouter } from "next/navigation";

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}-${suffix}`;
}

export function ShareRaceButton({ race }: { race: Race }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== "undefined" && race.share_slug
      ? `${window.location.origin}/share/race/${race.share_slug}`
      : "";

  const handleShare = async () => {
    if (race.share_slug) {
      setOpen(true);
      return;
    }
    setCreating(true);
    const supabase = createClient();
    const slug = generateSlug(race.name);
    await supabase
      .from("races")
      .update({ share_slug: slug, shared_at: new Date().toISOString() })
      .eq("id", race.id);
    setCreating(false);
    setOpen(true);
    router.refresh();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Button variant="secondary" size="sm" onClick={handleShare} loading={creating}>
        <Share2 className="h-4 w-4" />
        {race.share_slug ? "Share" : "Get share link"}
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Share this race">
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Anyone with this link can see your race countdown and goal time. No personal data
            (training, nutrition, etc.) is shared.
          </p>
          <div className="flex gap-2">
            <Input id="share-url" value={shareUrl} readOnly className="flex-1" />
            <Button onClick={handleCopy} variant="secondary">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
