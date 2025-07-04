require("dotenv").config();
const { ethers } = require("ethers");
const contractABI = require("./abi.json");

const rpcUrl = process.env.RPC_URL;
const contractAddress = process.env.CONTRACT_ADDRESS;
const privateKey = process.env.PRIVATE_KEY;

if (!rpcUrl || !contractAddress || !privateKey) {
  console.error("❌ Missing .env variables: RPC_URL, CONTRACT_ADDRESS, PRIVATE_KEY");
  process.exit(1);
}

const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
const wallet = new ethers.Wallet(privateKey, provider);
console.log("🛡️ Wallet connected:", wallet.address);

const contract = new ethers.Contract(contractAddress, contractABI, wallet);
console.log("📡 Smart contract connected:", contract.address);

async function isAdmin() {
  try {
    const adminAddress = await contract.admin();
    return adminAddress.toLowerCase() === wallet.address.toLowerCase();
  } catch (err) {
    console.error("❌ Error fetching admin:", err.message);
    return false;
  }
}

async function addCandidateToBlockchain(name, electionId) {
  if (!name || !electionId) {
    throw new Error("Name and electionId are required");
  }

  const adminCheck = await isAdmin();
  if (!adminCheck) {
    throw new Error(`🚫 Wallet ${wallet.address} is NOT the admin`);
  }

  try {
    console.log("🚀 Validating with callStatic...");
    await contract.callStatic.addCandidate(name, electionId);

    console.log("📝 Sending transaction...");
    const tx = await contract.addCandidate(name, electionId);
    const receipt = await tx.wait();
    console.log("✅ Mined TX:", receipt.transactionHash);

    const event = receipt.events.find(e => e.event === "CandidateAdded");
    if (!event) throw new Error("❌ CandidateAdded event not found");

    console.log("📦 Candidate added with ID:", event.args.id.toNumber());
    return event.args.id.toNumber();
  } catch (err) {
    console.error("❌ Blockchain error:", err.message);
    throw err;
  }
}

module.exports = {
  provider,
  wallet,
  contract,
  isAdmin,
  addCandidateToBlockchain,
};
