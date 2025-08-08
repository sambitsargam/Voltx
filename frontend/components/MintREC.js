import { useState } from 'react';
import { Factory, Plus, ExternalLink } from 'lucide-react';
import { FACILITY_TYPES, getHashScanTxUrl } from '../utils/contract';
import { toast } from 'react-toastify';

export default function MintREC({ 
  account, 
  isValidConnection, 
  isOwner, 
  mintREC, 
  registerFacility,
  getFacility,
  isLoading 
}) {
  const [activeTab, setActiveTab] = useState('mint');
  const [mintForm, setMintForm] = useState({
    recipient: '',
    amount: '',
    facilityId: ''
  });
  const [facilityForm, setFacilityForm] = useState({
    facilityId: '',
    owner: '',
    type: 'solar'
  });
  const [facilityInfo, setFacilityInfo] = useState(null);
  const [txHash, setTxHash] = useState('');

  const handleMint = async (e) => {
    e.preventDefault();
    
    if (!isValidConnection()) {
      toast.error('Please connect your wallet and switch to Hedera Testnet');
      return;
    }

    if (!isOwner) {
      toast.error('Only the contract owner can mint RECs');
      return;
    }

    try {
      const hash = await mintREC(
        mintForm.recipient,
        parseInt(mintForm.amount),
        mintForm.facilityId
      );
      
      setTxHash(hash);
      toast.success('RECs minted successfully!');
      
      // Reset form
      setMintForm({
        recipient: '',
        amount: '',
        facilityId: ''
      });
    } catch (error) {
      console.error('Mint error:', error);
      toast.error(error.message || 'Failed to mint RECs');
    }
  };

  const handleRegisterFacility = async (e) => {
    e.preventDefault();
    
    if (!isValidConnection()) {
      toast.error('Please connect your wallet and switch to Hedera Testnet');
      return;
    }

    if (!isOwner) {
      toast.error('Only the contract owner can register facilities');
      return;
    }

    try {
      const hash = await registerFacility(
        facilityForm.facilityId,
        facilityForm.owner,
        facilityForm.type
      );
      
      setTxHash(hash);
      toast.success('Facility registered successfully!');
      
      // Reset form
      setFacilityForm({
        facilityId: '',
        owner: '',
        type: 'solar'
      });
    } catch (error) {
      console.error('Register facility error:', error);
      toast.error(error.message || 'Failed to register facility');
    }
  };

  const handleCheckFacility = async () => {
    if (!facilityForm.facilityId) {
      toast.error('Please enter a facility ID');
      return;
    }

    try {
      const facility = await getFacility(facilityForm.facilityId);
      setFacilityInfo(facility);
      toast.success('Facility found!');
    } catch (error) {
      console.error('Get facility error:', error);
      setFacilityInfo(null);
      toast.error('Facility not found');
    }
  };

  if (!isValidConnection()) {
    return (
      <div className="bg-white rounded-lg card-shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Factory className="h-5 w-5 mr-2" />
          REC Management
        </h2>
        <div className="text-center py-8">
          <p className="text-gray-600">
            Please connect your wallet and switch to Hedera Testnet to manage RECs
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg card-shadow p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
        <Factory className="h-5 w-5 mr-2" />
        REC Management
      </h2>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
        <button
          onClick={() => setActiveTab('mint')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'mint'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Mint RECs
        </button>
        <button
          onClick={() => setActiveTab('facility')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'facility'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Manage Facilities
        </button>
      </div>

      {/* Owner Check */}
      {!isOwner && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-700">
            Only the contract owner can mint RECs and register facilities. 
            You can still view facility information.
          </p>
        </div>
      )}

      {/* Mint RECs Tab */}
      {activeTab === 'mint' && (
        <form onSubmit={handleMint} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipient Address
            </label>
            <input
              type="text"
              placeholder="0x..."
              value={mintForm.recipient}
              onChange={(e) => setMintForm(prev => ({ ...prev, recipient: e.target.value }))}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (MWh)
            </label>
            <input
              type="number"
              placeholder="100"
              min="1"
              value={mintForm.amount}
              onChange={(e) => setMintForm(prev => ({ ...prev, amount: e.target.value }))}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Facility ID
            </label>
            <input
              type="text"
              placeholder="SOLAR-001"
              value={mintForm.facilityId}
              onChange={(e) => setMintForm(prev => ({ ...prev, facilityId: e.target.value }))}
              className="input-field"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !isOwner}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Minting...' : 'Mint RECs'}
          </button>
        </form>
      )}

      {/* Facility Management Tab */}
      {activeTab === 'facility' && (
        <div className="space-y-6">
          {/* Register Facility Form */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Register New Facility</h3>
            <form onSubmit={handleRegisterFacility} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facility ID
                </label>
                <input
                  type="text"
                  placeholder="SOLAR-001"
                  value={facilityForm.facilityId}
                  onChange={(e) => setFacilityForm(prev => ({ ...prev, facilityId: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facility Owner Address
                </label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={facilityForm.owner}
                  onChange={(e) => setFacilityForm(prev => ({ ...prev, owner: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facility Type
                </label>
                <select
                  value={facilityForm.type}
                  onChange={(e) => setFacilityForm(prev => ({ ...prev, type: e.target.value }))}
                  className="input-field"
                  required
                >
                  {FACILITY_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading || !isOwner}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Registering...' : 'Register Facility'}
              </button>
            </form>
          </div>

          {/* Check Facility */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Check Facility</h3>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Enter Facility ID"
                value={facilityForm.facilityId}
                onChange={(e) => setFacilityForm(prev => ({ ...prev, facilityId: e.target.value }))}
                className="input-field flex-1"
              />
              <button
                type="button"
                onClick={handleCheckFacility}
                className="btn-secondary"
              >
                Check
              </button>
            </div>

            {facilityInfo && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Facility Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">ID:</span>
                    <span className="font-medium ml-2">{facilityInfo.facilityId}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium ml-2 capitalize">{facilityInfo.facilityType}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ml-2 ${facilityInfo.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {facilityInfo.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Generated:</span>
                    <span className="font-medium ml-2">{facilityInfo.totalGenerated} MWh</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Owner:</span>
                    <span className="font-mono text-xs ml-2">{facilityInfo.owner}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Registered:</span>
                    <span className="font-medium ml-2">{facilityInfo.registrationDate.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transaction Hash Display */}
      {txHash && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">Transaction Successful!</p>
              <p className="text-xs text-green-600 font-mono">{txHash}</p>
            </div>
            <a
              href={getHashScanTxUrl(txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-700 flex items-center text-sm"
            >
              View on HashScan <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
