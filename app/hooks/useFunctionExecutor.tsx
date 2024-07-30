import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  type Abi,
  type Address,
  type DecodeEventLogReturnType,
  type Hex,
  decodeEventLog,
  decodeFunctionResult,
  encodeFunctionData,
  type Log,
} from "viem";
import { useDebounce } from "./useDebounce";
import type { FunctionCallResult } from "../components/FunctionCallsPanel";

export type ExecutionResponse = {
  exitReason: string;
  reverted: boolean;
  result: Hex;
  gasUsed: string;
  logs: Log[];
  traces: FunctionCallResult["traces"];
};

export const useFunctionExecutor = (
  bytecode: string,
  abi: Abi,
  functionCalls: string[],
) => {
  const [result, setResult] = useState<Array<FunctionCallResult>>([]);

  const handleFunctionCalls = useCallback(
    async (parsedCalls: { name: string; args: string[] }[]) => {
      if (!abi.length || !bytecode) return;

      const calls: { calldata: Hex; value: string; caller: Address }[] =
        parsedCalls.map((call) => ({
          calldata: encodeFunctionData({
            abi,
            functionName: call.name,
            args: call.args,
          }),
          value: "0",
          caller: "0x0000000000000000000000000000000000000000",
        }));

      try {
        const response = await axios.post<ExecutionResponse[]>(
          `${process.env.NEXT_PUBLIC_SERVER}/execute_calldatas_fork`,
          {
            bytecode,
            calls,
          },
        );
        const results = response.data;

        const output = results.map((result, i) => {
          const returned = decodeFunctionResult({
            abi,
            functionName: parsedCalls[i].name,
            data: result.result,
          });
          const logs: DecodeEventLogReturnType[] = result.logs.map((log) =>
            decodeEventLog({
              abi,
              data: log.data,
              topics: log.topics as any,
            }),
          );
          return {
            call: parsedCalls[i].name,
            gasUsed: result.gasUsed,
            response: returned != undefined ? String(returned) : undefined,
            logs,
            traces: result.traces,
          };
        });

        setResult(output);
      } catch (error) {
        console.error("Execution error:", error);
      }
    },
    [abi, bytecode],
  );

  const debouncedHandleFunctionCalls = useDebounce(handleFunctionCalls, 500);

  useEffect(() => {
    const calls = parseFunctionCalls(functionCalls);
    if (bytecode && calls.length > 0 && abi.length > 0) {
      debouncedHandleFunctionCalls(calls);
    }
  }, [bytecode, functionCalls, abi, debouncedHandleFunctionCalls]);

  return result;
};

const parseFunctionCalls = (functionCalls: string[]) => {
  return functionCalls
    .map((line) => {
      const call = line.match(/(\w+)\((.*)\)/);
      if (call) {
        const name = call[1];
        const args = call[2]
          .split(",")
          .map((arg) => arg.trim())
          .filter((arg) => arg !== "");
        return { name, args };
      }
      return null;
    })
    .filter(Boolean);
};
