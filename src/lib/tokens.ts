/**
 * Client-side token API helpers.
 *
 * These call the Next.js API routes which use the service role key server-side.
 */
import { supabase } from "./supabase";

export const REPORT_TOKEN_COST = 10;

export async function getSessionToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export interface TokenBalance {
  balance: number;
  transactions: TokenTransaction[];
}

export interface TokenTransaction {
  id: number;
  amount: number;
  type: "grant" | "spend";
  reason: string;
  project_id: string | null;
  created_at: string;
}

export interface SpendResult {
  ok: boolean;
  unlocked?: boolean;
  alreadyUnlocked?: boolean;
  tokensSpent?: number;
  remainingBalance?: number;
  error?: string;
}

/** Spend tokens to unlock a report. */
export async function spendTokens(projectId: string): Promise<SpendResult> {
  const token = await getSessionToken();
  if (!token) return { ok: false, error: "Not signed in" };

  const res = await fetch("/api/tokens/spend", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ projectId }),
  });

  const data = await res.json();
  if (!res.ok) return { ok: false, error: data.error ?? "Failed" };
  return data;
}

export interface GrantResult {
  ok: boolean;
  email?: string;
  granted?: number;
  newBalance?: number;
  error?: string;
}

/** Admin: grant tokens to a user by email. */
export async function grantTokens(
  email: string,
  amount: number,
  reason: string,
): Promise<GrantResult> {
  const token = await getSessionToken();
  if (!token) return { ok: false, error: "Not signed in" };

  const res = await fetch("/api/tokens/grant", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ email, amount, reason }),
  });

  const data = await res.json();
  if (!res.ok) return { ok: false, error: data.error ?? "Failed" };
  return data;
}
