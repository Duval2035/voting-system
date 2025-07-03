// backend/blockchain/contractService.js
require("dotenv").config();
const { ethers } = require("ethers");
const contractABI = require("./abi.json");

const rpcUrl = process.env.RPC_URL;
const contractAddress = process.env.CONTRACT_ADDRESS;
const privateKey = process.env.PRIVATE_KEY;

if (!rpcUrl || !contractAddress || !privateKey) {
  console.error("❌ Missing env vars (RPC_URL, CONTRACT_ADDRESS, PRIVATE_KEY)");
  process.exit(1);
}

const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

let wallet;
try {
  wallet = new ethers.Wallet(privateKey, provider);
  console.log("🛡️ Wallet connected:", wallet.address);
} catch (error) {
  console.error("❌ Wallet error:", error.message);
  process.exit(1);
}

let contract;
try {
  contract = new ethers.Contract(contractAddress, contractABI, wallet);
  console.log("📡 Smart contract loaded:", contract.address);
} catch (error) {
  console.error("❌ Contract load error:", error.message);
  process.exit(1);
}

async function addCandidate(name, electionId) {
  if (!contract) throw new Error("Contract not initialized");

  try {
    const tx = await contract.addCandidate(name, electionId);
    const receipt = await tx.wait();

    console.log("🧾 Transaction hash:", receipt.transactionHash);

    const iface = new ethers.utils.Interface(contractABI);
    const parsedEvents = receipt.logs.map(log => {
      try {
        return iface.parseLog(log);
      } catch (err) {
        return null;
      }
    });

    const candidateAddedEvent = parsedEvents.find(e => e && e.name === "CandidateAdded");

    if (!candidateAddedEvent) {
      throw new Error("CandidateAdded event not emitted");
    }

    console.log("✅ CandidateAdded event args:", candidateAddedEvent.args);

    return candidateAddedEvent.args.id.toNumber();
  } catch (error) {
    console.error("❌ Blockchain addCandidate error:", error.message);
    throw error;
  }
}

module.exports = {
  provider,
  wallet,
  contract,
  addCandidateToBlockchain: addCandidate,
};
