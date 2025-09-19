import { createAppKit } from '@reown/appkit'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, sepolia } from 'wagmi/chains'

// Define Hedera Testnet
const hederaTestnet = {
  id: 296,
  name: 'Hedera Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'HBAR',
    symbol: 'HBAR',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.hashio.io/api'],
    },
    public: {
      http: ['https://testnet.hashio.io/api'],
    },
  },
  blockExplorers: {
    default: { name: 'HashScan', url: 'https://hashscan.io/testnet' },
  },
  testnet: true,
}

// Define Hedera Mainnet for future use
const hederaMainnet = {
  id: 295,
  name: 'Hedera Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'HBAR',
    symbol: 'HBAR',
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.hashio.io/api'],
    },
    public: {
      http: ['https://mainnet.hashio.io/api'],
    },
  },
  blockExplorers: {
    default: { name: 'HashScan', url: 'https://hashscan.io/mainnet' },
  },
  testnet: false,
}

// Get project ID from environment variables
const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || 'YOUR_REOWN_PROJECT_ID'

// Create Wagmi adapter
export const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  projectId,
  networks: [hederaTestnet, hederaMainnet],
})

// Create AppKit modal
export const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: [hederaTestnet, hederaMainnet],
  defaultNetwork: hederaTestnet,
  projectId,
  features: {
    analytics: true,
    email: false,
    socials: [],
    emailShowWallets: false,
  },
  themeMode: 'light',
  themeVariables: {
    '--w3m-accent': '#10b981', // Green-500
  },
})

export { hederaTestnet, hederaMainnet }
