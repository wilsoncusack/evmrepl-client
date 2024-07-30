import React from "react";
import type { Abi, DecodeEventLogReturnType } from "viem";
import FunctionCallItem from "./FunctionCallItem";

export type FunctionCallResult = {
  call: string;
  gasUsed: string;
  response: string | undefined;
  logs: DecodeEventLogReturnType[];
  traces: {
    arena: Array<{
      parent: null | number;
      children: number[];
      idx: number;
      trace: {
        depth: number;
        success: boolean;
        caller: string;
        address: string;
        kind: string;
        value: string;
        data: string;
        output: string;
        gas_used: number;
        gas_limit: number;
        status: string;
        steps: any[]; // You might want to define a more specific type for steps
      };
      logs: any[]; // Define a more specific type if needed
      ordering: number[];
    }>;
  };
};

interface FunctionCallsPanelProps {
  abi: Abi | null;
  functionCalls: string[];
  result: Array<FunctionCallResult>;
  addFunctionCall: () => void;
  handleFunctionCallsChange: (
    e: React.ChangeEvent<HTMLTextAreaElement> | null,
    index: number,
  ) => void;
}

const FunctionCallsPanel: React.FC<FunctionCallsPanelProps> = ({
  abi,
  functionCalls,
  result,
  addFunctionCall,
  handleFunctionCallsChange,
}) => {
  if (!abi) {
    return (
      <div className="w-full md:w-1/2 p-4">
        Please select a contract to make function calls.
      </div>
    );
  }

  return (
    <div className="w-full md:w-1/2 p-4 overflow-y-auto">
      <div className="space-y-4">
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
        {functionCalls.map((call, index) => (
          <FunctionCallItem
            key={index}
            call={call}
            index={index}
            result={result[index]}
            handleFunctionCallsChange={handleFunctionCallsChange}
          />
        ))}
      </div>
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
        onClick={addFunctionCall}
      >
        Add Function Call
      </button>
    </div>
  );
};

export default FunctionCallsPanel;
