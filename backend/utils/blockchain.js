// backend/utils/blockchain.js
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const abiPath = path.join(__dirname, "../blockchain/abi.json");
const contractABI = JSON.parse(fs.readFileSync(abiPath, "utf8"));

// Using ethers version 5 provider
const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, wallet);

console.log("🔧 blockchain.js → provider, wallet, contract initialized");

module.exports = contract;
