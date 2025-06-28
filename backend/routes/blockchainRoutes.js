const express = require("express");
const { ethers } = require("ethers");

const router = express.Router();

// Replace with your deployed contract address
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

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
];

// Example route: add a candidate
router.post("/add-candidate", async (req, res) => {
  try {
    const { name } = req.body;

    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545"); // Local Hardhat node
    const signer = await provider.getSigner(); // Account #0 from hardhat

    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    const tx = await contract.addCandidate(name);
    await tx.wait();

    res.json({ message: `✅ Candidate "${name}" added.` });
  } catch (err) {
    console.error("❌ Error adding candidate:", err);
    res.status(500).json({ message: "Failed to add candidate." });
  }
});

// Example route: vote for a candidate
router.post("/vote", async (req, res) => {
  try {
    const { candidateId } = req.body;

    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    const tx = await contract.vote(candidateId);
    await tx.wait();

    res.json({ message: `✅ Voted for candidate ID ${candidateId}` });
  } catch (err) {
    console.error("❌ Error voting:", err);
    res.status(500).json({ message: "Failed to vote." });
  }
});

module.exports = router;
