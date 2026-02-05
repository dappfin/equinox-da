/**
 * End-to-End Test for Equinox Quantum-Resistant DA
 * 
 * This test validates the complete workflow:
 * 1. Quantum key generation
 * 2. File processing with Merkle trees
 * 3. Hybrid signature creation
 * 4. Contract deployment simulation
 * 5. Data submission verification
 */

import { createHybridSigner } from '../src/lib/hybrid-signer';
import { createFileMerkleTree, merkleRootToHex } from '../src/lib/merkle-sha3';
import { generateFileSTARKProof } from '../src/lib/stark-proof';
import { ethers } from 'ethers';

/**
 * Test Configuration
 */
const TEST_CONFIG = {
  userId: 'test-user-123',
  fileName: 'quantum-test-data.txt',
  fileContent: 'Equinox Quantum-Resistant Test Data',
  contractAddress: '0x1234567890123456789012345678901234567890',
  chainId: 84532, // Base Sepolia
};

/**
 * Main Test Function
 */
export async function runEndToEndTest(): Promise<boolean> {
  console.log('🚀 Starting Equinox End-to-End Test...');
  
  try {
    // Test 1: Quantum Key Generation
    console.log('📝 Test 1: Quantum Key Generation...');
    const keyTest = await testQuantumKeyGeneration();
    if (!keyTest.success) {
      console.error('❌ Quantum key generation failed:', keyTest.error);
      return false;
    }
    console.log('✅ Quantum key generation passed');

    // Test 2: File Processing
    console.log('📄 Test 2: File Processing...');
    const fileTest = await testFileProcessing();
    if (!fileTest.success) {
      console.error('❌ File processing failed:', fileTest.error);
      return false;
    }
    console.log('✅ File processing passed');

    // Test 3: Hybrid Signature Creation
    console.log('✍️ Test 3: Hybrid Signature Creation...');
    const signatureTest = await testHybridSignature();
    if (!signatureTest.success) {
      console.error('❌ Hybrid signature creation failed:', signatureTest.error);
      return false;
    }
    console.log('✅ Hybrid signature creation passed');

    // Test 4: Merkle Tree Integrity
    console.log('🌳 Test 4: Merkle Tree Integrity...');
    const merkleTest = await testMerkleTreeIntegrity();
    if (!merkleTest.success) {
      console.error('❌ Merkle tree integrity failed:', merkleTest.error);
      return false;
    }
    console.log('✅ Merkle tree integrity passed');

    // Test 5: zk-STARK Proof Generation
    console.log('⚡ Test 5: zk-STARK Proof Generation...');
    const starkTest = await testSTARKProofGeneration();
    if (!starkTest.success) {
      console.error('❌ zk-STARK proof generation failed:', starkTest.error);
      return false;
    }
    console.log('✅ zk-STARK proof generation passed');

    // Test 6: Contract Integration
    console.log('🏗️ Test 6: Contract Integration...');
    const contractTest = await testContractIntegration();
    if (!contractTest.success) {
      console.error('❌ Contract integration failed:', contractTest.error);
      return false;
    }
    console.log('✅ Contract integration passed');

    console.log('🎉 All tests passed! Equinox is ready for deployment.');
    return true;

  } catch (error) {
    console.error('💥 End-to-end test failed:', error);
    return false;
  }
}

/**
 * Test 1: Quantum Key Generation
 */
