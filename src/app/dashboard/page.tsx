"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

interface TxRow {
  id: number;
  amount: number;
  type: "grant" | "spend";
  reason: string;
  project_id: string | null;
  created_at: string;
}

interface UnlockedRow {
  id: number;
  project_id: string;
  method: string;
  tokens_spent: number | null;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, signOut, tokenBalance } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [txs, setTxs] = useState<TxRow[]>([]);
  const [unlocked, setUnlocked] = useState<UnlockedRow[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [loading, user, router]);

  // Load transactions and unlocked reports
  useEffect(() => {
    if (!user) return;
    supabase
      .from("token_transactions")
      .select("id, amount, type, reason, project_id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => setTxs(data ?? []));

    supabase
      .from("unlocked_reports")
      .select("id, project_id, method, tokens_spent, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setUnlocked(data ?? []));
  }, [user]);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
    router.push("/");
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted sm:px-6">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted sm:px-6">
        Redirecting to sign in…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold sm:text-4xl">
            Your <span className="text-accent">Dashboard</span>
          </h1>
          <p className="mt-1 text-sm text-muted">
            Signed in as{" "}
            <span className="text-foreground">
              {user.email ?? "anonymous user"}
            </span>
          </p>
        </div>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="rounded-xl border border-white/10 bg-surface px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-surface-lighter disabled:opacity-60"
        >
          {signingOut ? "Signing out…" : "Log out"}
        </button>
      </div>

      {/* Token Balance Hero */}
      <section className="mt-8 overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 to-transparent p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted">
              Token Balance
            </div>
            <div className="mt-1 text-5xl font-extrabold text-accent">
              💎 {tokenBalance}
            </div>
          </div>
          <div className="text-right text-sm text-muted">
            <div>Reports = 10 💎 each</div>
            <div className="mt-1">
              {tokenBalance >= 10 ? (
                <span className="text-green-400">
                  {Math.floor(tokenBalance / 10)} unlock{Math.floor(tokenBalance / 10) !== 1 ? "s" : ""} available
                </span>
              ) : (
                <span>{10 - tokenBalance} more to unlock a report</span>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 text-xs text-muted">
          Earn tokens by contributing to{" "}
          <a
            href="https://github.com/CryptoSI-DAO"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            CryptoSI DAO
          </a>
        </div>
      </section>

      {/* Your Reports */}
      <section className="mt-6 rounded-2xl border border-white/5 bg-surface p-6 sm:p-8">
        <h2 className="text-lg font-bold">Unlocked Reports ({unlocked.length})</h2>
        {unlocked.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-surface-light/50 px-6 py-12 text-center">
            <div className="text-4xl">📂</div>
            <p className="mt-3 max-w-sm text-sm text-muted">
              No reports unlocked yet. Browse projects to get started.
            </p>
            <Link
              href="/browse"
              className="mt-5 rounded-xl bg-accent px-6 py-2.5 text-sm font-bold text-black transition-transform hover:scale-105"
            >
              Browse Projects
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {unlocked.map((r) => (
              <Link
                key={r.id}
                href={`/project/${r.project_id}`}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-surface-light px-4 py-3 transition-colors hover:border-accent/30"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {r.method === "tokens" ? "💎" : r.method === "crowdfund" ? "🤝" : "💳"}
                  </span>
                  <div>
                    <div className="font-semibold capitalize">{r.project_id.replace(/-/g, " ")}</div>
                    <div className="text-xs text-muted">
                      {new Date(r.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <span className="text-sm text-muted">View →</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Transaction History */}
      <section className="mt-6 rounded-2xl border border-white/5 bg-surface p-6 sm:p-8">
        <h2 className="text-lg font-bold">Token History</h2>
        {txs.length === 0 ? (
          <p className="mt-4 text-sm text-muted">No transactions yet.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {txs.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-surface-light px-4 py-2.5 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">
                    {tx.type === "grant" ? "🎁" : "💎"}
                  </span>
                  <div>
                    <div className="font-medium">{tx.reason}</div>
                    <div className="text-xs text-muted">
                      {new Date(tx.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                <span className={`font-bold ${tx.amount > 0 ? "text-green-400" : "text-red-400"}`}>
                  {tx.amount > 0 ? "+" : ""}{tx.amount} 💎
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
