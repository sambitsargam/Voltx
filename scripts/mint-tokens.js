const { ethers } = require("hardhat");

async function main() {
  console.log("🪙 Minting 10,000 VREC tokens...\n");
  
  const contractAddress = "0x2c0e28933b35b59DC51470f7729d97BCFdF5915c";
  const recipientAddress = "0xeA49dD5CC1032597C2B9E6576FF6140A7aa5bB73";
  const amount = ethers.parseEther("10000"); // 10,000 VREC tokens
  
  const RECToken = await ethers.getContractFactory("RECToken");
  const recToken = RECToken.attach(contractAddress);
  
  const [deployer] = await ethers.getSigners();
  
  try {
    console.log("📊 Before Minting:");
    console.log("==================");
    console.log(`Recipient: ${recipientAddress}`);
    
    // Check current balance
    const currentBalance = await recToken.balanceOf(recipientAddress);
    console.log(`Current Balance: ${ethers.formatEther(currentBalance)} VREC`);
    
    // Check total supply
    const totalSupplyBefore = await recToken.totalSupply();
    console.log(`Total Supply Before: ${ethers.formatEther(totalSupplyBefore)} VREC`);
    
    // Mint tokens
    console.log("\n⚡ Minting 10,000 VREC tokens...");
    console.log(`To Address: ${recipientAddress}`);
    console.log(`Facility: SOLAR-001`);
    
    const mintTx = await recToken.mintREC(
      recipientAddress,
      amount,
      "SOLAR-001",
      Math.floor(Date.now() / 1000) - 86400 // Yesterday's timestamp
    );
    
    console.log(`Transaction Hash: ${mintTx.hash}`);
    console.log("⏳ Waiting for confirmation...");
    
    const receipt = await mintTx.wait();
    console.log(`✅ Transaction confirmed in block: ${receipt.blockNumber}`);
    
    // Check new balance
    console.log("\n📊 After Minting:");
    console.log("=================");
    const newBalance = await recToken.balanceOf(recipientAddress);
    const totalSupplyAfter = await recToken.totalSupply();
    
    console.log(`New Balance: ${ethers.formatEther(newBalance)} VREC`);
    console.log(`Total Supply After: ${ethers.formatEther(totalSupplyAfter)} VREC`);
    console.log(`Tokens Minted: ${ethers.formatEther(amount)} VREC`);
    
    console.log("\n🎉 Successfully minted 10,000 VREC tokens!");
    console.log(`🔗 View transaction: https://hashscan.io/testnet/transaction/${mintTx.hash}`);
    console.log(`👤 View recipient account: https://hashscan.io/testnet/account/${recipientAddress}`);
    
  } catch (error) {
    console.error("❌ Error minting tokens:", error.message);
    
    // Check if it's a known error
    if (error.message.includes("UnregisteredFacility")) {
      console.log("\n💡 Note: Make sure the facility 'SOLAR-001' is registered.");
    } else if (error.message.includes("Ownable")) {
      console.log("\n💡 Note: Only the contract owner can mint tokens.");
    }
    
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
