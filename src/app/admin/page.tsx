"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { grantTokens } from "@/lib/tokens";

export default function AdminPage() {
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();

  const [emailInput, setEmailInput] = useState("");
  const [amountInput, setAmountInput] = useState("10");
  const [reasonInput, setReasonInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/auth/login");
      } else if (!isAdmin) {
        router.replace("/dashboard");
      }
    }
  }, [loading, user, isAdmin, router]);

  async function handleGrant() {
    if (!emailInput.trim() || !amountInput.trim()) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await grantTokens(
        emailInput.trim(),
        parseInt(amountInput) || 0,
        reasonInput.trim() || "Manual grant",
      );
      if (res.ok) {
        setMessage({
          type: "ok",
          text: `✅ Granted ${res.granted} tokens to ${res.email}. New balance: ${res.newBalance} 💎`,
        });
        setEmailInput("");
        setReasonInput("");
      } else {
        setMessage({ type: "err", text: `❌ ${res.error}` });
      }
    } catch (err) {
      setMessage({ type: "err", text: String(err) });
    } finally {
      setBusy(false);
    }
  }

  if (loading || !user || !isAdmin) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted sm:px-6">
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold sm:text-4xl">
        ⚙️ <span className="text-accent">Admin</span> Panel
      </h1>
      <p className="mt-2 text-sm text-muted">
        Grant tokens to contributors. They can spend tokens to unlock reports.
      </p>

      {/* Grant Form */}
      <section className="mt-8 rounded-2xl border border-accent/20 bg-surface p-6 sm:p-8">
        <h2 className="text-lg font-bold">Grant Tokens</h2>

        {message && (
          <div
            className={`mt-4 rounded-lg px-4 py-3 text-sm ${
              message.type === "ok"
                ? "bg-green-500/10 text-green-400"
                : "bg-red-500/10 text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted">
              User Email
            </label>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="contributor@example.com"
              className="mt-1 w-full rounded-lg border border-white/10 bg-surface-light px-4 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted">
              Amount (tokens)
            </label>
            <div className="mt-1 flex gap-2">
              {[5, 10, 20, 50].map((n) => (
                <button
                  key={n}
                  onClick={() => setAmountInput(String(n))}
                  className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                    amountInput === String(n)
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-white/10 bg-surface-light text-muted hover:text-foreground"
                  }`}
                >
                  {n}
                </button>
              ))}
              <input
                type="number"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className="w-24 rounded-lg border border-white/10 bg-surface-light px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted">
              Reason (optional)
            </label>
            <input
              type="text"
              value={reasonInput}
              onChange={(e) => setReasonInput(e.target.value)}
              placeholder="e.g. Merged PR #42 in subwatch"
              className="mt-1 w-full rounded-lg border border-white/10 bg-surface-light px-4 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>

          <button
            onClick={handleGrant}
            disabled={busy || !emailInput.trim()}
            className="w-full rounded-xl bg-accent px-5 py-3 text-sm font-bold text-black transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {busy ? "Granting…" : `Grant ${amountInput || "?"} 💎 →`}
          </button>
        </div>
      </section>

      {/* Quick reference */}
      <section className="mt-6 rounded-2xl border border-white/5 bg-surface p-6">
        <h2 className="text-lg font-bold">Suggested Grant Amounts</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-white/5 bg-surface-light p-3 text-sm">
            <span className="font-bold text-accent">5 💎</span> — Small fix, typo, minor refactor
          </div>
          <div className="rounded-lg border border-white/5 bg-surface-light p-3 text-sm">
            <span className="font-bold text-accent">10 💎</span> — One report unlock equivalent
          </div>
          <div className="rounded-lg border border-white/5 bg-surface-light p-3 text-sm">
            <span className="font-bold text-accent">20 💎</span> — Feature implementation, significant PR
          </div>
          <div className="rounded-lg border border-white/5 bg-surface-light p-3 text-sm">
            <span className="font-bold text-accent">50 💎</span> — Major contribution, ongoing maintainer
          </div>
        </div>
      </section>
    </div>
  );
}
