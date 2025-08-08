import { useState } from 'react'

export default function FloatingWalletButton({ account, balance, isCorrectNetwork, onDisconnect }) {
  const [isOpen, setIsOpen] = useState(false)

  const formatAddress = (address) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatBalance = (balance) => {
    const num = parseFloat(balance)
    return num.toFixed(3)
  }

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(account)
      alert('Address copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy address:', error)
    }
  }

  return (
    <div className="fixed top-4 right-4 z-40">
      <div className="relative">
        {/* Main Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center space-x-3 bg-white border-2 rounded-full px-4 py-2 shadow-lg hover:shadow-xl transition-all ${
            isCorrectNetwork ? 'border-green-200' : 'border-orange-200'
          }`}
        >
          <div className={`w-3 h-3 rounded-full ${
            isCorrectNetwork ? 'bg-green-500' : 'bg-orange-500'
          }`}></div>
          <span className="font-medium text-gray-800">{formatAddress(account)}</span>
          <span className="text-gray-600">⚡</span>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-12 right-0 bg-white border border-gray-200 rounded-xl shadow-2xl w-72 overflow-hidden">
            {/* Header */}
            <div className={`p-4 ${
              isCorrectNetwork 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200' 
                : 'bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    isCorrectNetwork ? 'bg-green-500' : 'bg-orange-500'
                  }`}></div>
                  <span className="font-semibold text-gray-800">
                    {isCorrectNetwork ? 'Hedera Testnet' : 'Wrong Network'}
                  </span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Account Info */}
            <div className="p-4 border-b border-gray-100">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">ACCOUNT</label>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm text-gray-800">{formatAddress(account)}</span>
                    <button
                      onClick={copyAddress}
                      className="text-blue-500 hover:text-blue-600 transition-colors"
                      title="Copy address"
                    >
                      📋
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">BALANCE</label>
                  <span className="text-sm font-semibold text-gray-800">{formatBalance(balance)} HBAR</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-4 space-y-2">
              <button
                onClick={() => {
                  window.open(`${process.env.NEXT_PUBLIC_BLOCK_EXPLORER}/account/${account}`, '_blank')
                }}
                className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span>🔍</span>
                <span className="text-sm font-medium text-gray-700">View on Explorer</span>
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
                className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span>🦊</span>
                <span className="text-sm font-medium text-gray-700">Add VREC to MetaMask</span>
              </button>

              <button
                onClick={() => {
                  onDisconnect()
                  setIsOpen(false)
                }}
                className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 transition-colors text-red-600"
              >
                <span>🔓</span>
                <span className="text-sm font-medium">Disconnect Wallet</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  )
}
