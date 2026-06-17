"use client";

import Link from "next/link";
import { useState } from "react";
import WalletButton from "./WalletButton";
import { useAuth } from "@/lib/auth-context";

function AuthButton({ mobile, onClick }: { mobile?: boolean; onClick?: () => void }) {
  const { user, loading, signOut, tokenBalance, isAdmin } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  if (loading) {
    return (
      <span className={mobile ? "block py-2 text-sm text-muted" : "text-sm text-muted"}>
        …
      </span>
    );
  }

  if (user) {
    return (
      <div className={mobile ? "mt-2 space-y-2" : "flex items-center gap-3"}>
        {mobile && (
          <Link
            href="/admin"
            onClick={onClick}
            className="block py-1 text-sm text-accent hover:underline"
          >
            ⚙️ Admin
          </Link>
        )}
        {!mobile && isAdmin && (
          <Link
            href="/admin"
            className="text-sm text-muted transition-colors hover:text-accent"
            title="Admin Panel"
          >
            ⚙️
          </Link>
        )}
        {!mobile && (
          <span className="flex items-center gap-1 rounded-lg border border-accent/30 bg-accent/5 px-3 py-1.5 text-xs font-bold text-accent">
            💎 {tokenBalance}
          </span>
        )}
        {mobile && (
          <div className="text-sm text-accent">💎 {tokenBalance} tokens</div>
        )}
        <Link
          href="/dashboard"
          onClick={onClick}
          className={mobile
            ? "block py-1 text-sm text-muted hover:text-foreground"
            : "max-w-[140px] truncate text-sm text-muted hover:text-foreground"}
          title={user.email ?? undefined}
        >
          {user.email}
        </Link>
        <button
          onClick={async () => {
            setSigningOut(true);
            await signOut();
            setSigningOut(false);
            onClick?.();
          }}
          disabled={signingOut}
          className={
            mobile
              ? "block w-full rounded-lg border border-white/10 bg-surface px-4 py-2 text-center text-sm font-semibold"
              : "rounded-lg border border-white/10 bg-surface px-4 py-2 text-sm font-semibold transition-colors hover:bg-surface-lighter disabled:opacity-60"
          }
        >
          {signingOut ? "…" : "Sign Out"}
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/auth/login"
      onClick={onClick}
      className={
        mobile
          ? "mt-2 block rounded-lg bg-accent px-4 py-2 text-center text-sm font-semibold text-black"
          : "rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90"
      }
    >
      Sign In
    </Link>
  );
}

function Nav() {
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/", label: "Home" },
    { href: "/browse", label: "Browse" },
    { href: "/dashboard", label: "Dashboard" },
  ];
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          <span className="text-2xl">👑</span>
          <span>
            Lisa<span className="text-accent">&apos;s Assets</span>
          </span>
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
          <WalletButton />
          <AuthButton />
        </div>
        <button
          className="md:hidden text-xl"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? "✕" : "☰"}
        </button>
      </nav>
      {open && (
        <div className="border-t border-white/5 px-4 py-4 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block py-2 text-sm text-muted hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-2">
            <WalletButton />
          </div>
          <AuthButton mobile onClick={() => setOpen(false)} />
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row">
          <div>
            <div className="flex items-center gap-2 text-lg font-bold">
              <span className="text-2xl">👑</span>
              <span>
                Lisa<span className="text-accent">&apos;s Assets</span>
              </span>
            </div>
            <p className="mt-2 max-w-xs text-sm text-muted">
              8 AI agents. One coefficient. Zero bias.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <span className="text-muted">CryptoSI DAO</span>
            <a
              href="https://github.com/CryptoSI-DAO"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted transition-colors hover:text-accent"
            >
              GitHub ↗
            </a>
            <Link href="/browse" className="text-muted transition-colors hover:text-accent">
              Browse Projects
            </Link>
          </div>
        </div>
        <div className="mt-8 border-t border-white/5 pt-6 text-xs text-muted">
          © {new Date().getFullYear()} Lisa&apos;s Assets · CryptoSI DAO. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
