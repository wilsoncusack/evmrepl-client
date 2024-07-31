import { createContext } from "react";
import type {
  CompilationResult,
  FileFunctionCalls,
  SolidityFile,
} from "../types";

interface AppContextType {
  files: SolidityFile[];
  setFiles: React.Dispatch<React.SetStateAction<SolidityFile[]>>;
  filesFunctionCalls: FileFunctionCalls;
  setFilesFunctionCalls: React.Dispatch<
    React.SetStateAction<FileFunctionCalls>
  >;
  currentFile: SolidityFile;
  setCurrentFile: React.Dispatch<React.SetStateAction<SolidityFile>>;
  compilationResult?: CompilationResult;
  isCompiling: boolean;
  setIsCompiling: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

// setFiles => update on file save, update on new file
// selectedFile => one of current files
// functionCalls => Should be specific to a file.
