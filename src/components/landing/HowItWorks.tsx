const steps = [
  {
    num: "1",
    title: "Request a Report",
    desc: "Submit any crypto project you want analyzed. Pick a full report or get 50% off with a supported token.",
    icon: "📥",
  },
  {
    num: "2",
    title: "Agents Analyze",
    desc: "8 specialized AI agents independently assess fundamentals, economics, liquidity, community, code, and risk.",
    icon: "🤖",
  },
  {
    num: "3",
    title: "Results Published",
    desc: "Lisa Kim synthesizes all agent outputs into the Lisa Coefficient — a single, transparent, bias-free score.",
    icon: "📊",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-white/5 bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <h2 className="text-center text-3xl font-bold sm:text-4xl">
          How It <span className="text-accent">Works</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-muted">
          From request to coefficient in three steps.
        </p>
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.num} className="relative">
              {i < steps.length - 1 && (
                <div className="absolute -right-4 top-12 hidden text-2xl text-muted md:block">
                  →
                </div>
              )}
              <div className="rounded-2xl border border-white/5 bg-background p-8 text-center transition-colors hover:border-accent/30">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-3xl">
                  {step.icon}
                </div>
                <div className="mb-2 text-sm font-bold text-accent">
                  STEP {step.num}
                </div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm text-muted">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
