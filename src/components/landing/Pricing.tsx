const plans = [
  {
    name: "Full Report",
    price: "$9.99",
    note: "Standard pricing",
    features: [
      "Complete 8-agent analysis",
      "Full Lisa Coefficient breakdown",
      "Individual agent scores & reasoning",
      "Risk assessment & trajectory prediction",
      "PDF download",
    ],
    cta: "Request Full Report",
    featured: false,
  },
  {
    name: "Token Holder Report",
    price: "$4.99",
    note: "50% off with supported tokens",
    badge: "BEST VALUE",
    tokens: ["CRDD", "SOONAK", "LISA"],
    features: [
      "Everything in Full Report",
      "50% discount for token holders",
      "Supported tokens: CRDD, SOONAK, LISA",
      "Priority queue access",
      "Community governance weight",
    ],
    cta: "Request with Token",
    featured: true,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="border-y border-white/5 bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <h2 className="text-center text-3xl font-bold sm:text-4xl">
          Simple <span className="text-accent">Pricing</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-muted">
          Pay per report. No subscriptions. Save 50% when you pay with a
          supported token.
        </p>
        <div className="mx-auto mt-14 grid max-w-4xl gap-8 md:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-8 transition-all ${
                plan.featured
                  ? "border-accent bg-background shadow-[0_0_40px_-10px_rgba(231,249,0,0.3)]"
                  : "border-white/5 bg-background"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-xs font-bold text-black">
                  {plan.badge}
                </div>
              )}
              <h3 className="text-xl font-semibold">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                <span className="text-sm text-muted">/ report</span>
              </div>
              <p className="mt-2 text-sm text-accent">{plan.note}</p>
              {plan.tokens && (
                <div className="mt-3 flex gap-2">
                  {plan.tokens.map((t) => (
                    <span
                      key={t}
                      className="rounded-md bg-accent/10 px-2 py-1 text-xs font-bold text-accent"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5 text-accent">✓</span>
                    <span className="text-muted">{f}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`mt-8 w-full rounded-xl py-3 text-sm font-bold transition-all ${
                  plan.featured
                    ? "bg-accent text-black hover:scale-[1.02]"
                    : "border border-white/10 bg-surface hover:bg-surface-light"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
