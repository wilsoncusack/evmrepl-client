// components/FunctionCallItem.tsx
"use client";

import React from "react";
import { useAppContext } from "../hooks/useAppContext";
import ResultDisplay from "./ResultDisplay";
import { FunctionCall, FunctionCallResult } from "../types";

interface FunctionCallItemProps {
  call: FunctionCall
  index: number;
  result?: FunctionCallResult
  handleFunctionCallsChange: (newCall: string, index: number) => void;
}

const FunctionCallItem: React.FC<FunctionCallItemProps> = ({
  call,
  index,
  handleFunctionCallsChange,
  result
}) => {
  const { setFilesFunctionCalls, currentFile } = useAppContext();

  const handleDelete = () => {
    if (!currentFile) return;

    setFilesFunctionCalls((prev) => {
      const newCalls = [...(prev[currentFile.id] || [])];
      newCalls.splice(index, 1);
      return { ...prev, [currentFile.id]: newCalls };
    });
  };

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="flex items-center p-2 bg-gray-50">
        <div className="flex-grow relative">
          <textarea
            className="w-full p-2 bg-white text-gray-800 resize-none focus:outline-none font-mono border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            value={call.name}
            onChange={(e) => handleFunctionCallsChange(e.target.value, index)}
            rows={1}
            placeholder="Enter function call (e.g., set(1))"
          />
        </div>
        <button
          className="ml-2 p-1 text-red-500 hover:bg-red-100 rounded"
          onClick={handleDelete}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      {result && <ResultDisplay result={result} />}
    </div>
  );
};

export default FunctionCallItem;
