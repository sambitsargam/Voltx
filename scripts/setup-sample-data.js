const { ethers } = require("hardhat");

async function main() {
  console.log("🌱 Setting up sample data for Voltx...");
  
  // Load deployment info
  const fs = require('fs');
  const path = require('path');
  
  try {
    const deploymentPath = path.join(__dirname, '..', 'deployments', 'hedera-testnet.json');
    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    
    const [deployer, addr1, addr2] = await ethers.getSigners();
    const RECToken = await ethers.getContractFactory("RECToken");
    const recToken = RECToken.attach(deploymentInfo.contractAddress);
    
    console.log("📍 Using contract at:", deploymentInfo.contractAddress);
    console.log("👤 Deployer:", deployer.address);
    
    // Register additional facilities
    const facilities = [
      { id: "WIND-001", owner: deployer.address, type: "wind" },
      { id: "HYDRO-001", owner: deployer.address, type: "hydro" },
      { id: "SOLAR-002", owner: deployer.address, type: "solar" }
    ];
    
    for (const facility of facilities) {
      try {
        console.log(`⏳ Registering facility ${facility.id}...`);
        const tx = await recToken.registerFacility(facility.id, facility.owner, facility.type);
        await tx.wait();
        console.log(`✅ Registered ${facility.id}`);
      } catch (error) {
        if (error.message.includes("already registered")) {
          console.log(`⚠️  Facility ${facility.id} already registered`);
        } else {
          console.error(`❌ Failed to register ${facility.id}:`, error.message);
        }
      }
    }
    
    // Mint some sample RECs
    const mintData = [
      { facility: "SOLAR-001", amount: 150 },
      { facility: "WIND-001", amount: 200 },
      { facility: "HYDRO-001", amount: 100 },
      { facility: "SOLAR-002", amount: 75 }
    ];
    
    for (const mint of mintData) {
      try {
        console.log(`⏳ Minting ${mint.amount} RECs from ${mint.facility}...`);
        const generationDate = Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 86400 * 7); // Random date in last week
        const tx = await recToken.mintREC(deployer.address, mint.amount, mint.facility, generationDate);
        await tx.wait();
        console.log(`✅ Minted ${mint.amount} RECs from ${mint.facility}`);
      } catch (error) {
        console.error(`❌ Failed to mint from ${mint.facility}:`, error.message);
      }
    }
    
    // Show final balances
    const balance = await recToken.balanceOf(deployer.address);
    const totalSupply = await recToken.totalSupply();
    const facilityCount = await recToken.getFacilityCount();
    
    console.log("\n📊 Final Status:");
    console.log("Your VREC Balance:", ethers.formatEther(balance));
    console.log("Total Supply:", ethers.formatEther(totalSupply));
    console.log("Registered Facilities:", facilityCount.toString());
    
    console.log("\n🎉 Sample data setup completed!");
    console.log("🔗 View on HashScan:", `https://hashscan.io/testnet/contract/${deploymentInfo.contractAddress}`);
    
  } catch (error) {
    console.error("❌ Failed to setup sample data:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
