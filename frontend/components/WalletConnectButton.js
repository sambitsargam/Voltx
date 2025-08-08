import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

const WalletModal = ({ isOpen, onClose, onConnect }) => {
  const [isConnecting, setIsConnecting] = useState(false)

  const walletOptions = [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: '🦊',
      description: 'Connect with MetaMask wallet',
      installed: typeof window !== 'undefined' && window.ethereum?.isMetaMask
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      icon: '🔵',
      description: 'Connect with Coinbase Wallet',
      installed: typeof window !== 'undefined' && window.ethereum?.isCoinbaseWallet
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      icon: '🔗',
      description: 'Connect with WalletConnect',
      installed: true // Always show as option
    }
  ]

  const connectWallet = async (walletId) => {
    if (walletId === 'metamask') {
      if (!window.ethereum?.isMetaMask) {
        window.open('https://metamask.io/download/', '_blank')
        return
      }
      
      setIsConnecting(true)
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        })
        
        // Check/switch to Hedera network
        await switchToHedera()
        
        onConnect(accounts[0])
        onClose()
      } catch (error) {
        console.error('Error connecting wallet:', error)
        alert('Failed to connect wallet: ' + error.message)
      } finally {
        setIsConnecting(false)
      }
    } else {
      alert(`${walletId} integration coming soon!`)
    }
  }

  const switchToHedera = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x128' }], // 296 in hex
      })
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x128',
              chainName: 'Hedera Testnet',
              nativeCurrency: {
                name: 'HBAR',
                symbol: 'HBAR',
                decimals: 18,
              },
              rpcUrls: ['https://testnet.hashio.io/api'],
              blockExplorerUrls: ['https://hashscan.io/testnet/'],
            }],
          })
        } catch (addError) {
          console.error('Error adding network:', addError)
        }
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Connect Wallet</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="text-blue-100 text-sm mt-2">
            Choose your preferred wallet to connect to Voltx
          </p>
        </div>

        {/* Wallet Options */}
        <div className="p-6 space-y-3">
          {walletOptions.map((wallet) => (
            <button
              key={wallet.id}
              onClick={() => connectWallet(wallet.id)}
              disabled={isConnecting || !wallet.installed}
              className={`w-full flex items-center p-4 rounded-xl border-2 transition-all ${
                wallet.installed
                  ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
                  : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
              }`}
            >
              <div className="text-3xl mr-4">{wallet.icon}</div>
              <div className="flex-1 text-left">
                <div className="flex items-center">
                  <h3 className="font-semibold text-gray-800">{wallet.name}</h3>
                  {!wallet.installed && wallet.id !== 'walletconnect' && (
                    <span className="ml-2 bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded">
                      Not Installed
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{wallet.description}</p>
              </div>
              {isConnecting && wallet.id === 'metamask' && (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              )}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">🔒</span>
            <span>Your wallet will be connected securely via Web3</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function WalletConnectButton({ isConnected, setIsConnected, account, setAccount }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [balance, setBalance] = useState('0')
  const [chainId, setChainId] = useState(null)
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false)

  useEffect(() => {
    checkConnection()
    setupEventListeners()
  }, [])

  useEffect(() => {
    if (isConnected && account) {
      loadBalance()
      checkNetwork()
    }
  }, [isConnected, account])

  const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          setAccount(accounts[0])
          setIsConnected(true)
        }
      } catch (error) {
        console.error('Error checking connection:', error)
      }
    }
  }

  const setupEventListeners = () => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0])
          setIsConnected(true)
        } else {
          setAccount('')
          setIsConnected(false)
        }
      })

      window.ethereum.on('chainChanged', (newChainId) => {
        setChainId(parseInt(newChainId, 16))
        window.location.reload()
      })
    }
  }

  const handleConnect = (connectedAccount) => {
    setAccount(connectedAccount)
    setIsConnected(true)
  }

  const disconnectWallet = () => {
    setAccount('')
    setIsConnected(false)
    setBalance('0')
  }

  const loadBalance = async () => {
    try {
      if (typeof window.ethereum !== 'undefined' && account) {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const balance = await provider.getBalance(account)
        setBalance(ethers.formatEther(balance))
      }
    } catch (error) {
      console.error('Error loading balance:', error)
    }
  }

  const checkNetwork = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' })
        const currentChainId = parseInt(chainId, 16)
        setChainId(currentChainId)
        setIsCorrectNetwork(currentChainId === 296)
      }
    } catch (error) {
      console.error('Error checking network:', error)
    }
  }

  const formatAddress = (address) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (typeof window !== 'undefined' && typeof window.ethereum === 'undefined') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Web3 Wallet Required</h3>
        <p className="text-yellow-700 mb-4">
          Please install a Web3 wallet to interact with Voltx REC Hub.
        </p>
        <button
          onClick={() => window.open('https://metamask.io/', '_blank')}
          className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors"
        >
          Install MetaMask
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {!isConnected ? (
          <div className="p-6 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">🔌</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Connect Your Wallet</h2>
              <p className="text-gray-600">
                Connect your wallet to start using Voltx REC Hub
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <div className="p-6">
            {/* Connected State Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Connected</h3>
                  <p className="text-sm text-gray-600">{formatAddress(account)}</p>
                </div>
              </div>
              <button
                onClick={disconnectWallet}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="Disconnect"
              >
                🔓
              </button>
            </div>

            {/* Balance and Network Info */}
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block text-gray-600 mb-1">Balance</label>
                    <p className="font-medium text-gray-800">{parseFloat(balance).toFixed(4)} HBAR</p>
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Network</label>
                    <div className="flex items-center space-x-2">
                      {isCorrectNetwork ? (
                        <>
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span className="text-green-600 font-medium">Hedera</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          <span className="text-red-600 font-medium">Wrong Network</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={loadBalance}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-200 transition-colors text-sm"
                >
                  🔄 Refresh
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(account)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-200 transition-colors text-sm"
                >
                  📋 Copy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Wallet Connection Modal */}
      <WalletModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConnect={handleConnect}
      />
    </>
  )
}
