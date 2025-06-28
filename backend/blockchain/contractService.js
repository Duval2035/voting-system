// backend/blockchain/contractService.js
const { ethers } = require("ethers");
const abi = require("./abi.json");

// ✅ Use your correct deployer's private key
const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

const wallet = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(contractAddress, abi, wallet);

// Optional: helper function to access signer if needed
const getContract = async () => {
  try {
    const signerAddress = await wallet.getAddress();
    console.log("🧾 Backend signer address:", signerAddress);
    return contract;
  } catch (err) {
    console.error("❌ Blockchain connection error:", err);
    throw err;
  }
};

module.exports = {
  contract,
  wallet,
  getContract,
};
