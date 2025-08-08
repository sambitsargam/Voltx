const { ethers } = require("hardhat");

async function main() {
  console.log("\n🚀 Starting Enhanced Voltx REC Token Deployment...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deploying with account:", deployer.address);
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
  
  if (balance === 0n) {
    throw new Error("❌ Deployer account has no ETH balance!");
  }

  console.log("\n📋 Contract Details:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  try {
    // Deploy the enhanced contract
    console.log("📦 Deploying EnhancedRECToken...");
    const EnhancedRECToken = await ethers.getContractFactory("EnhancedRECToken");
    const recToken = await EnhancedRECToken.deploy();
    
    console.log("⏳ Waiting for deployment confirmation...");
    await recToken.waitForDeployment();
    
    const contractAddress = await recToken.getAddress();
    console.log("✅ EnhancedRECToken deployed to:", contractAddress);

    // Verify initial state
    console.log("\n🔍 Verifying Initial State:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    const name = await recToken.name();
    const symbol = await recToken.symbol();
    const totalSupply = await recToken.totalSupply();
    const decimals = await recToken.decimals();
    const owner = await recToken.owner();
    const facilityCount = await recToken.getFacilityCount();
    const transactionCount = await recToken.getTransactionCount();
    const tokenPrice = await recToken.getTokenPrice();
    const tradingEnabled = await recToken.isTradingEnabled();
    
    console.log("📛 Token Name:", name);
    console.log("🔤 Token Symbol:", symbol);
    console.log("🔢 Decimals:", decimals);
    console.log("📊 Total Supply:", ethers.formatEther(totalSupply), symbol);
    console.log("👑 Contract Owner:", owner);
    console.log("🏭 Initial Facilities:", facilityCount.toString());
    console.log("📜 Transaction Count:", transactionCount.toString());
    console.log("💲 Token Price:", ethers.formatEther(tokenPrice), "ETH");
    console.log("🔄 Trading Enabled:", tradingEnabled);

    // Test facility registration
    console.log("\n🏭 Registering Sample Facilities...");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    // Register a sample solar facility
    const tx1 = await recToken.registerFacility(
      "SOLAR-001",
      "Sunrise Solar Farm",
      "California, USA",
      "Solar",
      ethers.parseUnits("1000", 0) // 1000 kW capacity
    );
    await tx1.wait();
    console.log("✅ Registered Solar Facility: SOLAR-001");

    // Register a wind facility
    const tx2 = await recToken.registerFacility(
      "WIND-001", 
      "Coastal Wind Farm",
      "Texas, USA",
      "Wind",
      ethers.parseUnits("2500", 0) // 2500 kW capacity
    );
    await tx2.wait();
    console.log("✅ Registered Wind Facility: WIND-001");

    // Register a hydro facility
    const tx3 = await recToken.registerFacility(
      "HYDRO-001",
      "Mountain River Hydro",
      "Colorado, USA", 
      "Hydro",
      ethers.parseUnits("500", 0) // 500 kW capacity
    );
    await tx3.wait();
    console.log("✅ Registered Hydro Facility: HYDRO-001");

    // Mint some tokens from facilities
    console.log("\n🪙 Minting Tokens from Facilities...");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const mintAmount = ethers.parseEther("1000"); // 1000 VREC tokens
    
    // Mint from solar facility
    const mintTx1 = await recToken.mintFromFacility(
      deployer.address,
      mintAmount,
      "SOLAR-001",
      "Q1 2025 Solar Generation"
    );
    await mintTx1.wait();
    console.log("✅ Minted 1000 VREC from Solar Facility");

    // Mint from wind facility
    const mintTx2 = await recToken.mintFromFacility(
      deployer.address,
      ethers.parseEther("1500"),
      "WIND-001", 
      "Q1 2025 Wind Generation"
    );
    await mintTx2.wait();
    console.log("✅ Minted 1500 VREC from Wind Facility");

    // Test token retirement
    console.log("\n♻️ Testing Token Retirement...");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const retireTx = await recToken.retireTokens(
      ethers.parseEther("100"),
      "Corporate sustainability offset"
    );
    await retireTx.wait();
    console.log("✅ Retired 100 VREC tokens");

    // Final state check
    console.log("\n📊 Final Contract State:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    const finalSupply = await recToken.totalSupply();
    const finalFacilityCount = await recToken.getFacilityCount();
    const finalTransactionCount = await recToken.getTransactionCount();
    const totalRetired = await recToken.getTotalRetired();
    const deployerBalance = await recToken.balanceOf(deployer.address);
    
    console.log("📊 Final Total Supply:", ethers.formatEther(finalSupply), symbol);
    console.log("🏭 Total Facilities:", finalFacilityCount.toString());
    console.log("📜 Total Transactions:", finalTransactionCount.toString());
    console.log("♻️ Total Retired:", ethers.formatEther(totalRetired), symbol);
    console.log("💼 Deployer Balance:", ethers.formatEther(deployerBalance), symbol);

    // Output environment variables
    console.log("\n🔧 Environment Variables:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
    console.log("NEXT_PUBLIC_CHAIN_ID=296");
    console.log("NEXT_PUBLIC_RPC_URL=https://testnet.hashio.io/api");

    console.log("\n🎉 Enhanced Deployment Complete!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ Contract Address:", contractAddress);
    console.log("🌐 Network: Hedera Testnet (296)");
    console.log("📱 Frontend URL: http://localhost:3000");
    console.log("🔗 Explorer: https://hashscan.io/testnet/contract/" + contractAddress);

  } catch (error) {
    console.error("\n❌ Deployment Error:", error.message);
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    if (error.message.includes("insufficient funds")) {
      console.error("💡 Solution: Add more HBAR to your account");
      console.error("🔗 Get testnet HBAR: https://portal.hedera.com");
    }
    
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Fatal Error:", error);
    process.exit(1);
  });
