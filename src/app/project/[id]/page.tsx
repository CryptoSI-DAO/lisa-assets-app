"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AgentScoreBar from "@/components/AgentScoreBar";
import ReportUnlockCard from "@/components/ReportUnlockCard";
import { useAuth } from "@/lib/auth-context";
import { getReport, type ReportResult } from "@/lib/api";
import {
  AGENTS,
  type LisaKimData,
  type MockReport,
} from "@/lib/mock-report";

function scoreColorClass(score: number): string {
  if (score >= 7) return "text-green-400";
  if (score >= 5) return "text-yellow-400";
  return "text-red-400";
}

function formatUsd(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function isStale(iso: string): boolean {
  const ms = Date.now() - new Date(iso).getTime();
  return ms > 30 * 24 * 60 * 60 * 1000;
}

export default function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [result, setResult] = useState<ReportResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [forceUnlocked, setForceUnlocked] = useState(false);

  // Check if user already has this report unlocked via tokens
  const { user } = useAuth();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setForceUnlocked(false);

    // First check if user already unlocked this report
    async function checkUnlocked() {
      if (user) {
        try {
          const { supabase } = await import("@/lib/supabase");
          const { data } = await supabase
            .from("unlocked_reports")
            .select("id")
            .eq("user_id", user.id)
            .eq("project_id", params.id)
            .single();
          if (data && mounted) {
            setForceUnlocked(true);
          }
        } catch {
          // Not unlocked or not signed in — that's fine
        }
      }
    }

    checkUnlocked();

    getReport(params.id)
      .then((r) => mounted && setResult(r))
      .catch(() => {
        if (mounted) {
          setResult({ report: null, locked: true, reason: "error" });
        }
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [params.id, user?.id]);

  if (loading || !result) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-muted sm:px-6">
        Loading report…
      </div>
    );
  }

  const locked = result.locked && !forceUnlocked;

  if (locked) {
    return (
      <>
        <div className="mx-auto max-w-4xl px-4 pt-10 sm:px-6">
          <Link
            href="/browse"
            className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
          >
            ← Back to projects
          </Link>
        </div>
        <ReportUnlockCard
          // Prefer the report's coingecko id when known, else the URL id.
          coingeckoId={(result.report as MockReport | null)?.project?.coingecko_id ?? params.id}
          onUnlocked={() => setForceUnlocked(true)}
        />
      </>
    );
  }

  return <ReportView report={result.report!} params={params} />;
}

// ---------------------------------------------------------------------------
// Full report view (existing UI, now driven by the unlocked report)
// ---------------------------------------------------------------------------