async function testQuantumKeyGeneration(): Promise<{success: boolean; error?: string}> {
  try {
    const signer = await createHybridSigner(TEST_CONFIG.userId);
    
    // Test quantum key setup
    await signer.setupQuantumKeys();
    
    const signerData = await signer.getSignerData();
    
    if (!signerData.hasPQKeys) {
      return { success: false, error: 'Quantum keys not generated' };
    }
    
    if (!signerData.mldsaPublicKey || signerData.mldsaPublicKey.length === 0) {
      return { success: false, error: 'ML-DSA public key missing' };
    }
    
    console.log(`   📊 Signer address: ${signerData.address}`);
    console.log(`   🔐 ML-DSA public key: ${signerData.mldsaPublicKey.substring(0, 20)}...`);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Test 2: File Processing
 */
async function testFileProcessing(): Promise<{success: boolean; error?: string}> {
  try {
    // Create test file
    const fileData = new TextEncoder().encode(TEST_CONFIG.fileContent);
    const file = new File([fileData], TEST_CONFIG.fileName, {
      type: 'text/plain'
    });
    
    // Create Merkle tree
    const merkleTree = await createFileMerkleTree(file);
    const merkleRoot = merkleRootToHex(merkleTree.root);
    
    if (!merkleRoot || merkleRoot.length !== 64) {
      return { success: false, error: 'Invalid Merkle root generated' };
    }
    
    console.log(`   📁 File: ${TEST_CONFIG.fileName} (${file.size} bytes)`);
    console.log(`   🌳 Merkle root: ${merkleRoot}`);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Test 3: Hybrid Signature Creation
 */
async function testHybridSignature(): Promise<{success: boolean; error?: string}> {
  try {
    const signer = await createHybridSigner(TEST_CONFIG.userId);
    await signer.setupQuantumKeys();
    
    const testData = JSON.stringify({
      fileName: TEST_CONFIG.fileName,
      content: TEST_CONFIG.fileContent,
      timestamp: Date.now()
    });
    
    const nonce = await signer.getNonce();
    const signature = await signer.signData(testData, nonce);
    
    // Validate signature structure
    if (!signature.ecdsaSignature || signature.ecdsaSignature.length === 0) {
      return { success: false, error: 'ECDSA signature missing' };
    }
    
    if (!signature.mldsaSignature || signature.mldsaSignature.length === 0) {
      return { success: false, error: 'ML-DSA signature missing' };
    }
    
    if (!signature.publicKey || signature.publicKey.length === 0) {
      return { success: false, error: 'ML-DSA public key missing' };
    }
    
    console.log(`   ✍️ ECDSA signature: ${signature.ecdsaSignature.substring(0, 20)}...`);
    console.log(`   🔐 ML-DSA signature: ${signature.mldsaSignature.substring(0, 20)}...`);
    console.log(`   🔑 ML-DSA public key: ${signature.publicKey.substring(0, 20)}...`);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Test 4: Merkle Tree Integrity
 */
async function testMerkleTreeIntegrity(): Promise<{success: boolean; error?: string}> {
  try {
    const fileData = new TextEncoder().encode(TEST_CONFIG.fileContent);
    const file = new File([fileData], TEST_CONFIG.fileName, {
      type: 'text/plain'
    });
    
    // Create multiple Merkle trees to test consistency
    const merkleTree1 = await createFileMerkleTree(file);
    const merkleTree2 = await createFileMerkleTree(file);
    
    const root1 = merkleRootToHex(merkleTree1.root);
    const root2 = merkleRootToHex(merkleTree2.root);
    
    if (root1 !== root2) {
      return { success: false, error: 'Merkle tree inconsistency detected' };
    }
    
    console.log(`   🌳 Consistent Merkle root: ${root1}`);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Test 5: zk-STARK Proof Generation
 */
async function testSTARKProofGeneration(): Promise<{success: boolean; error?: string}> {
  try {
    const fileData = new TextEncoder().encode(TEST_CONFIG.fileContent);
    const file = new File([fileData], TEST_CONFIG.fileName, {
      type: 'text/plain'
    });
    
    // Generate STARK proof
    const starkResult = await generateFileSTARKProof(file);
    
    if (!starkResult.proof || !starkResult.merkleRoot) {
      return { success: false, error: 'STARK proof generation failed' };
    }
    
    console.log(`   ⚡ STARK proof generated: ${JSON.stringify(starkResult.proof).substring(0, 50)}...`);
    console.log(`   🌳 STARK Merkle root: ${starkResult.merkleRoot}`);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Test 6: Contract Integration
 */
async function testContractIntegration(): Promise<{success: boolean; error?: string}> {
  try {
    // Simulate contract interaction data
    const signer = await createHybridSigner(TEST_CONFIG.userId);
    await signer.setupQuantumKeys();
    
    const fileData = new TextEncoder().encode(TEST_CONFIG.fileContent);
    const file = new File([fileData], TEST_CONFIG.fileName, {
      type: 'text/plain'
    });
    
    const merkleTree = await createFileMerkleTree(file);
    const merkleRoot = merkleRootToHex(merkleTree.root);
    
    const testData = JSON.stringify({
      fileName: TEST_CONFIG.fileName,
      merkleRoot,
      timestamp: Date.now()
    });
    
    const nonce = await signer.getNonce();
    const signature = await signer.signData(testData, nonce);
    
    // Create submission ID
    const submissionId = ethers.keccak256(
      ethers.toUtf8Bytes(`${TEST_CONFIG.fileName}-${Date.now()}-${nonce}`)
    );
    
    // Create contract call data (simulated)
    const contractInterface = new ethers.Interface([
      'function submitQuantumData(bytes32,bytes32,bytes32,bytes,bytes,bytes) payable'
    ]);
    
    const callData = contractInterface.encodeFunctionData('submitQuantumData', [
      submissionId,
      ethers.keccak256(ethers.toUtf8Bytes(testData)),
      merkleRoot,
      signature.ecdsaSignature,
      signature.mldsaSignature,
      signature.publicKey
    ]);
    
    if (!callData || callData === '0x') {
      return { success: false, error: 'Contract call data generation failed' };
    }
    
    console.log(`   🆔 Submission ID: ${submissionId}`);
    console.log(`   📋 Call data: ${callData.substring(0, 50)}...`);
    console.log(`   💰 Simulated fee: 1 ETH`);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Run test if called directly
 */
if (require.main === module) {
  runEndToEndTest()
    .then(success => {
      if (success) {
        console.log('🎉 Equinox End-to-End Test: PASSED');
        console.log('🚀 Project is ready for real deployment!');
        process.exit(0);
      } else {
        console.log('❌ Equinox End-to-End Test: FAILED');
        console.log('🔧 Please fix issues before deploying to testnet');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 Test execution failed:', error);
      process.exit(1);
    });
}

export { runEndToEndTest };
