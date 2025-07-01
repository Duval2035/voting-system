import React from "react";
import { getVotingContract } from "../blockchain/votingContract";

const VoteButton = ({ candidateId }) => {
  const vote = async () => {
    try {
      const contract = await getVotingContract();
      const tx = await contract.vote(candidateId);
      await tx.wait();
      alert("✅ Vote cast successfully on Ethereum!");
    } catch (err) {
      console.error("❌ Blockchain vote failed:", err);
      alert("❌ Failed to vote on blockchain. Check MetaMask or network.");
    }
  };

  return <button onClick={vote}>Vote (Blockchain)</button>;
};

export default VoteButton;
