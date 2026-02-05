import { useState, useEffect, useCallback } from 'react';
import { QuantumKeyManager, QuantumKeyPair, createQuantumKeyManager } from '../lib/quantum-key-manager';

export interface UseQuantumKeyManagerReturn {
  keyManager: QuantumKeyManager | null;
  currentKey: QuantumKeyPair | null;
  isGenerating: boolean;
  error: string | null;
  keyStats: {
    totalKeys: number;
    activeKeys: number;
    expiredKeys: number;
    nextRotation: Date | null;
  } | null;
  generateKeyPair: (
    algorithm?: 'ML-DSA-65' | 'ML-DSA-87' | 'ML-DSA-44',
    usage?: 'signing' | 'encryption' | 'both'
  ) => Promise<QuantumKeyPair>;
  rotateKey: () => Promise<QuantumKeyPair>;
  signData: (data: Uint8Array) => Promise<Uint8Array>;
  verifySignature: (
    data: Uint8Array,
    signature: Uint8Array,
    publicKey: Uint8Array
  ) => Promise<boolean>;
  exportKeys: (password: string) => Promise<Uint8Array>;
  importKeys: (encryptedData: Uint8Array, password: string) => Promise<void>;
  needsRotation: boolean;
  checkRotation: () => Promise<boolean>;
}

export function useQuantumKeyManager(): UseQuantumKeyManagerReturn {
  const [keyManager, setKeyManager] = useState<QuantumKeyManager | null>(null);
  const [currentKey, setCurrentKey] = useState<QuantumKeyPair | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keyStats, setKeyStats] = useState<UseQuantumKeyManagerReturn['keyStats']>(null);
  const [needsRotation, setNeedsRotation] = useState(false);

  // Initialize key manager
  useEffect(() => {
    const initKeyManager = async () => {
      try {
        const manager = createQuantumKeyManager();
        setKeyManager(manager);
        
        // Load current key
        const current = await manager.getCurrentKey();
        setCurrentKey(current);
        
        // Load key statistics
        const stats = await manager.getKeyStats();
        setKeyStats(stats);
        
        // Check if rotation is needed
        const rotationNeeded = await manager.needsRotation();
        setNeedsRotation(rotationNeeded);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize key manager');
      }
    };

    initKeyManager();
  }, []);

  // Generate new key pair
  const generateKeyPair = useCallback(async (
    algorithm: 'ML-DSA-65' | 'ML-DSA-87' | 'ML-DSA-44' = 'ML-DSA-65',
    usage: 'signing' | 'encryption' | 'both' = 'signing'
  ): Promise<QuantumKeyPair> => {
    if (!keyManager) {
      throw new Error('Key manager not initialized');
    }

    setIsGenerating(true);
    setError(null);

    try {
      const newKey = await keyManager.generateKeyPair(algorithm, usage);
      setCurrentKey(newKey);
      
      // Update statistics
      const stats = await keyManager.getKeyStats();
      setKeyStats(stats);
      
      // Check rotation status
      const rotationNeeded = await keyManager.needsRotation();
      setNeedsRotation(rotationNeeded);
      
      return newKey;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate key pair';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [keyManager]);

  // Rotate current key
  const rotateKey = useCallback(async (): Promise<QuantumKeyPair> => {
    if (!keyManager) {
      throw new Error('Key manager not initialized');
    }

    setIsGenerating(true);
    setError(null);

    try {
      const newKey = await keyManager.rotateKey();
      setCurrentKey(newKey);
      
      // Update statistics
      const stats = await keyManager.getKeyStats();
      setKeyStats(stats);
      
      // Check rotation status
      const rotationNeeded = await keyManager.needsRotation();
      setNeedsRotation(rotationNeeded);
      
      return newKey;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to rotate key';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [keyManager]);

  // Sign data with current key
  const signData = useCallback(async (data: Uint8Array): Promise<Uint8Array> => {
    if (!keyManager) {
      throw new Error('Key manager not initialized');
    }

    try {
      return await keyManager.signData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign data';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [keyManager]);

  // Verify signature
  const verifySignature = useCallback(async (
    data: Uint8Array,
    signature: Uint8Array,
    publicKey: Uint8Array
  ): Promise<boolean> => {
    if (!keyManager) {
      throw new Error('Key manager not initialized');
    }

    try {
      return await keyManager.verifySignature(data, signature, publicKey);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify signature';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [keyManager]);

  // Export keys
  const exportKeys = useCallback(async (password: string): Promise<Uint8Array> => {
    if (!keyManager) {
      throw new Error('Key manager not initialized');
    }

    try {
      return await keyManager.exportKeys(password);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export keys';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [keyManager]);

  // Import keys
  const importKeys = useCallback(async (
    encryptedData: Uint8Array,
    password: string
  ): Promise<void> => {
    if (!keyManager) {
      throw new Error('Key manager not initialized');
    }

    try {
      await keyManager.importKeys(encryptedData, password);
      
      // Reload current key and statistics
      const current = await keyManager.getCurrentKey();
      setCurrentKey(current);
      
      const stats = await keyManager.getKeyStats();
      setKeyStats(stats);
      
      const rotationNeeded = await keyManager.needsRotation();
      setNeedsRotation(rotationNeeded);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import keys';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [keyManager]);

  // Check if rotation is needed
  const checkRotation = useCallback(async (): Promise<boolean> => {
    if (!keyManager) {
      return false;
    }

    try {
      const rotationNeeded = await keyManager.needsRotation();
      setNeedsRotation(rotationNeeded);
      return rotationNeeded;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check rotation';
      setError(errorMessage);
      return false;
    }
  }, [keyManager]);

  return {
    keyManager,
    currentKey,
    isGenerating,
    error,
    keyStats,
    generateKeyPair,
    rotateKey,
    signData,
    verifySignature,
    exportKeys,
    importKeys,
    needsRotation,
    checkRotation
  };
}
