"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AppContext } from "../contexts/AppContext";
import type {
  CompilationResult,
  ExecutionResponse,
  FileFunctionCalls,
  FunctionCall,
  SolidityFile,
} from "../types";
import {
  type Address,
  type DecodeEventLogReturnType,
  type Hex,
  decodeEventLog,
  decodeFunctionResult,
  encodeFunctionData,
  zeroAddress,
} from "viem";
import axios from "axios";
import { useDebounce } from "../hooks/useDebounce";

export const AppProvider: React.FC<{
  initialFiles: SolidityFile[];
  initialFunctionCalls: FileFunctionCalls;
  children: React.ReactNode;
}> = ({ initialFiles, initialFunctionCalls, children }) => {
  const [files, setFiles] = useState<SolidityFile[]>(initialFiles);
  // TODO consider if there can be no current file
  const [currentFile, setCurrentFile] = useState<SolidityFile>(initialFiles[0]);
  const [filesFunctionCalls, setFilesFunctionCalls] =
    useState<FileFunctionCalls>(initialFunctionCalls);
  const [compilationResult, setCompilationResult] = useState<
    CompilationResult | undefined
  >(undefined);
  const [isCompiling, setIsCompiling] = useState(false);

  useEffect(() => {
    const compileCode = async () => {
      if (files.length === 0) return;

      setIsCompiling(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER}/compile_solidity`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            // TODO may need to strip ID
            body: JSON.stringify({ files }),
          },
        );

        if (!response.ok) {
          throw new Error("Compilation failed");
        }

        const result = await response.json();
        setCompilationResult(result);
      } catch (error) {
        // TODO bubble this error up
        console.error("Compilation error:", error);
        setCompilationResult(undefined);
      } finally {
        setIsCompiling(false);
      }
    };

    // TODO debounce this
    compileCode();
  }, [files]);

  const refreshFunctionCallResult = useCallback(async () => {
    if (!currentFile.compilationResult) return;

    const currentFileFunctionCalls = filesFunctionCalls[currentFile.id];
    if (!currentFileFunctionCalls) {
      console.error("No function calls found for current file");
      return;
    }

    if (currentFileFunctionCalls.length === 0) {
      return;
    }

    const calls = currentFileFunctionCalls;
    const abi = currentFile.compilationResult.abi;
    const bytecode = currentFile.compilationResult.evm.bytecode.object;

    const encodedCalls: { call: Hex; value: bigint; caller: Address }[] = [];
    for (const call of calls) {
      const data = encodeFunctionData({
        abi,
        functionName: call.name,
        args: call.args,
      });
      encodedCalls.push({
        call: data,
        value: call.value || BigInt(0),
        caller: call.caller || zeroAddress,
      });
    }

    try {
      const response = await axios.post<ExecutionResponse[]>(
        `${process.env.NEXT_PUBLIC_SERVER}/execute_calldatas_fork`,
        {
          bytecode,
          encodedCalls,
        },
      );
      const results = response.data;
      const output = results.map((result, i) => {
        const returned = decodeFunctionResult({
          abi,
          functionName: calls[i].name,
          data: result.result,
        });
        const logs: DecodeEventLogReturnType[] = result.logs.map((log) =>
          decodeEventLog({
            abi,
            data: log.data,
            topics: log.topics,
          }),
        );
        return {
          call: calls[i].name,
          gasUsed: result.gasUsed,
          response: returned !== undefined ? String(returned) : undefined,
          logs,
          traces: result.traces,
        };
      });

      const newFunctionCalls: FunctionCall[] = calls.map((f, i) => {
        return { ...f, result: output[i] };
      });
      setFilesFunctionCalls((prev) => {
        return {
          ...prev,
          [currentFile.id]: newFunctionCalls,
        };
      });
    } catch (error) {
      console.error("Execution error:", error);
    }
  }, [currentFile, filesFunctionCalls]);

  const debouncedRefreshFunctionCallResult = useDebounce(
    refreshFunctionCallResult,
    300,
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: want to update when any of these change
  useEffect(() => {
    debouncedRefreshFunctionCallResult();
  }, [
    compilationResult,
    currentFile,
    filesFunctionCalls,
    debouncedRefreshFunctionCallResult,
  ]);

  const value = {
    files,
    setFiles,
    filesFunctionCalls,
    setFilesFunctionCalls,
    currentFile,
    setCurrentFile,
    compilationResult,
    isCompiling,
    setIsCompiling,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
