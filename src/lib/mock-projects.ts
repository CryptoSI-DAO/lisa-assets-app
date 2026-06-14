/**
 * Mock data used to render pages before the backend is reachable.
 *
 * Kept in lib (not a component) so it can be imported from server components
 * and the API client without pulling React into the bundle.
 */

import type { Project } from "./types";

export const mockProjects: Project[] = [
  {
    id: "ldo",
    rank: 1,
    logo: "#f7931a",
    name: "Lido",
    symbol: "LDO",
    coefficient: 8.4,
    change: 0.6,
    updated: "2h ago",
  },
  {
    id: "aave",
    rank: 2,
    logo: "#2a5ada",
    name: "Aave",
    symbol: "AAVE",
    coefficient: 7.9,
    change: 0.3,
    updated: "1d ago",
  },
  {
    id: "uni",
    rank: 3,
    logo: "#ff007a",
    name: "Uniswap",
    symbol: "UNI",
    coefficient: 7.5,
    change: -0.2,
    updated: "3h ago",
  },
  {
    id: "snx",
    rank: 4,
    logo: "#00d1ff",
    name: "Synthetix",
    symbol: "SNX",
    coefficient: 6.8,
    change: 0.4,
    updated: "5h ago",
  },
  {
    id: "comp",
    rank: 5,
    logo: "#00d395",
    name: "Compound",
    symbol: "COMP",
    coefficient: 6.3,
    change: -0.5,
    updated: "8h ago",
  },
  {
    id: "mkr",
    rank: 6,
    logo: "#1aab9b",
    name: "Maker",
    symbol: "MKR",
    coefficient: 7.1,
    change: 0.1,
    updated: "12h ago",
  },
  {
    id: "crv",
    rank: 7,
    logo: "#a41c90",
    name: "Curve",
    symbol: "CRV",
    coefficient: 5.9,
    change: -0.3,
    updated: "1d ago",
  },
  {
    id: "bal",
    rank: 8,
    logo: "#f5f5f5",
    name: "Balancer",
    symbol: "BAL",
    coefficient: 5.5,
    change: 0.2,
    updated: "2d ago",
  },
];

/** Map project id (coingecko-style slug) → human-readable name. */
export const projectNameById: Record<string, string> = Object.fromEntries(
  mockProjects.map((p) => [p.id, p.name]),
);
