'use client';

import { useState, useEffect } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import {
  verifyCertificateId,
  getCertificateData,
  generateCertificateQRData,
  formatAddress,
  getCertificateStatus,
  validateCertificateIntegrity
} from '../utils/certificateUtils'

export default function CertificateVerification({ account }) {
  const [certificateId, setCertificateId] = useState('')
  const [certificateData, setCertificateData] = useState(null)
  const [facilityData, setFacilityData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showQR, setShowQR] = useState(false)
  const [qrData, setQrData] = useState('')

  // Contract ABI (simplified for the functions we need)
  const contractABI = [
    "function getTransaction(uint256 _index) view returns (tuple(address from, address to, uint256 amount, string transactionType, string facilityId, uint256 timestamp, string metadata))",
    "function getFacility(string _facilityId) view returns (tuple(string facilityId, string name, string location, string energyType, uint256 capacity, bool isActive, uint256 totalGenerated, uint256 registrationTime, address registeredBy))",
    "function getTransactionCount() view returns (uint256)",
    "function balanceOf(address account) view returns (uint256)",
    "function retiredTokens(address account) view returns (uint256)"
  ]

  const verifyCertificate = async () => {
    if (!certificateId.trim()) {
      setError('Please enter a certificate ID')
      return
    }

    setLoading(true)
    setError('')
    setCertificateData(null)
    setFacilityData(null)

    try {
      // First verify the certificate ID exists
      const verification = await verifyCertificateId(certificateId)
      if (!verification.valid) {
        setError(verification.error)
        return
      }

      // Get certificate data
      const certData = await getCertificateData(certificateId)

      // Validate certificate integrity
      const validation = validateCertificateIntegrity(certData)
      if (!validation.isValid) {
        setError(`Certificate validation failed: ${validation.errors.join(', ')}`)
        return
      }

      setCertificateData(certData)
      setFacilityData(certData.facility)

      // Generate QR code data
      const qrCodeData = generateCertificateQRData(certData)
      setQrData(JSON.stringify(qrCodeData))
      setShowQR(true)

    } catch (error) {
      console.error('Error verifying certificate:', error)
      setError(error.message || 'Failed to verify certificate. Please check the certificate ID and try again.')
    } finally {
      setLoading(false)
    }
  }

  const bytes32ToString = (bytes32) => {
    try {
      return ethers.decodeBytes32String(bytes32)
    } catch {
      return bytes32 // Return as-is if not bytes32
    }
  }

  const resetVerification = () => {
    setCertificateId('')
    setCertificateData(null)
    setFacilityData(null)
    setError('')
    setShowQR(false)
    setQrData('')
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">🔍 Certificate Verification</h2>

        {/* Verification Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Certificate ID
          </label>
          <div className="flex space-x-3">
            <input
              type="number"
              value={certificateId}
              onChange={(e) => setCertificateId(e.target.value)}
              placeholder="Enter certificate ID (e.g., 1, 2, 3...)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              min="0"
            />
            <button
              onClick={verifyCertificate}
              disabled={loading}
              className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        {/* Certificate Details */}
        {certificateData && (
          <div className="space-y-6">
            {/* Status Banner */}
            <div className={`p-4 rounded-lg ${
              certificateData.isActive
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center space-x-2">
                <span className={`text-lg ${certificateData.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {certificateData.isActive ? '✅' : '❌'}
                </span>
                <span className={`font-semibold ${certificateData.isActive ? 'text-green-800' : 'text-red-800'}`}>
                  Certificate {certificateData.isActive ? 'Active' : 'Retired'}
                </span>
              </div>
              <p className={`text-sm mt-1 ${certificateData.isActive ? 'text-green-700' : 'text-red-700'}`}>
                {certificateData.isActive
                  ? 'This certificate is valid and active on the blockchain'
                  : 'This certificate has been retired and is no longer valid'
                }
              </p>
            </div>

            {/* Certificate Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Certificate Details</h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Certificate ID</label>
                    <p className="text-sm font-mono text-gray-800">#{certificateData.id}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600">Amount</label>
                    <p className="text-lg font-semibold text-green-600">{certificateData.amount} VREC</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600">Recipient</label>
                    <p className="text-sm font-mono text-gray-800">{formatAddress(certificateData.to)}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600">Issue Date</label>
                    <p className="text-sm text-gray-800">{certificateData.timestamp.toLocaleString()}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600">Facility ID</label>
                    <p className="text-sm text-gray-800">{certificateData.facilityId || 'N/A'}</p>
                  </div>

                  {certificateData.metadata && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Metadata</label>
                      <p className="text-sm text-gray-800">{certificateData.metadata}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Facility Information */}
              {facilityData && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Facility Information</h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Facility Name</label>
                      <p className="text-sm text-gray-800">{facilityData.name}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600">Location</label>
                      <p className="text-sm text-gray-800">{facilityData.location}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600">Energy Type</label>
                      <p className="text-sm text-gray-800">{facilityData.energyType}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600">Capacity</label>
                      <p className="text-sm text-gray-800">{facilityData.capacity} kW</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600">Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        facilityData.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {facilityData.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* QR Code Section */}
            {showQR && qrData && (
              <div className="mt-6 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">📱 Certificate QR Code</h3>
                <div className="flex flex-col items-center space-y-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <QRCodeCanvas
                      value={qrData}
                      size={200}
                      level="M"
                      includeMargin={true}
                    />
                  </div>
                  <p className="text-sm text-gray-600 text-center max-w-md">
                    Scan this QR code to verify the certificate authenticity and details
                  </p>
                  <button
                    onClick={() => {
                      const canvas = document.querySelector('canvas')
                      if (canvas) {
                        const link = document.createElement('a')
                        link.download = `certificate-${certificateData.id}.png`
                        link.href = canvas.toDataURL()
                        link.click()
                      }
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                  >
                    📥 Download QR Code
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={resetVerification}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Verify Another
              </button>
              <button
                onClick={() => {
                  const url = `${process.env.NEXT_PUBLIC_BLOCK_EXPLORER}/transaction/${certificateData.id}`
                  window.open(url, '_blank')
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                🔍 View on Explorer
              </button>
            </div>
          </div>
        )}

        {/* Help Section */}
        {!certificateData && (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">How to Verify Certificates</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Certificate IDs are numeric values starting from 0</li>
              <li>• Only mint transactions are considered valid certificates</li>
              <li>• Active certificates can still be transferred or retired</li>
              <li>• Retired certificates are permanently removed from circulation</li>
              <li>• QR codes contain all certificate data for easy verification</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}