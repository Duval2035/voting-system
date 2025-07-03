const express = require("express");
const router = express.Router();
const { Wallet, Contract } = require("ethers");
const { JsonRpcProvider } = require("@ethersproject/providers");
require("dotenv").config();

const provider = new JsonRpcProvider(process.env.RPC_URL);
const wallet = new Wallet(process.env.PRIVATE_KEY, provider);
const contractAddress = process.env.CONTRACT_ADDRESS;

const contractABI = [
  {
    inputs: [{ internalType: "string", name: "_name", type: "string" }],
    name: "addCandidate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_candidateId", type: "uint256" }],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "candidatesCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "candidates",
    outputs: [
      { internalType: "uint256", name: "id", type: "uint256" },
      { internalType: "string", name: "name", type: "string" },
      { internalType: "uint256", name: "voteCount", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const contract = new Contract(contractAddress, contractABI, wallet);

// Add a new candidate
router.post("/add-candidate", async (req, res) => {
  try {
    const { name } = req.body;
    if (typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({ message: "Candidate name is required and must be a string." });
    }

    const tx = await contract.addCandidate(name);
    await tx.wait();

    res.json({ message: `✅ Candidate '${name}' added.`, txHash: tx.hash });
  } catch (err) {
    console.error("❌ Error adding candidate:", err);
    res.status(500).json({ message: "Error adding candidate." });
  }
});

// Cast a vote
router.post("/vote", async (req, res) => {
  try {
    const { candidateId } = req.body;
    if (typeof candidateId !== "number" || candidateId < 0) {
      return res.status(400).json({ message: "Candidate ID must be a non-negative number." });
    }

    const tx = await contract.vote(candidateId);
    await tx.wait();

    res.json({ message: `✅ Voted for candidate ID ${candidateId}`, txHash: tx.hash });
  } catch (err) {
    console.error("❌ Error casting vote:", err);
    res.status(500).json({ message: "Error casting vote." });
  }
});

// Get total number of candidates
router.get("/candidates-count", async (req, res) => {
  try {
    const count = await contract.candidatesCount();
    res.json({ count: count.toString() });
  } catch (err) {
    console.error("❌ Error getting count:", err);
    res.status(500).json({ message: "Error getting candidate count." });
  }
});

// Get all candidates
router.get("/candidates", async (req, res) => {
  try {
    const count = await contract.candidatesCount();
    const candidates = [];

    for (let i = 1; i <= count; i++) {
      const candidate = await contract.candidates(i);
      candidates.push({
        id: candidate.id.toString(),
        name: candidate.name,
        voteCount: candidate.voteCount.toString(),
      });
    }

    res.json({ candidates });
  } catch (err) {
    console.error("❌ Error fetching candidates:", err);
    res.status(500).json({ message: "Error fetching candidates." });
  }
});

module.exports = router;
