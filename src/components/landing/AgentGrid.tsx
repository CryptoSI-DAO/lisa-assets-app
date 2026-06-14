import type { Agent } from "@/lib/types";

const agents: Agent[] = [
  {
    id: "truthseeker",
    name: "TruthSeeker",
    emoji: "🎯",
    description: "Subnet fundamentals & validator health",
  },
  {
    id: "mavenmetrics",
    name: "MavenMetrics",
    emoji: "📊",
    description: "Token emissions & inflation analysis",
  },
  {
    id: "tokenlogic",
    name: "TokenLogic",
    emoji: "💰",
    description: "Economic sustainability scoring",
  },
  {
    id: "liquidedge",
    name: "LiquidEdge",
    emoji: "🌊",
    description: "Liquidity & stake flow trends",
  },
  {
    id: "hypepulse",
    name: "HypePulse",
    emoji: "🔥",
    description: "Community sentiment & social volume",
  },
  {
    id: "codecrafter",
    name: "CodeCrafter",
    emoji: "👨‍💻",
    description: "Code quality & dev activity",
  },
  {
    id: "riskeye",
    name: "RiskEye",
    emoji: "⚠️",
    description: "Smart contract risk assessment",
  },
  {
    id: "lisa-kim",
    name: "Lisa Kim",
    emoji: "👑",
    description: "Meta-synthesis & trajectory prediction",
  },
];

export default function AgentGrid() {
  return (
    <section id="agents" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <h2 className="text-center text-3xl font-bold sm:text-4xl">
        Meet the <span className="text-accent">Agents</span>
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-center text-muted">
        Eight specialized AI agents, each an expert in their domain, working
        together to produce the Lisa Coefficient.
      </p>
      <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="group rounded-2xl border border-white/5 bg-surface p-6 transition-all hover:border-accent/30 hover:bg-surface-light"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-background text-3xl transition-transform group-hover:scale-110">
              {agent.emoji}
            </div>
            <h3 className="text-lg font-semibold">{agent.name}</h3>
            <p className="mt-2 text-sm text-muted">{agent.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
