"use client";

/**
 * Client-side provider stack.
 *
 * Order matters: WagmiProvider → QueryClientProvider → WalletProvider → AuthProvider.
 * `WalletProvider` reads from wagmi's hooks so it must sit inside WagmiProvider.
 */

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { walletConfig, WalletProvider } from "@/lib/wallet-context";
import { AuthProvider } from "@/lib/auth-context";

export default function Providers({ children }: { children: ReactNode }) {
  // One QueryClient per browser session; useState avoids re-creating on
  // every render during SSR hydration.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Don't refetch aggressively on focus — keeps API calls cheap.
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <WagmiProvider config={walletConfig}>
      <QueryClientProvider client={queryClient}>
        <WalletProvider>
          <AuthProvider>{children}</AuthProvider>
        </WalletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