function ReportView({
  report,
  params,
}: {
  report: MockReport;
  params: { id: string };
}) {
  const [copied, setCopied] = useState(false);
  const stale = isStale(report.created_at);

  const lisaKim = report.agents.lisa_kim as LisaKimData;
  const hasTrajectory = Boolean(lisaKim?.trajectory);

  // Build a flat ordered list of agents for rendering, flagging the strongest.
  const orderedAgents = useMemo(
    () =>
      AGENTS.map((meta) => {
        const data = report.agents[meta.id as keyof typeof report.agents];
        return {
          meta,
          score: data.score,
          notes: data.notes,
          isStrongest: report.strongest_agent === meta.id,
        };
      }),
    [report],
  );

  // Agents excluding Lisa Kim (rendered separately above the grid).
  const gridAgents = orderedAgents.filter((a) => a.meta.id !== "lisa_kim");

  function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(
        () => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        },
        () => undefined,
      );
    }
  }

  return (
    <div
      className="mx-auto max-w-4xl px-4 py-10 sm:px-6"
      data-project-id={params.id}
    >
      {/* Back link */}
      <Link
        href="/browse"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
      >
        ← Back to projects
      </Link>

      {/* Header */}
      <section className="rounded-3xl border border-white/5 bg-surface p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-2xl font-bold text-black">
              {report.project.symbol.slice(0, 2)}
            </div>
            <div>
              <h1 className="text-3xl font-bold sm:text-4xl">
                {report.project.name}{" "}
                <span className="text-muted">({report.project.symbol})</span>
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                <span className="font-semibold text-foreground">
                  {formatUsd(report.project.price_usd)}
                </span>
                <span>MCap {formatUsd(report.project.market_cap_usd)}</span>
              </div>
            </div>
          </div>

          {/* Lisa Coefficient hero */}
          <div className="text-left sm:text-right">
            <div className="text-xs uppercase tracking-widest text-muted">
              Lisa Coefficient
            </div>
            <div
              className={`text-6xl font-extrabold leading-none ${scoreColorClass(
                report.lisa_coefficient,
              )}`}
            >
              {report.lisa_coefficient.toFixed(1)}
            </div>
            {hasTrajectory && lisaKim.trajectory && (
              <div
                className={`mt-1 inline-flex items-center gap-1 text-sm font-semibold ${
                  lisaKim.trajectory.improvement >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {lisaKim.trajectory.improvement >= 0 ? "▲" : "▼"}{" "}
                {Math.abs(lisaKim.trajectory.improvement).toFixed(1)}{" "}
                <span className="font-normal text-muted">
                  ({lisaKim.trajectory.momentum})
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Lisa Kim verdict — styled distinctly */}
      <section className="mt-6 rounded-3xl border-2 border-accent/60 bg-accent/5 p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="text-4xl">👑</span>
          <div>
            <h2 className="text-2xl font-bold">
              Lisa Kim&apos;s Verdict
              <span className="ml-2 align-middle text-xs font-medium uppercase tracking-widest text-accent">
                Meta-Synthesis
              </span>
            </h2>
            <p className="text-xs text-muted">
              {lisaKim.score.toFixed(1)}/10 · trajectory analysis
            </p>
          </div>
        </div>
        <blockquote className="mt-4 border-l-4 border-accent pl-4 text-lg italic leading-relaxed">
          &ldquo;{report.lisa_verdict}&rdquo;
        </blockquote>
      </section>

      {/* Trajectory (only if prior data exists) */}
      {hasTrajectory && lisaKim.trajectory && (
        <section className="mt-6 rounded-3xl border border-white/5 bg-surface p-6 sm:p-8">
          <h2 className="text-xl font-bold">📈 Trajectory</h2>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-surface-light p-4 text-center">
              <div className="text-xs uppercase tracking-widest text-muted">
                Previous
              </div>
              <div className="mt-1 text-3xl font-bold text-muted">
                {lisaKim.trajectory.previous_score.toFixed(1)}
              </div>
            </div>
            <div className="rounded-2xl bg-surface-light p-4 text-center">
              <div className="text-xs uppercase tracking-widest text-muted">
                Current
              </div>
              <div
                className={`mt-1 text-3xl font-bold ${scoreColorClass(
                  report.lisa_coefficient,
                )}`}
              >
                {report.lisa_coefficient.toFixed(1)}
              </div>
              <div className="text-xs text-green-400">
                ▲ {lisaKim.trajectory.improvement.toFixed(1)}
              </div>
            </div>
            <div className="rounded-2xl border border-accent/30 bg-accent/5 p-4 text-center">
              <div className="text-xs uppercase tracking-widest text-accent">
                Projected
              </div>
              <div className="mt-1 text-3xl font-bold text-accent">
                {lisaKim.trajectory.projected_score.toFixed(1)}
              </div>
              <div className="text-xs text-muted">
                by {formatDate(lisaKim.trajectory.projection_date)}
              </div>
            </div>
          </div>

          {/* Simple progression chart */}
          <div className="mt-6">
            <div className="relative h-2 w-full rounded-full bg-surface-lighter">
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-accent transition-all duration-700"
                style={{
                  width: `${(lisaKim.trajectory.projected_score / 10) * 100}%`,
                }}
              />
              <div
                className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-surface bg-muted"
                style={{
                  left: `calc(${(lisaKim.trajectory.previous_score / 10) * 100}% - 8px)`,
                }}
                title={`Previous: ${lisaKim.trajectory.previous_score}`}
              />
              <div
                className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-surface bg-green-400"
                style={{
                  left: `calc(${(report.lisa_coefficient / 10) * 100}% - 8px)`,
                }}
                title={`Current: ${report.lisa_coefficient}`}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted">
              <span>0</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>
        </section>
      )}

      {/* Agent scores */}
      <section className="mt-6">
        <h2 className="mb-4 text-xl font-bold">
          🤖 Agent Scores
          <span className="ml-2 text-sm font-normal text-muted">
            7 specialists · 1 synthesizer
          </span>
        </h2>
        <div className="space-y-3">
          {gridAgents.map(({ meta, score, notes, isStrongest }) => (
            <AgentScoreBar
              key={meta.id}
              agentName={meta.name}
              emoji={meta.emoji}
              score={score}
              description={meta.description}
              notes={notes}
              isStrongest={isStrongest}
            />
          ))}
          {/* Lisa Kim rendered last with the crown variant */}
          <AgentScoreBar
            agentName="Lisa Kim"
            emoji="👑"
            score={lisaKim.score}
            description="Meta-synthesis & trajectory"
            variant="crown"
          />
        </div>
      </section>

      {/* Footer / actions */}
      <section className="mt-8 rounded-2xl border border-white/5 bg-surface p-6 text-center">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-sm text-muted">
            <div>
              Report date:{" "}
              <span className="text-foreground">
                {formatDate(report.created_at)}
              </span>
            </div>
            {report.funded_by_count > 0 && (
              <div className="mt-1">
                💰 Funded by{" "}
                <span className="text-foreground">
                  {report.funded_by_count} contributors
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-xl border border-white/10 bg-surface-light px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-surface-lighter">
              {stale ? "🔄 Refresh for $9.99" : "🔄 Refresh Report"}
            </button>
            <button
              onClick={handleShare}
              className="rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-black transition-transform hover:scale-105"
            >
              {copied ? "✓ Copied!" : "🔗 Share"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
