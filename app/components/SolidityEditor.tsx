// components/SolidityEditor.tsx
import type React from "react";
import { useRef, useMemo, useEffect } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import CompileErrorDisplay from "./CompileErrorDisplay";
import type { CompilationResult, File } from "../types";

interface SolidityEditorProps {
  files: File[];
  currentFile: string;
  setFiles: (files: File[]) => void;
  errors: CompilationResult["errors"];
}

const SolidityEditor: React.FC<SolidityEditorProps> = ({
  files,
  currentFile,
  setFiles,
  errors,
}) => {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  const relevantErrors = useMemo(() => {
    if (!errors) return [];
    return errors.filter((e) => e.severity !== "warning");
  }, [errors]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Create models for each file
    for (const file of files) {
      if (!monaco.editor.getModel(monaco.Uri.parse(`file:///${file.name}`))) {
        monaco.editor.createModel(
          file.content,
          "sol",
          monaco.Uri.parse(`file:///${file.name}`),
        );
      }
    }

    // Set the current model
    const currentModel = monaco.editor.getModel(
      monaco.Uri.parse(`file:///${currentFile}`),
    );
    if (currentModel) {
      editor.setModel(currentModel);
    }
  };

  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      const currentModel = monacoRef.current.editor.getModel(
        monacoRef.current.Uri.parse(`file:///${currentFile}`),
      );
      if (currentModel) {
        editorRef.current.setModel(currentModel);
      }
    }
  }, [currentFile]);

  const handleEditorChange = (value: string | undefined) => {
    setFiles(
      files.map((file) =>
        file.name === currentFile ? { ...file, content: value || "" } : file,
      ),
    );
  };

  return (
    <div className="w-full md:w-3/4 p-4">
      {relevantErrors.length > 0 && (
        <CompileErrorDisplay errors={relevantErrors} />
      )}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
        <div className="relative flex h-[calc(100vh-10rem)] p-4">
          <Editor
            height="100%"
            defaultLanguage="sol"
            path={currentFile}
            value={files.find((f) => f.name === currentFile)?.content}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 14,
              lineNumbers: "on",
              glyphMargin: true,
              folding: true,
              lineNumbersMinChars: 0,
              overviewRulerBorder: false,
              language: "sol",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SolidityEditor;
