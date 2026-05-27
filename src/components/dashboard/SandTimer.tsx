"use client";

import { useEffect, useRef, useState } from "react";

interface SandTimerProps {
  raceDate: string;
  /** How many days before the race the sand starts draining. Default 84 (12 weeks). */
  prepDays?: number;
  size?: number;
}

const DAY_MS = 1000 * 60 * 60 * 24;

type Urgency = "normal" | "final-week" | "race-eve" | "race-day";

function getUrgency(daysToRace: number): Urgency {
  if (daysToRace <= 0) return "race-day";
  if (daysToRace < 1) return "race-eve";
  if (daysToRace <= 7) return "final-week";
  return "normal";
}

const GRADIENTS = {
  normal: { from: "#F04E23", to: "#FF8C00", glow: "#F97316" },
  "final-week": { from: "#EF4444", to: "#F04E23", glow: "#EF4444" },
  "race-eve": { from: "#DC2626", to: "#EF4444", glow: "#DC2626" },
  "race-day": { from: "#00B96B", to: "#059669", glow: "#00B96B" },
};

export function SandTimer({ raceDate, prepDays = 84, size = 96 }: SandTimerProps) {
  const [progress, setProgress] = useState(0);
  const [daysToRace, setDaysToRace] = useState(prepDays);
  const [shake, setShake] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const tick = () => {
      const end = new Date(raceDate).getTime();
      const days = (end - Date.now()) / DAY_MS;
      const p = Math.max(0, Math.min(1, (prepDays - days) / prepDays));
      setProgress(p);
      setDaysToRace(days);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [raceDate, prepDays]);

  const urgency = getUrgency(daysToRace);
  const colors = GRADIENTS[urgency];

  // Geometry
  const CHAMBER_HEIGHT = 60;
  const topSandY = 14 + progress * CHAMBER_HEIGHT;
  const topSandHeight = (1 - progress) * CHAMBER_HEIGHT;
  const bottomSandY = 146 - progress * CHAMBER_HEIGHT;
  const bottomSandHeight = progress * CHAMBER_HEIGHT;

  const isDraining = progress > 0 && progress < 1;
  const isRaceDay = urgency === "race-day";
  const pulse = urgency === "race-eve" || isRaceDay;
  const pileHeight = Math.min(8, bottomSandHeight * 0.3);

  const handleClick = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  return (
    <div
      onClick={handleClick}
      className="relative cursor-pointer select-none"
      style={{
        animation: shake ? "sandShake 0.6s ease-in-out" : pulse ? "sandPulse 2s ease-in-out infinite" : undefined,
        filter: pulse ? `drop-shadow(0 0 12px ${colors.glow}aa)` : undefined,
        transition: "filter 0.3s",
      }}
    >
      <style>{`
        @keyframes sandShake {
          0%, 100% { transform: rotate(0deg); }
          15% { transform: rotate(-6deg); }
          30% { transform: rotate(5deg); }
          45% { transform: rotate(-4deg); }
          60% { transform: rotate(3deg); }
          75% { transform: rotate(-1deg); }
        }
        @keyframes sandPulse {
          0%, 100% { filter: drop-shadow(0 0 8px ${colors.glow}88); }
          50% { filter: drop-shadow(0 0 18px ${colors.glow}); }
        }
      `}</style>
      <svg
        ref={svgRef}
        viewBox="0 0 100 160"
        width={size}
        height={size * 1.6}
        role="img"
        aria-label={`Sand timer at ${Math.round(progress * 100)}% — ${Math.max(0, Math.ceil(daysToRace))} days remaining`}
      >
        <defs>
          <linearGradient id={`sg-${urgency}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.from} />
            <stop offset="100%" stopColor={colors.to} />
          </linearGradient>
          <linearGradient id="capGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </linearGradient>
          <clipPath id="topChamber">
            <path d="M 22 14 L 78 14 L 52 74 L 48 74 Z" />
          </clipPath>
          <clipPath id="bottomChamber">
            <path d="M 48 86 L 52 86 L 78 146 L 22 146 Z" />
          </clipPath>
        </defs>

        {/* Caps */}
        <rect x="14" y="6" width="72" height="6" rx="2" fill="url(#capGradient)" />
        <rect x="14" y="148" width="72" height="6" rx="2" fill="url(#capGradient)" />

        {/* Glass interior tint */}
        <path
          d="M 22 14 L 78 14 L 52 74 L 52 86 L 78 146 L 22 146 L 48 86 L 48 74 Z"
          fill="rgba(255, 255, 255, 0.03)"
        />

        {/* Top sand */}
        {topSandHeight > 0.5 && (
          <rect
            x="20"
            y={topSandY}
            width="60"
            height={topSandHeight}
            fill={`url(#sg-${urgency})`}
            clipPath="url(#topChamber)"
          />
        )}

        {/* Bottom sand (flat fill) */}
        {bottomSandHeight > 0.5 && (
          <rect
            x="20"
            y={bottomSandY}
            width="60"
            height={bottomSandHeight}
            fill={`url(#sg-${urgency})`}
            clipPath="url(#bottomChamber)"
          />
        )}

        {/* Bottom pile peak */}
        {isDraining && pileHeight > 1 && (
          <path
            d={`M ${50 - 12} ${bottomSandY + 0.5} Q 50 ${bottomSandY - pileHeight} ${50 + 12} ${bottomSandY + 0.5} Z`}
            fill={`url(#sg-${urgency})`}
            clipPath="url(#bottomChamber)"
          />
        )}

        {/* Falling stream + animated grains */}
        {isDraining && (
          <>
            <line
              x1="50"
              y1="80"
              x2="50"
              y2={bottomSandY - pileHeight}
              stroke={colors.from}
              strokeWidth="1.2"
              opacity="0.85"
            />
            {[0, 0.33, 0.66].map((delay, i) => (
              <circle key={i} cx="50" cy="80" r="0.9" fill={colors.from}>
                <animate
                  attributeName="cy"
                  from="80"
                  to={bottomSandY - pileHeight}
                  dur={urgency === "final-week" || urgency === "race-eve" ? "0.4s" : "0.7s"}
                  begin={`${delay}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0;1;1;0"
                  dur={urgency === "final-week" || urgency === "race-eve" ? "0.4s" : "0.7s"}
                  begin={`${delay}s`}
                  repeatCount="indefinite"
                />
              </circle>
            ))}
          </>
        )}

        {/* Race day completion glow */}
        {isRaceDay && (
          <>
            <circle cx="50" cy="116" r="14" fill={colors.from} opacity="0.25">
              <animate attributeName="r" values="14;18;14" dur="2s" repeatCount="indefinite" />
            </circle>
            <text
              x="50"
              y="120"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="9"
              fontWeight="700"
              letterSpacing="0.5"
            >
              GO
            </text>
          </>
        )}

        {/* Glass outline (on top so it sits above sand) */}
        <path
          d="M 22 14 L 78 14 L 52 74 L 52 86 L 78 146 L 22 146 L 48 86 L 48 74 Z"
          fill="none"
          stroke="#CBD5E1"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
