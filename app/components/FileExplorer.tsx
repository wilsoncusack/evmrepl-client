// components/FileExplorer.tsx
"use client";

import type React from "react";
import { useAppContext } from "../hooks/useAppContext";
import type { SolidityFile } from "../types";

const FileExplorer: React.FC = () => {
  const { files, currentFile, setCurrentFileId, setFiles } = useAppContext();

  const onFileSelect = (fileId: string) => {
    const selectedFile = files.find((file) => file.id === fileId);
    if (selectedFile) {
      setCurrentFileId(selectedFile.id);
    }
  };

  const onAddFile = () => {
    const newFileName = `NewFile${files.length + 1}.sol`;
    const newFile: SolidityFile = {
      id: crypto.randomUUID(),
      name: newFileName,
      content: "pragma solidity 0.8.26;\n\n// Your Solidity code here",
    };
    setFiles([...files, newFile]);
  };

  return (
    <div className="w-64 bg-gray-800 text-white h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h3 className="font-bold text-xl">Files</h3>
      </div>
      <ul className="flex-grow overflow-y-auto">
        {files.map((file) => (
          <li
            key={file.id}
            className={`cursor-pointer p-3 hover:bg-gray-700 transition-colors ${
              file.id === currentFile.id ? "bg-gray-700" : ""
            }`}
            onClick={() => onFileSelect(file.id)}
          >
            {file.name}
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="m-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
        onClick={onAddFile}
      >
        Add File
      </button>
    </div>
  );
};

export default FileExplorer;
