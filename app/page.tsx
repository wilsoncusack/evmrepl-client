"use client";
import { useMemo, useState, useEffect } from "react";
import { useSolidityCompiler } from "./hooks/useSolidityCompiler";
import { useFunctionExecutor } from "./hooks/useFunctionExecutor";
import SolidityEditor from "./components/SolidityEditor";
import FunctionCallsPanel from "./components/FunctionCallsPanel";
import FileExplorer from "./components/FileExplorer";
import type { File } from "./types";

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
  const [files, setFiles] = useState<File[]>([
    { name: "SimpleStorage.sol", content: defaultSolidityCode },
  ]);
  const [currentFile, setCurrentFile] = useState("SimpleStorage.sol");
  const [functionCalls, setFunctionCalls] = useState<string[]>([
    "get()",
    "set(1)",
    "get()",
    "getBlockNumber()",
  ]);

  const [selectedContract, setSelectedContract] = useState<{
    fileName: string;
    contractName: string;
  } | null>(null);

  const { isCompiling, ...compilationResult } = useSolidityCompiler(files);

  // Auto-select the first contract in the current file when compilation results change
  useEffect(() => {
    if (compilationResult.contracts && currentFile) {
      // Create a regex to match the file name at the end of the path
      const fileNameRegex = new RegExp(`${currentFile}$`);

      // Find the matching key in the contracts object
      const matchingKey = Object.keys(compilationResult.contracts).find((key) =>
        fileNameRegex.test(key),
      );

      if (matchingKey) {
        const fileContracts = compilationResult.contracts[matchingKey];
        const contractName = Object.keys(fileContracts)[0];
        if (contractName) {
          setSelectedContract({ fileName: matchingKey, contractName });
        }
      } else {
        // If no matching contract is found, set selected contract to null
        setSelectedContract(null);
      }
    }
  }, [compilationResult.contracts, currentFile]);

  const selectedAbi = useMemo(() => {
    if (
      !compilationResult.contracts ||
      !selectedContract?.fileName ||
      !compilationResult.contracts[selectedContract.fileName]
    )
      return null;
    return compilationResult.contracts[selectedContract.fileName][
      selectedContract.contractName
    ][0].contract.abi;
  }, [compilationResult.contracts, selectedContract]);

  const selectedBytecode = useMemo(() => {
    if (
      !compilationResult.contracts ||
      !selectedContract?.fileName ||
      !compilationResult.contracts[selectedContract.fileName]
    )
      return null;
    return compilationResult.contracts[selectedContract.fileName][
      selectedContract.contractName
    ][0].contract.evm.bytecode.object;
  }, [compilationResult.contracts, selectedContract]);

  const result = useFunctionExecutor(
    selectedBytecode,
    selectedAbi,
    functionCalls,
  );

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

  const addNewFile = () => {
    const fileName = `NewFile${files.length + 1}.sol`;
    setFiles([...files, { name: fileName, content: "" }]);
    setCurrentFile(fileName);
  };

  const updateFile = (name: string, content: string) => {
    setFiles(
      files.map((file) => (file.name === name ? { ...file, content } : file)),
    );
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      <div className="w-1/4 p-4">
        <FileExplorer
          files={files}
          currentFile={currentFile}
          onFileSelect={setCurrentFile}
          onAddFile={addNewFile}
        />
      </div>
      <SolidityEditor
        files={files}
        currentFile={currentFile}
        setFiles={setFiles}
        errors={compilationResult.errors || []}
      />
      <FunctionCallsPanel
        abi={selectedAbi}
        functionCalls={functionCalls}
        result={result}
        addFunctionCall={addFunctionCall}
        handleFunctionCallsChange={handleFunctionCallsChange}
      />
    </div>
  );
};

export default IndexPage;
