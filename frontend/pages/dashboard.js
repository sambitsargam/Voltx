import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import ReownWallet from '../components/ReownWallet'
import RECDashboard from '../components/RECDashboard'
import MintREC from '../components/MintREC'
import RECActions from '../components/RECActions'
import FacilityManagement from '../components/FacilityManagement'
import TransactionHistory from '../components/TransactionHistory'
import ContractInfo from '../components/ContractInfo'

export default function Home() {
  const { address: account, isConnected } = useAccount()
  const [isOwner, setIsOwner] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')

  // Check if connected account is contract owner
  useEffect(() => {
    if (isConnected && account) {
      checkOwnership()
    }
  }, [isConnected, account])

  const checkOwnership = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const { ethers } = require('ethers')
        const provider = new ethers.BrowserProvider(window.ethereum)
        const contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
          [
            "function owner() view returns (address)"
          ],
          provider
        )
        const owner = await contract.owner()
        setIsOwner(owner.toLowerCase() === account.toLowerCase())
      }
    } catch (error) {
      console.error('Error checking ownership:', error)
    }
  }

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'actions', name: 'REC Actions', icon: '⚡' },
    { id: 'facilities', name: 'Registered Facilities', icon: '🏭' },
    { id: 'mint', name: 'Mint RECs', icon: '🪙', ownerOnly: true },
    { id: 'history', name: 'History', icon: '📜' },
    { id: 'contract', name: 'Contract Info', icon: '📋' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <Head>
        <title>Voltx - Renewable Energy Certificates Hub</title>
        <meta name="description" content="Voltx REC Hub on Hedera Network" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-green-500">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">⚡</div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Voltx</h1>
                <p className="text-sm text-gray-600">Renewable Energy Certificates Hub</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-sm font-medium text-green-700">Hedera Testnet</span>
              </div>
              {isOwner && (
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                  👑 Owner
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Wallet Connection */}
        <div className="mb-8">
          <ReownWallet />
        </div>

        {isConnected && (
          <>
            {/* Navigation Tabs */}
            <div className="mb-8">
              <div className="border-b border-gray-200 bg-white rounded-t-lg">
                <nav className="flex space-x-8 px-6">
                  {tabs.map((tab) => {
                    if (tab.ownerOnly && !isOwner) return null
                    
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab.id
                            ? 'border-green-500 text-green-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <span className="mr-2">{tab.icon}</span>
                        {tab.name}
                      </button>
                    )
                  })}
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {activeTab === 'dashboard' && (
                <div className="p-6">
                  <RECDashboard account={account} />
                </div>
              )}

              {activeTab === 'actions' && (
                <div className="p-6">
                  <RECActions account={account} />
                </div>
              )}

              {activeTab === 'facilities' && (
                <div className="p-6">
                  <FacilityManagement account={account} />
                </div>
              )}

              {activeTab === 'mint' && isOwner && (
                <div className="p-6">
                  <MintREC account={account} />
                </div>
              )}

              {activeTab === 'history' && (
                <div className="p-6">
                  <TransactionHistory account={account} />
                </div>
              )}

              {activeTab === 'contract' && (
                <div className="p-6">
                  <ContractInfo />
                </div>
              )}
            </div>
          </>
        )}

        {/* Welcome Message for Non-Connected Users */}
        {!isConnected && (
          <div className="text-center py-16">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Welcome to Voltx REC Hub
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Trade, mint, and retire Renewable Energy Certificates on the Hedera network. 
                Connect your wallet to get started.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="text-3xl mb-4">🌱</div>
                  <h3 className="font-semibold mb-2">Green Energy</h3>
                  <p className="text-sm text-gray-600">
                    Certify and track renewable energy generation
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="text-3xl mb-4">🔗</div>
                  <h3 className="font-semibold mb-2">Blockchain</h3>
                  <p className="text-sm text-gray-600">
                    Powered by Hedera's fast and secure network
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="text-3xl mb-4">♻️</div>
                  <h3 className="font-semibold mb-2">Transparent</h3>
                  <p className="text-sm text-gray-600">
                    Immutable records of energy certificates
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-4">⚡ Voltx - Renewable Energy Certificates Hub</p>
          <div className="flex justify-center space-x-6 text-sm">
            <a href="https://hashscan.io/testnet" target="_blank" rel="noopener noreferrer" 
               className="hover:text-green-400 transition-colors">
              HashScan Explorer
            </a>
            <a href="https://hedera.com" target="_blank" rel="noopener noreferrer"
               className="hover:text-green-400 transition-colors">
              Hedera Network
            </a>
            <span className="text-gray-400">Contract: {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS?.slice(0, 10)}...</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
