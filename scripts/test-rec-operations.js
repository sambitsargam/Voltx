const { ethers } = require("hardhat");

async function main() {
  console.log("🔄 Testing REC minting and retirement functionality...\n");
  
  const contractAddress = "0x2c0e28933b35b59DC51470f7729d97BCFdF5915c";
  const RECToken = await ethers.getContractFactory("RECToken");
  const recToken = RECToken.attach(contractAddress);
  
  const [deployer] = await ethers.getSigners();
  
  try {
    console.log("📊 Initial State:");
    console.log("=================");
    const initialBalance = await recToken.balanceOf(deployer.address);
    const initialRetired = await recToken.getRetiredBalance(deployer.address);
    console.log(`Balance: ${ethers.formatEther(initialBalance)} VREC`);
    console.log(`Retired: ${ethers.formatEther(initialRetired)} VREC`);
    
    // Mint additional RECs
    console.log("\n⚡ Minting 50 more RECs...");
    const mintTx = await recToken.mintREC(
      deployer.address,
      ethers.parseEther("50"),
      "SOLAR-001",
      Math.floor(Date.now() / 1000) - 86400 // Yesterday
    );
    await mintTx.wait();
    console.log("✅ Minting successful!");
    
    // Check new balance
    const newBalance = await recToken.balanceOf(deployer.address);
    console.log(`New Balance: ${ethers.formatEther(newBalance)} VREC`);
    
    // Retire some RECs
    console.log("\n♻️ Retiring 25 RECs...");
    const retireTx = await recToken.retireREC(
      ethers.parseEther("25"),
      "Carbon offset for EV charging stations"
    );
    await retireTx.wait();
    console.log("✅ Retirement successful!");
    
    // Check final balances
    console.log("\n📊 Final State:");
    console.log("================");
    const finalBalance = await recToken.balanceOf(deployer.address);
    const finalRetired = await recToken.getRetiredBalance(deployer.address);
    const totalSupply = await recToken.totalSupply();
    
    console.log(`Active Balance: ${ethers.formatEther(finalBalance)} VREC`);
    console.log(`Retired Balance: ${ethers.formatEther(finalRetired)} VREC`);
    console.log(`Total Supply: ${ethers.formatEther(totalSupply)} VREC`);
    
    console.log("\n✅ All REC operations completed successfully!");
    console.log(`🔗 View transactions on HashScan: https://hashscan.io/testnet/account/${deployer.address}`);
    
  } catch (error) {
    console.error("❌ Error during REC operations:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
