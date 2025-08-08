import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

export default function RECActions({ account }) {
  const [tokenBalance, setTokenBalance] = useState('0')
  const [retiredBalance, setRetiredBalance] = useState('0')
  const [retireForm, setRetireForm] = useState({
    amount: '',
    reason: ''
  })
  const [transferForm, setTransferForm] = useState({
    recipient: '',
    amount: ''
  })
  const [isRetiring, setIsRetiring] = useState(false)
  const [isTransferring, setIsTransferring] = useState(false)
  const [activeAction, setActiveAction] = useState('retire')

  useEffect(() => {
    if (account) {
      loadBalances()
    }
  }, [account])

  const formatTokenAmount = (amount) => {
    const num = parseFloat(amount)
    if (num === 0) return '0.0000'
    if (num < 0.0001) return '< 0.0001'
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K'
    return num.toFixed(4)
  }

  const loadBalances = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
          [
            "function balanceOf(address account) view returns (uint256)",
            "function getRetiredBalance(address account) view returns (uint256)"
          ],
          provider
        )

        const [balance, retired] = await Promise.all([
          contract.balanceOf(account),
          contract.getRetiredBalance(account)
        ])

        setTokenBalance(ethers.formatEther(balance))
        setRetiredBalance(ethers.formatEther(retired))
      }
    } catch (error) {
      console.error('Error loading balances:', error)
    }
  }

  const handleRetireREC = async (e) => {
    e.preventDefault()
    if (!retireForm.amount || !retireForm.reason) {
      alert('Please fill in all fields')
      return
    }

    const amount = parseFloat(retireForm.amount)
    const balance = parseFloat(tokenBalance)
    
    if (amount > balance) {
      alert('Insufficient balance')
      return
    }

    setIsRetiring(true)
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        [
          "function retireTokens(uint256 amount, string reason) external"
        ],
        signer
      )

      const tx = await contract.retireTokens(
        ethers.parseEther(retireForm.amount),
        retireForm.reason
      )

      await tx.wait()
      
      // Reset form and reload balances
      setRetireForm({ amount: '', reason: '' })
      await loadBalances()
      
      alert(`Successfully retired ${retireForm.amount} VREC tokens!`)
    } catch (error) {
      console.error('Error retiring RECs:', error)
      alert('Error retiring RECs: ' + error.message)
    } finally {
      setIsRetiring(false)
    }
  }

  const handleTransferREC = async (e) => {
    e.preventDefault()
    if (!transferForm.recipient || !transferForm.amount) {
      alert('Please fill in all fields')
      return
    }

    const amount = parseFloat(transferForm.amount)
    const balance = parseFloat(tokenBalance)
    
    if (amount > balance) {
      alert('Insufficient balance')
      return
    }

    setIsTransferring(true)
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        [
          "function transfer(address to, uint256 amount) external returns (bool)"
        ],
        signer
      )

      const tx = await contract.transfer(
        transferForm.recipient,
        ethers.parseEther(transferForm.amount)
      )

      await tx.wait()
      
      // Reset form and reload balances
      setTransferForm({ recipient: '', amount: '' })
      await loadBalances()
      
      alert(`Successfully transferred ${transferForm.amount} VREC tokens!`)
    } catch (error) {
      console.error('Error transferring RECs:', error)
      alert('Error transferring RECs: ' + error.message)
    } finally {
      setIsTransferring(false)
    }
  }

  const retireReasons = [
    'Carbon offset for business operations',
    'Personal carbon footprint reduction',
    'Renewable energy support',
    'Corporate sustainability goals',
    'EV charging carbon offset',
    'Green building certification',
    'Other environmental initiative'
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">⚡ REC Actions</h2>
        <button
          onClick={loadBalances}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          🔄 Refresh Balance
        </button>
      </div>

      {/* Balance Display */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Active Balance</label>
            <p className="text-lg font-semibold text-gray-800">{formatTokenAmount(tokenBalance)} VREC</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Retired Balance</label>
            <p className="text-lg font-semibold text-green-600">{formatTokenAmount(retiredBalance)} VREC</p>
          </div>
        </div>
      </div>

      {/* Action Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveAction('retire')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeAction === 'retire'
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          ♻️ Retire RECs
        </button>
        <button
          onClick={() => setActiveAction('transfer')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeAction === 'transfer'
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          ↔️ Transfer RECs
        </button>
      </div>

      {/* Retire RECs */}
      {activeAction === 'retire' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">♻️ Retire RECs</h3>
          <form onSubmit={handleRetireREC} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount to Retire *
              </label>
              <input
                type="number"
                placeholder="e.g., 25"
                value={retireForm.amount}
                onChange={(e) => setRetireForm({...retireForm, amount: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                min="0"
                max={tokenBalance}
                step="0.01"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Available: {formatTokenAmount(tokenBalance)} VREC
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Retirement Reason *
              </label>
              <select
                value={retireForm.reason}
                onChange={(e) => setRetireForm({...retireForm, reason: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Select a reason...</option>
                {retireReasons.map(reason => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isRetiring || parseFloat(tokenBalance) === 0}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
            >
              {isRetiring ? 'Retiring...' : 'Retire RECs'}
            </button>
          </form>

          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">💡 About Retiring RECs</h4>
            <p className="text-sm text-green-700">
              Retiring RECs permanently removes them from circulation and credits you with the environmental benefits. 
              This action cannot be undone.
            </p>
          </div>
        </div>
      )}

      {/* Transfer RECs */}
      {activeAction === 'transfer' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">↔️ Transfer RECs</h3>
          <form onSubmit={handleTransferREC} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Address *
              </label>
              <input
                type="text"
                placeholder="0x..."
                value={transferForm.recipient}
                onChange={(e) => setTransferForm({...transferForm, recipient: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount to Transfer *
              </label>
              <input
                type="number"
                placeholder="e.g., 50"
                value={transferForm.amount}
                onChange={(e) => setTransferForm({...transferForm, amount: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                max={tokenBalance}
                step="0.01"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Available: {formatTokenAmount(tokenBalance)} VREC
              </p>
            </div>

            <button
              type="submit"
              disabled={isTransferring || parseFloat(tokenBalance) === 0}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {isTransferring ? 'Transferring...' : 'Transfer RECs'}
            </button>
          </form>

          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">💡 About Transferring RECs</h4>
            <p className="text-sm text-blue-700">
              Transfer your RECs to another wallet address. The recipient will be able to retire or transfer them further.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
