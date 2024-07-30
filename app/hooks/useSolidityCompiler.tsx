import { useState, useEffect } from "react";
import axios, { type AxiosError } from "axios";
import type { Abi } from "viem";

interface ContractData {
  name: string;
  abi: string;
  bytecode: string;
}

export interface SolcCompileResponse {
  data: ContractData[];
  errors: SolcError[];
}

export interface SolcError {
  errorType: "Error" | "Warning";
  message: string;
  details: {
    line?: number;
    column?: number;
    codeSnippet?: string;
  };
}
export const useSolidityCompiler = (solidityCode: string) => {
  const [bytecode, setBytecode] = useState("");
  const [abi, setAbi] = useState<Abi>([]);
  const [compilationErrors, setCompilationErrors] = useState<SolcError[]>([]);

  useEffect(() => {
    const compileSolidity = async () => {
      try {
        const response = await axios.post<SolcCompileResponse>(
          `${process.env.NEXT_PUBLIC_SERVER}/compile_solidity`,
          { code: solidityCode },
        );

        if (response.data.data.length > 0) {
          const lastContract =
            response.data.data[response.data.data.length - 1];
          setBytecode(lastContract.bytecode);
          setAbi(JSON.parse(lastContract.abi));
        }

        // Update compilation errors state
        setCompilationErrors(response.data.errors);
      } catch (error) {
        console.error("Compilation error:", error);
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError<{ message: string }>;
          if (axiosError.response) {
            setCompilationErrors([
              {
                errorType: "Error",
                message:
                  axiosError.response.data.message || "Unknown error occurred",
                details: {},
              },
            ]);
          }
        }
      }
    };

    const delayDebounceFn = setTimeout(() => {
      compileSolidity();
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [solidityCode]);

  return { bytecode, abi, compilationErrors };
};
