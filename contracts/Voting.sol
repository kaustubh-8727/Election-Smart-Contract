pragma solidity ^0.5.16;

contract Voting{

    struct Candidate {
        uint id;
        string name;
    }

     address public Creator;

     bool public votingEnded;

     mapping (address => bool) public hasVoted;

     uint256 public totalVotes;

     mapping(uint => Candidate) public candidates;

     // Tallies for each candidate
    mapping (uint256 => uint256) private votesReceived;

     uint public candidatesCount;

     constructor() public {
        Creator = msg.sender;

        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, "Narendra Modi");

        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, "Rahul Gandhi");
    }

    function voteForCandidate(uint _candidate) public {
        // can only vote during voting period
        require(!votingEnded);
        // candidate must be part of the ballot
        require(_candidate > 0 && _candidate <= candidatesCount);
        // one vote per address (not sybil resistant)
        require(!hasVoted[msg.sender]);

        votesReceived[_candidate] += 1;
        hasVoted[msg.sender] = true;
        totalVotes += 1;
    }

    function endVoting() public returns (bool) {
        require(msg.sender == Creator);  // Only creator can end the vote.
        require(!votingEnded);
        votingEnded = true;
        return true;
    }

    function totalVotesFor(uint _candidate) view public returns (uint256) {
        require(votingEnded);  // Don't reveal votes until voting has ended
        return votesReceived[_candidate];
    }
}
