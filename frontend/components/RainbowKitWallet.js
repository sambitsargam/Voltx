import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance, useChainId, useSwitchChain } from 'wagmi';
import { hederaTestnet } from '../lib/wagmi';

export default function RainbowKitWalletButton() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({
    address: address,
  });
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const isCorrectNetwork = chainId === hederaTestnet.id;

  return (
    <div className="space-y-4">
      {/* RainbowKit Connect Button */}
      <div className="flex justify-center">
        <ConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            authenticationStatus,
            mounted,
          }) => {
            // Note: If your app doesn't use authentication, you
            // can remove all 'authenticationStatus' checks
            const ready = mounted && authenticationStatus !== 'loading';
            const connected =
              ready &&
              account &&
              chain &&
              (!authenticationStatus ||
                authenticationStatus === 'authenticated');

            return (
              <div
                {...(!ready && {
                  'aria-hidden': true,
                  'style': {
                    opacity: 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  },
                })}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-w-md mx-auto">
                        <div className="p-6 text-center">
                          <div className="mb-4">
                            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                              <span className="text-2xl text-white">🔌</span>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">Connect Your Wallet</h2>
                            <p className="text-gray-600">
                              Connect your wallet to start using Voltx REC Hub
                            </p>
                          </div>
                          <button
                            onClick={openConnectModal}
                            className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-green-600 hover:to-blue-700 transition-all transform hover:scale-105"
                          >
                            Connect Wallet
                          </button>
                        </div>
                      </div>
                    );
                  }

                  if (chain.unsupported) {
                    return (
                      <div className="bg-white rounded-xl shadow-lg border border-red-200 overflow-hidden max-w-md mx-auto">
                        <div className="p-6 text-center">
                          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl text-red-600">⚠️</span>
                          </div>
                          <h3 className="text-lg font-semibold text-red-800 mb-2">Wrong Network</h3>
                          <p className="text-red-600 mb-4">
                            Please switch to Hedera Testnet to use Voltx
                          </p>
                          <button
                            onClick={openChainModal}
                            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Switch Network
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-w-md mx-auto">
                      <div className="p-6">
                        {/* Connected State Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-green-600">✓</span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-800">Connected</h3>
                              <p className="text-sm text-gray-600">{account.displayName}</p>
                            </div>
                          </div>
                          <button
                            onClick={openAccountModal}
                            className="text-gray-400 hover:text-green-500 transition-colors"
                            title="Account Details"
                          >
                            ⚙️
                          </button>
                        </div>

                        {/* Balance and Network Info */}
                        <div className="space-y-3">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <label className="block text-gray-600 mb-1">Balance</label>
                                <p className="font-medium text-gray-800">
                                  {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : '0.0000 HBAR'}
                                </p>
                              </div>
                              <div>
                                <label className="block text-gray-600 mb-1">Network</label>
                                <button
                                  onClick={openChainModal}
                                  className="flex items-center space-x-2 hover:text-blue-600 transition-colors"
                                >
                                  <span className={`w-2 h-2 rounded-full ${
                                    chain?.unsupported ? 'bg-red-500' : 'bg-green-500'
                                  }`}></span>
                                  <span className="font-medium">{chain?.name || 'Unknown'}</span>
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                window.open(`${process.env.NEXT_PUBLIC_BLOCK_EXPLORER}/account/${account.address}`, '_blank')
                              }}
                              className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-200 transition-colors text-sm"
                            >
                              🔍 Explorer
                            </button>
                            <button
                              onClick={() => navigator.clipboard.writeText(account.address)}
                              className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-200 transition-colors text-sm"
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
                              className="flex-1 bg-green-100 text-green-700 py-2 px-3 rounded-md hover:bg-green-200 transition-colors text-sm"
                            >
                              🦊 Add VREC
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>

      {/* Network Warning */}
      {isConnected && !isCorrectNetwork && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <span className="text-orange-600">⚠️</span>
            <h3 className="font-semibold text-orange-800">Switch to Hedera Testnet</h3>
          </div>
          <p className="text-orange-700 text-sm mb-3">
            Voltx works on Hedera Testnet. Please switch your network to continue.
          </p>
          <button
            onClick={() => switchChain?.({ chainId: hederaTestnet.id })}
            className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
          >
            Switch to Hedera Testnet
          </button>
        </div>
      )}
    </div>
  );
}
