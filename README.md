# Voltx - Renewable Energy Certificates Hub

<p align="center">
  <img src="https://img.shields.io/badge/Hedera-Testnet-brightgreen" alt="Hedera Testnet" />
  <img src="https://img.shields.io/badge/Hardhat-v2.19.0-blue" alt="Hardhat" />
  <img src="https://img.shields.io/badge/Next.js-14.0.0-black" alt="Next.js" />
  <img src="https://img.shields.io/badge/Solidity-0.8.19-purple" alt="Solidity" />
</p>

Voltx is a minimal Renewable Energy Certificates (REC) Hub built as an EVM dApp on Hedera Testnet. This MVP demonstrates basic REC functionality with plans for future Guardian integration.

## 🌟 Features

- **Mint RECs**: Issue new RECs for verified renewable energy generation
- **Transfer RECs**: Trade certificates between wallet addresses  
- **Retire RECs**: Permanently burn RECs to claim environmental benefits
- **Facility Management**: Register and manage renewable energy facilities
- **Dashboard**: View balances, stats, and transaction history
- **MetaMask Integration**: Seamless wallet connection and network switching

## 🏗️ Architecture

### Smart Contract (Solidity)
- **RECToken.sol**: ERC-20 based REC token with additional functionality
- Features: Minting, burning, facility registration, pause functionality
- Owner-controlled minting with facility verification
- Transparent retirement tracking

