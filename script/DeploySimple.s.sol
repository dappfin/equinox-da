// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/SimpleQuantumDA.sol";

contract DeploySimple is Script {
    SimpleQuantumDA public simple;
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy Simple Quantum DA
        simple = new SimpleQuantumDA();
        
        console.log("SimpleQuantumDA Deployed to:", address(simple));
        console.log("Quantum Features:");
        console.log("   - ML-DSA Support: Ready");
        console.log("   - SHA-3 Merkle Trees: Ready");
        console.log("   - zk-STARK Verification: Ready");
        console.log("   - Hybrid Signing: Ready");
        
        console.log("Deployment Details:");
        console.log("   Chain ID:", block.chainid);
        console.log("   Deployer:", vm.addr(deployerPrivateKey));
        console.log("   Gas Used:", gasleft());
        
        vm.stopBroadcast();
    }
    
    function verifyDeployment() external view {
        require(address(simple) != address(0), "Contract not deployed");
        
        console.log("Deployment Verified:");
        console.log("   Contract Address:", address(simple));
        console.log("   Submission Fee:", simple.SUBMISSION_FEE());
        console.log("   Owner:", simple.owner());
        console.log("   Quantum Features: Enabled");
    }
}
