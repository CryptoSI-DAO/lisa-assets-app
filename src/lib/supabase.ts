import { createClient } from "@supabase/supabase-js";

/**
 * Supabase browser client.
 *
 * The env vars may be empty during local development — auth calls will fail
 * gracefully in that case. Provide real values in `.env.local` (see
 * `.env.local.example`) once the Supabase project is provisioned.
 */
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://localhost:8000";
// Supabase's client throws if the key is empty. When unconfigured we use a
// clearly-invalid placeholder so the module still loads; auth calls then fail
// gracefully and are caught by the auth context.
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey || "public-anon-key-placeholder",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);
