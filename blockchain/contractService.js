const { ethers } = require("ethers");
const contractABI = require("./abi.json");
const { contractAddress, contractABI } = require("./contractInfo");

// Connect to the local Hardhat blockchain
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

// Use the first private key from Hardhat (Account #0)
const signer = new ethers.Wallet(
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // Account #0 private key
  provider
);

// Connect the contract with the signer
const contract = new ethers.Contract(contractAddress, contractABI, signer);

// ✅ Add a candidate
async function addCandidate(name) {
  try {
    const tx = await contract.addCandidate(name);
    await tx.wait();
    console.log(`✅ Candidate added: ${name}`);
  } catch (err) {
    console.error("❌ Error adding candidate:", err.message);
  }
}

// ✅ Get all candidates
async function getCandidates() {
  try {
    const count = await contract.getCandidateCount();
    const candidates = [];
    for (let i = 0; i < count; i++) {
      const candidate = await contract.candidates(i);
      candidates.push({
        id: i,
        name: candidate.name,
        voteCount: candidate.voteCount.toString(),
      });
    }
    return candidates;
  } catch (err) {
    console.error("❌ Error getting candidates:", err.message);
    return [];
  }
}

// ✅ Vote for a candidate
async function vote(candidateId) {
  try {
    const tx = await contract.vote(candidateId);
    await tx.wait();
    console.log(`🗳️ Voted for candidate ID: ${candidateId}`);
  } catch (err) {
    console.error("❌ Error voting:", err.message);
  }
}

module.exports = {
  addCandidate,
  getCandidates,
  vote,
};
