"use client";

/**
 * Unlock card shown when a report is locked (404 / not public / paywalled).
 *
 * Two paths:
 *   1. Pay directly with USDC on Base ($9.99, or $4.99 with token discount).
 *   2. Start or join a crowdfunding pool — once the pool hits its goal the
 *      report unlocks for everyone who contributed.
 *
 * All API calls fall back to mock data (see lib/api.ts) so the full flow works
 * end-to-end without a live backend.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  checkoutReport,
  contributeToPool,
  createCrowdfundPool,
  DEFAULT_POOL_GOAL_USD,
  DISCOUNTED_REPORT_PRICE_USD,
  FULL_REPORT_PRICE_USD,
  getTokenDiscount,
  getProjectPool,
  type CheckoutResponse,
  type CrowdfundPool,
  type TokenDiscount,
} from "@/lib/api";
import { useWallet } from "@/lib/wallet-context";
import { useAuth } from "@/lib/auth-context";
import { spendTokens, REPORT_TOKEN_COST } from "@/lib/tokens";

interface ReportUnlockCardProps {
  /** Coingecko id of the project to unlock. */
  coingeckoId: string;
  /** Called once the report is unlocked (payment verified or pool funded). */
  onUnlocked: () => void;
}

type Mode = "choose" | "tokens" | "pay" | "crowdfund";

