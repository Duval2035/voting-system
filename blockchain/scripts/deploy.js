// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("📦 Deploying with:", deployer.address);
  console.log("💰 Balance:", hre.ethers.formatEther(balance), "ETH");

  const Voting = await hre.ethers.getContractFactory("Voting");
  const contract = await Voting.deploy();

  await contract.waitForDeployment(); // Ethers v6 method

  const address = await contract.getAddress(); // Ethers v6
  console.log("✅ Contract deployed to:", address);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});

