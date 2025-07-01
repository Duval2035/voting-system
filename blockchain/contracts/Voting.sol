// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    struct Candidate {
        uint id;
        string name;
        string electionId;
        uint voteCount;
    }

    address public admin;
    uint public nextId = 1;

    mapping(uint => Candidate) public candidates;
    mapping(string => uint[]) public electionToCandidateIds;
    mapping(string => mapping(address => bool)) public hasVoted;

    event CandidateAdded(uint id, string name, string electionId);
    event Voted(address indexed voter, uint candidateId, string electionId);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function addCandidate(string memory _name, string memory _electionId) public onlyAdmin {
        candidates[nextId] = Candidate(nextId, _name, _electionId, 0);
        electionToCandidateIds[_electionId].push(nextId);
        emit CandidateAdded(nextId, _name, _electionId);
        nextId++;
    }

    function vote(uint _candidateId, string memory _electionId) public {
        require(!hasVoted[_electionId][msg.sender], "You already voted");
        Candidate storage candidate = candidates[_candidateId];
        require(candidate.id != 0, "Candidate does not exist");
        require(
            keccak256(bytes(candidate.electionId)) == keccak256(bytes(_electionId)),
            "Invalid candidate"
        );
        candidate.voteCount++;
        hasVoted[_electionId][msg.sender] = true;
        emit Voted(msg.sender, _candidateId, _electionId);
    }

    function getCandidatesCount(string memory _electionId) public view returns (uint) {
        return electionToCandidateIds[_electionId].length;
    }

    function getCandidate(uint _id) public view returns (
        uint id,
        string memory name,
        string memory electionId,
        uint voteCount
    ) {
        Candidate memory c = candidates[_id];
        return (c.id, c.name, c.electionId, c.voteCount);
    }

    // Fixed: return empty array instead of reverting when no candidates
    function getCandidatesByElection(string memory _electionId) public view returns (Candidate[] memory) {
        uint[] memory ids = electionToCandidateIds[_electionId];
        Candidate[] memory result = new Candidate[](ids.length);
        for (uint i = 0; i < ids.length; i++) {
            result[i] = candidates[ids[i]];
        }
        return result;
    }
}
