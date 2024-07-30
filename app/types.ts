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
    [key: string]: {
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

export interface File {
  name: string;
  content: string;
}
