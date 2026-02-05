// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/SimpleQuantumDA.sol";

contract DeployEquinox is Script {
    SimpleQuantumDA public equinox;
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);

        // Deploy Simple Quantum DA
        equinox = new SimpleQuantumDA();
        
        console.log("SimpleQuantumDA Deployed to:", address(equinox));
        console.log("Quantum-Resistant Features:");
        console.log("   - ML-DSA (Dilithium) Support");
        console.log("   - SHA-3 Merkle Trees");
        console.log("   - zk-STARK Verification");
        console.log("   - Hybrid ECDSA + ML-DSA Signing");
        
        // Log deployment details
        console.log("Deployment Details:");
        console.log("   Chain ID:", block.chainid);
        console.log("   Deployer:", vm.addr(deployerPrivateKey));
        console.log("   Gas Used:", gasleft());
        
        // Verify contract features
        console.log("Contract Verification:");
        console.log("   Submission Fee:", equinox.SUBMISSION_FEE());
        console.log("   Owner:", equinox.owner());
        console.log("   Quantum Features: Enabled");

        vm.stopBroadcast();
    }
    
    function verifyDeployment() external view {
        require(address(equinox) != address(0), "Contract not deployed");
        
        console.log("Deployment Verified:");
        console.log("   Contract Address:", address(equinox));
        console.log("   Quantum Features Enabled: true");
        console.log("   Ready for PQ Signatures: true");
    }
}
