exports.getBlockchainResultsByElection = async (req, res) => {
  const { electionId } = req.params;
  try {
    const contract = global.contract;
    if (!contract) throw new Error("Contract not initialized");

    const total = await contract.getCandidatesCountForElection(electionId); // Assume this method exists
    const results = [];

    for (let i = 0; i < total; i++) {
      const [id, name, eId, voteCount] = await contract.getCandidateByElection(electionId, i);
      results.push({
        _id: id.toString(),
        name,
        voteCount: voteCount.toString(),
        position: "Candidate",
        image: "/default-user.png",
      });
    }

    res.status(200).json(results);
  } catch (err) {
    console.error("❌ Blockchain results fetch error:", err);
    res.status(500).json({ message: "Failed to fetch blockchain results" });
  }
};
