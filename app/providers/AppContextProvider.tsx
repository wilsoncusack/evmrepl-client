"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AppContext } from "../contexts/AppContext";
import type {
  CompilationResult,
  ExecutionResponse,
  FileFunctionCalls,
  FileId,
  FunctionCall,
  FunctionCallResult,
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
import { extractFileName, replacer } from "../utils";

export const AppProvider: React.FC<{
  initialFiles: SolidityFile[];
  initialFunctionCalls: FileFunctionCalls;
  children: React.ReactNode;
}> = ({ initialFiles, initialFunctionCalls, children }) => {
  const [files, setFiles] = useState<SolidityFile[]>(initialFiles);
  // TODO consider if there can be no current file
  const [currentFileId, setCurrentFileId] = useState<FileId>(
    initialFiles[0].id,
  );
  const [filesFunctionCalls, setFilesFunctionCalls] =
    useState<FileFunctionCalls>(initialFunctionCalls);
  const [compilationResult, setCompilationResult] = useState<
    CompilationResult | undefined
  >(undefined);
  const [isCompiling, setIsCompiling] = useState(false);
  const [currentFileFunctionCallResults, setCurrentFileFunctionCallResults] =
    useState<FunctionCallResult[] | undefined>(undefined);

  const currentFile = useMemo(() => {
    return files.find((f) => f.id === currentFileId);
  }, [currentFileId, files]);

  const currentFileCompilationResult = useMemo(() => {
    if (!compilationResult || !currentFile) return;

    const compiledFiles = Object.keys(compilationResult.contracts);
    const k = compiledFiles.find(
      (file) => extractFileName(file) === currentFile.name,
    );
    if (!k) {
      console.error("Could not find compiled result for current file");
      return;
    }

    return Object.values(compilationResult.contracts[k])[0][0].contract;
  }, [currentFile, compilationResult]);

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
    if (!currentFile || !currentFileCompilationResult) return;

    const currentFileFunctionCalls = filesFunctionCalls[currentFile.id];
    if (!currentFileFunctionCalls) {
      console.error("No function calls found for current file");
      return;
    }

    console.log(currentFileFunctionCalls);

    if (currentFileFunctionCalls.length === 0) {
      return;
    }

    const calls = currentFileFunctionCalls;
    const abi = currentFileCompilationResult.abi;
    const bytecode = currentFileCompilationResult.evm.bytecode.object;

    const filteredCalls = calls.filter(
      (call) => call.name && call.encodedCalldata,
    );
    console.log("filtered calls", filteredCalls);
    const encodedCalls: { calldata: Hex; value: string; caller: Address }[] =
      [];
    for (const call of filteredCalls) {
      encodedCalls.push({
        // biome-ignore lint/style/noNonNullAssertion:
        calldata: call.encodedCalldata!,
        value: "0",
        caller: call.caller || zeroAddress,
      });
    }

    try {
      const response = await axios.post<ExecutionResponse[]>(
        `${process.env.NEXT_PUBLIC_SERVER}/execute_calldatas_fork`,
        {
          bytecode,
          calls: encodedCalls,
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
          // biome-ignore lint/style/noNonNullAssertion: all filtered calls have a name
          call: filteredCalls[i].name!,
          gasUsed: result.gasUsed,
          response: returned !== undefined ? String(returned) : undefined,
          logs,
          traces: result.traces,
        };
      });

      setCurrentFileFunctionCallResults(output);
    } catch (error) {
      console.error("Execution error:", error);
    }
  }, [currentFile, filesFunctionCalls, currentFileCompilationResult]);

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
    setCurrentFileId,
    compilationResult,
    isCompiling,
    setIsCompiling,
    currentFileCompilationResult,
    currentFileFunctionCallResults,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
