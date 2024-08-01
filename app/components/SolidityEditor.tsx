// components/SolidityEditor.tsx
"use client";

import React, { useRef, useMemo, useEffect } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import CompileErrorDisplay from "./CompileErrorDisplay";
import { useAppContext } from "../hooks/useAppContext";

const SolidityEditor: React.FC = () => {
  const { files, currentFile, setFiles, compilationResult } = useAppContext();
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  const errors = compilationResult?.errors || [];

  const relevantErrors = useMemo(() => {
    return errors.filter((e) => e.severity !== "warning");
  }, [errors]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    if (!currentFile) return;
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
      monaco.Uri.parse(`file:///${currentFile.name}`),
    );
    if (currentModel) {
      editor.setModel(currentModel);
    }
  };

  useEffect(() => {
    if (!currentFile) return;
    if (editorRef.current && monacoRef.current) {
      const currentModel = monacoRef.current.editor.getModel(
        monacoRef.current.Uri.parse(`file:///${currentFile.name}`),
      );
      if (currentModel) {
        editorRef.current.setModel(currentModel);
      }
    }
  }, [currentFile]);

  const handleEditorChange = (value: string | undefined) => {
    if (!currentFile) return;
    setFiles(
      files.map((file) =>
        file.id === currentFile.id ? { ...file, content: value || "" } : file,
      ),
    );
  };

  return (
    <div className="h-full overflow-hidden">
      <div className="bg-white shadow-lg overflow-hidden border border-gray-200">
        <div className="relative flex h-[calc(100vh-10rem)] p-4 pb-0">
          {currentFile && (
            <Editor
              height="100%"
              defaultLanguage="sol"
              path={currentFile.name}
              value={currentFile.content}
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
          )}
        </div>
      </div>
      {relevantErrors.length > 0 && (
        <CompileErrorDisplay errors={relevantErrors} />
      )}
    </div>
  );
};

export default SolidityEditor;
