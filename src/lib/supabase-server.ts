import { createClient } from "@supabase/supabase-js";

/**
 * Supabase server-side client using the service role key.
 *
 * Bypasses RLS — ONLY use in API routes / server components, never in client
 * code. The service role key is set as a Vercel env var (not public).
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.warn("[supabase-server] Missing env vars — API routes will fail");
}

export const supabaseAdmin = createClient(
  supabaseUrl || "http://localhost:8000",
  serviceRoleKey || "missing-service-key",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

export const REPORT_TOKEN_COST = 10;
