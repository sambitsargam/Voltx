const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing deployed RECToken contract...\n");
  
  // Contract address from deployment
  const contractAddress = "0x2c0e28933b35b59DC51470f7729d97BCFdF5915c";
  
  // Get the contract instance
  const RECToken = await ethers.getContractFactory("RECToken");
  const recToken = RECToken.attach(contractAddress);
  
  try {
    // Test basic contract info
    console.log("📊 Contract Information:");
    console.log("========================");
    const name = await recToken.name();
    const symbol = await recToken.symbol();
    const decimals = await recToken.decimals();
    const totalSupply = await recToken.totalSupply();
    const owner = await recToken.owner();
    
    console.log(`Name: ${name}`);
    console.log(`Symbol: ${symbol}`);
    console.log(`Decimals: ${decimals}`);
    console.log(`Total Supply: ${ethers.formatEther(totalSupply)} VREC`);
    console.log(`Owner: ${owner}`);
    
    // Test facility information
    console.log("\n🏭 Facility Information:");
    console.log("========================");
    const facilityCount = await recToken.getFacilityCount();
    console.log(`Registered Facilities: ${facilityCount}`);
    
    if (facilityCount > 0) {
      // Get facility details - the contract returns facility IDs, not full structs
      try {
        const facilityId = await recToken.registeredFacilities(0);
        console.log(`Facility 0 ID: ${facilityId}`);
        console.log(`  (Note: Facility details are stored in mapping by ID)`);
      } catch (err) {
        console.log(`  Could not retrieve facility details: ${err.message}`);
      }
    }
    
    // Test balance of deployer
    console.log("\n💰 Token Balances:");
    console.log("==================");
    const [deployer] = await ethers.getSigners();
    const balance = await recToken.balanceOf(deployer.address);
    console.log(`Deployer Balance: ${ethers.formatEther(balance)} VREC`);
    
    // Test contract state
    console.log("\n⚙️ Contract State:");
    console.log("==================");
    const isPaused = await recToken.paused();
    console.log(`Contract Paused: ${isPaused}`);
    
    console.log("\n✅ All tests completed successfully!");
    console.log(`🔗 View on HashScan: https://hashscan.io/testnet/contract/${contractAddress}`);
    
  } catch (error) {
    console.error("❌ Error testing contract:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
