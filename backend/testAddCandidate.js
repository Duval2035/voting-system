require("dotenv").config();
const { ethers } = require("ethers");
const contractABI = require("./blockchain/abi.json");

const rpcUrl = process.env.RPC_URL;
const contractAddress = process.env.CONTRACT_ADDRESS;
const privateKey = process.env.PRIVATE_KEY;

const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
const wallet = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

async function main() {
  const admin = await contract.admin();
  console.log("Admin:", admin);
  console.log("Wallet:", wallet.address);
  if (admin.toLowerCase() !== wallet.address.toLowerCase()) {
    console.error("❌ Your wallet is NOT admin! Cannot add candidates.");
    process.exit(1);
  }

  try {
    await contract.callStatic.addCandidate("John Doe", "Election123");

    const tx = await contract.addCandidate("John Doe", "Election123");
    const receipt = await tx.wait();

    console.log("Tx hash:", receipt.transactionHash);

    const eventTopic = contract.interface.getEventTopic("CandidateAdded");
    const logs = receipt.logs.filter(log => log.topics[0] === eventTopic);
    if (logs.length === 0) {
      throw new Error("CandidateAdded event not emitted");
    }
    const parsedEvent = contract.interface.parseLog(logs[0]);
    console.log("Candidate added:", parsedEvent.args);
  } catch (e) {
    console.error("Error adding candidate:", e);
  }
}

main();
