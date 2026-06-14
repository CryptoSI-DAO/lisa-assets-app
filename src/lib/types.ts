// Core type definitions for Lisa's Assets

export interface Project {
  id: string;
  rank: number;
  logo: string;
  name: string;
  symbol: string;
  coefficient: number;
  change: number; // positive or negative delta
  updated: string; // relative time string, e.g. "2h ago"
  description?: string;
}

export interface ProjectDetail extends Project {
  marketCap?: number;
  volume24h?: number;
  price?: number;
  priceChange24h?: number;
  lastReportDate?: string;
  agentScores?: AgentScore[];
}

export interface AgentScore {
  agentId: string;
  agentName: string;
  emoji: string;
  score: number; // 0-10
  summary: string;
}

export interface Report {
  id: string;
  projectId: string;
  projectName: string;
  lisaCoefficient: number;
  createdAt: string;
  agentScores: AgentScore[];
  synthesis: string;
}

export interface Agent {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export type SortKey = "rank" | "coefficient" | "change" | "name";
export type SortDirection = "asc" | "desc";
