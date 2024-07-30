// components/FileExplorer.tsx
import type React from "react";
import type { File } from "../types";

interface FileExplorerProps {
  files: File[];
  currentFile: string;
  onFileSelect: (fileName: string) => void;
  onAddFile: () => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  currentFile,
  onFileSelect,
  onAddFile,
}) => {
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200 p-4">
      <h3 className="font-bold mb-2">Files</h3>
      <ul>
        {files.map((file) => (
          <li
            key={file.name}
            className={`cursor-pointer p-1 ${
              file.name === currentFile ? "bg-gray-200" : ""
            }`}
            onClick={() => onFileSelect(file.name)}
          >
            {file.name}
          </li>
        ))}
      </ul>
      <button
        className="mt-2 bg-blue-500 text-white px-2 py-1 rounded"
        onClick={onAddFile}
      >
        Add File
      </button>
    </div>
  );
};

export default FileExplorer;
