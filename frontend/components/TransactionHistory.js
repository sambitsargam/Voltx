import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { ENHANCED_CONTRACT_ABI, formatTokenAmount } from '../lib/contract'

export default function TransactionHistory({ account }) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')
  const [totalTransactions, setTotalTransactions] = useState(0)

  useEffect(() => {
    if (account) {
      loadTransactionHistory()
    }
  }, [account])

  const loadTransactionHistory = async () => {
    setLoading(true)
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
          ENHANCED_CONTRACT_ABI,
          provider
        )

        // Get total transaction count
        const totalCount = await contract.getTransactionCount()
        setTotalTransactions(Number(totalCount))

        // Get user's transaction indices
        const userTransactionIndices = await contract.getUserTransactions(account)
        
        // Fetch detailed transaction data
        const transactionPromises = userTransactionIndices.map(async (index) => {
          try {
            const tx = await contract.getTransaction(Number(index))
            return {
              index: Number(index),
              from: tx.from,
              to: tx.to,
              amount: tx.amount,
              transactionType: tx.transactionType,
              facilityId: tx.facilityId,
              timestamp: Number(tx.timestamp),
              metadata: tx.metadata
            }
          } catch (error) {
            console.error(`Error loading transaction ${index}:`, error)
            return null
          }
        })

        const transactionData = await Promise.all(transactionPromises)
        const validTransactions = transactionData.filter(tx => tx !== null)
        
        // Sort by timestamp (newest first)
        validTransactions.sort((a, b) => b.timestamp - a.timestamp)
        
        setTransactions(validTransactions)
      }
    } catch (error) {
      console.error('Error loading transaction history:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true
    return tx.transactionType === filter
  })

  const formatTransactionData = (tx) => {
    const date = new Date(tx.timestamp * 1000).toLocaleString()
    const amount = formatTokenAmount(tx.amount)
    
    switch (tx.transactionType) {
      case 'mint':
        return {
          title: '🪙 RECs Minted',
          description: `${amount} VREC minted`,
          details: [
            `Amount: ${amount} VREC`,
            `Facility: ${tx.facilityId || 'General'}`,
            `To: ${tx.to === account ? 'You' : `${tx.to.slice(0, 10)}...`}`,
            `Metadata: ${tx.metadata || 'N/A'}`,
            `Date: ${date}`
          ],
          icon: '🪙',
          color: 'text-green-600'
        }
      case 'transfer':
        const isReceived = tx.to.toLowerCase() === account.toLowerCase()
        return {
          title: isReceived ? '📥 RECs Received' : '📤 RECs Sent',
          description: `${amount} VREC ${isReceived ? 'received' : 'sent'}`,
          details: [
            `Amount: ${amount} VREC`,
            `${isReceived ? 'From' : 'To'}: ${isReceived ? 
              (tx.from === ethers.ZeroAddress ? 'Minted' : `${tx.from.slice(0, 10)}...`) : 
              `${tx.to.slice(0, 10)}...`}`,
            `Metadata: ${tx.metadata || 'Standard transfer'}`,
            `Date: ${date}`
          ],
          icon: isReceived ? '📥' : '📤',
          color: isReceived ? 'text-green-600' : 'text-blue-600'
        }
      case 'retire':
        return {
          title: '♻️ RECs Retired',
          description: `${amount} VREC retired`,
          details: [
            `Amount: ${amount} VREC`,
            `Reason: ${tx.metadata || 'Sustainability offset'}`,
            `Date: ${date}`
          ],
          icon: '♻️',
          color: 'text-purple-600'
        }
      case 'burn':
        return {
          title: '🔥 RECs Burned',
          description: `${amount} VREC burned`,
          details: [
            `Amount: ${amount} VREC`,
            `Reason: ${tx.metadata || 'Token burn'}`,
            `Date: ${date}`
          ],
          icon: '🔥',
          color: 'text-red-600'
        }
      case 'purchase':
        return {
          title: '💰 RECs Purchased',
          description: `${amount} VREC purchased`,
          details: [
            `Amount: ${amount} VREC`,
            `Payment: ${tx.metadata || 'ETH payment'}`,
            `Date: ${date}`
          ],
          icon: '💰',
          color: 'text-blue-600'
        }
      default:
        return {
          title: '📝 Transaction',
          description: `${amount} VREC - ${tx.transactionType}`,
          details: [
            `Amount: ${amount} VREC`,
            `Type: ${tx.transactionType}`,
            `Metadata: ${tx.metadata || 'N/A'}`,
            `Date: ${date}`
          ],
          icon: '📝',
          color: 'text-gray-600'
        }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">📜 Transaction History</h2>
          <p className="text-sm text-gray-600 mt-1">
            {transactions.length} personal transactions • {totalTransactions} total system transactions
          </p>
        </div>
        <button
          onClick={loadTransactionHistory}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'All', icon: '📋' },
          { id: 'mint', label: 'Minting', icon: '🪙' },
          { id: 'transfer', label: 'Transfers', icon: '↔️' },
          { id: 'retire', label: 'Retirement', icon: '♻️' },
          { id: 'burn', label: 'Burning', icon: '🔥' },
          { id: 'purchase', label: 'Purchases', icon: '💰' }
        ].map(filterOption => (
          <button
            key={filterOption.id}
            onClick={() => setFilter(filterOption.id)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === filterOption.id
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {filterOption.icon} {filterOption.label}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading transaction history...</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <div className="text-4xl mb-4">📭</div>
          <p className="text-gray-600">
            {filter === 'all' ? 'No transactions found for your account.' : `No ${filter} transactions found.`}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Transactions will appear here when you interact with the contract.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map((tx, index) => {
            const txData = formatTransactionData(tx)
            return (
              <div key={`${tx.index}-${index}`} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className={`text-2xl ${txData.color}`}>
                      {txData.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">{txData.title}</h3>
                      <p className="text-gray-600 mb-2">{txData.description}</p>
                      <div className="space-y-1">
                        {txData.details.map((detail, idx) => (
                          <p key={idx} className="text-xs text-gray-500">{detail}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">
                      TX #{tx.index}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Summary Stats */}
      {!loading && transactions.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">📊 Transaction Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Transactions:</span>
              <span className="font-medium ml-2">{transactions.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Mints:</span>
              <span className="font-medium ml-2">{transactions.filter(tx => tx.transactionType === 'mint').length}</span>
            </div>
            <div>
              <span className="text-gray-600">Transfers:</span>
              <span className="font-medium ml-2">{transactions.filter(tx => tx.transactionType === 'transfer').length}</span>
            </div>
            <div>
              <span className="text-gray-600">Retirements:</span>
              <span className="font-medium ml-2">{transactions.filter(tx => tx.transactionType === 'retire').length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
