import { useState, useEffect, useCallback } from 'react';
import { createHybridSigner, HybridSigner, HybridSignature, SignerData } from '@/lib/hybrid-signer';
import { buildMerkleTree, createFileMerkleTree, merkleRootToHex } from '@/lib/merkle-sha3';
import { generateFileSTARKProof } from '@/lib/stark-proof';

/**
 * Hook for managing hybrid quantum-resistant signing
 * Combines ECDSA (MetaMask) with ML-DSA (Dilithium) signatures
 */
export interface UseHybridSignerReturn {
  signer: HybridSigner | null;
  signerData: SignerData | null;
  isInitializing: boolean;
  hasQuantumKeys: boolean;
  setupQuantumKeys: () => Promise<void>;
  signData: (data: string, nonce: string) => Promise<HybridSignature>;
  signFile: (file: File, nonce: string) => Promise<{
    hybridSignature: HybridSignature;
    merkleRoot: string;
    starkProof?: string;
  }>;
  error: string | null;
  reset: () => void;
}

export const useHybridSigner = (userId?: string): UseHybridSignerReturn => {
  const [signer, setSigner] = useState<HybridSigner | null>(null);
  const [signerData, setSignerData] = useState<SignerData | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize hybrid signer
  const initializeSigner = useCallback(async () => {
    if (!userId) {
      setError('User ID is required for hybrid signing');
      return;
    }

    setIsInitializing(true);
    setError(null);

    try {
      const hybridSigner = await createHybridSigner(userId);
      const data = await hybridSigner.getSignerData();
      
      setSigner(hybridSigner);
      setSignerData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize hybrid signer';
      setError(errorMessage);
      console.error('Hybrid signer initialization error:', err);
    } finally {
      setIsInitializing(false);
    }
  }, [userId]);

  // Setup quantum keys
  const setupQuantumKeys = useCallback(async () => {
    if (!signer) {
      setError('Signer not initialized');
      return;
    }

    try {
      await signer.setupQuantumKeys();
      const data = await signer.getSignerData();
      setSignerData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to setup quantum keys';
      setError(errorMessage);
      console.error('Quantum keys setup error:', err);
    }
  }, [signer]);

  // Sign data with hybrid signature
  const signData = useCallback(async (data: string, nonce: string): Promise<HybridSignature> => {
    if (!signer) {
      throw new Error('Signer not initialized');
    }

    try {
      const signature = await signer.signData(data, nonce);
      setError(null);
      return signature;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign data';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [signer]);

  // Sign file with hybrid signature and generate proofs
  const signFile = useCallback(async (
    file: File, 
    nonce: string
  ): Promise<{
    hybridSignature: HybridSignature;
    merkleRoot: string;
    starkProof?: string;
  }> => {
    if (!signer) {
      throw new Error('Signer not initialized');
    }

    try {
      // Create Merkle tree for file
      const merkleTree = await createFileMerkleTree(file);
      const merkleRoot = merkleRootToHex(merkleTree.root);

      // Generate file data for signing
      const fileData = JSON.stringify({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        merkleRoot,
        timestamp: Date.now()
      });

      // Sign with hybrid signer
      const hybridSignature = await signer.signData(fileData, nonce);

      // Generate STARK proof (optional, for quantum-resistant verification)
      let starkProof: string | undefined;
      try {
        const starkResult = await generateFileSTARKProof(file);
        starkProof = JSON.stringify(starkResult);
      } catch (starkError) {
        console.warn('STARK proof generation failed (optional):', starkError);
        // Continue without STARK proof - it's optional for basic functionality
      }

      setError(null);
      return {
        hybridSignature,
        merkleRoot,
        starkProof
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign file';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [signer]);

  // Reset state
  const reset = useCallback(() => {
    setSigner(null);
    setSignerData(null);
    setError(null);
    setIsInitializing(false);
  }, []);

  // Auto-initialize when userId changes
  useEffect(() => {
    if (userId) {
      initializeSigner();
    } else {
      reset();
    }
  }, [userId, initializeSigner]);

  return {
    signer,
    signerData,
    isInitializing,
    hasQuantumKeys: signerData?.hasPQKeys || false,
    setupQuantumKeys,
    signData,
    signFile,
    error,
    reset
  };
};
