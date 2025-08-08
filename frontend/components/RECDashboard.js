import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

export default function RECDashboard({ account }) {
  const [dashboardData, setDashboardData] = useState({
    tokenBalance: '0',
    retiredBalance: '0',
    totalSupply: '0',
    facilityCount: 0
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (account) {
      loadDashboardData()
    }
  }, [account])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
          [
            "function balanceOf(address account) view returns (uint256)",
            "function getRetiredBalance(address account) view returns (uint256)",
            "function totalSupply() view returns (uint256)",
            "function getFacilityCount() view returns (uint256)"
          ],
          provider
        )

        const [tokenBalance, retiredBalance, totalSupply, facilityCount] = await Promise.all([
          contract.balanceOf(account),
          contract.getRetiredBalance(account),
          contract.totalSupply(),
          contract.getFacilityCount()
        ])

        setDashboardData({
          tokenBalance: ethers.formatEther(tokenBalance),
          retiredBalance: ethers.formatEther(retiredBalance),
          totalSupply: ethers.formatEther(totalSupply),
          facilityCount: Number(facilityCount)
        })
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTokenAmount = (amount) => {
    const num = parseFloat(amount)
    if (num === 0) return '0.00'
    if (num < 0.01) return '< 0.01'
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K'
    return num.toFixed(2)
  }

  const stats = [
    {
      title: 'Your VREC Balance',
      value: loading ? 'Loading...' : `${formatTokenAmount(dashboardData.tokenBalance)} VREC`,
      icon: '⚡',
      description: 'Renewable Energy Certificates you own',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Your Retired RECs',
      value: loading ? 'Loading...' : `${formatTokenAmount(dashboardData.retiredBalance)} VREC`,
      icon: '♻️',
      description: 'RECs you have retired for environmental impact',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Supply',
      value: loading ? 'Loading...' : `${formatTokenAmount(dashboardData.totalSupply)} VREC`,
      icon: '📊',
      description: 'Total RECs minted on the platform',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Registered Facilities',
      value: loading ? 'Loading...' : `${dashboardData.facilityCount}`,
      icon: '🏭',
      description: 'Total facilities registered on the platform',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    }
  ]

  const retiredAmount = parseFloat(dashboardData.retiredBalance)
  const environmentalImpact = {
    carbonOffset: retiredAmount * 1.2, // Assume 1.2 tons CO2 per VREC
    treesEquivalent: retiredAmount * 15 // Assume 15 trees per VREC
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">📊 REC Dashboard</h2>
        <button
          onClick={loadDashboardData}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {loading ? '🔄 Loading...' : '🔄 Refresh'}
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} rounded-lg p-6 border`}>
            <div className="flex items-center justify-between">
              <div className="text-2xl">{stat.icon}</div>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {loading ? (
                  <div className="animate-pulse bg-gray-300 h-6 w-16 rounded"></div>
                ) : (
                  stat.value
                )}
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mt-2">{stat.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Environmental Impact Card */}
      {retiredAmount > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            🌍 Your Environmental Impact
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {environmentalImpact.carbonOffset.toFixed(1)} tons
              </div>
              <p className="text-sm text-gray-600">CO₂ Offset Equivalent</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600">
                {Math.round(environmentalImpact.treesEquivalent)}
              </div>
              <p className="text-sm text-gray-600">Trees Planted Equivalent</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4 text-center">
            *Estimates based on average renewable energy carbon offset values
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🚀 Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href={`${process.env.NEXT_PUBLIC_BLOCK_EXPLORER}/account/${account}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors"
          >
            <span>🔍</span>
            <span className="font-medium">View on Explorer</span>
          </a>
          <a
            href={`${process.env.NEXT_PUBLIC_BLOCK_EXPLORER}/contract/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 bg-purple-50 border border-purple-200 rounded-lg p-4 hover:bg-purple-100 transition-colors"
          >
            <span>📄</span>
            <span className="font-medium">View Contract</span>
          </a>
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
            className="flex items-center justify-center space-x-2 bg-orange-50 border border-orange-200 rounded-lg p-4 hover:bg-orange-100 transition-colors"
          >
            <span>🦊</span>
            <span className="font-medium">Add to MetaMask</span>
          </button>
        </div>
      </div>
    </div>
  )
}
