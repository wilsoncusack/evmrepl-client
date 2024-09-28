import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { randomUUID } from "node:crypto";
import type { Metadata } from "next";
import { AppProvider } from "./providers/AppContextProvider";
import { WagmiProvider } from "./providers/WagmiProvider";
import type { FileFunctionCalls } from "./types";
import { getRandomAddress } from "./utils";

const simpleStorageSolidityCode = `pragma solidity 0.8.26;

contract SimpleStorage {
    uint256 public storedData;
    event StoredDataUpdated(uint);

    function set(uint256 x) public {
        storedData = x;
        emit StoredDataUpdated(x);
    }

    function get() public view returns (uint256) {
        return storedData;
    }

    function getBlockNumber() public view returns (uint256) {
      return block.number;
  }
}
`;

export const metadata: Metadata = {
  title: "EVM REPL",
  description: "EVM REPL",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialFiles = [
    {
      id: randomUUID(),
      name: "SimpleStorage.sol",
      content: simpleStorageSolidityCode,
      address: getRandomAddress(),
    },
  ];
  const initialFunctionCalls: FileFunctionCalls = {
    [initialFiles[0].id]: [
      {
        rawInput: "get()",
      },
      {
        rawInput: "set(1)",
      },
      {
        rawInput: "get()",
      },
    ],
  };

  return (
    <html lang="en">
      <WagmiProvider>
        <AppProvider
          initialFiles={initialFiles}
          initialFunctionCalls={initialFunctionCalls}
        >
          <body>{children}</body>
        </AppProvider>
      </WagmiProvider>
      <Analytics />
    </html>
  );
}
