import { useState } from 'react';
import { Recycle, Send, ExternalLink } from 'lucide-react';
import { getHashScanTxUrl } from '../utils/contract';
import { toast } from 'react-toastify';

export default function RECActions({ 
  account,
  tokenBalance,
  isValidConnection, 
  retireREC,
  transferTokens,
  isLoading 
}) {
  const [activeTab, setActiveTab] = useState('retire');
  const [retireForm, setRetireForm] = useState({
    amount: '',
    reason: ''
  });
  const [transferForm, setTransferForm] = useState({
    recipient: '',
    amount: ''
  });
  const [txHash, setTxHash] = useState('');

  const handleRetire = async (e) => {
    e.preventDefault();
    
    if (!isValidConnection()) {
      toast.error('Please connect your wallet and switch to Hedera Testnet');
      return;
    }

    if (parseFloat(retireForm.amount) > parseFloat(tokenBalance)) {
      toast.error('Insufficient VREC balance');
      return;
    }

    try {
      const hash = await retireREC(retireForm.amount, retireForm.reason);
      setTxHash(hash);
      toast.success('RECs retired successfully!');
      
      // Reset form
      setRetireForm({
        amount: '',
        reason: ''
      });
    } catch (error) {
      console.error('Retire error:', error);
      toast.error(error.message || 'Failed to retire RECs');
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    
    if (!isValidConnection()) {
      toast.error('Please connect your wallet and switch to Hedera Testnet');
      return;
    }

    if (parseFloat(transferForm.amount) > parseFloat(tokenBalance)) {
      toast.error('Insufficient VREC balance');
      return;
    }

    try {
      const hash = await transferTokens(transferForm.recipient, transferForm.amount);
      setTxHash(hash);
      toast.success('RECs transferred successfully!');
      
      // Reset form
      setTransferForm({
        recipient: '',
        amount: ''
      });
    } catch (error) {
      console.error('Transfer error:', error);
      toast.error(error.message || 'Failed to transfer RECs');
    }
  };

  const setMaxAmount = (formType) => {
    if (formType === 'retire') {
      setRetireForm(prev => ({ ...prev, amount: tokenBalance }));
    } else {
      setTransferForm(prev => ({ ...prev, amount: tokenBalance }));
    }
  };

  if (!isValidConnection()) {
    return (
      <div className="bg-white rounded-lg card-shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Recycle className="h-5 w-5 mr-2" />
          REC Actions
        </h2>
        <div className="text-center py-8">
          <p className="text-gray-600">
            Please connect your wallet and switch to Hedera Testnet to manage your RECs
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg card-shadow p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
        <Recycle className="h-5 w-5 mr-2" />
        REC Actions
      </h2>

      {/* Balance Display */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Your VREC Balance:</span>
          <span className="text-lg font-semibold text-gray-900">{tokenBalance} VREC</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
        <button
          onClick={() => setActiveTab('retire')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'retire'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Retire RECs
        </button>
        <button
          onClick={() => setActiveTab('transfer')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'transfer'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Transfer RECs
        </button>
      </div>

      {/* Retire RECs Tab */}
      {activeTab === 'retire' && (
        <div>
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-1">About Retiring RECs</h3>
            <p className="text-sm text-blue-700">
              Retiring RECs permanently removes them from circulation and allows you to claim 
              their environmental benefits. This is commonly done for carbon offsetting or 
              sustainability reporting.
            </p>
          </div>

          <form onSubmit={handleRetire} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Amount to Retire (VREC)
                </label>
                <button
                  type="button"
                  onClick={() => setMaxAmount('retire')}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Max
                </button>
              </div>
              <input
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                max={tokenBalance}
                value={retireForm.amount}
                onChange={(e) => setRetireForm(prev => ({ ...prev, amount: e.target.value }))}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Retirement Reason
              </label>
              <textarea
                placeholder="e.g., Carbon offset for company operations"
                value={retireForm.reason}
                onChange={(e) => setRetireForm(prev => ({ ...prev, reason: e.target.value }))}
                className="input-field h-20 resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || parseFloat(retireForm.amount) > parseFloat(tokenBalance)}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Recycle className="h-4 w-4 mr-2" />
              {isLoading ? 'Retiring...' : 'Retire RECs'}
            </button>
          </form>
        </div>
      )}

      {/* Transfer RECs Tab */}
      {activeTab === 'transfer' && (
        <div>
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-sm font-medium text-green-800 mb-1">About Transferring RECs</h3>
            <p className="text-sm text-green-700">
              Transfer RECs to another wallet address. The recipient will be able to trade 
              or retire these RECs. Make sure the recipient address is correct.
            </p>
          </div>

          <form onSubmit={handleTransfer} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipient Address
              </label>
              <input
                type="text"
                placeholder="0x..."
                value={transferForm.recipient}
                onChange={(e) => setTransferForm(prev => ({ ...prev, recipient: e.target.value }))}
                className="input-field"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Amount to Transfer (VREC)
                </label>
                <button
                  type="button"
                  onClick={() => setMaxAmount('transfer')}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Max
                </button>
              </div>
              <input
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                max={tokenBalance}
                value={transferForm.amount}
                onChange={(e) => setTransferForm(prev => ({ ...prev, amount: e.target.value }))}
                className="input-field"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || parseFloat(transferForm.amount) > parseFloat(tokenBalance)}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Send className="h-4 w-4 mr-2" />
              {isLoading ? 'Transferring...' : 'Transfer RECs'}
            </button>
          </form>
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
