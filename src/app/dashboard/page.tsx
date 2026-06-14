"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  // Protect the route — redirect unauthenticated users to login.
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [loading, user, router]);

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

  // While the redirect effect runs, render a minimal state.
  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted sm:px-6">
        Redirecting to sign in…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
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

      {/* Subscription status */}
      <section className="mt-8 rounded-2xl border border-white/5 bg-surface p-6">
        <h2 className="text-lg font-bold">Subscription</h2>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-surface-light px-3 py-1 text-xs font-medium text-muted">
            Free plan
          </span>
          <Link
            href="/browse"
            className="text-sm font-semibold text-accent hover:underline"
          >
            Upgrade for unlimited reports →
          </Link>
        </div>
      </section>

      {/* Your reports */}
      <section className="mt-6 rounded-2xl border border-white/5 bg-surface p-6 sm:p-8">
        <h2 className="text-lg font-bold">Your Reports</h2>
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-surface-light/50 px-6 py-16 text-center">
          <div className="text-4xl">📂</div>
          <p className="mt-3 max-w-sm text-sm text-muted">
            No reports yet. Browse projects to get started.
          </p>
          <Link
            href="/browse"
            className="mt-5 rounded-xl bg-accent px-6 py-2.5 text-sm font-bold text-black transition-transform hover:scale-105"
          >
            Browse Projects
          </Link>
        </div>
      </section>
    </div>
  );
}
