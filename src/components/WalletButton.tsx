"use client";

/**
 * Wallet connect button for the nav bar.
 *
 * - Disconnected: shows "Connect Wallet" (neon accent pill).
 * - Connected: shows a truncated address; clicking opens a small dropdown with
 *   a Disconnect action and a Base chain badge.
 *
 * Uses the injected connector only (MetaMask etc.) — see wallet-context.
 */

import { useEffect, useRef, useState } from "react";
import { useWallet } from "@/lib/wallet-context";

/** Truncate 0xabcdef...1234 for display. */
function shortAddr(addr: string): string {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function WalletButton() {
  const { address, isConnected, isConnecting, noWallet, connect, disconnect } =
    useWallet();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close the dropdown when clicking outside.
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  async function handleConnect() {
    setError(null);
    try {
      await connect();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect");
    }
  }

  // --- Disconnected -------------------------------------------------------
  if (!isConnected) {
    return (
      <div className="flex flex-col items-end">
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="rounded-lg border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent/20 disabled:opacity-60"
          title={
            noWallet
              ? "No wallet detected — install MetaMask"
              : "Connect your wallet"
          }
        >
          {isConnecting ? "Connecting…" : "Connect Wallet"}
        </button>
        {error && (
          <span className="mt-1 max-w-[200px] text-right text-[10px] text-red-400">
            {error}
          </span>
        )}
        {noWallet && !error && (
          <span className="mt-1 text-[10px] text-muted">No wallet found</span>
        )}
      </div>
    );
  }

  // --- Connected ----------------------------------------------------------
  return (
    <div className="relative" ref={wrapRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-white/10 bg-surface-light px-3 py-2 text-sm font-semibold transition-colors hover:bg-surface-lighter"
      >
        <span className="h-2 w-2 rounded-full bg-green-400" aria-hidden />
        <span className="font-mono tabular-nums">{shortAddr(address ?? "")}</span>
        <span className="text-muted">▾</span>
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-surface-light shadow-2xl">
          <div className="border-b border-white/5 px-4 py-3">
            <div className="text-[10px] uppercase tracking-widest text-muted">
              Connected · Base
            </div>
            <div className="mt-1 break-all font-mono text-xs text-foreground">
              {address}
            </div>
          </div>
          <button
            onClick={() => {
              setOpen(false);
              void disconnect();
            }}
            className="block w-full px-4 py-3 text-left text-sm text-red-400 transition-colors hover:bg-surface-lighter"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
