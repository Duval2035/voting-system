const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Load ABI
const abiPath = path.join(__dirname, "../blockchain/abi.json");
const contractABI = JSON.parse(fs.readFileSync(abiPath, "utf8"));

// Create provider and wallet
const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Create contract instance
const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  contractABI,
  wallet
);

module.exports = contract;
