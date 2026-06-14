"use client";

import { useState, useMemo, useEffect } from "react";
import ProjectRow from "@/components/ProjectRow";
import type { Project, SortKey, SortDirection } from "@/lib/types";
import { getProjects, isApiConfigured } from "@/lib/api";
import { mockProjects } from "@/lib/mock-projects";

export default function BrowsePage() {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");
  const [visibleCount, setVisibleCount] = useState(5);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [loading, setLoading] = useState(true);

  // Try the real API; fall back to the seeded mock list. getProjects() already
  // falls back internally, but we wrap this so we can show a subtle loading
  // state and reflect API-driven data when it becomes available.
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getProjects()
      .then((list) => {
        if (!mounted) return;
        if (Array.isArray(list) && list.length > 0) setProjects(list);
      })
      .catch(() => {
        /* getProjects already returns mock on failure */
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const sorted = useMemo(() => {
    let list = projects;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.symbol.toLowerCase().includes(q),
      );
    }
    const sortedList = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else cmp = (a[sortKey] as number) - (b[sortKey] as number);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sortedList;
  }, [projects, search, sortKey, sortDir]);

  const visible = sorted.slice(0, visibleCount);
  const hasMore = visibleCount < sorted.length;

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold sm:text-4xl">
          Browse <span className="text-accent">Projects</span>
        </h1>
        <p className="mt-2 text-muted">
          Projects ranked by the Lisa Coefficient — the aggregate output of 8
          AI agents.
        </p>
        {!isApiConfigured && (
          <p className="mt-2 inline-block rounded-full border border-white/10 bg-surface px-3 py-1 text-xs text-muted">
            Demo data · backend not yet connected
          </p>
        )}
        {loading && (
          <p className="mt-2 text-xs text-muted">Loading projects…</p>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search by name or symbol..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setVisibleCount(5);
            }}
            className="w-full rounded-xl border border-white/10 bg-surface px-12 py-3 text-sm outline-none transition-colors placeholder:text-muted focus:border-accent"
          />
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border border-white/5 bg-surface sm:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wider text-muted">
              <th className="px-4 py-3 font-medium">
                <button
                  onClick={() => handleSort("rank")}
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  # {sortKey === "rank" && (sortDir === "asc" ? "▲" : "▼")}
                </button>
              </th>
              <th className="px-4 py-3 font-medium">
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  Name {sortKey === "name" && (sortDir === "asc" ? "▲" : "▼")}
                </button>
              </th>
              <th className="px-4 py-3 font-medium">Symbol</th>
              <th className="px-4 py-3 font-medium">
                <button
                  onClick={() => handleSort("coefficient")}
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  Lisa Coeff.{" "}
                  {sortKey === "coefficient" && (sortDir === "asc" ? "▲" : "▼")}
                </button>
              </th>
              <th className="px-4 py-3 font-medium">
                <button
                  onClick={() => handleSort("change")}
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  Change{" "}
                  {sortKey === "change" && (sortDir === "asc" ? "▲" : "▼")}
                </button>
              </th>
              <th className="px-4 py-3 text-right font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((p) => (
              <ProjectRow key={p.id} project={p} />
            ))}
          </tbody>
        </table>
        {visible.length === 0 && (
          <div className="px-4 py-12 text-center text-muted">
            No projects found matching &quot;{search}&quot;.
          </div>
        )}
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 sm:hidden">
        {visible.map((p) => (
          <div
            key={p.id}
            className="rounded-2xl border border-white/5 bg-surface p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-black"
                  style={{ background: p.logo }}
                >
                  {p.symbol.slice(0, 2)}
                </div>
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs text-muted">{p.symbol}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-accent">{p.coefficient}</div>
                <div
                  className={`text-xs ${p.change >= 0 ? "text-green-400" : "text-red-400"}`}
                >
                  {p.change >= 0 ? "▲" : "▼"} {Math.abs(p.change)}
                </div>
              </div>
            </div>
            <div className="mt-2 text-xs text-muted">
              #{p.rank} · Updated {p.updated}
            </div>
          </div>
        ))}
        {visible.length === 0 && (
          <div className="rounded-2xl border border-white/5 bg-surface px-4 py-12 text-center text-muted">
            No projects found matching &quot;{search}&quot;.
          </div>
        )}
      </div>

      {/* Load More */}
      {hasMore && visible.length > 0 && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setVisibleCount((c) => c + 5)}
            className="rounded-xl border border-white/10 bg-surface px-8 py-3 text-sm font-semibold transition-colors hover:bg-surface-light"
          >
            Load More
          </button>
        </div>
      )}

      {/* Request CTA */}
      <div className="mt-10 rounded-2xl border border-accent/20 bg-surface p-6 text-center sm:p-8">
        <h3 className="text-xl font-bold">
          Don&apos;t see your project?
        </h3>
        <p className="mt-2 text-sm text-muted">
          Request a full report and our 8 AI agents will analyze it.
        </p>
        <button className="mt-4 rounded-xl bg-accent px-8 py-3 text-sm font-bold text-black transition-transform hover:scale-105">
          Request Report → $9.99
        </button>
      </div>
    </div>
  );
}
