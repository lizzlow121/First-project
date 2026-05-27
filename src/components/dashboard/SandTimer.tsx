"use client";

import { useEffect, useState } from "react";

interface SandTimerProps {
  raceDate: string;
  /** How many days before the race the sand starts draining. Default 84 (12 weeks). */
  prepDays?: number;
  size?: number;
}

const DAY_MS = 1000 * 60 * 60 * 24;

export function SandTimer({ raceDate, prepDays = 84, size = 96 }: SandTimerProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const tick = () => {
      const end = new Date(raceDate).getTime();
      const daysToRace = (end - Date.now()) / DAY_MS;
      const p = Math.max(0, Math.min(1, (prepDays - daysToRace) / prepDays));
      setProgress(p);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [raceDate, prepDays]);

  // Geometry: chambers go from y=14→74 (top) and y=86→146 (bottom)
  const CHAMBER_HEIGHT = 60;
  const topSandY = 14 + progress * CHAMBER_HEIGHT;
  const topSandHeight = (1 - progress) * CHAMBER_HEIGHT;
  const bottomSandY = 146 - progress * CHAMBER_HEIGHT;
  const bottomSandHeight = progress * CHAMBER_HEIGHT;

  const isDraining = progress > 0 && progress < 1;
  const pileHeight = Math.min(8, bottomSandHeight * 0.3);

  return (
    <svg
      viewBox="0 0 100 160"
      width={size}
      height={size * 1.6}
      className="select-none"
      role="img"
      aria-label={`Sand timer at ${Math.round(progress * 100)}%`}
    >
      <defs>
        <linearGradient id="sandGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
        <linearGradient id="capGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#525252" />
          <stop offset="100%" stopColor="#3f3f46" />
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

      {/* Glass fill background */}
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
          fill="url(#sandGradient)"
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
          fill="url(#sandGradient)"
          clipPath="url(#bottomChamber)"
        />
      )}

      {/* Bottom sand pile peak (in the middle, where sand is landing) */}
      {isDraining && pileHeight > 1 && (
        <path
          d={`M ${50 - 12} ${bottomSandY + 0.5} Q 50 ${bottomSandY - pileHeight} ${50 + 12} ${bottomSandY + 0.5} Z`}
          fill="url(#sandGradient)"
          clipPath="url(#bottomChamber)"
        />
      )}

      {/* Falling sand stream */}
      {isDraining && (
        <>
          <line
            x1="50"
            y1="80"
            x2="50"
            y2={bottomSandY - pileHeight}
            stroke="#fbbf24"
            strokeWidth="1.2"
            opacity="0.85"
          />
          {/* Animated falling grains */}
          {[0, 0.33, 0.66].map((delay, i) => (
            <circle
              key={i}
              cx="50"
              cy="80"
              r="0.9"
              fill="#fbbf24"
            >
              <animate
                attributeName="cy"
                from="80"
                to={bottomSandY - pileHeight}
                dur="0.7s"
                begin={`${delay}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0;1;1;0"
                dur="0.7s"
                begin={`${delay}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </>
      )}

      {/* Glass outline (drawn last so it sits above sand) */}
      <path
        d="M 22 14 L 78 14 L 52 74 L 52 86 L 78 146 L 22 146 L 48 86 L 48 74 Z"
        fill="none"
        stroke="#52525b"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
