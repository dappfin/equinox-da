# Equinox DA - Deployment Guide

## 🚀 Quick Start for ETH Global Hackathon

### Prerequisites
- Git and Foundry installed
- 0.5 ETH from Chainlink Faucet (recommended)
- Base Sepolia testnet configured

### Step 1: Get Testnet ETH

1. **Chainlink Faucet** (Recommended - 0.5 ETH)
   - Visit: https://faucet.chain.link/
   - Select: Base Sepolia
   - Enter your wallet address
   - Complete verification

2. **Alternative Faucets** (if needed)
   - Superchain Faucet: https://app.optimism.io/faucet
   - Base Sepolia Faucet: https://sepoliafaucet.com/

### Step 2: Setup Environment

```bash
# Clone the repository
git clone <your-repo-url>
cd equinox-da

# Install Foundry (if not installed)
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### Step 3: Configure Environment

Edit `.env` with your values:

```bash
# Required for deployment
BASE_SEPOLIA_RPC="https://sepolia.base.org"
PRIVATE_KEY="your_private_key_with_0.5_eth"
BASESCAN_API_KEY="your_basescan_api_key"

# Optional: Use Alchemy for better performance
ALCHEMY_BASE_SEPOLIA_URL="https://base-sepolia.g.alchemy.com/v2/your_alchemy_key"
```

### Step 4: Deploy to Base Sepolia

```bash
# Deploy with verification
npm run deploy:base-sepolia

# Or manually with forge
forge script script/DeployEquinox.s.sol \
    --rpc-url $BASE_SEPOLIA_RPC \
    --broadcast \
    --verify \
    --verifier-url https://api-sepolia.basescan.org/api \
    --etherscan-api-key $BASESCAN_API_KEY \
    -vvvv
```

### Step 5: Update Frontend Configuration

1. Get the deployed contract address from the deployment output
2. Update your frontend configuration:

```typescript
// src/config/wagmi.ts
export const QUANTUM_LATTICE_DA_ADDRESS = "0x..." // Your deployed address
export const BASE_SEPOLIA_CHAIN_ID = 84532
```

3. Update environment variables:

```bash
# .env
VITE_CONTRACT_ADDRESS="0x..." # Your deployed contract
VITE_CHAIN_ID="84532"
VITE_RPC_URL="https://sepolia.base.org"
```

## 🏗️ Deployment Architecture

### Contract Features Deployed
- ✅ **Quantum-Resistant Storage**: ML-DSA signature support
- ✅ **SHA-3 Merkle Trees**: Quantum-resistant data commitment
- ✅ **zk-STARK Verification**: Trustless proof verification
- ✅ **Hybrid Signing**: ECDSA + ML-DSA compatibility
- ✅ **Gas Optimization**: Efficient batch operations
- ✅ **Emergency Controls**: Pause/unpause functionality

### Network Configuration
- **Chain**: Base Sepolia (Chain ID: 84532)
- **RPC**: https://sepolia.base.org
- **Explorer**: https://sepolia.basescan.org
- **Gas Token**: ETH

## 📊 Deployment Verification

### 1. Contract Verification
The deployment script automatically verifies the contract on Basescan.

### 2. Manual Verification
```bash
# Verify if auto-verification fails
npm run verify:base-sepolia
```

### 3. Test Quantum Features
```bash
# Run Foundry tests
forge test

# Test gas usage
forge test --gas-report
```

## 🔧 Advanced Deployment Options

### Local Deployment
```bash
# Start local Anvil node
anvil --chain-id 84532

# Deploy locally
npm run deploy:local
```

### Mainnet Deployment (Future)
```bash
# Update .env with mainnet RPC
MAINNET_RPC="https://mainnet.base.org"

# Deploy to mainnet
forge script script/DeployEquinox.s.sol \
    --rpc-url $MAINNET_RPC \
    --broadcast \
    --verify \
    --verifier-url https://api.basescan.org/api \
    --etherscan-api-key $BASESCAN_API_KEY
