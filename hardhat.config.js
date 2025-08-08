require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hedera: {
      url: "https://testnet.hashio.io/api",
      chainId: 296, // 0x128
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gas: 30000000,
      gasPrice: 50000000000, // 50 gwei
      timeout: 60000,
    },
    hardhat: {
      chainId: 1337,
    },
  },
  etherscan: {
    apiKey: {
      hedera: "your-api-key-here", // Placeholder for future use
    },
    customChains: [
      {
        network: "hedera",
        chainId: 296,
        urls: {
          apiURL: "https://server-verify.hashscan.io",
          browserURL: "https://hashscan.io/testnet"
        }
      }
    ]
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 60000
  }
};
