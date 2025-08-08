import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { ENHANCED_CONTRACT_ABI, formatTokenAmount } from '../lib/contract'

export default function ContractInfo() {
  const [contractData, setContractData] = useState({
    name: '',
    symbol: '',
    totalSupply: '0',
    owner: '',
    decimals: 18,
    facilityCount: 0,
    transactionCount: 0,
    totalRetired: '0',
    tokenPrice: '0',
    tradingEnabled: false
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadContractInfo()
  }, [])

  const loadContractInfo = async () => {
    setLoading(true)
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
          ENHANCED_CONTRACT_ABI,
          provider
        )
        // Get all contract data
        const [
          name, 
          symbol, 
          totalSupply, 
          owner, 
          decimals, 
          facilityCount,
          transactionCount,
          totalRetired,
          tokenPrice,
          tradingEnabled
        ] = await Promise.all([
          contract.name(),
          contract.symbol(),
          contract.totalSupply(),
          contract.owner(),
          contract.decimals(),
          contract.getFacilityCount(),
          contract.getTransactionCount(),
          contract.getTotalRetired(),
          contract.getTokenPrice(),
          contract.isTradingEnabled()
        ])

        setContractData({
          name,
          symbol,
          totalSupply: formatTokenAmount(totalSupply),
          owner,
          decimals: Number(decimals),
          facilityCount: Number(facilityCount),
          transactionCount: Number(transactionCount),
          totalRetired: formatTokenAmount(totalRetired),
          tokenPrice: ethers.formatEther(tokenPrice),
          tradingEnabled
        })
      }
    } catch (error) {
      console.error('Error loading contract info:', error)
    } finally {
      setLoading(false)
    }
  }

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
  const explorerUrl = `${process.env.NEXT_PUBLIC_BLOCK_EXPLORER}/contract/${contractAddress}`

  const contractInfo = [
    {
      label: 'Contract Address',
      value: contractAddress,
      type: 'address'
    },
    {
      label: 'Token Name',
      value: contractData.name,
      type: 'text'
    },
    {
      label: 'Token Symbol', 
      value: contractData.symbol,
      type: 'text'
    },
    {
      label: 'Decimals',
      value: contractData.decimals,
      type: 'number'
    },
    {
      label: 'Total Supply',
      value: `${contractData.totalSupply} ${contractData.symbol}`,
      type: 'text'
    },
    {
      label: 'Total Retired',
      value: `${contractData.totalRetired} ${contractData.symbol}`,
      type: 'text'
    },
    {
      label: 'Contract Owner',
      value: contractData.owner,
      type: 'address'
    },
    {
      label: 'Token Price',
      value: `${contractData.tokenPrice} ETH`,
      type: 'text'
    },
    {
      label: 'Trading Status',
      value: contractData.tradingEnabled ? 'Enabled' : 'Disabled',
      type: 'status'
    },
    {
      label: 'Registered Facilities',
      value: contractData.facilityCount,
      type: 'number'
    },
    {
      label: 'Total Transactions',
      value: contractData.transactionCount,
      type: 'number'
    }
  ]

  const networkInfo = [
    {
      label: 'Network',
      value: process.env.NEXT_PUBLIC_NETWORK_NAME || 'Hedera Testnet'
    },
    {
      label: 'Chain ID',
      value: process.env.NEXT_PUBLIC_CHAIN_ID || '296'
    },
    {
      label: 'RPC URL',
      value: process.env.NEXT_PUBLIC_RPC_URL || 'https://testnet.hashio.io/api'
    },
    {
      label: 'Currency',
      value: process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'HBAR'
    },
    {
      label: 'Explorer',
      value: process.env.NEXT_PUBLIC_BLOCK_EXPLORER || 'https://hashscan.io/testnet'
    }
  ]

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('Copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const formatAddress = (address) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">📋 Contract Information</h2>
        <button
          onClick={loadContractInfo}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {loading ? '🔄 Loading...' : '🔄 Refresh'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contract Details */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            📄 Contract Details
          </h3>
          <div className="space-y-4">
            {contractInfo.map((info, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">{info.label}:</span>
                <div className="flex items-center space-x-2">
                  {info.type === 'address' ? (
                    <>
                      <span className="text-sm text-gray-800 font-mono">
                        {formatAddress(info.value)}
                      </span>
                      <button
                        onClick={() => copyToClipboard(info.value)}
                        className="text-blue-500 hover:text-blue-600 transition-colors"
                        title="Copy full address"
                      >
                        📋
                      </button>
                    </>
                  ) : info.type === 'status' ? (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      info.value === 'Enabled' || info.value === 'Active'
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {info.value}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-800">{info.value}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Network Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            🌐 Network Information
          </h3>
          <div className="space-y-4">
            {networkInfo.map((info, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">{info.label}:</span>
                <span className="text-sm text-gray-800 max-w-48 truncate" title={info.value}>
                  {info.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">🔗 Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 bg-white border border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <span>🔍</span>
            <span className="font-medium">View on Explorer</span>
          </a>
          <button
            onClick={() => copyToClipboard(contractAddress)}
            className="flex items-center justify-center space-x-2 bg-white border border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <span>📋</span>
            <span className="font-medium">Copy Address</span>
          </button>
          <button
            onClick={() => {
              const tokenData = {
                type: 'ERC20',
                options: {
                  address: contractAddress,
                  symbol: contractData.symbol,
                  decimals: contractData.decimals,
                  image: '', // Could add a token logo here
                }
              }
              if (window.ethereum) {
                window.ethereum.request({
                  method: 'wallet_watchAsset',
                  params: tokenData,
                })
              }
            }}
            className="flex items-center justify-center space-x-2 bg-white border border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <span>🦊</span>
            <span className="font-medium">Add to MetaMask</span>
          </button>
        </div>
      </div>

      {/* API Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">⚙️ For Developers</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contract ABI (Main Functions)
            </label>
            <div className="bg-gray-50 border border-gray-300 rounded-md p-3">
              <pre className="text-xs text-gray-700 overflow-x-auto">
{`// Main Contract Functions
function mintREC(address to, uint256 amount, string facilityId, uint256 generationDate)
function retireREC(uint256 amount, string reason)
function registerFacility(string facilityId, string name, string location, string energyType, uint256 capacity)
function balanceOf(address account) view returns (uint256)
function getRetiredBalance(address account) view returns (uint256)
function getFacilityCount() view returns (uint256)`}
              </pre>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            💡 This is a simplified view. Use Hardhat or other tools to get the complete ABI for integration.
          </p>
        </div>
      </div>
    </div>
  )
}
