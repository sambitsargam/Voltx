import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

export default function MintREC({ account }) {
  const [facilities, setFacilities] = useState([])
  const [mintForm, setMintForm] = useState({
    recipient: '',
    amount: '',
    facilityId: '',
    generationDate: ''
  })
  const [isMinting, setIsMinting] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadFacilities()
  }, [])

  const loadFacilities = async () => {
    setLoading(true)
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
          [
            "function getFacilityCount() view returns (uint256)",
            "function registeredFacilities(uint256) view returns (string)"
          ],
          provider
        )

        const count = await contract.getFacilityCount()
        const facilityList = []
        
        for (let i = 0; i < count; i++) {
          try {
            const facilityId = await contract.registeredFacilities(i)
            facilityList.push(facilityId)
          } catch (error) {
            console.error(`Error loading facility ${i}:`, error)
          }
        }
        
        setFacilities(facilityList)
        if (facilityList.length > 0 && !mintForm.facilityId) {
          setMintForm(prev => ({ ...prev, facilityId: facilityList[0] }))
        }
      }
    } catch (error) {
      console.error('Error loading facilities:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMintREC = async (e) => {
    e.preventDefault()
    if (!mintForm.recipient || !mintForm.amount || !mintForm.facilityId) {
      alert('Please fill in all fields')
      return
    }

    setIsMinting(true)
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        [
          "function mintREC(address to, uint256 amount, string facilityId, uint256 generationDate) external"
        ],
        signer
      )

      // Use provided date or default to yesterday
      const generationTimestamp = mintForm.generationDate 
        ? Math.floor(new Date(mintForm.generationDate).getTime() / 1000)
        : Math.floor(Date.now() / 1000) - 86400

      const tx = await contract.mintREC(
        mintForm.recipient,
        ethers.parseEther(mintForm.amount),
        mintForm.facilityId,
        generationTimestamp
      )

      await tx.wait()
      
      // Reset form
      setMintForm({
        recipient: '',
        amount: '',
        facilityId: facilities[0] || '',
        generationDate: ''
      })
      
      alert(`Successfully minted ${mintForm.amount} VREC tokens to ${mintForm.recipient}!`)
    } catch (error) {
      console.error('Error minting RECs:', error)
      alert('Error minting RECs: ' + error.message)
    } finally {
      setIsMinting(false)
    }
  }

  const fillCurrentAccount = () => {
    setMintForm(prev => ({ ...prev, recipient: account }))
  }

  const getCurrentDate = () => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    return yesterday.toISOString().split('T')[0]
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">🪙 Mint RECs</h2>
        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
          👑 Owner Only
        </span>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <form onSubmit={handleMintREC} className="space-y-6">
          {/* Recipient Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Address *
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="0x..."
                value={mintForm.recipient}
                onChange={(e) => setMintForm({...mintForm, recipient: e.target.value})}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <button
                type="button"
                onClick={fillCurrentAccount}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
              >
                Use My Address
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (VREC) *
            </label>
            <input
              type="number"
              placeholder="e.g., 100"
              value={mintForm.amount}
              onChange={(e) => setMintForm({...mintForm, amount: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              min="0"
              step="0.01"
              required
            />
          </div>

          {/* Facility Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facility *
            </label>
            {loading ? (
              <div className="animate-pulse bg-gray-300 h-10 rounded-md"></div>
            ) : facilities.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <p className="text-yellow-700">No facilities registered. Please register a facility first.</p>
              </div>
            ) : (
              <select
                value={mintForm.facilityId}
                onChange={(e) => setMintForm({...mintForm, facilityId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                {facilities.map(facilityId => (
                  <option key={facilityId} value={facilityId}>{facilityId}</option>
                ))}
              </select>
            )}
          </div>

          {/* Generation Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Generation Date (optional)
            </label>
            <input
              type="date"
              value={mintForm.generationDate}
              onChange={(e) => setMintForm({...mintForm, generationDate: e.target.value})}
              max={getCurrentDate()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to use yesterday's date. Cannot be future date.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isMinting || facilities.length === 0}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition-colors font-medium"
          >
            {isMinting ? '⏳ Minting RECs...' : '🪙 Mint RECs'}
          </button>
        </form>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">💡 Minting Information</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Only the contract owner can mint new REC tokens</li>
          <li>• RECs must be associated with a registered facility</li>
          <li>• Generation date cannot be in the future</li>
          <li>• Each REC represents renewable energy generation</li>
        </ul>
      </div>
    </div>
  )
}
