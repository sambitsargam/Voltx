const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting Voltx REC Token deployment on Hedera Testnet...");
  
  const [deployer] = await ethers.getSigners();
  
  console.log("📍 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "HBAR");
  
  // Deploy REC Token
  const RECToken = await ethers.getContractFactory("RECToken");
  
  const tokenName = "Voltx Renewable Energy Certificate";
  const tokenSymbol = "VREC";
  const initialOwner = deployer.address;
  
  console.log("⏳ Deploying RECToken...");
  const recToken = await RECToken.deploy(tokenName, tokenSymbol, initialOwner);
  
  console.log("⏳ Waiting for deployment confirmation...");
  await recToken.waitForDeployment();
  
  const contractAddress = await recToken.getAddress();
  
  console.log("✅ RECToken deployed successfully!");
  console.log("📄 Contract Address:", contractAddress);
  console.log("🔗 HashScan URL:", `https://hashscan.io/testnet/contract/${contractAddress}`);
  
  // Register a sample facility
  console.log("⏳ Registering sample solar facility...");
  const registerTx = await recToken.registerFacility(
    "SOLAR-001",
    deployer.address,
    "solar"
  );
  await registerTx.wait();
  console.log("✅ Sample facility registered!");
  
  // Mint some sample RECs
  console.log("⏳ Minting sample RECs...");
  const mintTx = await recToken.mintREC(
    deployer.address,
    100, // 100 MWh
    "SOLAR-001",
    Math.floor(Date.now() / 1000) - 86400 // Yesterday
  );
  await mintTx.wait();
  console.log("✅ 100 VREC tokens minted!");
  
  // Verification info
  console.log("\n📋 Deployment Summary:");
  console.log("========================");
  console.log("Contract Name:", tokenName);
  console.log("Symbol:", tokenSymbol);
  console.log("Address:", contractAddress);
  console.log("Owner:", initialOwner);
  console.log("Network: Hedera Testnet (Chain ID: 296)");
  console.log("Explorer:", `https://hashscan.io/testnet/contract/${contractAddress}`);
  
  console.log("\n🔧 Next Steps:");
  console.log("1. Update frontend/.env with contract address");
  console.log("2. Verify contract on HashScan (if API available)");
  console.log("3. Test frontend integration");
  
  // Save deployment info for frontend
  const deploymentInfo = {
    contractAddress: contractAddress,
    contractName: tokenName,
    symbol: tokenSymbol,
    network: "hedera-testnet",
    chainId: 296,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    txHash: recToken.deploymentTransaction().hash
  };
  
  const fs = require('fs');
  const path = require('path');
  
  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  // Save deployment info
  fs.writeFileSync(
    path.join(deploymentsDir, 'hedera-testnet.json'),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("💾 Deployment info saved to deployments/hedera-testnet.json");
  
  return {
    recToken: contractAddress,
    deployer: deployer.address
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
