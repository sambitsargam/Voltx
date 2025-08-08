import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

const FACILITY_TYPES = [
  'Solar',
  'Wind', 
  'Hydro',
  'Geothermal',
  'Biomass',
  'Nuclear'
]

export default function FacilityManagement({ account }) {
  const [facilities, setFacilities] = useState([])
  const [loading, setLoading] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [newFacility, setNewFacility] = useState({
    id: '',
    name: '',
    location: '',
    energyType: 'Solar',
    capacity: ''
  })

  useEffect(() => {
    if (account) {
      loadFacilities()
    }
  }, [account])

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
            facilityList.push({ index: i, id: facilityId })
          } catch (error) {
            console.error(`Error loading facility ${i}:`, error)
          }
        }
        
        setFacilities(facilityList)
      }
    } catch (error) {
      console.error('Error loading facilities:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterFacility = async (e) => {
    e.preventDefault()
    if (!newFacility.id || !newFacility.name || !newFacility.location || !newFacility.capacity) {
      alert('Please fill in all fields')
      return
    }

    setIsRegistering(true)
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        [
          "function registerFacility(string facilityId, string name, string location, string energyType, uint256 capacity) external"
        ],
        signer
      )

      const tx = await contract.registerFacility(
        newFacility.id,
        newFacility.name,
        newFacility.location,
        newFacility.energyType,
        ethers.parseUnits(newFacility.capacity, 0) // Convert to Wei for capacity
      )

      await tx.wait()
      
      // Reset form
      setNewFacility({
        id: '',
        name: '',
        location: '',
        energyType: 'Solar',
        capacity: ''
      })
      
      // Reload facilities
      await loadFacilities()
      
      alert('Facility registered successfully!')
    } catch (error) {
      console.error('Error registering facility:', error)
      alert('Error registering facility: ' + error.message)
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">🏭 Facility Management</h2>
        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
          Owner Only
        </span>
      </div>

      {/* Register New Facility */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Register New Facility</h3>
        <form onSubmit={handleRegisterFacility} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facility ID *
              </label>
              <input
                type="text"
                placeholder="e.g., SOLAR-002"
                value={newFacility.id}
                onChange={(e) => setNewFacility({...newFacility, id: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facility Name *
              </label>
              <input
                type="text"
                placeholder="e.g., Sunrise Solar Farm"
                value={newFacility.name}
                onChange={(e) => setNewFacility({...newFacility, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                placeholder="e.g., California, USA"
                value={newFacility.location}
                onChange={(e) => setNewFacility({...newFacility, location: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Energy Type *
              </label>
              <select
                value={newFacility.energyType}
                onChange={(e) => setNewFacility({...newFacility, energyType: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {FACILITY_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capacity (MW) *
              </label>
              <input
                type="number"
                placeholder="e.g., 100"
                value={newFacility.capacity}
                onChange={(e) => setNewFacility({...newFacility, capacity: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                min="0"
                step="0.1"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isRegistering}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
          >
            {isRegistering ? 'Registering...' : 'Register Facility'}
          </button>
        </form>
      </div>

      {/* Existing Facilities */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Registered Facilities</h3>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading facilities...</p>
          </div>
        ) : facilities.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No facilities registered yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {facilities.map((facility) => (
              <div key={facility.index} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-medium">🏭</span>
                  <span className="text-xs text-gray-500">#{facility.index}</span>
                </div>
                <h4 className="font-semibold text-gray-800 mb-1">{facility.id}</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Status: <span className="text-green-600 font-medium">Active</span></p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