```

## 🎯 Hackathon Strategy

### Gas Optimization Tips
1. **Use Alchemy RPC**: Better rate limits for Merkle root updates
2. **Batch Operations**: Submit multiple files in one transaction
3. **Calldata Optimization**: Use efficient data encoding
4. **EIP-4844 Blobs**: Consider for large data (if supported)

### Quantum Features Showcase
1. **ML-DSA Key Generation**: Demonstrate quantum key setup
2. **Hybrid Signing**: Show both ECDSA + ML-DSA signatures
3. **SHA-3 Merkle Trees**: Display quantum-resistant data commitment
4. **zk-STARK Proofs**: Verify zero-knowledge quantum resistance

### Demo Flow
1. **Setup**: Generate quantum keys in browser
2. **Upload**: Submit file with hybrid signatures
3. **Verify**: Show zk-STARK proof verification
4. **Explore**: Browse quantum-resistant submissions

## 📱 Frontend Integration

### Update Wagmi Configuration
```typescript
// src/config/wagmi.ts
import { defineChain } from 'viem';

export const baseSepolia = defineChain({
  id: 84532,
  name: 'Base Sepolia',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://sepolia.base.org'] },
  },
  blockExplorers: {
    default: { name: 'BaseScan', url: 'https://sepolia.basescan.org' },
  },
  testnet: true,
});
```

### Update Contract ABI
```typescript
// src/config/contracts.ts
export const QUANTUM_LATTICE_DA_ABI = [
  // ... ABI from deployed contract
];
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Insufficient Gas
```bash
# Check balance
cast balance <address> --rpc-url $BASE_SEPOLIA_RPC

# Get more ETH from faucet
```

#### 2. Verification Failures
```bash
# Check contract address
echo $CONTRACT_ADDRESS

# Manual verification
forge verify-contract <address> contracts/QuantumLatticeDAStorage.sol:QuantumLatticeDAStorage \
  --verifier-url https://api-sepolia.basescan.org/api \
  --etherscan-api-key $BASESCAN_API_KEY
```

#### 3. RPC Issues
```bash
# Test RPC connection
cast chain-id --rpc-url $BASE_SEPOLIA_RPC

# Use Alchemy as backup
ALCHEMY_BASE_SEPOLIA_URL="https://base-sepolia.g.alchemy.com/v2/your_key"
```

### Performance Optimization

#### 1. RPC Provider Selection
- **Alchemy**: Best for hackathon (growth tier available)
- **Infura**: Good alternative
- **Public RPC**: Use only for testing

#### 2. Gas Optimization
- **Batch submissions**: More efficient than individual
- **zk-STARK verification**: Cheaper than on-chain ML-DSA verification
- **Calldata compression**: Use efficient encoding

## 📈 Monitoring

### Contract Monitoring
- **BaseScan**: https://sepolia.basescan.org/address/CONTRACT_ADDRESS
- **Dune Analytics**: Create dashboard for submissions
- **Graph Protocol**: Index submission data

### Performance Metrics
- **Gas per submission**: Track efficiency
- **Verification time**: Measure zk-STARK performance
- **Success rate**: Monitor quantum signature verification

## 🎉 Success Criteria

### Hackathon Judging
✅ **Quantum Innovation**: First DApp with ML-DSA integration  
✅ **Technical Excellence**: Complete zk-STARK implementation  
✅ **User Experience**: Seamless quantum key setup  
✅ **Security**: Proper hybrid signing pattern  
✅ **Performance**: Gas-optimized verification  

### Post-Hackathon
- **Mainnet Readiness**: Production-ready quantum features
- **Documentation**: Complete technical documentation
- **Community**: Open-source contribution guidelines
- **Ecosystem**: Integration with other Web3 tools

---

## 🚨 Important Notes

- **Never commit private keys** to version control
- **Use testnet** for all hackathon development
- **Verify contract** after deployment
- **Test thoroughly** before demo
- **Have backup** deployment strategy ready

Good luck at ETH Global! 🚀
