const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

// Load ABI
const abiPath = path.join(__dirname, "abi.json");
const abi = JSON.parse(fs.readFileSync(abiPath, "utf8"));

// Setup provider and wallet
const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
const privateKey = "0xde9be858da4a475276426320d5e9262ecfc3ba460bfac56360bfa6c4c28b4ee0"; // <-- Replace with your private key
const wallet = new ethers.Wallet(privateKey, provider);

// Contract address (replace with your deployed contract address)
const contractAddress = "0x9Cf55a18fd221501013A84813DE220f3B7ED7D62";

const contract = new ethers.Contract(contractAddress, abi, wallet);

async function addCandidate(name, electionId) {
  try {
    const tx = await contract.addCandidate(name, electionId);
    const receipt = await tx.wait();

    const event = receipt.events.find((e) => e.event === "CandidateAdded");
    if (!event) throw new Error("CandidateAdded event not found");

    const blockchainId = event.args[0].toNumber();
    console.log(`✅ Candidate added: ${name} to election ${electionId} with blockchainId ${blockchainId}`);

    return blockchainId;
  } catch (err) {
    console.error("❌ Error adding candidate:", err);
    throw err;
  }
}

module.exports = {
  contract,
  addCandidate,
};

