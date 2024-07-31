import { Address, DecodeEventLogReturnType, Hex, Log } from "viem";

export interface CompilationResult {
  errors: {
    sourceLocation: {
      file: string;
      start: number;
      end: number;
    };
    type: string;
    component: string;
    severity: string;
    errorCode: string;
    message: string;
    formattedMessage: string;
  }[];
  contracts: {
    [fileName: string]: {
      [contractName: string]: {
        contract: {
          abi: {
            type: string;
            name: string;
            inputs: {
              name: string;
              type: string;
              internalType: string;
            }[];
            outputs?: {
              name: string;
              type: string;
              internalType: string;
            }[];
            stateMutability: string;
            anonymous?: boolean;
          }[];
          userdoc: {};
          devdoc: {};
          evm: {
            bytecode: {
              object: string;
              opcodes: string;
              sourceMap: string;
              linkReferences: {};
            };
            deployedBytecode: {
              object: string;
              opcodes: string;
              sourceMap: string;
              linkReferences: {};
            };
            methodIdentifiers: {
              [key: string]: string;
            };
          };
        };
        version: string;
        build_id: string;
      }[];
    };
  };
}

export type FunctionCallResult = {
  call: string;
  gasUsed: string;
  response: string | undefined;
  logs: DecodeEventLogReturnType[];
  traces: {
    arena: Array<{
      parent: null | number;
      children: number[];
      idx: number;
      trace: {
        depth: number;
        success: boolean;
        caller: string;
        address: string;
        kind: string;
        value: string;
        data: string;
        output: string;
        gas_used: number;
        gas_limit: number;
        status: string;
        steps: any[];
      };
      logs: any[];
      ordering: number[];
    }>;
  };
};

type FileId = string;

export interface FileFunctionCalls {
  [id: FileId]: FunctionCall[];
}

export interface FunctionCall {
  name: string;
  // biome-ignore lint/suspicious/noExplicitAny:
  args: any[];
  value?: bigint;
  caller?: Address;
  encodedCalldata?: Hex;
  result?: FunctionCallResult;
  // consider having something for like parse errors. But maybe these never make it
  error?: string;
}

export interface SolidityFile {
  id: FileId;
  name: string;
  content: string;
  compilationResult?: CompilationResult["contracts"][0][0][0]["contract"];
}

export type ExecutionResponse = {
  exitReason: string;
  reverted: boolean;
  result: Hex;
  gasUsed: string;
  logs: Log[];
  traces: FunctionCallResult["traces"];
};
