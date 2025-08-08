import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

export default function WalletConnection({ isConnected, setIsConnected, account, setAccount }) {
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
        window.location.reload() // Reload on network change
      })
    }
  }

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask!')
      return
    }

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      })
      setAccount(accounts[0])
      setIsConnected(true)
    } catch (error) {
      console.error('Error connecting wallet:', error)
      alert('Failed to connect wallet: ' + error.message)
    }
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
        setIsCorrectNetwork(currentChainId === 296) // Hedera Testnet
      }
    } catch (error) {
      console.error('Error checking network:', error)
    }
  }

  const switchToHedera = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x128' }], // 296 in hex
      })
    } catch (switchError) {
      // If the chain is not added to MetaMask
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
          alert('Failed to add Hedera Testnet to MetaMask')
        }
      } else {
        console.error('Error switching network:', switchError)
        alert('Failed to switch to Hedera Testnet')
      }
    }
  }

  const formatAddress = (address) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (typeof window !== 'undefined' && typeof window.ethereum === 'undefined') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">MetaMask Required</h3>
        <p className="text-yellow-700 mb-4">
          Please install MetaMask to interact with Voltx REC Hub.
        </p>
        <a
          href="https://metamask.io/"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors"
        >
          Install MetaMask
        </a>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">🔌 Wallet Connection</h2>
        {isConnected && (
          <span className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-sm text-green-600 font-medium">Connected</span>
          </span>
        )}
      </div>

      {!isConnected ? (
        <div className="text-center">
          <p className="text-gray-600 mb-4">Connect your wallet to start using Voltx</p>
          <button
            onClick={connectWallet}
            className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition-colors font-medium"
          >
            🦊 Connect MetaMask
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Account Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
                <p className="text-sm font-mono text-gray-800">{formatAddress(account)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Balance</label>
                <p className="text-sm text-gray-800">{parseFloat(balance).toFixed(4)} HBAR</p>
              </div>
            </div>
          </div>

          {/* Network Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-700">Network Status</p>
              <p className="text-xs text-gray-500">
                {isCorrectNetwork ? 'Hedera Testnet (296)' : `Wrong Network (${chainId})`}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {isCorrectNetwork ? (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  ✅ Correct
                </span>
              ) : (
                <button
                  onClick={switchToHedera}
                  className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-orange-600 transition-colors"
                >
                  Switch to Hedera
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <button
              onClick={loadBalance}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
            >
              🔄 Refresh
            </button>
            <button
              onClick={disconnectWallet}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
