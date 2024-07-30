// hooks/useSolidityCompiler.ts
import { useState, useEffect } from "react";
import { CompilationResult, File } from "../types";

export const useSolidityCompiler = (files: File[]) => {
  const [compilationResult, setCompilationResult] =
    useState<CompilationResult | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);

  useEffect(() => {
    const compileCode = async () => {
      if (files.length === 0) return;

      setIsCompiling(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER}/compile_solidity`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ files }),
          },
        );

        if (!response.ok) {
          throw new Error("Compilation failed");
        }

        const result = await response.json();
        setCompilationResult(result);
      } catch (error) {
        console.error("Compilation error:", error);
        setCompilationResult(null);
      } finally {
        setIsCompiling(false);
      }
    };

    compileCode();
  }, [files]);

  return { ...compilationResult, isCompiling };
};
