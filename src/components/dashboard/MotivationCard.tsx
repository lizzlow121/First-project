import type { Quote } from "@/lib/quotes";
import type { Podcast } from "@/types";
import { Quote as QuoteIcon, Headphones, ExternalLink } from "lucide-react";

interface MotivationCardProps {
  quote: Quote;
  podcast: Podcast;
}

export function MotivationCard({ quote, podcast }: MotivationCardProps) {
  return (
    <div className="rounded-xl bg-[var(--color-surface-1)] border border-[var(--color-border)] p-5 flex flex-col gap-4">
      {/* Quote */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
          <QuoteIcon className="h-3 w-3" />
          Daily quote
        </div>
        <blockquote className="text-sm text-[var(--color-text-primary)] leading-relaxed">
          &ldquo;{quote.q}&rdquo;
        </blockquote>
        <p className="text-xs text-[var(--color-text-muted)]">— {quote.a}</p>
      </div>

      {/* Divider */}
      <div className="border-t border-[var(--color-border)]" />

      {/* Podcast */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
          <Headphones className="h-3 w-3" />
          Podcast suggestion
        </div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium">{podcast.name}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{podcast.description}</p>
          </div>
          <a
            href={podcast.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-[var(--color-accent)] hover:opacity-80"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
