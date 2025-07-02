require("dotenv").config();
const { ethers } = require("ethers");
const contractABI = require("./abi.json");

// Load from .env (use exact key names)
const rpcUrl = process.env.RPC_URL;
const contractAddress = process.env.CONTRACT_ADDRESS;
const privateKey = process.env.PRIVATE_KEY;

if (!rpcUrl || !contractAddress || !privateKey) {
  console.error("❌ Missing required environment variables (RPC_URL, CONTRACT_ADDRESS, PRIVATE_KEY)");
  process.exit(1);
}

const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

let wallet;
try {
  wallet = new ethers.Wallet(privateKey, provider);
  console.log("🛡️ Wallet address:", wallet.address);
} catch (err) {
  console.error("❌ Blockchain connection error (wallet):", err.message);
  process.exit(1);
}

let contract;
try {
  contract = new ethers.Contract(contractAddress, contractABI, wallet);
  console.log("📡 Contract address:", contract.address);
} catch (err) {
  console.error("❌ Blockchain connection error (contract):", err.message);
  process.exit(1);
}

async function addCandidate(name, electionId) {
  if (!contract) {
    throw new Error("Contract is not initialized.");
  }

  try {
    const tx = await contract.addCandidate(name, electionId);
    const receipt = await tx.wait();

    const event = receipt.events.find(e => e.event === "CandidateAdded");
    if (!event) throw new Error("CandidateAdded event not found in transaction receipt.");

    const blockchainId = event.args.id.toNumber();

    return blockchainId;
  } catch (error) {
    console.error("Blockchain addCandidate error:", error);
    throw error;
  }
}

module.exports = {
  contract,
  wallet, 
  provider,
  addCandidateToBlockchain: addCandidate,
};
