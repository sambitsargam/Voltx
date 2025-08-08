import { useState } from 'react';
import { Wallet, ExternalLink, AlertCircle } from 'lucide-react';
import { formatAddress, getHashScanContractUrl, HEDERA_TESTNET } from '../utils/contract';

export default function WalletConnection({ 
  isConnected, 
  account, 
  chainId, 
  balance, 
  isLoading, 
  error,
  isValidConnection,
  connectWallet, 
  disconnectWallet, 
  switchToHedera,
  isMetaMaskInstalled
}) {
  const [showDetails, setShowDetails] = useState(false);

  if (!isMetaMaskInstalled()) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">MetaMask Required</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Please install MetaMask to interact with Voltx.{' '}
              <a 
                href="https://metamask.io/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:text-yellow-900"
              >
                Download MetaMask
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg card-shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <Wallet className="h-5 w-5 mr-2" />
          Wallet Connection
        </h2>
        
        {isConnected && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {!isConnected ? (
        <div className="text-center">
          <p className="text-gray-600 mb-4">Connect your wallet to interact with Voltx</p>
          <button
            onClick={connectWallet}
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Connected to</span>
              <span className="text-sm font-medium text-gray-900 ml-1">
                {formatAddress(account)}
              </span>
            </div>
            
            <button
              onClick={disconnectWallet}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Disconnect
            </button>
          </div>

          {!isValidConnection() && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                  <span className="text-sm text-yellow-700">
                    Wrong Network - Switch to Hedera Testnet
                  </span>
                </div>
                <button
                  onClick={switchToHedera}
                  disabled={isLoading}
                  className="text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 disabled:opacity-50"
                >
                  {isLoading ? 'Switching...' : 'Switch Network'}
                </button>
              </div>
            </div>
          )}

          {showDetails && isValidConnection() && (
            <div className="border-t pt-4 space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Network:</span>
                  <span className="font-medium text-gray-900 ml-2">
                    {HEDERA_TESTNET.name}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Chain ID:</span>
                  <span className="font-medium text-gray-900 ml-2">
                    {chainId}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Balance:</span>
                  <span className="font-medium text-gray-900 ml-2">
                    {parseFloat(balance).toFixed(4)} HBAR
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Explorer:</span>
                  <a
                    href={`${HEDERA_TESTNET.blockExplorerUrl}/account/${account}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 ml-2 inline-flex items-center"
                  >
                    View <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              </div>
              
              <div className="pt-2">
                <span className="text-gray-600 text-sm">Full Address:</span>
                <div className="font-mono text-xs text-gray-900 bg-gray-50 p-2 rounded mt-1 break-all">
                  {account}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
