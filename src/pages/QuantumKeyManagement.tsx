import React, { useState } from 'react';
import { useQuantumKeyManager } from '../hooks/useQuantumKeyManager';

export function QuantumKeyManagement() {
  const {
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
  } = useQuantumKeyManager();

  const [password, setPassword] = useState('');
  const [exportData, setExportData] = useState('');
  const [importData, setImportData] = useState('');
  const [testMessage, setTestMessage] = useState('Equinox quantum test message');
  const [signature, setSignature] = useState<Uint8Array | null>(null);
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);

  const handleGenerateKey = async () => {
    try {
      await generateKeyPair('ML-DSA-65', 'signing');
    } catch (err) {
      console.error('Failed to generate key:', err);
    }
  };

  const handleRotateKey = async () => {
    try {
      await rotateKey();
    } catch (err) {
      console.error('Failed to rotate key:', err);
    }
  };

  const handleExportKeys = async () => {
    if (!password) {
      alert('Please enter a password for encryption');
      return;
    }

    try {
      const encrypted = await exportKeys(password);
      const base64 = btoa(String.fromCharCode(...Array.from(encrypted)));
      setExportData(base64);
    } catch (err) {
      console.error('Failed to export keys:', err);
    }
  };

  const handleImportKeys = async () => {
    if (!password || !importData) {
      alert('Please enter password and import data');
      return;
    }

    try {
      const encrypted = Uint8Array.from(atob(importData), (c: string) => c.charCodeAt(0));
      await importKeys(encrypted, password);
      setImportData('');
      setPassword('');
    } catch (err) {
      console.error('Failed to import keys:', err);
    }
  };

  const handleSignMessage = async () => {
    if (!currentKey) {
      alert('No key available for signing');
      return;
    }

    try {
      const data = new TextEncoder().encode(testMessage);
      const sig = await signData(data);
      setSignature(sig);
      setVerificationResult(null);
    } catch (err) {
      console.error('Failed to sign message:', err);
    }
  };

  const handleVerifySignature = async () => {
    if (!signature || !currentKey) {
      alert('No signature or key available');
      return;
    }

    try {
      const data = new TextEncoder().encode(testMessage);
      const result = await verifySignature(data, signature, currentKey.publicKey);
      setVerificationResult(result);
    } catch (err) {
      console.error('Failed to verify signature:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <div className="text-2xl">🔐</div>
        <h1 className="text-3xl font-bold">Quantum Key Manager</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Key Statistics */}
      {keyStats && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">🔑 Key Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{keyStats.totalKeys}</div>
              <div className="text-sm text-gray-600">Total Keys</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{keyStats.activeKeys}</div>
              <div className="text-sm text-gray-600">Active Keys</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{keyStats.expiredKeys}</div>
              <div className="text-sm text-gray-600">Expired Keys</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {keyStats.nextRotation ? 
                  Math.ceil((new Date(keyStats.nextRotation).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 
                  'N/A'
                }
              </div>
              <div className="text-sm text-gray-600">Days to Rotation</div>
            </div>
          </div>
        </div>
      )}

      {/* Current Key Information */}
      {currentKey && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
            <span>🔒 Current Key</span>
            {needsRotation && (
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                ⚠️ Rotation Needed
              </span>
            )}
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Key ID:</span>
              <span className="font-mono text-sm">{currentKey.keyId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Algorithm:</span>
              <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {currentKey.algorithm}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Security Level:</span>
              <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {currentKey.metadata?.securityLevel}-bit
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Usage:</span>
              <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {currentKey.usage}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Created:</span>
              <span className="text-sm">{new Date(currentKey.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Expires:</span>
              <span className="text-sm">
                {currentKey.expiresAt ? new Date(currentKey.expiresAt).toLocaleString() : 'Never'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Public Key Size:</span>
              <span className="text-sm">{currentKey.publicKey.length} bytes</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Secret Key Size:</span>
              <span className="text-sm">{currentKey.secretKey.length} bytes</span>
            </div>
          </div>
        </div>
      )}

      {/* Key Management Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">🔧 Key Management</h2>
        <p className="text-gray-600 mb-4">Generate, rotate, and manage your quantum-resistant keys</p>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={handleGenerateKey} 
            disabled={isGenerating}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isGenerating ? 'Generating...' : '🔑 Generate New Key'}
          </button>
          <button 
            onClick={handleRotateKey} 
            disabled={!currentKey || isGenerating}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            🔄 Rotate Key
          </button>
          <button 
            onClick={checkRotation}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
          >
            ⏰ Check Rotation
          </button>
        </div>
      </div>

      {/* Quantum Signing */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">✍️ Quantum Signing</h2>
        <p className="text-gray-600 mb-4">Test ML-DSA quantum-resistant signatures</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Test Message</label>
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Enter message to sign"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex space-x-4">
            <button onClick={handleSignMessage} disabled={!currentKey} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
              Sign Message
            </button>
            <button 
              onClick={handleVerifySignature} 
              disabled={!signature}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Verify Signature
            </button>
          </div>
          {signature && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Signature</label>
              <textarea
                value={Array.from(signature).map(b => b.toString(16).padStart(2, '0')).join('')}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs"
                rows={3}
              />
            </div>
          )}
          {verificationResult !== null && (
            <div className={`p-3 rounded ${verificationResult ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              ✅ Signature is {verificationResult ? 'valid' : 'invalid'}
            </div>
          )}
        </div>
      </div>

      {/* Export/Import Keys */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">💾 Export/Import Keys</h2>
        <p className="text-gray-600 mb-4">Securely backup and restore your quantum keys</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Encryption Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter strong password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex space-x-4">
            <button onClick={handleExportKeys} disabled={!password} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
              📥 Export Keys
            </button>
            <button onClick={handleImportKeys} disabled={!password || !importData} className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 disabled:opacity-50">
              📤 Import Keys
            </button>
          </div>
          {exportData && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exported Data (Base64)</label>
              <textarea
                value={exportData}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs"
                rows={6}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Import Data (Base64)</label>
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="Paste exported key data"
              className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs"
              rows={6}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
