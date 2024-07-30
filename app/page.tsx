"use client";
import { useState } from "react";
import { useSolidityCompiler } from "./hooks/useSolidityCompiler";
import { useFunctionExecutor } from "./hooks/useFunctionExecutor";
import SolidityEditor from "./components/SolidityEditor";
import FunctionCallsPanel from "./components/FunctionCallsPanel";

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
  const [solidityCode, setSolidityCode] = useState(defaultSolidityCode);
  const [functionCalls, setFunctionCalls] = useState<string[]>([
    "get()",
    "set(1)",
    "get()",
    "getBlockNumber()",
  ]);

  const { bytecode, abi, compilationErrors } =
    useSolidityCompiler(solidityCode);
  const result = useFunctionExecutor(bytecode, abi, functionCalls);

  const addFunctionCall = () => {
    setFunctionCalls((prev) => [...prev, ""]);
  };

  const handleFunctionCallsChange = (
    e: React.ChangeEvent<HTMLTextAreaElement> | null,
    index: number,
  ) => {
    setFunctionCalls((prev) => {
      const newCalls = [...prev];
      if (e === null) {
        newCalls.splice(index, 1);
      } else {
        newCalls[index] = e.target.value;
      }
      return newCalls;
    });
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      <SolidityEditor
        solidityCode={solidityCode}
        setSolidityCode={setSolidityCode}
        errors={compilationErrors}
      />
      <FunctionCallsPanel
        functionCalls={functionCalls}
        result={result}
        addFunctionCall={addFunctionCall}
        handleFunctionCallsChange={handleFunctionCallsChange}
      />
    </div>
  );
};

export default IndexPage;
