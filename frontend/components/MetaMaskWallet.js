'use client';

import { useState, useEffect } from 'react';
import { MetaMaskSDK } from '@metamask/sdk';
import { ethers } from 'ethers';
import { hederaTestnet } from '../lib/wagmi';

export default function MetaMaskWallet() {
  const [sdk, setSdk] = useState(null);
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('0');
  const [chainId, setChainId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const MMSDK = new MetaMaskSDK({
      dappMetadata: {
        name: 'Voltx REC Hub',
        url: window.location.origin,
      },
      checkInstallationImmediately: false,
    });

    setSdk(MMSDK);

    // Check if already connected
    if (MMSDK.isInitialized()) {
      const provider = MMSDK.getProvider();
      if (provider) {
        provider.request({ method: 'eth_accounts', params: [] }).then((accounts) => {
          if (accounts && accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);
            updateBalance(accounts[0], provider);
            updateChainId(provider);
          }
        });
      }
    }
  }, []);

  const updateBalance = async (address, provider) => {
    try {
      const balanceWei = await provider.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
      const balanceEth = ethers.formatEther(balanceWei);
      setBalance(parseFloat(balanceEth).toFixed(4));
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const updateChainId = async (provider) => {
    try {
      const chain = await provider.request({ method: 'eth_chainId' });
      setChainId(parseInt(chain, 16));
    } catch (error) {
      console.error('Error fetching chain ID:', error);
    }
  };

  const connect = async () => {
    if (!sdk) return;
    setIsConnecting(true);
    try {
      const accounts = await sdk.connect();
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        const provider = sdk.getProvider();
        updateBalance(accounts[0], provider);
        updateChainId(provider);
      }
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAccount('');
    setBalance('0');
    setChainId('');
    setIsConnected(false);
  };

  const switchToHedera = async () => {
    if (!sdk) return;
    const provider = sdk.getProvider();
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${hederaTestnet.id.toString(16)}` }],
      });
      updateChainId(provider);
    } catch (error) {
      if (error.code === 4902) {
        // Chain not added, add it
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${hederaTestnet.id.toString(16)}`,
              chainName: hederaTestnet.name,
              nativeCurrency: hederaTestnet.nativeCurrency,
              rpcUrls: hederaTestnet.rpcUrls.default.http,
              blockExplorerUrls: [hederaTestnet.blockExplorers.default.url],
            }],
          });
        } catch (addError) {
          console.error('Error adding chain:', addError);
        }
      }
    }
  };

  const isCorrectNetwork = chainId === hederaTestnet.id;

  if (!isConnected) {
    return (
      <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-700 overflow-hidden max-w-md mx-auto">
        <div className="p-6 text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">🦊</span>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Connect MetaMask</h2>
            <p className="text-gray-400">
              Connect your MetaMask wallet to Voltx REC Hub
            </p>
          </div>
          <button
            onClick={connect}
            disabled={isConnecting}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 px-6 rounded-lg font-medium hover:from-orange-600 hover:to-red-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
          </button>
        </div>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="bg-gray-900 rounded-xl shadow-2xl border border-red-700 overflow-hidden max-w-md mx-auto">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-red-600">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-red-400 mb-2">Wrong Network</h3>
          <p className="text-red-300 mb-4">
            Please switch to Hedera Testnet to use Voltx
          </p>
          <button
            onClick={switchToHedera}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
          >
            Switch to Hedera Testnet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-700 overflow-hidden max-w-md mx-auto">
      <div className="p-6">
        {/* Connected State Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600">🦊</span>
            </div>
            <div>
              <h3 className="font-semibold text-white">MetaMask Connected</h3>
              <p className="text-sm text-gray-400">
                {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Unknown'}
              </p>
            </div>
          </div>
          <button
            onClick={disconnect}
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Disconnect"
          >
            ✕
          </button>
        </div>

        {/* Balance and Network Info */}
        <div className="space-y-3">
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-gray-400 mb-1">Balance</label>
                <p className="font-medium text-white">
                  {balance} HBAR
                </p>
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Network</label>
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${
                    !isCorrectNetwork ? 'bg-red-500' : 'bg-green-500'
                  }`}></span>
                  <span className="font-medium text-white">{hederaTestnet.name}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex space-x-2">
            <button
              onClick={() => {
                window.open(`${process.env.NEXT_PUBLIC_BLOCK_EXPLORER}/account/${account}`, '_blank')
              }}
              className="flex-1 bg-gray-800 text-gray-300 py-2 px-3 rounded-md hover:bg-gray-700 transition-colors text-sm"
            >
              🔍 Explorer
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(account)}
              className="flex-1 bg-gray-800 text-gray-300 py-2 px-3 rounded-md hover:bg-gray-700 transition-colors text-sm"
            >
              📋 Copy
            </button>
            <button
              onClick={() => {
                if (window.ethereum) {
                  window.ethereum.request({
                    method: 'wallet_watchAsset',
                    params: {
                      type: 'ERC20',
                      options: {
                        address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
                        symbol: 'VREC',
                        decimals: 18,
                      },
                    },
                  })
                }
              }}
              className="flex-1 bg-orange-100 text-orange-700 py-2 px-3 rounded-md hover:bg-orange-200 transition-colors text-sm"
            >
              🦊 Add VREC
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}