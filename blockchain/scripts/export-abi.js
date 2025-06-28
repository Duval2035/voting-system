const fs = require("fs");
const path = require("path");

const contractJson = require("../artifacts/contracts/Voting.sol/Voting.json");

fs.writeFileSync(
  path.join(__dirname, "../backend/blockchain/abi.json"),
  JSON.stringify(contractJson.abi, null, 2)
);

console.log("✅ ABI exported to backend/blockchain/abi.json");
