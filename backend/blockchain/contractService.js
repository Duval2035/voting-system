// backend/blockchain/contractService.js
const { ethers } = require("ethers");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "./.env") }); // load .env inside blockchain folder

const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const contractAddress = process.env.CONTRACT_ADDRESS;

if (!ethers.utils.isAddress(contractAddress)) {
  throw new Error("Invalid contract address in .env");
}

const abi = require("./abi.json");

const contract = new ethers.Contract(contractAddress, abi, wallet);

(async () => {
  try {
    const network = await provider.getNetwork();
    console.log(`🔗 Connected to network: ${network.name} (chainId: ${network.chainId})`);

    const walletAddress = await wallet.getAddress();
    console.log(`🔐 Wallet address: ${walletAddress}`);

    // You can add additional contract checks here if needed
  } catch (err) {
    console.error("❌ Blockchain initialization error:", err);
  }
})();

module.exports = { provider, wallet, contract };
