// components/FunctionCallsPanel.tsx
"use client";

import type React from "react";
import { useMemo, useState } from "react";
import { useAppContext } from "../hooks/useAppContext";
import FunctionCallItem from "./FunctionCallItem";
import ConnectWalletModal from "./ConnectWalletModal";
import ConstructorArgsModal from "./ConstructorArgsModal";
import {
  useAccount,
  useChainId,
  useDeployContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { chains } from "../wagmi";

const FunctionCallsPanel: React.FC = () => {
  const {
    currentFile,
    filesFunctionCalls,
    setFilesFunctionCalls,
    currentFileFunctionCallResults,
    currentFileCompilationResult,
    compilationResult,
  } = useAppContext();

  const [constructorArgs, setConstructorArgs] = useState<string[]>([]);

  const constructorInputs = useMemo(() => {
    if (!currentFileCompilationResult) return undefined;

    const constructorInputs = currentFileCompilationResult.abi.find(
      (abi) => abi.type === "constructor",
    )?.inputs;

    return constructorInputs || [];
  }, [currentFileCompilationResult]);

  const hasSufficientArgs = useMemo(() => {
    if (!constructorInputs) return false;
    return constructorInputs.length === constructorArgs.length;
  }, [constructorInputs, constructorArgs]);

  const account = useAccount();
  const deploymentChainId = useChainId();

  const {
    deployContract,
    data: deployContractTxHash,
    isPending: isSigningTx,
  } = useDeployContract();

  const { isLoading: isDeploying, isSuccess: isDeployed } =
    useWaitForTransactionReceipt({
      hash: deployContractTxHash,
    });

  const [isConnectWalletModalOpen, setIsConnectWalletModalOpen] =
    useState(false);
  const [isConstructorArgsModalOpen, setIsConstructorArgsModalOpen] =
    useState(false);

  const functionCalls = useMemo(() => {
    if (!currentFile) return [];
    return filesFunctionCalls[currentFile.id] || [];
  }, [currentFile, filesFunctionCalls]);

  const addFunctionCall = () => {
    if (!currentFile) return;
    setFilesFunctionCalls((prev) => ({
      ...prev,
      [currentFile.id]: [...(prev[currentFile.id] || []), { rawInput: "" }],
    }));
  };

  const deployResult = () => {
    if (!currentFile || !compilationResult || !currentFileCompilationResult)
      return;

    if (!account.isConnected) {
      setIsConnectWalletModalOpen(true);
      return;
    }

    if (!hasSufficientArgs) {
      setIsConstructorArgsModalOpen(true);
      return;
    }

    console.log(currentFileCompilationResult);

    deployContract({
      abi: currentFileCompilationResult.abi,
      bytecode: `0x${currentFileCompilationResult.evm.bytecode.object}`,
      args: constructorArgs,
    });
  };

  return (
    <div className="flex flex-col h-full border-l border-gray-200">
      <div className="p-4 bg-white border-b border-gray-200">
        <h2 className="text-xl font-bold">Function Calls</h2>
        <p className="text-gray-800 italic">
          State forked from{" "}
          <a
            className="underline"
            target="_blank"
            href="https://basescan.org/"
            rel="noreferrer"
          >
            Base.
          </a>
        </p>
      </div>
      <div className="flex-grow overflow-y-auto p-4">
        <div className="space-y-4">
          {functionCalls.map((call, index) => (
            <FunctionCallItem
              key={index}
              call={call}
              index={index}
              result={
                currentFileFunctionCallResults
                  ? currentFileFunctionCallResults[index]
                  : undefined
              }
              isRawCalldata={!currentFile?.content}
            />
          ))}
        </div>
      </div>
      <div className="p-4 bg-white border-t border-gray-200 flex flex-col gap-2">
        <button
          type="button"
          className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
          onClick={addFunctionCall}
        >
          Add Function Call
        </button>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            className="w-full px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-opacity-50 transition duration-150 ease-in-out"
            onClick={
              deployContractTxHash
                ? () => {
                    window.open(
                      `https://https://blockscan.com/tx/${deployContractTxHash}`,
                      "_blank",
                    );
                  }
                : deployResult
            }
            disabled={isSigningTx}
          >
            {isDeploying || isSigningTx
              ? "Deploying..."
              : `Deploy to ${chains.find((chain) => chain.id === deploymentChainId)?.name}`}
            {!hasSufficientArgs ? "*" : ""}
          </button>
          {isDeployed && (
            <a
              className="text-sm text-gray-500 text-center hover:underline"
              href={`https://blockscan.com/tx/${deployContractTxHash}`}
              target="_blank"
              rel="noreferrer"
            >
              Deployed in tx {deployContractTxHash?.slice(0, 6)}...
              {deployContractTxHash?.slice(-4)}
            </a>
          )}
          {account.isConnected && (
            <div className="text-sm text-gray-500 text-center">
              {`Connected as ${account.address?.slice(0, 6)}...${account.address?.slice(-4)}`}
            </div>
          )}
        </div>
      </div>
      <ConnectWalletModal
        isOpen={isConnectWalletModalOpen}
        onClose={() => setIsConnectWalletModalOpen(false)}
      />
      <ConstructorArgsModal
        isOpen={isConstructorArgsModalOpen}
        onClose={() => setIsConstructorArgsModalOpen(false)}
        constructorInputs={constructorInputs || []}
        constructorArgs={constructorArgs}
        setConstructorArgs={setConstructorArgs}
      />
    </div>
  );
};

export default FunctionCallsPanel;
