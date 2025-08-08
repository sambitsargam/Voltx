const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Interacting with deployed Voltx REC Token...");
  
  // Load deployment info
  const fs = require('fs');
  const path = require('path');
  
  try {
    const deploymentPath = path.join(__dirname, '..', 'deployments', 'hedera-testnet.json');
    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    
    console.log("📍 Contract Address:", deploymentInfo.contractAddress);
    
    const [deployer] = await ethers.getSigners();
    const RECToken = await ethers.getContractFactory("RECToken");
    const recToken = RECToken.attach(deploymentInfo.contractAddress);
    
    // Get contract info
    console.log("\n📊 Contract Information:");
    console.log("Name:", await recToken.name());
    console.log("Symbol:", await recToken.symbol());
    console.log("Total Supply:", ethers.formatEther(await recToken.totalSupply()));
    console.log("Total Retired:", ethers.formatEther(await recToken.totalRetired()));
    console.log("Owner:", await recToken.owner());
    console.log("Paused:", await recToken.paused());
    
    // Get deployer balance
    const balance = await recToken.balanceOf(deployer.address);
    const retiredBalance = await recToken.getRetiredBalance(deployer.address);
    
    console.log("\n💰 Your Balances:");
    console.log("VREC Balance:", ethers.formatEther(balance));
    console.log("Retired Balance:", ethers.formatEther(retiredBalance));
    
    // Get facility count
    const facilityCount = await recToken.getFacilityCount();
    console.log("\n🏭 Facilities:");
    console.log("Total Registered:", facilityCount.toString());
    
    // If there are facilities, show the first one
    if (facilityCount > 0) {
      try {
        const facility = await recToken.getFacility("SOLAR-001");
        console.log("\nSample Facility (SOLAR-001):");
        console.log("Owner:", facility[1]);
        console.log("Type:", facility[2]);
        console.log("Active:", facility[3]);
        console.log("Total Generated:", facility[4].toString(), "MWh");
      } catch (err) {
        console.log("Could not fetch sample facility");
      }
    }
    
    console.log("\n✅ Contract interaction completed!");
    
  } catch (error) {
    console.error("❌ Failed to read deployment info:", error.message);
    console.log("📝 Make sure to deploy the contract first with: npm run deploy");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
