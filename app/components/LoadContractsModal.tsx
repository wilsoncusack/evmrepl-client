// components/LoadContractsModal.tsx

import { useState } from "react";
import { useAppContext } from "../hooks/useAppContext";
import axios from "axios";
import { SolidityFile } from "../types";

interface LoadContractsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const chains = [
  { id: "1", name: "Ethereum Mainnet" },
  { id: "5", name: "Goerli" },
  { id: "11155111", name: "Sepolia" },
  { id: "137", name: "Polygon" },
  { id: "80001", name: "Mumbai" },
  { id: "42161", name: "Arbitrum One" },
  { id: "421613", name: "Arbitrum Goerli" },
  { id: "10", name: "Optimism" },
  { id: "420", name: "Optimism Goerli" },
  { id: "8453", name: "Base" },
  { id: "84531", name: "Base Goerli" },
];

const LoadContractsModal: React.FC<LoadContractsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [address, setAddress] = useState("");
  const [chainId, setChainId] = useState("8453"); // Default to Base
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setFiles } = useAppContext();

  const loadContractsFromSourceify = async (
    chainId: string,
    address: string,
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `https://sourcify.dev/server/files/tree/any/${chainId}/${address}`,
      );
      const { files } = response.data;

      const newFiles: SolidityFile[] = await Promise.all(
        files
          .filter((file: string) => file.endsWith(".sol"))
          .map(async (file: string) => {
            const content = await fetchFileContent(file);
            const name = file.split("/").pop() || "";
            return {
              id: crypto.randomUUID(),
              name,
              content: processFileContent(content, name),
            };
          }),
      );

      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
      onClose();
    } catch (error) {
      console.error("Error loading contracts from Sourcify:", error);
      setError(
        "Failed to load contracts. Please check the address and chain ID.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFileContent = async (url: string) => {
    const response = await axios.get(url);
    return response.data;
  };

  const processFileContent = (content: string, fileName: string) => {
    // Fix import statements
    let processedContent = content.replace(
      /import\s+(?:{[^}]+}\s+from\s+)?["']([^"']+)["'];/g,
      (match, path) => {
        const parts = path.split("/");
        const newPath = `./${parts[parts.length - 1]}`;

        if (match.includes("{")) {
          // Named imports
          return match.replace(path, newPath);
        }
        // Default imports
        return `import "${newPath}";`;
      },
    );

    // Remove duplicate imports
    const imports = new Set();
    processedContent = processedContent
      .split("\n")
      .filter((line) => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith("import ")) {
          if (imports.has(trimmedLine)) {
            return false;
          }
          imports.add(trimmedLine);
        }
        return true;
      })
      .join("\n");

    return processedContent;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await loadContractsFromSourceify(chainId, address);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          Load Contracts from Sourcify
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="chainId"
              className="block text-sm font-medium text-gray-700"
            >
              Chain
            </label>
            <select
              id="chainId"
              value={chainId}
              onChange={(e) => setChainId(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-800"
            >
              {chains.map((chain) => (
                <option key={chain.id} value={chain.id}>
                  {chain.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700"
            >
              Contract Address
            </label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-800"
              placeholder="0x..."
            />
          </div>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Load Contracts"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoadContractsModal;
