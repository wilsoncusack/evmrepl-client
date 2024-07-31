"use client";
import SolidityEditor from "./components/SolidityEditor";
import FunctionCallsPanel from "./components/FunctionCallsPanel";
import FileExplorer from "./components/FileExplorer";
import { useAppContext } from "./hooks/useAppContext";

const IndexPage = () => {
  const { compilationResult } = useAppContext();
  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      {/* {JSON.stringify(compilationResult)} */}
      <div className="w-1/4 p-4">
        <FileExplorer />
      </div>
      <SolidityEditor />
      <FunctionCallsPanel />
    </div>
  );
};

export default IndexPage;
