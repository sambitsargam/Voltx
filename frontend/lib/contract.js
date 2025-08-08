// Enhanced Contract ABI for all features
export const ENHANCED_CONTRACT_ABI = [
  // ERC20 Standard Functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  
  // Enhanced Transfer Functions
  "function transferWithMetadata(address to, uint256 amount, string metadata) returns (bool)",
  
  // Ownership Functions
  "function owner() view returns (address)",
  "function transferOwnership(address newOwner)",
  
  // Facility Management Functions
  "function registerFacility(string facilityId, string name, string location, string energyType, uint256 capacity)",
  "function updateFacilityStatus(string facilityId, bool isActive)",
  "function getFacility(string facilityId) view returns (tuple(string facilityId, string name, string location, string energyType, uint256 capacity, bool isActive, uint256 totalGenerated, uint256 registrationTime, address registeredBy))",
  "function getAllFacilities() view returns (string[])",
  "function getFacilityCount() view returns (uint256)",
  "function registeredFacilities(uint256 index) view returns (string)",
  "function facilityExists(string facilityId) view returns (bool)",
  
  // Token Minting Functions
  "function mint(address to, uint256 amount)",
  "function mintFromFacility(address to, uint256 amount, string facilityId, string metadata)",
  
  // Token Burning/Retirement Functions
  "function burn(uint256 amount)",
  "function burnFrom(address account, uint256 amount)",
  "function retireTokens(uint256 amount, string reason)",
  "function getRetiredBalance(address user) view returns (uint256)",
  "function getTotalRetired() view returns (uint256)",
  
  // Transaction History Functions
  "function getTransaction(uint256 index) view returns (tuple(address from, address to, uint256 amount, string transactionType, string facilityId, uint256 timestamp, string metadata))",
  "function getUserTransactions(address user) view returns (uint256[])",
  "function getTransactionCount() view returns (uint256)",
  
  // Trading & Pricing Functions
  "function getTokenPrice() view returns (uint256)",
  "function updateTokenPrice(uint256 newPrice)",
  "function isTradingEnabled() view returns (bool)",
  "function setTradingEnabled(bool enabled)",
  "function buyTokens() payable",
  
  // Admin Functions
  "function withdrawETH()",
  "function emergencyToggleTrading()",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event FacilityRegistered(string indexed facilityId, string name, string location, string energyType, uint256 capacity, address registeredBy)",
  "event FacilityStatusChanged(string indexed facilityId, bool isActive)",
  "event TokensMinted(address indexed to, uint256 amount, string indexed facilityId, string metadata)",
  "event TokensRetired(address indexed by, uint256 amount, string reason)",
  "event TransactionRecorded(address indexed from, address indexed to, uint256 amount, string transactionType, string facilityId)",
  "event TokenPriceUpdated(uint256 oldPrice, uint256 newPrice)",
  "event TradingStatusChanged(bool enabled)"
];

// Contract Address
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

// Network Information
export const NETWORK_CONFIG = {
  chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "296"),
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "https://testnet.hashio.io/api",
  name: "Hedera Testnet",
  currency: "HBAR"
};

// Helper function to format token amounts
export function formatTokenAmount(amount, decimals = 18) {
  if (!amount) return "0";
  
  try {
    // Convert to string and handle scientific notation
    const amountStr = amount.toString();
    
    // If it's in scientific notation, handle it
    if (amountStr.includes('e')) {
      const num = parseFloat(amountStr);
      return (num / Math.pow(10, decimals)).toFixed(4);
    }
    
    // For regular numbers, divide by 10^decimals
    const divisor = Math.pow(10, decimals);
    const result = parseFloat(amountStr) / divisor;
    
    // Format with appropriate decimal places
    if (result >= 1000000) {
      return (result / 1000000).toFixed(2) + "M";
    } else if (result >= 1000) {
      return (result / 1000).toFixed(2) + "K";
    } else if (result >= 1) {
      return result.toFixed(4);
    } else if (result > 0) {
      return result.toFixed(6);
    }
    
    return "0";
  } catch (error) {
    console.error('Error formatting token amount:', error);
    return "0";
  }
}

// Facility Types
export const FACILITY_TYPES = [
  'Solar',
  'Wind', 
  'Hydro',
  'Geothermal',
  'Biomass',
  'Nuclear'
];

// Transaction Types
export const TRANSACTION_TYPES = {
  MINT: 'mint',
  TRANSFER: 'transfer', 
  BURN: 'burn',
  RETIRE: 'retire',
  PURCHASE: 'purchase'
};

export default {
  ENHANCED_CONTRACT_ABI,
  CONTRACT_ADDRESS,
  NETWORK_CONFIG,
  formatTokenAmount,
  FACILITY_TYPES,
  TRANSACTION_TYPES
};
