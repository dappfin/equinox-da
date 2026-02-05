// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SimpleQuantumDA
 * @notice Simplified quantum-resistant data availability for quick deployment
 * @dev Minimal version for immediate testing
 */
contract SimpleQuantumDA {
    uint256 public constant SUBMISSION_FEE = 1 ether;
    address public owner;
    
    struct QuantumSubmission {
        bytes32 dataHash;
        bytes32 merkleRoot;
        bytes ecdsaSignature;
        bytes mldsaSignature;
        bytes mldsaPublicKey;
        uint256 timestamp;
        address submitter;
        bool verified;
    }
    
    mapping(bytes32 => QuantumSubmission) public submissions;
    bytes32[] public submissionIds;
    
    event QuantumSubmitted(
        address indexed user,
        bytes32 indexed submissionId,
        bytes32 dataHash,
        bytes32 merkleRoot,
        uint256 amount
    );
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    function submitQuantumData(
        bytes32 submissionId,
        bytes32 dataHash,
        bytes32 merkleRoot,
        bytes calldata ecdsaSignature,
        bytes calldata mldsaSignature,
        bytes calldata mldsaPublicKey
    ) external payable {
        require(msg.value >= SUBMISSION_FEE, "Insufficient payment");
        require(submissions[submissionId].submitter == address(0), "Submission already exists");
        require(mldsaSignature.length > 0, "ML-DSA signature required");
        require(mldsaPublicKey.length > 0, "ML-DSA public key required");
        
        submissions[submissionId] = QuantumSubmission({
            dataHash: dataHash,
            merkleRoot: merkleRoot,
            ecdsaSignature: ecdsaSignature,
            mldsaSignature: mldsaSignature,
            mldsaPublicKey: mldsaPublicKey,
            timestamp: block.timestamp,
            submitter: msg.sender,
            verified: false
        });
        
        submissionIds.push(submissionId);
        
        emit QuantumSubmitted(
            msg.sender,
            submissionId,
            dataHash,
            merkleRoot,
            msg.value
        );
        
        if (msg.value > SUBMISSION_FEE) {
            payable(msg.sender).transfer(msg.value - SUBMISSION_FEE);
        }
    }
    
    function getSubmission(bytes32 submissionId) external view returns (QuantumSubmission memory) {
        return submissions[submissionId];
    }
    
    function getAllSubmissionIds() external view returns (bytes32[] memory) {
        return submissionIds;
    }
    
    function getSubmissionCount() external view returns (uint256) {
        return submissionIds.length;
    }
    
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance");
        payable(owner).transfer(balance);
    }
    
    receive() external payable {}
}
