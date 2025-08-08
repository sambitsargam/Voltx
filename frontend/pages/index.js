import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Zap, Github, ExternalLink, BookOpen, CheckCircle } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { useRECContract } from '../hooks/useRECContract';
import WalletConnection from '../components/WalletConnection';
import RECDashboard from '../components/RECDashboard';
import MintREC from '../components/MintREC';
import RECActions from '../components/RECActions';
import { CONTRACT_CONFIG, getHashScanContractUrl } from '../utils/contract';

export default function Home() {
  const wallet = useWallet();
  const [isOwner, setIsOwner] = useState(false);
  
  const contract = useRECContract(wallet.account, wallet.isValidConnection);

  // Check if user is contract owner
  useEffect(() => {
    const checkOwner = async () => {
      if (contract.contract && wallet.account) {
        try {
          const ownerStatus = await contract.isOwner();
          setIsOwner(ownerStatus);
        } catch (error) {
          console.error('Failed to check owner status:', error);
        }
      }
    };

    checkOwner();
  }, [contract.contract, wallet.account]);

  return (
    <>
      <Head>
        <title>Voltx - Renewable Energy Certificates Hub</title>
        <meta name="description" content="Trade and manage Renewable Energy Certificates on Hedera Testnet" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="gradient-bg text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Zap className="h-8 w-8 mr-2" />
                <h1 className="text-xl font-bold">Voltx</h1>
                <span className="ml-2 text-sm bg-white/20 px-2 py-1 rounded">
                  Hedera Testnet
                </span>
              </div>
              
              <div className="flex items-center space-x-4">
                <a
                  href="https://github.com/sambitsargam/Voltx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <Github className="h-5 w-5" />
                </a>
                
                {CONTRACT_CONFIG.address && (
                  <a
                    href={getHashScanContractUrl(CONTRACT_CONFIG.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/80 hover:text-white transition-colors flex items-center text-sm"
                  >
                    Contract <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Renewable Energy Certificates Hub
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Trade, mint, and retire Renewable Energy Certificates (RECs) on Hedera's 
              sustainable blockchain network. Each VREC token represents 1 MWh of clean energy.
            </p>
          </div>

          {/* Contract Info */}
          {CONTRACT_CONFIG.address ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Contract Deployed Successfully
                  </p>
                  <p className="text-sm text-green-700">
                    Address: <span className="font-mono">{CONTRACT_CONFIG.address}</span>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 text-yellow-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Contract Not Configured
                  </p>
                  <p className="text-sm text-yellow-700">
                    Please deploy the contract and update the frontend configuration.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Wallet Connection */}
          <WalletConnection {...wallet} />

          {/* Dashboard */}
          {wallet.isValidConnection() && (
            <RECDashboard
              tokenBalance={contract.tokenBalance}
              retiredBalance={contract.retiredBalance}
              totalSupply={contract.totalSupply}
              totalRetired={contract.totalRetired}
              isLoading={contract.isLoading}
            />
          )}

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* REC Management */}
            <MintREC
              account={wallet.account}
              isValidConnection={wallet.isValidConnection}
              isOwner={isOwner}
              mintREC={contract.mintREC}
              registerFacility={contract.registerFacility}
              getFacility={contract.getFacility}
              isLoading={contract.isLoading}
            />

            {/* REC Actions */}
            <RECActions
              account={wallet.account}
              tokenBalance={contract.tokenBalance}
              isValidConnection={wallet.isValidConnection}
              retireREC={contract.retireREC}
              transferTokens={contract.transferTokens}
              isLoading={contract.isLoading}
            />
          </div>

          {/* Features Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg card-shadow p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Mint RECs</h3>
              <p className="text-gray-600 text-sm">
                Issue new RECs for verified renewable energy generation from registered facilities.
              </p>
            </div>

            <div className="bg-white rounded-lg card-shadow p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ExternalLink className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Trade RECs</h3>
              <p className="text-gray-600 text-sm">
                Transfer RECs between wallets to create a marketplace for renewable energy certificates.
              </p>
            </div>

            <div className="bg-white rounded-lg card-shadow p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Retire RECs</h3>
              <p className="text-gray-600 text-sm">
                Permanently retire RECs to claim environmental benefits for carbon offsetting.
              </p>
            </div>
          </div>

          {/* Future with Guardian Section */}
          <div className="mt-12 bg-white rounded-lg card-shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Future with Guardian</h2>
            <div className="prose max-w-none text-gray-600">
              <p className="mb-4">
                This Voltx MVP demonstrates basic REC functionality on Hedera EVM. The next phase 
                will integrate with <strong>Hedera Guardian</strong> to provide:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Enhanced Features</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      Comprehensive ESG policy workflows
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      Multi-party verification and auditing
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      Real-time environmental data integration
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      Advanced IoT sensor data validation
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Guardian Integration</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      Automated MRV (Monitoring, Reporting, Verification)
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      Decentralized identity and role management
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      Compliance with international carbon standards
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      Transparent audit trails and reporting
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Learn more:</strong> Visit the{' '}
                  <a 
                    href="https://github.com/hashgraph/guardian#readme"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-blue-900"
                  >
                    Guardian documentation
                  </a>{' '}
                  to understand how this integration will enable enterprise-grade 
                  environmental asset management.
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Zap className="h-6 w-6 text-primary-600 mr-2" />
                <span className="text-gray-900 font-semibold">Voltx</span>
                <span className="text-gray-500 ml-2">Renewable Energy Certificates Hub</span>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <a 
                  href="https://docs.hedera.com/hedera/getting-started/evm-developers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-700 transition-colors"
                >
                  Hedera EVM Docs
                </a>
                <a 
                  href="https://hashscan.io/testnet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-700 transition-colors"
                >
                  HashScan Explorer
                </a>
                <a 
                  href="https://github.com/hashgraph/guardian#readme"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-700 transition-colors"
                >
                  Guardian
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
