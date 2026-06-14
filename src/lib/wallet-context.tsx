"use client";

/**
 * Wallet connection via wagmi + viem, configured for the Base chain.
 *
 * We deliberately use only the `injected()` connector (MetaMask, Rabby, etc.)
 * so we avoid pulling in the heavy WalletConnect SDK — keeping the client
 * bundle small. Users without an injected provider will see a helpful message.
 */

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { http, createConfig, type Config } from "wagmi";
import { base } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { useAccount, useConnect, useDisconnect } from "wagmi";

/** Wagmi config for the Base L2 (chainId 8453). */
export const walletConfig: Config = createConfig({
  chains: [base],
  connectors: [injected()],
  ssr: true,
  multiInjectedProviderDiscovery: true,
  transports: {
    [base.id]: http(),
  },
});

/** Base chain constant, re-exported for UI components. */
export const BASE_CHAIN = base;

interface WalletContextValue {
  /** Connected EOA address (checksummed) or null. */
  address: `0x${string}` | null;
  /** True once a wallet is connected. */
  isConnected: boolean;
  /** True while the connector list is still loading. */
  isConnecting: boolean;
  /** True if no injected wallet was detected. */
  noWallet: boolean;
  /** Trigger MetaMask/injected connect flow. */
  connect: () => Promise<void>;
  /** Disconnect the active wallet. */
  disconnect: () => Promise<void>;
  /** Raw wagmi connectors available. */
  connectors: ReturnType<typeof useConnect>["connectors"];
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

function WalletInner({ children }: { children: ReactNode }) {
  const { connectors, connectAsync, isPending, status } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnectAsync } = useDisconnect();

  const noWallet = useMemo(
    () => status !== "pending" && connectors.length === 0,
    [status, connectors.length],
  );

  const value: WalletContextValue = {
    address: address ?? null,
    isConnected,
    isConnecting: isPending,
    noWallet,
    connectors,
    async connect() {
      // Prefer the first injected connector (MetaMask etc.).
      const connector = connectors[0];
      if (!connector) {
        throw new Error(
          "No injected wallet detected. Please install MetaMask.",
        );
      }
      await connectAsync({ connector });
    },
    async disconnect() {
      await disconnectAsync();
    },
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

/**
 * Convenience hook used across the app. Throws if used outside the
 * `WalletProvider`.
 */
export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (ctx === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return ctx;
}

/**
 * Top-level wallet provider. Must wrap any component that calls `useWallet`.
 * Intended to live below `WagmiProvider` + `QueryClientProvider` in the tree.
 */
export function WalletProvider({ children }: { children: ReactNode }) {
  return <WalletInner>{children}</WalletInner>;
}
