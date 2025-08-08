import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_CONFIG, HEDERA_TESTNET, isCorrectNetwork, ERROR_MESSAGES } from '../utils/contract';

export function useWallet() {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  };

  // Get provider
  const getProvider = () => {
    if (!isMetaMaskInstalled()) {
      throw new Error(ERROR_MESSAGES.METAMASK_NOT_INSTALLED);
    }
    return new ethers.BrowserProvider(window.ethereum);
  };

  // Connect wallet
  const connectWallet = async () => {
    try {
      setIsLoading(true);
      setError('');

      if (!isMetaMaskInstalled()) {
        throw new Error(ERROR_MESSAGES.METAMASK_NOT_INSTALLED);
      }

      const provider = getProvider();
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (accounts.length > 0) {
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const network = await provider.getNetwork();
        
        setAccount(address);
        setChainId(Number(network.chainId));
        setIsConnected(true);

        // Get balance
        await updateBalance(provider, address);
      }
    } catch (err) {
      console.error('Failed to connect wallet:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setIsConnected(false);
    setAccount('');
    setChainId(null);
    setBalance('0');
    setError('');
  };

  // Switch to Hedera network
  const switchToHedera = async () => {
    try {
      setIsLoading(true);
      setError('');

      if (!isMetaMaskInstalled()) {
        throw new Error(ERROR_MESSAGES.METAMASK_NOT_INSTALLED);
      }

      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${HEDERA_TESTNET.chainId.toString(16)}` }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${HEDERA_TESTNET.chainId.toString(16)}`,
                chainName: HEDERA_TESTNET.name,
                nativeCurrency: {
                  name: HEDERA_TESTNET.currency,
                  symbol: HEDERA_TESTNET.currency,
                  decimals: HEDERA_TESTNET.decimals,
                },
                rpcUrls: [HEDERA_TESTNET.rpcUrl],
                blockExplorerUrls: [HEDERA_TESTNET.blockExplorerUrl],
              },
            ],
          });
        } catch (addError) {
          console.error('Failed to add Hedera network:', addError);
          setError('Failed to add Hedera network to MetaMask');
        }
      } else {
        console.error('Failed to switch to Hedera network:', switchError);
        setError('Failed to switch to Hedera network');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Update balance
  const updateBalance = async (provider, address) => {
    try {
      const balance = await provider.getBalance(address);
      setBalance(ethers.formatEther(balance));
    } catch (err) {
      console.error('Failed to get balance:', err);
    }
  };

  // Check if connected and on correct network
  const isValidConnection = () => {
    return isConnected && isCorrectNetwork(chainId);
  };

  // Initialize wallet connection on page load
  useEffect(() => {
    const initializeWallet = async () => {
      if (!isMetaMaskInstalled()) return;

      try {
        const provider = getProvider();
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          const network = await provider.getNetwork();
          const address = accounts[0].address;
          
          setAccount(address);
          setChainId(Number(network.chainId));
          setIsConnected(true);
          
          await updateBalance(provider, address);
        }
      } catch (err) {
        console.error('Failed to initialize wallet:', err);
      }
    };

    initializeWallet();
  }, []);

  // Listen for account and network changes
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (accounts[0] !== account) {
        setAccount(accounts[0]);
        const provider = getProvider();
        updateBalance(provider, accounts[0]);
      }
    };

    const handleChainChanged = (chainId) => {
      setChainId(parseInt(chainId, 16));
      // Reload the page to avoid stale state
      window.location.reload();
    };

    window.ethereum?.on('accountsChanged', handleAccountsChanged);
    window.ethereum?.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, [account]);

  return {
    isConnected,
    account,
    chainId,
    balance,
    isLoading,
    error,
    isValidConnection,
    isMetaMaskInstalled,
    connectWallet,
    disconnectWallet,
    switchToHedera,
    updateBalance: () => {
      if (isConnected && account) {
        const provider = getProvider();
        updateBalance(provider, account);
      }
    }
  };
}
