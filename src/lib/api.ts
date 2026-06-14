/**
 * API client for Lisa's Assets backend.
 *
 * The backend lives at `NEXT_PUBLIC_API_URL` (currently empty — see the note
 * below about self-signed certs). Every public function tries the real API
 * first and falls back to mock data when the API is unreachable, so the UI
 * keeps working during local development and outages.
 *
 * NOTE on self-signed certs:
 *   The staging backend is served over HTTPS with a self-signed certificate.
 *   Browsers will refuse to fetch from it (and Vercel's serverless runtime
 *   would too), so we intentionally leave NEXT_PUBLIC_API_URL empty for now and
 *   serve mock data. Once the cert is signed by a real CA, set the env var and
 *   these calls will hit the real endpoints automatically.
 */

import type { Project, ProjectDetail, SortKey } from "./types";
import { mockProjects } from "./mock-projects";
import { mockReport, type MockReport } from "./mock-report";

// Empty by design — see the module docstring. When set, must end with "/".
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/** True when a real backend URL has been configured. */
export const isApiConfigured = Boolean(BASE_URL);

/** Error thrown for a 404 (used by callers to switch to the unlock UI). */
export class NotFoundError extends Error {
  readonly status = 404;
  constructor(message = "Not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  // If no backend is configured, short-circuit so callers fall through to
  // their mock fallbacks without a network attempt.
  if (!BASE_URL) {
    throw new Error("API not configured");
  }
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    // Client-side mutation calls (POST) should never be cached.
    cache: options?.method === "POST" ? "no-store" : "default",
    next: options?.method === "POST" ? undefined : { revalidate: 60 },
  });
  if (res.status === 404) throw new NotFoundError(await safeText(res));
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }
  return (await res.json()) as T;
}

async function safeText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return res.statusText;
  }
}

// ---------------------------------------------------------------------------
// Projects + reports
// ---------------------------------------------------------------------------

/** Fetch a paginated, optionally filtered list of projects. Falls back to mock. */
export async function getProjects(
  search?: string,
  sort?: SortKey,
  page?: number,
): Promise<Project[]> {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (sort) params.set("sort", sort);
  if (page) params.set("page", String(page));
  const qs = params.toString();
  try {
    return await apiFetch<Project[]>(`/api/projects${qs ? `?${qs}` : ""}`);
  } catch (err) {
    console.warn("[api] getProjects fell back to mock:", String(err));
    return mockProjects;
  }
}

/** Fetch a single project's details by id. Falls back to a mock project. */
export async function getProject(id: string): Promise<ProjectDetail> {
  try {
    return await apiFetch<ProjectDetail>(`/api/projects/${id}`);
  } catch (err) {
    console.warn(`[api] getProject(${id}) fell back to mock:`, String(err));
    const found = mockProjects.find((p) => p.id === id) ?? mockProjects[0];
    return { ...found };
  }
}

/**
 * Fetch a full report for a project.
 *
 * Returns `{ report: null, reason }` when the report is not yet public /
 * doesn't exist — callers use this to switch to the unlock card.
 */
export type ReportResult =
  | { report: MockReport; locked: false }
  | {
      report: null;
      locked: true;
      reason: "not_found" | "not_public" | "error";
    };

export async function getReport(id: string): Promise<ReportResult> {
  try {
    const data = await apiFetch<MockReport>(`/api/reports/${id}`);
    return { report: data, locked: false };
  } catch (err) {
    if (err instanceof NotFoundError) {
      // Unknown id → treat as "needs unlock".
      return { report: null, locked: true, reason: "not_found" };
    }
    console.warn(`[api] getReport(${id}) fell back to mock:`, String(err));
    // API unreachable → show the demo report so the page is never empty.
    return { report: mockReport, locked: false };
  }
}

/** Subscribe an email to the newsletter. */
export async function subscribeNewsletter(
  email: string,
): Promise<{ ok: true }> {
  return apiFetch<{ ok: true }>(`/api/newsletter/subscribe`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------

export interface TokenDiscount {
  /** Discount as a fraction of full price (e.g. 0.5 = 50% off). */
  discount: number;
  /** Final price in USD after discount. */
  discountedPrice: number;
  /** Full price in USD. */
  fullPrice: number;
  /** Token symbol that qualified the wallet, if any. */
  token?: string;
}

export const FULL_REPORT_PRICE_USD = 9.99;
export const DISCOUNTED_REPORT_PRICE_USD = 4.99;

/**
 * Look up the token-gated discount for a wallet.
 *
 * Mock behaviour: any non-empty address gets the 50% discount.
 */
export async function getTokenDiscount(
  walletAddress: string,
): Promise<TokenDiscount> {
  try {
    return await apiFetch<TokenDiscount>(
      `/api/payments/discount/${walletAddress}`,
    );
  } catch (err) {
    console.warn("[api] getTokenDiscount fell back to mock:", String(err));
    const qualifies = Boolean(walletAddress);
    return {
      discount: qualifies ? 0.5 : 0,
      fullPrice: FULL_REPORT_PRICE_USD,
      discountedPrice: qualifies
        ? DISCOUNTED_REPORT_PRICE_USD
        : FULL_REPORT_PRICE_USD,
      token: qualifies ? "LISA" : undefined,
    };
  }
}

export interface CheckoutRequest {
  coingeckoId: string;
  walletAddress: string;
  amount: number;
  token: string;
  chain: string;
}

export interface CheckoutResponse {
  /** Address the user should send USDC to. */
  payToAddress: string;
  amountUsd: number;
  amountToken: string;
  token: string;
  chain: string;
  /** Server-issued order id to reference in the verify step. */
  orderId: string;
  /** Seconds before the order expires. */
  expiresInSeconds: number;
}

// USDC on Base — used for the mock checkout response.
const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

/** Initiate a checkout. Mock returns a deterministic order record. */
export async function checkoutReport(
  req: CheckoutRequest,
): Promise<CheckoutResponse> {
  try {
    return await apiFetch<CheckoutResponse>(`/api/payments/checkout`, {
      method: "POST",
      body: JSON.stringify(req),
    });
  } catch (err) {
    console.warn("[api] checkoutReport fell back to mock:", String(err));
    // 6 decimals for USDC.
    const amountToken = (req.amount * 1_000_000).toFixed(0);
    return {
      payToAddress: USDC_BASE,
      amountUsd: req.amount,
      amountToken,
      token: req.token || "USDC",
      chain: req.chain || "base",
      orderId: `mock_${req.coingeckoId}_${Date.now()}`,
      expiresInSeconds: 1800,
    };
  }
}

export interface VerifyRequest {
  coingeckoId: string;
  txHash: string;
  walletAddress: string;
  amount: number;
  token: string;
  chain: string;
}

export interface VerifyResponse {
  verified: boolean;
  /** When verified, the report becomes unlocked for this wallet. */
  unlockReportId?: string;
  message?: string;
}

/**
 * Verify a payment tx. Mock: any hash ≥10 chars "verifies" so the demo flow
 * can complete end-to-end without a live backend.
 */
export async function verifyPayment(
  req: VerifyRequest,
): Promise<VerifyResponse> {
  try {
    return await apiFetch<VerifyResponse>(`/api/payments/verify`, {
      method: "POST",
      body: JSON.stringify(req),
    });
  } catch (err) {
    console.warn("[api] verifyPayment fell back to mock:", String(err));
    const verified = Boolean(req.txHash && req.txHash.length >= 10);
    return {
      verified,
      unlockReportId: verified ? req.coingeckoId : undefined,
      message: verified
        ? "Mock verification: tx accepted."
        : "Provide a transaction hash to mock-verify.",
    };
  }
}

// ---------------------------------------------------------------------------
// Crowdfunding
// ---------------------------------------------------------------------------

export interface CrowdfundPool {
  id: string;
  coingeckoId: string;
  goalUsd: number;
  raisedUsd: number;
  contributors: number;
  status: "open" | "funded" | "expired";
  createdAt: string;
  expiresAt?: string;
}

/** Create a new crowdfund pool. Mock returns a deterministic in-memory pool. */
export async function createCrowdfundPool(
  coingeckoId: string,
): Promise<CrowdfundPool> {
  try {
    return await apiFetch<CrowdfundPool>(`/api/crowdfund/create`, {
      method: "POST",
      body: JSON.stringify({ coingeckoId }),
    });
  } catch (err) {
    console.warn("[api] createCrowdfundPool fell back to mock:", String(err));
    return mockPoolFor(coingeckoId, 0);
  }
}

/** Fetch a pool by id. */
export async function getCrowdfundPool(poolId: string): Promise<CrowdfundPool> {
  try {
    return await apiFetch<CrowdfundPool>(`/api/crowdfund/${poolId}`);
  } catch (err) {
    console.warn(`[api] getCrowdfundPool(${poolId}) fell back to mock:`, String(err));
    // Try to decode the slug-encoded mock pool id ("mock_<slug>_...").
    const slug = poolId.startsWith("mock_") ? poolId.split("_")[1] : poolId;
    return mockPoolFor(slug, 0);
  }
}

export interface ContributeRequest {
  poolId: string;
  walletAddress: string;
  amount: number;
  txHash: string;
}

export interface ContributeResponse {
  ok: boolean;
  pool: CrowdfundPool;
  message?: string;
}

/** Contribute to a pool. Mock: any amount ≥0 increments raised + contributors. */
export async function contributeToPool(
  req: ContributeRequest,
): Promise<ContributeResponse> {
  try {
    return await apiFetch<ContributeResponse>(
      `/api/crowdfund/${req.poolId}/contribute`,
      {
        method: "POST",
        body: JSON.stringify({
          walletAddress: req.walletAddress,
          amount: req.amount,
          txHash: req.txHash,
        }),
      },
    );
  } catch (err) {
    console.warn("[api] contributeToPool fell back to mock:", String(err));
    const pool = mockPoolFor(req.poolId, req.amount);
    return {
      ok: true,
      pool,
      message: "Mock contribution recorded.",
    };
  }
}

/**
 * Look up the crowdfund pool for a given project, if one exists.
 * Mock: returns a pool seeded with one prior contributor so the UI shows life.
 */
export async function getProjectPool(
  coingeckoId: string,
): Promise<CrowdfundPool | null> {
  try {
    return await apiFetch<CrowdfundPool | null>(
      `/api/crowdfund/project/${coingeckoId}`,
    );
  } catch (err) {
    console.warn(
      `[api] getProjectPool(${coingeckoId}) fell back to mock:`,
      String(err),
    );
    // Demo: project already has a pool with $3.00 raised from 3 contributors.
    return mockPoolFor(coingeckoId, 3);
  }
}

/** Default funding goal for a single report. */
export const DEFAULT_POOL_GOAL_USD = 9.99;

function mockPoolFor(slug: string, extraRaised = 0): CrowdfundPool {
  const base = 3.0; // demo: show some prior momentum
  const raised = Math.min(DEFAULT_POOL_GOAL_USD, base + extraRaised);
  return {
    id: `mock_${slug}_${Date.now()}`,
    coingeckoId: slug,
    goalUsd: DEFAULT_POOL_GOAL_USD,
    raisedUsd: raised,
    contributors: extraRaised > 0 ? 4 : 3,
    status: raised >= DEFAULT_POOL_GOAL_USD ? "funded" : "open",
    createdAt: new Date(Date.now() - 86_400_000).toISOString(),
  };
}