### Frontend (Next.js)
- **React hooks** for wallet and contract interaction
- **Tailwind CSS** for responsive design
- **MetaMask integration** with automatic network switching
- **Real-time updates** and transaction tracking

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MetaMask wallet extension
- HBAR tokens for Hedera Testnet (get from [portal.hedera.com](https://portal.hedera.com/))

### 1. Clone and Setup

```bash
git clone https://github.com/sambitsargam/Voltx.git
cd Voltx
npm install
```

### 2. Configure Environment

```bash
# Copy and edit environment file
cp .env.example .env

# Add your private key and other settings
nano .env
```

Required environment variables:
```env
PRIVATE_KEY=your_hedera_testnet_private_key
NEXT_PUBLIC_CONTRACT_ADDRESS=deployed_contract_address
NEXT_PUBLIC_CHAIN_ID=296
NEXT_PUBLIC_RPC_URL=https://testnet.hashio.io/api
```

### 3. Deploy Smart Contract

```bash
# Compile contracts
npm run compile

# Run tests
npm run test

# Deploy to Hedera Testnet
npm run deploy
```

The deployment script will:
- Deploy the RECToken contract
- Register a sample solar facility
- Mint 100 sample RECs
- Save contract address to `deployments/hedera-testnet.json`

### 4. Setup Frontend

```bash
# Install frontend dependencies
npm run frontend:install

# Update contract address in frontend/.env
echo "NEXT_PUBLIC_CONTRACT_ADDRESS=YOUR_DEPLOYED_CONTRACT_ADDRESS" > frontend/.env

# Start development server
npm run frontend:dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

### 5. Configure MetaMask

Add Hedera Testnet to MetaMask:
- **Network Name**: Hedera Testnet
- **RPC URL**: `https://testnet.hashio.io/api`
- **Chain ID**: `296` (0x128)
- **Currency Symbol**: HBAR
- **Block Explorer**: `https://hashscan.io/testnet`

## 📋 Available Scripts

### Backend
```bash
npm run compile          # Compile smart contracts
npm run test            # Run contract tests
npm run deploy          # Deploy to Hedera Testnet
npm run verify          # Verify contract on HashScan
```

### Frontend
```bash
npm run frontend:dev    # Start development server
npm run frontend:build  # Build for production
npm run frontend:start  # Start production server
```

### Utility Scripts
```bash
node scripts/interact.js           # Interact with deployed contract
node scripts/setup-sample-data.js  # Setup additional sample data
```

## 🔧 Contract Interaction

### Mint RECs (Owner Only)
```javascript
// Mint 100 RECs for a facility
await recToken.mintREC(
  recipientAddress,
  100, // Amount in MWh
  "SOLAR-001", // Facility ID
  timestamp // Generation date
);
```

### Register Facility (Owner Only)
```javascript
await recToken.registerFacility(
  "WIND-001",           // Facility ID
  facilityOwnerAddress, // Owner address
  "wind"               // Facility type
);
```

### Retire RECs
```javascript
// Retire 50 RECs
const amount = ethers.parseEther("50");
await recToken.retireREC(amount, "Carbon offset for operations");
```

### Transfer RECs
```javascript
const amount = ethers.parseEther("25");
await recToken.transfer(recipientAddress, amount);
```

## 🌐 Network Configuration

### Hedera Testnet Details
- **Chain ID**: 296 (0x128)
- **Currency**: HBAR
- **RPC Endpoint**: https://testnet.hashio.io/api
- **Block Explorer**: https://hashscan.io/testnet
- **Block Gas Limit**: 30,000,000

### Common Issues & Solutions

#### 1. RPC Connection Issues
If you encounter RPC timeouts or connection issues:
```javascript
// Add to hardhat.config.js
networks: {
  hedera: {
    url: "https://testnet.hashio.io/api",
    timeout: 60000,
    gasPrice: 50000000000, // 50 gwei
  }
}
```

#### 2. Chain ID Mismatch
Ensure MetaMask is connected to Hedera Testnet (Chain ID: 296):
```javascript
// The frontend will automatically prompt to switch networks
if (chainId !== 296) {
  await switchToHedera();
}
```

#### 3. Nonce Issues
If transactions fail due to nonce issues:
```bash
# Reset MetaMask account
# Settings > Advanced > Reset Account
```

#### 4. Gas Estimation
For complex transactions, manually set gas:
```javascript
const tx = await contract.mintREC(address, amount, facility, date, {
  gasLimit: 500000
});
```

## 🧪 Testing

### Run Contract Tests
```bash
npm run test
```

Test coverage includes:
- Contract deployment and initialization
- Facility registration and management
- REC minting with various scenarios
- REC retirement and burning
- Transfer functionality
- Access control and permissions
- Pausable functionality
- Edge cases and error handling

### Frontend Testing
```bash
cd frontend
npm run test        # Run component tests
npm run test:e2e    # Run end-to-end tests
```

## 📚 Documentation Links

- [Hedera EVM Developers](https://docs.hedera.com/hedera/getting-started/evm-developers)
- [JSON-RPC Relay (Hashio)](https://docs.hedera.com/hedera/core-concepts/smart-contracts/json-rpc-relay)
- [Hedera Testnet Overview](https://docs.hedera.com/hedera/networks/testnet)
- [HashScan Block Explorer](https://hashscan.io/testnet)
- [Hardhat Documentation](https://hardhat.org/docs)
- [HashPack Wallet](https://docs.hashpack.app/)

## 🔮 Future with Guardian

This Voltx MVP demonstrates basic REC functionality on Hedera EVM. The next phase will integrate with **Hedera Guardian** to provide:

### Enhanced Features
- ✅ Comprehensive ESG policy workflows
- ✅ Multi-party verification and auditing  
- ✅ Real-time environmental data integration
- ✅ Advanced IoT sensor data validation

### Guardian Integration Benefits
- ✅ Automated MRV (Monitoring, Reporting, Verification)
- ✅ Decentralized identity and role management
- ✅ Compliance with international carbon standards
- ✅ Transparent audit trails and reporting

### Roadmap
1. **Phase 1** ✅ EVM MVP (Current)
2. **Phase 2** 🔄 Guardian Policy Integration
3. **Phase 3** 📋 IoT Data Feeds
4. **Phase 4** 🌍 Multi-Registry Support

Learn more: [Guardian Documentation](https://github.com/hashgraph/guardian#readme)

## 🛠️ Troubleshooting

### Common MetaMask Issues

1. **Network Not Added**
   - The dApp will automatically prompt to add Hedera Testnet
   - Alternatively, add manually using the network details above

2. **Insufficient HBAR for Gas**
   - Get test HBAR from [Hedera Portal](https://portal.hedera.com/)
   - Each transaction costs ~0.001 HBAR

3. **Contract Interaction Fails**
   - Ensure you're connected to Hedera Testnet (Chain ID: 296)
   - Check that contract address is correctly configured
   - Verify your account has sufficient HBAR balance

### Deployment Issues

1. **Contract Deployment Fails**
   ```bash
   # Check your private key format (without 0x prefix)
   # Ensure sufficient HBAR balance (>1 HBAR recommended)
   # Verify RPC endpoint is responsive
   ```

2. **Verification Fails**
   ```bash
   # Manual verification on HashScan
   # Upload contract source code and constructor parameters
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow Solidity best practices for smart contracts
- Use ESLint and Prettier for code formatting
- Write comprehensive tests for new features
- Update documentation for API changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **GitHub**: [https://github.com/sambitsargam/Voltx](https://github.com/sambitsargam/Voltx)
- **Demo**: [Deployed Application URL]
- **HashScan**: [Contract Explorer URL]
- **Documentation**: [Additional Docs URL]

## 📞 Support

For questions, issues, or contributions:
- Create an issue on GitHub
- Join our Discord community
- Follow updates on Twitter

---

<p align="center">
  Built with ❤️ for the Hedera ecosystem and sustainable energy future
</p>
