// components/FileExplorer.tsx
"use client";

import type React from "react";
import { useAppContext } from "../hooks/useAppContext";
import type { SolidityFile } from "../types";
import { randomUUID } from "crypto";

const FileExplorer: React.FC = () => {
  const { files, currentFile, setCurrentFile, setFiles } = useAppContext();

  const onFileSelect = (fileId: string) => {
    const selectedFile = files.find((file) => file.id === fileId);
    if (selectedFile) {
      setCurrentFile(selectedFile);
    }
  };

  const onAddFile = () => {
    const newFileName = `NewFile${files.length + 1}.sol`;
    const newFile: SolidityFile = {
      id: randomUUID(),
      name: newFileName,
      content: "// Your Solidity code here",
    };
    setFiles([...files, newFile]);
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200 p-4">
      <h3 className="font-bold mb-2">Files</h3>
      <ul>
        {files.map((file) => (
          <li
            key={file.id}
            className={`cursor-pointer p-1 ${
              file.id === currentFile.id ? "bg-gray-200" : ""
            }`}
            onClick={() => onFileSelect(file.id)}
          >
            {file.name}
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="mt-2 bg-blue-500 text-white px-2 py-1 rounded"
        onClick={onAddFile}
      >
        Add File
      </button>
    </div>
  );
};

export default FileExplorer;
