"use client";
import { useMemo, useState, useEffect } from "react";
import { useSolidityCompiler } from "./hooks/useSolidityCompiler";
import { useFunctionExecutor } from "./hooks/useFunctionExecutor";
import SolidityEditor from "./components/SolidityEditor";
import FunctionCallsPanel from "./components/FunctionCallsPanel";
import FileExplorer from "./components/FileExplorer";
import type { File } from "./types";
import { useAppContext } from "./hooks/useAppContext";

const defaultSolidityCode = `pragma solidity 0.8.26;

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

const IndexPage = () => {
  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      <div className="w-1/4 p-4">
        <FileExplorer />
      </div>
      <SolidityEditor />
      {/* <FunctionCallsPanel
        abi={selectedAbi}
        functionCalls={functionCalls}
        result={result}
        addFunctionCall={addFunctionCall}
        handleFunctionCallsChange={handleFunctionCallsChange}
      /> */}
    </div>
  );
};

export default IndexPage;
