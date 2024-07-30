import { useState, useEffect } from "react";
import axios, { type AxiosError } from "axios";
import type { Abi } from "viem";
import { CompilationResult } from "../types";

export const useSolidityCompiler = (solidityCode: string) => {
  const [bytecode, setBytecode] = useState("");
  const [abi, setAbi] = useState<Abi>([]);
  const [compilationErrors, setCompilationErrors] = useState<
    CompilationResult["errors"]
  >([]);

  useEffect(() => {
    const compileSolidity = async () => {
      try {
        const response = await axios.post<CompilationResult>(
          `${process.env.NEXT_PUBLIC_SERVER}/compile_solidity`,
          { code: solidityCode },
        );

        let contractKeys = Object.keys(response.data.contracts);
        let contractCount = contractKeys.length;
        if (contractCount > 0) {
          const lastContractObj =
            response.data.contracts[contractKeys[contractCount - 1]];
          const lastContract = Object.values(lastContractObj)[0][0].contract;
          setBytecode(lastContract.evm.bytecode.object);
          setAbi(lastContract.abi as any);
        }

        // Update compilation errors state
        setCompilationErrors(response.data.errors);
      } catch (error) {
        console.error("Compilation error:", error);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      compileSolidity();
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [solidityCode]);

  return { bytecode, abi, compilationErrors };
};
