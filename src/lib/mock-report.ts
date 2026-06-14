/**
 * Mock report data used to render the report detail page before the backend
 * is reachable. Shapes loosely mirror the wire format the API will return.
 */

export interface AgentScoreData {
  score: number;
  notes: string[];
}

export interface LisaTrajectory {
  previous_score: number;
  improvement: number;
  momentum: "improving" | "stable" | "declining";
  projected_score: number;
  projection_date: string;
}

export interface LisaKimData extends AgentScoreData {
  trajectory?: LisaTrajectory;
}

export interface MockReport {
  id: string;
  project: {
    name: string;
    symbol: string;
    logo_url: string;
    coingecko_id: string;
    price_usd: number;
    market_cap_usd: number;
  };
  lisa_coefficient: number;
  lisa_verdict: string;
  strongest_agent: string;
  agents: {
    truth_seeker: AgentScoreData;
    maven_metrics: AgentScoreData;
    token_logic: AgentScoreData;
    liquid_edge: AgentScoreData;
    hype_pulse: AgentScoreData;
    code_crafter: AgentScoreData;
    risk_eye: AgentScoreData;
    lisa_kim: LisaKimData;
  };
  created_at: string;
  funded_by_count: number;
}

export const mockReport: MockReport = {
  id: "demo-1",
  project: {
    name: "Lido",
    symbol: "LDO",
    logo_url: "",
    coingecko_id: "lido-dao",
    price_usd: 2.45,
    market_cap_usd: 2_100_000_000,
  },
  lisa_coefficient: 8.4,
  lisa_verdict:
    "Strong fundamentals with improving trajectory. RiskEye flags manageable contract risk. HypePulse shows exceptional community engagement. Lisa recommends close monitoring.",
  strongest_agent: "hype_pulse",
  agents: {
    truth_seeker: {
      score: 8.5,
      notes: ["Solid validator set", "Clear purpose"],
    },
    maven_metrics: {
      score: 7.2,
      notes: ["Moderate inflation", "Healthy distribution"],
    },
    token_logic: { score: 8.0, notes: ["Sustainable yield model"] },
    liquid_edge: { score: 7.8, notes: ["Good liquidity depth"] },
    hype_pulse: {
      score: 9.1,
      notes: ["Twitter volume up 340%", "Discord very active"],
    },
    code_crafter: {
      score: 8.3,
      notes: ["1,247 commits", "Audited by OpenZeppelin"],
    },
    risk_eye: { score: 8.0, notes: ["No major vulnerabilities"] },
    lisa_kim: {
      score: 8.4,
      notes: [],
      trajectory: {
        previous_score: 7.8,
        improvement: 0.6,
        momentum: "improving",
        projected_score: 8.8,
        projection_date: "2026-09-01",
      },
    },
  },
  created_at: "2026-06-14T12:00:00Z",
  funded_by_count: 3,
};

export interface AgentMeta {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

/** Canonical display order & metadata for all 8 agents. */
export const AGENTS: AgentMeta[] = [
  {
    id: "truth_seeker",
    name: "TruthSeeker",
    emoji: "🎯",
    description: "Subnet fundamentals",
  },
  {
    id: "maven_metrics",
    name: "MavenMetrics",
    emoji: "📊",
    description: "Token emissions",
  },
  {
    id: "token_logic",
    name: "TokenLogic",
    emoji: "💰",
    description: "Economic sustainability",
  },
  {
    id: "liquid_edge",
    name: "LiquidEdge",
    emoji: "🌊",
    description: "Liquidity & stake flow",
  },
  {
    id: "hype_pulse",
    name: "HypePulse",
    emoji: "🔥",
    description: "Community sentiment",
  },
  {
    id: "code_crafter",
    name: "CodeCrafter",
    emoji: "👨‍💻",
    description: "Code quality",
  },
  {
    id: "risk_eye",
    name: "RiskEye",
    emoji: "⚠️",
    description: "Smart contract risk",
  },
  {
    id: "lisa_kim",
    name: "Lisa Kim",
    emoji: "👑",
    description: "Meta-synthesis & trajectory",
  },
];
