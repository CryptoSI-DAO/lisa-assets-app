"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const res = await signUp(email.trim(), password);
    setLoading(false);

    if (res.ok) {
      setNotice(
        "Account created! Check your email for a confirmation link, then sign in.",
      );
      setTimeout(() => router.push("/auth/login"), 2000);
    } else {
      setError(res.error ?? "Unable to create account.");
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="text-center">
        <div className="text-5xl">✨</div>
        <h1 className="mt-4 text-3xl font-bold">
          Create <span className="text-accent">Account</span>
        </h1>
        <p className="mt-2 text-sm text-muted">
          Join Lisa&apos;s Assets to save reports and track coefficients.
        </p>
      </div>

      {!isSupabaseConfigured && (
        <p className="mt-6 rounded-xl border border-yellow-500/30 bg-yellow-500/5 px-4 py-3 text-xs text-yellow-300">
          ⚠️ Supabase isn&apos;t configured yet. Authentication is in demo
          mode.
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4 rounded-2xl border border-white/5 bg-surface p-6"
      >
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-muted"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-white/10 bg-surface-light px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted focus:border-accent"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-muted"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            className="w-full rounded-xl border border-white/10 bg-surface-light px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted focus:border-accent"
          />
        </div>
        <div>
          <label
            htmlFor="confirm"
            className="mb-1 block text-sm font-medium text-muted"
          >
            Confirm Password
          </label>
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Re-enter password"
            className="w-full rounded-xl border border-white/10 bg-surface-light px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted focus:border-accent"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}
        {notice && (
          <p className="rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-400">
            {notice}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-bold text-black transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Create Account"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="font-semibold text-accent hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
