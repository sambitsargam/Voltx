import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia } from 'wagmi/chains';

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
};

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
};

export const config = getDefaultConfig({
  appName: 'Voltx REC Hub',
  projectId: 'YOUR_PROJECT_ID', // Get this from https://cloud.walletconnect.com
  chains: [hederaTestnet, hederaMainnet],
  ssr: true, // If your dApp uses server side rendering (SSR)
  // Add additional options for better localhost support
  multiInjectedProviderDiscovery: false,
});

export { hederaTestnet, hederaMainnet };
