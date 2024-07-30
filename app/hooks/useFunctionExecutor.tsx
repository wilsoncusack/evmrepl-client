import { useState, useEffect } from "react";
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

  const handleFunctionCalls = async (
    parsedCalls: { name: string; args: string[] }[],
  ) => {
    if (!abi.length) return;

    const calls: { calldata: Hex; value: string; caller: Address }[] = [];
    for (const call of parsedCalls) {
      calls.push({
        calldata: encodeFunctionData({
          abi,
          functionName: call.name,
          args: call.args,
        }),
        value: "0",
        caller: "0x0000000000000000000000000000000000000000",
      });
    }

    try {
      const response = await axios.post<ExecutionResponse[]>(
        `${process.env.NEXT_PUBLIC_SERVER}/execute_calldatas_fork`,
        {
          bytecode,
          calls,
        },
      );
      const results = response.data;

      const output = [];
      for (const i in results) {
        const result = results[i];
        const returned = decodeFunctionResult({
          abi,
          functionName: parsedCalls[i].name,
          data: result.result,
        });
        const logs: DecodeEventLogReturnType[] = [];
        for (const log of result.logs) {
          logs.push(
            decodeEventLog({
              abi,
              data: log.data,
              topics: log.topics,
            }),
          );
        }
        output.push({
          call: parsedCalls[i].name,
          gasUsed: result.gasUsed,
          response: returned !== undefined ? String(returned) : undefined,
          logs,
          traces: result.traces,
        });
      }

      setResult(output);
    } catch (error) {
      console.error("Execution error:", error);
    }
  };

  const debouncedHandleFunctionCalls = useDebounce(handleFunctionCalls, 500);

  useEffect(() => {
    const calls = parseFunctionCalls(functionCalls);
    if (bytecode && calls.length > 0) {
      debouncedHandleFunctionCalls(calls);
    }
  }, [bytecode, functionCalls, debouncedHandleFunctionCalls]);

  return result;
};

const parseFunctionCalls = (functionCalls: string[]) => {
  const calls: { name: string; args: string[] }[] = [];
  for (const line of functionCalls) {
    const call = line.match(/(\w+)\((.*)\)/);
    if (call) {
      const name = call[1];
      const args = call[2]
        .split(",")
        .map((arg) => arg.trim())
        .filter((arg) => arg !== "");
      calls.push({ name, args });
    }
  }
  return calls;
};
