import type { HttpTransport } from "viem";
import {
  anvil,
  arbitrum,
  base,
  baseSepolia,
  hardhat,
  mainnet,
  optimism,
  polygon,
  sepolia,
  zora,
} from "viem/chains";
import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";

export const chains = [
  anvil,
  hardhat,
  mainnet,
  sepolia,
  polygon,
  arbitrum,
  optimism,
  zora,
  base,
  baseSepolia,
] as const;

const transports = Object.fromEntries(
  chains.map((chain) => [chain.id, http()])
) as { [K in (typeof chains)[number]["id"]]: HttpTransport };

export const config = createConfig({
  chains,
  transports,
  connectors: [injected()],
});
