import { ethers } from 'ethers'

/**
 * Certificate verification utilities for Voltx REC Hub
 */

export const CERTIFICATE_CONTRACT_ABI = [
  "function getTransaction(uint256 _index) view returns (tuple(address from, address to, uint256 amount, string transactionType, string facilityId, uint256 timestamp, string metadata))",
  "function getFacility(string _facilityId) view returns (tuple(string facilityId, string name, string location, string energyType, uint256 capacity, bool isActive, uint256 totalGenerated, uint256 registrationTime, address registeredBy))",
  "function getTransactionCount() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function retiredTokens(address account) view returns (uint256)"
]

/**
 * Get contract instance
 */
export const getContract = (provider) => {
  return new ethers.Contract(
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    CERTIFICATE_CONTRACT_ABI,
    provider
  )
}

/**
 * Verify if a certificate ID is valid
 */
export const verifyCertificateId = async (certificateId) => {
  try {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('Wallet not connected')
    }

    const provider = new ethers.BrowserProvider(window.ethereum)
    const contract = getContract(provider)

    const transactionCount = await contract.getTransactionCount()
    const certId = parseInt(certificateId)

    if (certId >= transactionCount || certId < 0) {
      return { valid: false, error: 'Certificate ID not found' }
    }

    return { valid: true }
  } catch (error) {
    return { valid: false, error: error.message }
  }
}

/**
 * Get certificate data by ID
 */
export const getCertificateData = async (certificateId) => {
  try {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('Wallet not connected')
    }

    const provider = new ethers.BrowserProvider(window.ethereum)
    const contract = getContract(provider)

    // Get transaction data
    const transaction = await contract.getTransaction(certificateId)

    // Only mint transactions are certificates
    if (transaction.transactionType !== 'mint') {
      throw new Error('This transaction is not a valid REC certificate')
    }

    // Get facility data if available
    let facility = null
    if (transaction.facilityId && transaction.facilityId !== '') {
      try {
        facility = await contract.getFacility(transaction.facilityId)
      } catch (facilityError) {
        console.log('Facility data not available:', facilityError)
      }
    }

    // Check certificate status
    const currentBalance = await contract.balanceOf(transaction.to)
    const retiredBalance = await contract.retiredTokens(transaction.to)
    const isActive = currentBalance > 0

    return {
      id: parseInt(certificateId),
      from: transaction.from,
      to: transaction.to,
      amount: ethers.formatEther(transaction.amount),
      transactionType: transaction.transactionType,
      facilityId: transaction.facilityId,
      timestamp: new Date(Number(transaction.timestamp) * 1000),
      metadata: transaction.metadata,
      isActive,
      currentBalance: ethers.formatEther(currentBalance),
      retiredBalance: ethers.formatEther(retiredBalance),
      facility
    }
  } catch (error) {
    throw new Error(`Failed to get certificate data: ${error.message}`)
  }
}

/**
 * Generate QR code data for a certificate
 */
export const generateCertificateQRData = (certificateData) => {
  return {
    certificateId: certificateData.id,
    amount: certificateData.amount,
    facilityId: certificateData.facilityId,
    timestamp: certificateData.timestamp.toISOString(),
    recipient: certificateData.to,
    contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    network: 'Hedera Testnet',
    verificationUrl: `${window.location.origin}/verify/${certificateData.id}`
  }
}

/**
 * Format address for display
 */
export const formatAddress = (address) => {
  if (!address) return 'N/A'
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * Format certificate amount
 */
export const formatCertificateAmount = (amount) => {
  return `${parseFloat(amount).toLocaleString()} VREC`
}

/**
 * Get certificate status information
 */
export const getCertificateStatus = (certificateData) => {
  if (!certificateData) return null

  return {
    isActive: certificateData.isActive,
    status: certificateData.isActive ? 'Active' : 'Retired',
    statusColor: certificateData.isActive ? 'green' : 'red',
    statusIcon: certificateData.isActive ? '✅' : '❌',
    description: certificateData.isActive
      ? 'This certificate is valid and active on the blockchain'
      : 'This certificate has been retired and is no longer valid'
  }
}

/**
 * Validate certificate data integrity
 */
export const validateCertificateIntegrity = (certificateData) => {
  const errors = []

  if (!certificateData.id && certificateData.id !== 0) {
    errors.push('Invalid certificate ID')
  }

  if (!certificateData.amount || parseFloat(certificateData.amount) <= 0) {
    errors.push('Invalid certificate amount')
  }

  if (!certificateData.to || !ethers.isAddress(certificateData.to)) {
    errors.push('Invalid recipient address')
  }

  if (!certificateData.timestamp || isNaN(certificateData.timestamp.getTime())) {
    errors.push('Invalid timestamp')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}