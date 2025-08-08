import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

export default function TransactionHistory({ account }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (account) {
      loadEvents()
    }
  }, [account])

  const loadEvents = async () => {
    setLoading(true)
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
          [
            "event RECMinted(address indexed to, uint256 amount, string facilityId, uint256 generationDate)",
            "event RECRetired(address indexed from, uint256 amount, string reason)",
            "event FacilityRegistered(string indexed facilityId, string name, string location)",
            "event Transfer(address indexed from, address indexed to, uint256 value)"
          ],
          provider
        )

        // Get events from the last 1000 blocks
        const currentBlock = await provider.getBlockNumber()
        const fromBlock = Math.max(0, currentBlock - 1000)

        const eventPromises = []

        // Get minting events
        eventPromises.push(
          contract.queryFilter('RECMinted', fromBlock, 'latest')
            .then(events => events.map(event => ({
              type: 'mint',
              ...event,
              args: event.args
            })))
        )

        // Get retirement events
        eventPromises.push(
          contract.queryFilter('RECRetired', fromBlock, 'latest')
            .then(events => events.map(event => ({
              type: 'retire',
              ...event,
              args: event.args
            })))
        )

        // Get facility registration events
        eventPromises.push(
          contract.queryFilter('FacilityRegistered', fromBlock, 'latest')
            .then(events => events.map(event => ({
              type: 'facility',
              ...event,
              args: event.args
            })))
        )

        // Get transfer events
        eventPromises.push(
          contract.queryFilter('Transfer', fromBlock, 'latest')
            .then(events => events.filter(event => 
              event.args.from !== ethers.ZeroAddress && 
              event.args.to !== ethers.ZeroAddress
            ).map(event => ({
              type: 'transfer',
              ...event,
              args: event.args
            })))
        )

        const allEventArrays = await Promise.all(eventPromises)
        const allEvents = allEventArrays.flat()

        // Sort by block number (newest first)
        allEvents.sort((a, b) => b.blockNumber - a.blockNumber)

        setEvents(allEvents)
      }
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true
    return event.type === filter
  })

  const formatEventData = (event) => {
    const commonData = {
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash
    }

    switch (event.type) {
      case 'mint':
        return {
          ...commonData,
          title: '🪙 RECs Minted',
          description: `${ethers.formatEther(event.args.amount)} VREC to ${event.args.to.slice(0, 10)}...`,
          details: [
            `Facility: ${event.args.facilityId}`,
            `Amount: ${ethers.formatEther(event.args.amount)} VREC`,
            `Recipient: ${event.args.to}`
          ]
        }
      case 'retire':
        return {
          ...commonData,
          title: '♻️ RECs Retired',
          description: `${ethers.formatEther(event.args.amount)} VREC retired`,
          details: [
            `Amount: ${ethers.formatEther(event.args.amount)} VREC`,
            `Account: ${event.args.from}`,
            `Reason: ${event.args.reason}`
          ]
        }
      case 'facility':
        return {
          ...commonData,
          title: '🏭 Facility Registered',
          description: `${event.args.name} (${event.args.facilityId})`,
          details: [
            `ID: ${event.args.facilityId}`,
            `Name: ${event.args.name}`,
            `Location: ${event.args.location}`
          ]
        }
      case 'transfer':
        return {
          ...commonData,
          title: '↔️ Token Transfer',
          description: `${ethers.formatEther(event.args.value)} VREC transferred`,
          details: [
            `Amount: ${ethers.formatEther(event.args.value)} VREC`,
            `From: ${event.args.from}`,
            `To: ${event.args.to}`
          ]
        }
      default:
        return {
          ...commonData,
          title: '📝 Unknown Event',
          description: 'Unknown event type',
          details: []
        }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">📜 Transaction History</h2>
        <button
          onClick={loadEvents}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'All Events', icon: '📋' },
          { id: 'mint', label: 'Minting', icon: '🪙' },
          { id: 'retire', label: 'Retirement', icon: '♻️' },
          { id: 'facility', label: 'Facilities', icon: '🏭' },
          { id: 'transfer', label: 'Transfers', icon: '↔️' }
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

      {/* Events List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading transaction history...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            {filter === 'all' ? 'No transactions found.' : `No ${filter} events found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event, index) => {
            const eventData = formatEventData(event)
            return (
              <div key={`${event.transactionHash}-${index}`} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">{eventData.title}</h3>
                    <p className="text-gray-600 mb-2">{eventData.description}</p>
                    <div className="space-y-1">
                      {eventData.details.map((detail, idx) => (
                        <p key={idx} className="text-xs text-gray-500">{detail}</p>
                      ))}
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-xs text-gray-500">Block #{eventData.blockNumber}</p>
                    <a
                      href={`${process.env.NEXT_PUBLIC_BLOCK_EXPLORER}/transaction/${eventData.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:text-blue-600 transition-colors"
                    >
                      View Tx 🔗
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
