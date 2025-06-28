const { addCandidate, getCandidates, vote } = require("./contractService");

async function main() {
  await addCandidate("Alice");
  await delay(3000); // 👈 Give time to mine before next tx

  await addCandidate("Bob");
  await delay(3000);

  const candidates = await getCandidates();
  console.log("🧾 Candidates:", candidates);

  if (candidates.length > 0) {
    await vote(candidates[0].id); // vote for first candidate
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main();
