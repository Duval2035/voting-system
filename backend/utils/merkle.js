// backend/utils/merkle.js
const crypto = require("crypto");

function hash(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function computeMerkleRoot(hashes) {
  if (hashes.length === 0) return null;
  if (hashes.length === 1) return hashes[0];

  while (hashes.length > 1) {
    const temp = [];
    for (let i = 0; i < hashes.length; i += 2) {
      const left = hashes[i];
      const right = hashes[i + 1] || left;
      const combinedHash = hash(left + right);
      temp.push(combinedHash);
    }
    hashes = temp;
  }

  return hashes[0];
}

module.exports = { computeMerkleRoot };
module.exports = { hash, computeMerkleRoot };