export default function ReportUnlockCard({
  coingeckoId,
  onUnlocked,
}: ReportUnlockCardProps) {
  const { address } = useWallet();
  const { user, tokenBalance } = useAuth();

  const [mode, setMode] = useState<Mode>("choose");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canUseTokens = Boolean(user) && tokenBalance >= REPORT_TOKEN_COST;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="rounded-3xl border border-accent/30 bg-surface p-6 text-center sm:p-10">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/15 text-3xl">
          🔒
        </div>
        <h1 className="text-2xl font-bold sm:text-3xl">Unlock this report</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          Get the full Lisa Coefficient breakdown — all 8 agent scores,
          trajectory analysis, and Lisa Kim&apos;s verdict.
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
            {error}
          </p>
        )}

        {mode === "choose" && (
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {/* Token option */}
            <button
              onClick={() => {
                if (!user) {
                  setError("Sign in to use tokens.");
                  return;
                }
                if (canUseTokens) {
                  setMode("tokens");
                } else {
                  setError(`You need ${REPORT_TOKEN_COST} tokens. Earn them by contributing to CryptoSI DAO.`);
                }
              }}
              className={`group rounded-2xl border p-5 text-left transition-all ${
                canUseTokens
                  ? "border-accent/40 bg-accent/5 hover:border-accent"
                  : "border-white/5 bg-surface-light opacity-60"
              }`}
            >
              <div className="text-2xl">💎</div>
              <div className="mt-2 font-bold">
                {REPORT_TOKEN_COST} Tokens
              </div>
              <div className="mt-1 text-xs text-muted">
                {user
                  ? canUseTokens
                    ? `You have ${tokenBalance} 💎`
                    : `${tokenBalance}/${REPORT_TOKEN_COST} 💎 — contribute more!`
                  : "Sign in required"}
              </div>
            </button>

            {/* USDC pay option */}
            <button
              onClick={() => setMode("pay")}
              className="group rounded-2xl border border-accent/40 bg-accent/5 p-5 text-left transition-all hover:border-accent"
            >
              <div className="text-2xl">💳</div>
              <div className="mt-2 font-bold">Pay with USDC</div>
              <div className="mt-1 text-xs text-muted">
                ${FULL_REPORT_PRICE_USD.toFixed(2)}
                <span className="text-accent">
                  {" "}or ${DISCOUNTED_REPORT_PRICE_USD.toFixed(2)} with token
                </span>
              </div>
            </button>

            {/* Crowdfund option */}
            <button
              onClick={() => setMode("crowdfund")}
              className="group rounded-2xl border border-white/10 bg-surface-light p-5 text-left transition-all hover:border-accent/40"
            >
              <div className="text-2xl">🤝</div>
              <div className="mt-2 font-bold">Crowdfund</div>
              <div className="mt-1 text-xs text-muted">
                Pool ${DEFAULT_POOL_GOAL_USD.toFixed(2)} with the community
              </div>
            </button>
          </div>
        )}

        {mode === "tokens" && (
          <TokenFlow
            coingeckoId={coingeckoId}
            tokenBalance={tokenBalance}
            onUnlocked={onUnlocked}
            onBack={() => setMode("choose")}
            setError={setError}
          />
        )}

        {mode === "pay" && (
          <PayFlow
            coingeckoId={coingeckoId}
            walletAddress={address ?? ""}
            onUnlocked={onUnlocked}
            onBack={() => setMode("choose")}
            busy={busy}
            setBusy={setBusy}
            setError={setError}
          />
        )}

        {mode === "crowdfund" && (
          <CrowdfundFlow
            coingeckoId={coingeckoId}
            walletAddress={address ?? ""}
            onUnlocked={onUnlocked}
            onBack={() => setMode("choose")}
            busy={busy}
            setBusy={setBusy}
            setError={setError}
          />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Token spend flow
// ---------------------------------------------------------------------------

function TokenFlow({
  coingeckoId,
  tokenBalance,
  onUnlocked,
  onBack,
  setError,
}: {
  coingeckoId: string;
  tokenBalance: number;
  onUnlocked: () => void;
  onBack: () => void;
  setError: (v: string | null) => void;
}) {
  const [spending, setSpending] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSpend() {
    setSpending(true);
    setError(null);
    try {
      const res = await spendTokens(coingeckoId);
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => onUnlocked(), 900);
      } else {
        setError(res.error ?? "Failed to spend tokens");
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setSpending(false);
    }
  }

  return (
    <div className="mt-8 text-left">
      <button onClick={onBack} className="mb-4 text-xs text-muted hover:text-foreground">
        ← back
      </button>

      <div className="rounded-2xl border border-accent/30 bg-accent/5 p-5 text-center">
        {success ? (
          <div className="py-4">
            <div className="text-4xl">🎉</div>
            <p className="mt-3 text-lg font-bold text-green-400">Report Unlocked!</p>
            <p className="mt-1 text-sm text-muted">Loading your report…</p>
          </div>
        ) : (
          <>
            <div className="text-4xl">💎</div>
            <div className="mt-3 text-sm text-muted">You currently have</div>
            <div className="text-3xl font-bold text-accent">{tokenBalance} tokens</div>
            <div className="mt-4 text-sm">
              Spend <span className="font-bold text-accent">{REPORT_TOKEN_COST} tokens</span> to unlock this report.
            </div>
            <div className="mt-1 text-xs text-muted">
              Remaining after unlock: {tokenBalance - REPORT_TOKEN_COST} 💎
            </div>
            <button
              onClick={handleSpend}
              disabled={spending}
              className="mt-5 w-full rounded-xl bg-accent px-5 py-3 text-sm font-bold text-black transition-transform hover:scale-[1.02] disabled:opacity-60"
            >
              {spending ? "Unlocking…" : `Spend ${REPORT_TOKEN_COST} 💎 → Unlock`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pay flow
// ---------------------------------------------------------------------------

interface FlowProps {
  coingeckoId: string;
  walletAddress: string;
  onUnlocked: () => void;
  onBack: () => void;
  busy: boolean;
  setBusy: (v: boolean) => void;
  setError: (v: string | null) => void;
}

function PayFlow({
  coingeckoId,
  walletAddress,
  onUnlocked,
  onBack,
  busy,
  setBusy,
  setError,
}: FlowProps) {
  const [discount, setDiscount] = useState<TokenDiscount | null>(null);
  const [checkout, setCheckout] = useState<CheckoutResponse | null>(null);
  const [txHash, setTxHash] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifiedMsg, setVerifiedMsg] = useState<string | null>(null);

  const price = discount?.discountedPrice ?? FULL_REPORT_PRICE_USD;
  const hasDiscount = (discount?.discount ?? 0) > 0;

  // Look up the token discount for the connected wallet.
  useEffect(() => {
    let mounted = true;
    if (!walletAddress) {
      setDiscount(null);
      return;
    }
    getTokenDiscount(walletAddress)
      .then((d) => mounted && setDiscount(d))
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, [walletAddress]);

  // Lazily create the checkout order.
  async function startCheckout() {
    setBusy(true);
    setError(null);
    try {
      const res = await checkoutReport({
        coingeckoId,
        walletAddress,
        amount: price,
        token: "USDC",
        chain: "base",
      });
      setCheckout(res);
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleVerify() {
    setVerifying(true);
    setError(null);
    try {
      // Dynamic import keeps viem out of the server bundle.
      const { verifyPayment } = await import("@/lib/api");
      const res = await verifyPayment({
        coingeckoId,
        txHash,
        walletAddress,
        amount: price,
        token: "USDC",
        chain: "base",
      });
      if (res.verified) {
        setVerifiedMsg(res.message ?? "Payment verified — unlocking report.");
        // Small beat so the user sees the confirmation before the card swaps.
        setTimeout(() => onUnlocked(), 900);
      } else {
        setError(res.message ?? "Payment could not be verified.");
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="mt-8 text-left">
      <button
        onClick={onBack}
        className="mb-4 text-xs text-muted hover:text-foreground"
      >
        ← back
      </button>

      <div className="rounded-2xl border border-white/10 bg-surface-light p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">Price</span>
          <span className="font-bold">
            ${price.toFixed(2)}{" "}
            <span className="text-xs text-muted">USDC · Base</span>
          </span>
        </div>
        {hasDiscount && (
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-accent">
              ✓ {discount?.token} token discount applied
            </span>
            <span className="text-muted line-through">
              ${FULL_REPORT_PRICE_USD.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {!checkout ? (
        <button
          onClick={startCheckout}
          disabled={busy || !walletAddress}
          className="mt-4 w-full rounded-xl bg-accent px-5 py-3 text-sm font-bold text-black transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {busy ? "Creating order…" : `Continue · $${price.toFixed(2)}`}
        </button>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="rounded-2xl border border-accent/30 bg-accent/5 p-4">
            <div className="text-xs uppercase tracking-widest text-muted">
              Send USDC on Base to
            </div>
            <div className="mt-1 break-all font-mono text-sm">
              {checkout.payToAddress}
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-muted">Amount</span>
              <span className="font-bold">
                {checkout.amountToken} units (${checkout.amountUsd.toFixed(2)})
              </span>
            </div>
          </div>

          <label className="block text-xs text-muted">
            Transaction hash
            <input
              type="text"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="0x…"
              className="mt-1 w-full rounded-lg border border-white/10 bg-surface px-3 py-2 font-mono text-sm outline-none focus:border-accent"
            />
          </label>

          {verifiedMsg ? (
            <div className="rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-400">
              ✓ {verifiedMsg}
            </div>
          ) : (
            <button
              onClick={handleVerify}
              disabled={verifying || txHash.length < 10}
              className="w-full rounded-xl bg-accent px-5 py-3 text-sm font-bold text-black transition-transform hover:scale-[1.02] disabled:opacity-60"
            >
              {verifying ? "Verifying…" : "I've Paid — Verify"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Crowdfund flow
// ---------------------------------------------------------------------------

function CrowdfundFlow({
  coingeckoId,
  walletAddress,
  onUnlocked,
  onBack,
  busy,
  setBusy,
  setError,
}: FlowProps) {
  const [pool, setPool] = useState<CrowdfundPool | null>(null);
  const [loading, setLoading] = useState(true);
  const [contributing, setContributing] = useState(false);
  const [amount, setAmount] = useState("1.00");
  const [contributed, setContributed] = useState(false);

  // Load any existing pool for this project; create one if none exists.
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      let p = await getProjectPool(coingeckoId);
      if (!p) p = await createCrowdfundPool(coingeckoId);
      setPool(p);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [coingeckoId, setError]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const pct = useMemo(() => {
    if (!pool) return 0;
    return Math.min(100, (pool.raisedUsd / pool.goalUsd) * 100);
  }, [pool]);

  const funded = pool?.status === "funded" || pct >= 100;

  async function handleContribute() {
    setContributing(true);
    setError(null);
    try {
      const amt = parseFloat(amount) || 0;
      const res = await contributeToPool({
        poolId: pool?.id ?? coingeckoId,
        walletAddress,
        amount: amt,
        txHash: `mock_tx_${Date.now()}`,
      });
      setPool(res.pool);
      setContributed(true);
      if (res.pool.status === "funded") {
        setTimeout(() => onUnlocked(), 900);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setContributing(false);
    }
  }

  return (
    <div className="mt-8 text-left">
      <button
        onClick={onBack}
        className="mb-4 text-xs text-muted hover:text-foreground"
      >
        ← back
      </button>

      {loading || !pool ? (
        <div className="rounded-2xl border border-white/10 bg-surface-light p-6 text-center text-sm text-muted">
          Loading crowdfund pool…
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-white/10 bg-surface-light p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">
                {funded ? "🎉 Funded!" : "Pool progress"}
              </span>
              <span className="text-muted">
                ${pool.raisedUsd.toFixed(2)} / ${pool.goalUsd.toFixed(2)}
              </span>
            </div>
            <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-surface-lighter">
              <div
                className="h-full rounded-full bg-accent transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted">
              <span>{pool.contributors} contributors</span>
              <span>{pct.toFixed(0)}%</span>
            </div>
          </div>

          {contributed && !funded && (
            <div className="mt-3 rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-400">
              ✓ Thanks! Your contribution was recorded.
            </div>
          )}

          {funded ? (
            <button
              onClick={onUnlocked}
              className="mt-4 w-full rounded-xl bg-accent px-5 py-3 text-sm font-bold text-black transition-transform hover:scale-[1.02]"
            >
              Open report →
            </button>
          ) : (
            <div className="mt-4 space-y-3">
              <label className="block text-xs text-muted">
                Your contribution (USDC)
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
                />
              </label>
              <button
                onClick={handleContribute}
                disabled={
                  contributing || busy || !walletAddress || parseFloat(amount) <= 0
                }
                className="w-full rounded-xl bg-accent px-5 py-3 text-sm font-bold text-black transition-transform hover:scale-[1.02] disabled:opacity-60"
              >
                {contributing ? "Contributing…" : `Contribute $${amount}`}
              </button>
              <p className="text-center text-xs text-muted">
                Need a fresh pool?{" "}
                <button
                  className="underline hover:text-foreground"
                  onClick={async () => {
                    setBusy(true);
                    try {
                      const p = await createCrowdfundPool(coingeckoId);
                      setPool(p);
                    } catch (e) {
                      setError(String(e));
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  Start a new one
                </button>
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
