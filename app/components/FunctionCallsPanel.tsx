// components/FunctionCallsPanel.tsx
"use client";

import React, { useMemo } from "react";
import { useAppContext } from "../hooks/useAppContext";
import FunctionCallItem from "./FunctionCallItem";

const FunctionCallsPanel: React.FC = () => {
  const {
    currentFile,
    filesFunctionCalls,
    setFilesFunctionCalls,
    currentFileFunctionCallResults,
  } = useAppContext();

  const functionCalls = useMemo(() => {
    if (!currentFile) return [];
    return filesFunctionCalls[currentFile.id] || [];
  }, [currentFile, filesFunctionCalls]);

  const addFunctionCall = () => {
    if (!currentFile) return;
    setFilesFunctionCalls((prev) => ({
      ...prev,
      [currentFile.id]: [
        ...(prev[currentFile.id] || []),
        { name: "", args: [] },
      ],
    }));
  };

  const handleFunctionCallsChange = (newCall: string, index: number) => {
    if (!currentFile) return;
    setFilesFunctionCalls((prev) => {
      const newCalls = [...(prev[currentFile.id] || [])];
      newCalls[index] = { ...newCalls[index], name: newCall };
      return { ...prev, [currentFile.id]: newCalls };
    });
  };

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
            result={currentFileFunctionCallResults ? currentFileFunctionCallResults[index] : undefined}
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
