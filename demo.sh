#!/bin/bash

# Voltx Deployment and Demo Script
# This script demonstrates the complete setup and usage of Voltx

set -e

echo "🚀 Voltx - Renewable Energy Certificates Hub Demo"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning "Environment file not found. Creating from template..."
    cp .env.example .env
    print_error "Please edit .env file with your private key and other settings, then run this script again."
    echo ""
    echo "Required environment variables:"
    echo "  PRIVATE_KEY=your_hedera_testnet_private_key_without_0x"
    echo "  NEXT_PUBLIC_CHAIN_ID=296"
    echo "  NEXT_PUBLIC_RPC_URL=https://testnet.hashio.io/api"
    echo ""
    exit 1
fi

# Load environment variables
source .env

if [ -z "$PRIVATE_KEY" ] || [ "$PRIVATE_KEY" = "your_private_key_here" ]; then
    print_error "Please set your PRIVATE_KEY in the .env file"
    exit 1
fi

print_status "Environment configured ✓"

# Step 1: Install dependencies
print_status "Installing backend dependencies..."
npm install
print_success "Backend dependencies installed"

print_status "Installing frontend dependencies..."
npm run frontend:install
print_success "Frontend dependencies installed"

# Step 2: Compile contracts
print_status "Compiling smart contracts..."
npm run compile
print_success "Smart contracts compiled"

# Step 3: Run tests
print_status "Running contract tests..."
npm run test
print_success "All tests passed"

# Step 4: Deploy contracts
print_status "Deploying contracts to Hedera Testnet..."
npm run deploy
print_success "Contracts deployed successfully"

# Step 5: Setup sample data
print_status "Setting up sample facilities and RECs..."
npm run setup-data
print_success "Sample data configured"

# Step 6: Interact with contract
print_status "Verifying contract deployment..."
npm run interact
print_success "Contract verification complete"

# Step 7: Update frontend configuration
if [ -f "deployments/hedera-testnet.json" ]; then
    CONTRACT_ADDRESS=$(node -p "JSON.parse(require('fs').readFileSync('deployments/hedera-testnet.json', 'utf8')).contractAddress")
    
    print_status "Updating frontend configuration..."
    
    # Update frontend .env
    echo "NEXT_PUBLIC_CONTRACT_ADDRESS=$CONTRACT_ADDRESS" > frontend/.env
    echo "NEXT_PUBLIC_CHAIN_ID=296" >> frontend/.env
    echo "NEXT_PUBLIC_RPC_URL=https://testnet.hashio.io/api" >> frontend/.env
    
    print_success "Frontend configured with contract address: $CONTRACT_ADDRESS"
else
    print_error "Deployment file not found. Contract deployment may have failed."
    exit 1
fi

echo ""
print_success "🎉 Voltx deployment completed successfully!"
echo ""
echo "📋 Summary:"
echo "  - Smart contract deployed and verified"
echo "  - Sample facilities registered (SOLAR-001, WIND-001, HYDRO-001, SOLAR-002)"
echo "  - Sample RECs minted for testing"
echo "  - Frontend configured with contract address"
echo ""
echo "🔗 Useful Links:"
echo "  - HashScan Explorer: https://hashscan.io/testnet/contract/$CONTRACT_ADDRESS"
echo "  - Hedera Portal: https://portal.hedera.com"
echo "  - Documentation: https://docs.hedera.com/hedera/getting-started/evm-developers"
echo ""
echo "🚀 Next Steps:"
echo "  1. Start the frontend: npm run frontend:dev"
echo "  2. Open http://localhost:3000 in your browser"
echo "  3. Connect your MetaMask wallet"
echo "  4. Switch to Hedera Testnet (Chain ID: 296)"
echo "  5. Start trading and retiring RECs!"
echo ""
echo "💡 Tips:"
echo "  - Get test HBAR from https://portal.hedera.com"
echo "  - Each VREC token represents 1 MWh of renewable energy"
echo "  - Retiring RECs burns them permanently for environmental benefits"
echo "  - View all transactions on HashScan testnet explorer"
echo ""
print_success "Happy trading! 🌱⚡"
