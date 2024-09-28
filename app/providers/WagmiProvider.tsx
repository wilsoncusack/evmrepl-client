"use client";
import { WagmiProvider as WagmiProviderBase } from "wagmi";
import { config } from "../wagmi";
import {
  QueryClient,
  QueryClientProvider as QueryClientProviderBase,
} from "@tanstack/react-query";

export function WagmiProvider({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();

  return (
    <WagmiProviderBase config={config}>
      <QueryClientProviderBase client={queryClient}>
        {children}
      </QueryClientProviderBase>
    </WagmiProviderBase>
  );
}
