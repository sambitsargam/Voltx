// Contract ABI - This should be updated with the actual ABI after compilation
export const REC_TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function mintREC(address to, uint256 amountMWh, string facilityId, uint256 generationDate)",
  "function retireREC(uint256 amount, string reason)",
  "function registerFacility(string facilityId, address facilityOwner, string facilityType)",
  "function getFacility(string facilityId) view returns (tuple(string facilityId, address owner, string facilityType, bool isActive, uint256 totalGenerated, uint256 registrationDate))",
  "function getRetiredBalance(address account) view returns (uint256)",
  "function getFacilityCount() view returns (uint256)",
  "function totalRetired() view returns (uint256)",
  "function owner() view returns (address)",
  "function paused() view returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event RECMinted(address indexed to, uint256 amount, string facilityId, uint256 generationDate)",
  "event RECRetired(address indexed from, uint256 amount, string reason)",
  "event FacilityRegistered(string facilityId, address indexed owner, string facilityType)"
];

// Hedera Testnet Configuration
export const HEDERA_TESTNET = {
  chainId: 296, // 0x128
  name: 'Hedera Testnet',
  currency: 'HBAR',
  decimals: 18,
  rpcUrl: 'https://testnet.hashio.io/api',
  blockExplorerUrl: 'https://hashscan.io/testnet',
  blockExplorerName: 'HashScan'
};

// Contract Configuration
export const CONTRACT_CONFIG = {
  address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '',
  abi: REC_TOKEN_ABI,
  network: HEDERA_TESTNET
};

// Network validation
export const isCorrectNetwork = (chainId) => {
  return parseInt(chainId) === HEDERA_TESTNET.chainId;
};

// Format token amounts
export const formatTokenAmount = (amount, decimals = 18) => {
  try {
    const value = parseFloat(amount) / Math.pow(10, decimals);
    return value.toFixed(2);
  } catch (error) {
    return '0.00';
  }
};

// Format address for display
export const formatAddress = (address, startLength = 6, endLength = 4) => {
  if (!address) return '';
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};

// Generate HashScan transaction URL
export const getHashScanTxUrl = (txHash) => {
  return `${HEDERA_TESTNET.blockExplorerUrl}/transaction/${txHash}`;
};

// Generate HashScan contract URL
export const getHashScanContractUrl = (contractAddress) => {
  return `${HEDERA_TESTNET.blockExplorerUrl}/contract/${contractAddress}`;
};

// Common facility types
export const FACILITY_TYPES = [
  { value: 'solar', label: 'Solar Power' },
  { value: 'wind', label: 'Wind Power' },
  { value: 'hydro', label: 'Hydroelectric' },
  { value: 'biomass', label: 'Biomass' },
  { value: 'geothermal', label: 'Geothermal' },
  { value: 'other', label: 'Other Renewable' }
];

// Error messages
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet',
  WRONG_NETWORK: 'Please switch to Hedera Testnet',
  INSUFFICIENT_BALANCE: 'Insufficient VREC balance',
  TRANSACTION_FAILED: 'Transaction failed',
  CONTRACT_NOT_FOUND: 'Contract not found or not deployed',
  INVALID_INPUT: 'Invalid input provided',
  METAMASK_NOT_INSTALLED: 'MetaMask is not installed'
};
