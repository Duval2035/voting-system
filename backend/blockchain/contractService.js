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

/**
 * Check if current wallet is admin
 */
async function isAdmin() {
  try {
    const adminAddress = await contract.admin();
    return adminAddress.toLowerCase() === wallet.address.toLowerCase();
  } catch (error) {
    console.error("❌ Error fetching admin from contract:", error.message);
    return false;
  }
}

/**
 * Add candidate to blockchain, verify CandidateAdded event and return blockchain ID
 */
async function addCandidateToBlockchain(name, electionId) {
  if (!contract) throw new Error("Contract not initialized");

  const isAdminUser = await isAdmin();
  if (!isAdminUser) {
    throw new Error(`Wallet ${wallet.address} is NOT admin. Cannot add candidate.`);
  }

  try {
    // Simulate to check for reverts
    await contract.callStatic.addCandidate(name, electionId);

    const tx = await contract.addCandidate(name, electionId);
    const receipt = await tx.wait();

    console.log("🧾 Transaction hash:", receipt.transactionHash);

    const eventTopic = contract.interface.getEventTopic("CandidateAdded");

    const matchingLogs = receipt.logs.filter(
      (log) => log.topics[0] === eventTopic
    );

    if (matchingLogs.length === 0) {
      console.error("❌ CandidateAdded event not found in logs");
      throw new Error("CandidateAdded event not emitted");
    }

    const parsedEvent = contract.interface.parseLog(matchingLogs[0]);

    console.log("✅ CandidateAdded event args:", parsedEvent.args);

    const blockchainId = parsedEvent.args.id.toNumber();
    return blockchainId;
  } catch (error) {
    console.error("❌ Blockchain addCandidate error:", error.message);
    throw error;
  }
}

(async () => {
  try {
    const adminAddress = await contract.admin();
    console.log("👮 Admin on chain: ", adminAddress);
    console.log("🔐 Your wallet:    ", wallet.address);
    console.log(
      adminAddress.toLowerCase() === wallet.address.toLowerCase()
        ? "✅ Wallet IS admin"
        : "❌ Wallet is NOT admin"
    );
  } catch (err) {
    console.error("❌ Failed to fetch admin:", err.message);
  }
})();

module.exports = {
  provider,
  wallet,
  contract,
  addCandidateToBlockchain,
};

