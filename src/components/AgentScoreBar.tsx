"use client";

import { useEffect, useState } from "react";

interface AgentScoreBarProps {
  agentName: string;
  emoji: string;
  score: number;
  description?: string;
  notes?: string[];
  isStrongest?: boolean;
  variant?: "default" | "crown";
}

/** Color a score 0-10 for the fill bar. */
function scoreColor(score: number): string {
  if (score >= 7) return "#22c55e"; // green
  if (score >= 5) return "#eab308"; // yellow
  return "#ef4444"; // red
}

export default function AgentScoreBar({
  agentName,
  emoji,
  score,
  description,
  notes = [],
  isStrongest = false,
  variant = "default",
}: AgentScoreBarProps) {
  const pct = Math.min(100, Math.max(0, (score / 10) * 100));
  const color = scoreColor(score);

  // Animate the fill from 0 on mount for a satisfying reveal.
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 60);
    return () => clearTimeout(t);
  }, [pct]);

  const isCrown = variant === "crown";

  return (
    <div
      className={`rounded-2xl border p-4 transition-colors ${
        isCrown
          ? "border-accent/50 bg-accent/5"
          : isStrongest
            ? "border-accent/40 bg-surface"
            : "border-white/5 bg-surface"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm sm:text-base">
          <span className="text-lg">{emoji}</span>
          <span className="font-semibold">{agentName}</span>
          {description && (
            <span className="hidden text-xs text-muted sm:inline">
              · {description}
            </span>
          )}
          {isStrongest && (
            <span className="ml-1 rounded-full bg-accent/20 px-2 py-0.5 text-xs font-bold text-accent">
              ⭐ Top
            </span>
          )}
        </span>
        <span className="font-bold tabular-nums" style={{ color }}>
          {score.toFixed(1)}
        </span>
      </div>

      <div
        className={`mt-3 h-2.5 w-full overflow-hidden rounded-full ${
          isCrown ? "bg-accent/10" : "bg-surface-lighter"
        }`}
      >
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>

      {notes.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {notes.map((note, i) => (
            <li
              key={i}
              className="rounded-full bg-surface-light px-3 py-1 text-xs text-muted"
            >
              {note}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
