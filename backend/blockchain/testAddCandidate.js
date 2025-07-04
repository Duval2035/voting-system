// testAddCandidate.js
const { addCandidateToBlockchain } = require("./services/blockchainService");

(async () => {
  try {
    const candidateId = await addCandidateToBlockchain("Alice Blockchain", "68645fdba0fb4f359cbe9b7f");
    console.log("✅ Candidate added with ID:", candidateId);
  } catch (e) {
    console.error("❌ Failed to add candidate:", e);
  }
})();
