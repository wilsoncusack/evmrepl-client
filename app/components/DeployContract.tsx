import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useWalletClient, useChainId, useSwitchChain, useAccount } from 'wagmi';
import { createPublicClient, http, Chain, Hash, encodeFunctionData } from 'viem';
import { 
  base,
  baseSepolia,
  sepolia,
  polygon,
  arbitrum,
  optimism,
  zora,
  mainnet,
  localhost,
} from 'viem/chains';
import { SolidityFile } from '../types';
import { 
  ConnectWallet, 
  Wallet, 
  WalletDropdown, 
  WalletDropdownLink, 
  WalletDropdownDisconnect, 
} from '@coinbase/onchainkit/wallet'; 
import {
  Address,
  Avatar,
  Name,
  Identity,
  EthBalance,
} from '@coinbase/onchainkit/identity';
import { color } from '@coinbase/onchainkit/theme';

const chains: Chain[] = [ // TODO: this is defined in multiple places
  mainnet,
  sepolia,
  polygon,
  arbitrum,
  optimism,
  zora,
  base,
  baseSepolia,
  localhost,
];

interface DeployContractProps {
  onClose: () => void;
}

const DeployContract: React.FC<DeployContractProps> = ({ onClose }) => {
  const { currentFile, currentFileCompilationResult, addNewContract } = useAppContext();
  const { data: walletClient } = useWalletClient();
  const { switchChain } = useSwitchChain();
  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  
  const [isDeploying, setIsDeploying] = useState(false);
  const [selectedChain, setSelectedChain] = useState(base);
  const [error, setError] = useState<string | null>(null);

  const deployContract = async () => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return;
    }
    
    if (!walletClient) {
      setError('Please connect your wallet first');
      return;
    }

    setIsDeploying(true);
    setError(null);
    if (!currentFile || !currentFileCompilationResult) {
      setError('No contract selected or compilation result not available');
      return;
    }

    setIsDeploying(true);
    setError(null);

    try {
      // Ensure the connected chain matches the selected chain
      console.log('Starting deployment process');
      console.log('Current chain:', chainId);
      console.log('Selected chain:', selectedChain.id);

      if (chainId !== selectedChain.id) {
        console.log('Switching chain');
        await switchChain({ chainId: selectedChain.id });
      }

      console.log('Preparing contract deployment');

      const publicClient = createPublicClient({
        chain: selectedChain,
        transport: http()
      });

      const bytecode = currentFileCompilationResult.evm.bytecode.object as `0x${string}`;
      console.log('ABI:', currentFileCompilationResult.abi);
      console.log('Bytecode:', bytecode);
      console.log('Account:', address);

      const hash = await walletClient.deployContract({
        abi: currentFileCompilationResult.abi,
        bytecode,
        account: address,
      });

      console.log('Deployment transaction hash:', hash);


      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      const newFile: SolidityFile = {
        id: crypto.randomUUID(),
        name: currentFile.name,
        content: currentFile.content,
        address: receipt.contractAddress as `0x${string}`,
      };

      addNewContract(newFile);
      onClose();
    } catch (err) {
      console.error('Deployment error:', err);
      setError(`Deployment failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Deploy Contract</h2>
        
        <Wallet>
          <ConnectWallet>
            <Avatar className="h-6 w-6" />
            <Name />
          </ConnectWallet>
          <WalletDropdown>
            <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
              <Avatar />
              <Name />
              <Address className={color.foregroundMuted} />
              <EthBalance />
            </Identity>
            <WalletDropdownLink icon="wallet" href="https://wallet.coinbase.com">
              Wallet
            </WalletDropdownLink>
            <WalletDropdownDisconnect />
          </WalletDropdown>
        </Wallet>
        
        <div className="mb-4">
          <label htmlFor="chain" className="block text-sm font-medium text-gray-700">
            Select Chain
          </label>
          <select
            id="chain"
            value={selectedChain.id}
            onChange={(e) => setSelectedChain(chains.find(c => c.id === Number(e.target.value)) || base)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            {chains.map((chain) => (
              <option key={chain.id} value={chain.id}>
                {chain.name} (Chain ID: {chain.id})
              </option>
            ))}
          </select>
        </div>
        
        {chainId && (
          <div className="mb-4 text-sm">
            Current wallet chain ID: {chainId}
          </div>
        )}
        
        {error && <div className="text-red-500 mb-4">{error}</div>}
        
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            disabled={isDeploying}
          >
            Cancel
          </button>
          <button
            onClick={deployContract}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={isDeploying || !walletClient || status === 'pending'}
          >
            {isDeploying ? 'Deploying...' : 'Deploy Contract'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeployContract;