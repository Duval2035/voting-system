require("dotenv").config();
const { ethers } = require("ethers");
const contractABI = require("./abi.json");
const logger = require("../utils/logger");

const rpcUrl = process.env.RPC_URL;
const contractAddress = process.env.CONTRACT_ADDRESS;
const privateKey = process.env.PRIVATE_KEY;

if (!rpcUrl || !contractAddress || !privateKey) {
  logger.error("Missing .env variables: RPC_URL, CONTRACT_ADDRESS, PRIVATE_KEY");
  process.exit(1);
}

const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
const wallet = new ethers.Wallet(privateKey, provider);
logger.info("Wallet connected: %s", wallet.address);

const contract = new ethers.Contract(contractAddress, contractABI, wallet);
logger.info("Smart contract connected: %s", contract.address);

async function isAdmin() {
  try {
    const adminAddress = await contract.admin();
    return adminAddress.toLowerCase() === wallet.address.toLowerCase();
  } catch (err) {
    logger.error("Error fetching admin: %s", err.message);
    return false;
  }
}

async function addCandidateToBlockchain(name, electionId) {
  if (!name || !electionId) throw new Error("Name and electionId are required");

  const adminCheck = await isAdmin();
  if (!adminCheck) throw new Error(`Wallet ${wallet.address} is NOT the admin`);

  try {
    logger.info("Validating addCandidate with callStatic...");
    await contract.callStatic.addCandidate(name, electionId);

    logger.info("Sending addCandidate transaction...");
    const tx = await contract.addCandidate(name, electionId);
    const receipt = await tx.wait();
    logger.info("Mined addCandidate TX: %s", receipt.transactionHash);

    const event = receipt.events.find((e) => e.event === "CandidateAdded");
    if (!event) throw new Error("CandidateAdded event not found");

    logger.info("Candidate added with ID: %d", event.args.id.toNumber());
    return event.args.id.toNumber();
  } catch (err) {
    logger.error("Blockchain error in addCandidate: %s", err.message);
    throw err;
  }
}

// IMPORTANT: voterPrivateKey MUST be provided by the caller securely
async function voteOnBlockchain(candidateId, electionId, voterPrivateKey) {
  if (!candidateId || !electionId || !voterPrivateKey) {
    throw new Error("Missing required vote parameters.");
  }

  const tempWallet = new ethers.Wallet(voterPrivateKey, provider);
  const tempContract = new ethers.Contract(contractAddress, contractABI, tempWallet);

  try {
    logger.info("Voting on blockchain with voter wallet %s", tempWallet.address);
    const tx = await tempContract.vote(electionId, candidateId);
    return tx; // Caller should await tx.wait()
  } catch (err) {
    logger.error("Blockchain voting error: %s", err.message);
    throw err;
  }
}

module.exports = {
  provider,
  wallet,
  contract,
  isAdmin,
  addCandidateToBlockchain,
  voteOnBlockchain,
};
