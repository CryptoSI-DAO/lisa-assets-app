import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* glow effect */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full opacity-20 blur-[120px]"
        style={{ background: "#e7f900" }}
      />
      <div className="relative mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 sm:py-32">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-4 py-1.5 text-xs font-medium text-accent">
          <span>👑</span> Powered by 8 AI Agents
        </div>
        <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
          8 AI Agents. <span className="text-accent">One Coefficient.</span>{" "}
          Zero Bias.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
          Lisa Kim and her team of specialized AI agents analyze crypto projects
          across fundamentals, economics, liquidity, community, code, and risk —
          synthesizing everything into a single, transparent score.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/browse"
            className="rounded-xl bg-accent px-8 py-4 text-base font-bold text-black transition-transform hover:scale-105"
          >
            Browse Projects →
          </Link>
          <Link
            href="#how-it-works"
            className="rounded-xl border border-white/10 bg-surface px-8 py-4 text-base font-semibold transition-colors hover:bg-surface-light"
          >
            How It Works
          </Link>
        </div>
      </div>
    </section>
  );
}
