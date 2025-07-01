import { ethers } from "ethers";
const Voting = await ethers.getContractFactory("Voting");
const voting = await Voting.attach("0xYourDeployedContractAddress");
(await voting.getCandidatesCount()).toString();
// ✅ Use the updated deployed contract address
const contractAddress = "0x9Cf55a18fd221501013A84813DE220f3B7ED7D62";

// ✅ ABI must match the full Voting.sol with all updated params
const contractABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "_name", "type": "string" },
      { "internalType": "string", "name": "_position", "type": "string" },
      { "internalType": "string", "name": "_bio", "type": "string" },
      { "internalType": "string", "name": "_electionId", "type": "string" }
    ],
    "name": "addCandidate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_candidateId", "type": "uint256" }
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCandidatesCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_id", "type": "uint256" }],
    "name": "getCandidate",
    "outputs": [
      { "internalType": "uint256", "name": "id", "type": "uint256" },
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "string", "name": "position", "type": "string" },
      { "internalType": "string", "name": "bio", "type": "string" },
      { "internalType": "uint256", "name": "voteCount", "type": "uint256" },
      { "internalType": "string", "name": "electionId", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// ✅ Connect to the smart contract
export const getVotingContract = async () => {
  if (!window.ethereum) {
    throw new Error("🦊 MetaMask not detected. Please install MetaMask.");
  }

  await window.ethereum.request({ method: "eth_requestAccounts" });

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  return new ethers.Contract(contractAddress, contractABI, signer);
};

// ✅ Fetch all candidates using getCandidate
export const getCandidates = async () => {
  const contract = await getVotingContract();
  const count = await contract.getCandidatesCount();
  const candidates = [];

  for (let i = 1; i <= count; i++) {
    const c = await contract.getCandidate(i);
    candidates.push({
      id: c.id.toString(),
      name: c.name,
      position: c.position,
      bio: c.bio,
      voteCount: c.voteCount.toString(),
      electionId: c.electionId
    });
  }

  return candidates;
};
