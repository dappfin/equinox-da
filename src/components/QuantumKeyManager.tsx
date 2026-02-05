import React, { useState } from 'react';
import { useQuantumKeyManager } from '../hooks/useQuantumKeyManager';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { 
  Shield, 
  Key, 
  RefreshCw, 
  Download, 
  Upload, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Lock
} from 'lucide-react';

export function QuantumKeyManager() {
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
      const base64 = btoa(String.fromCharCode(...encrypted));
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
      const encrypted = Uint8Array.from(atob(importData), c => c.charCodeAt(0));
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

  const formatKeyInfo = (key: any) => {
    return {
      keyId: key.keyId,
      algorithm: key.algorithm,
      securityLevel: key.metadata?.securityLevel || 'Unknown',
      createdAt: new Date(key.createdAt).toLocaleString(),
      expiresAt: key.expiresAt ? new Date(key.expiresAt).toLocaleString() : 'Never',
      usage: key.usage,
      publicKeySize: key.publicKey?.length || 0,
      secretKeySize: key.secretKey?.length || 0
    };
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Shield className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Quantum Key Manager</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Key Statistics */}
      {keyStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5" />
              Key Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      )}

      {/* Current Key Information */}
      {currentKey && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Lock className="h-5 w-5" />
                Current Key
              </div>
              {needsRotation && (
                <Badge variant="destructive" className="flex items-center space-x-1">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Rotation Needed</span>
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Key ID:</span>
                <span className="font-mono text-sm">{currentKey.keyId}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Algorithm:</span>
                <Badge variant="outline">{currentKey.algorithm}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Security Level:</span>
                <Badge variant="outline">{currentKey.metadata?.securityLevel}-bit</Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Usage:</span>
                <Badge variant="outline">{currentKey.usage}</Badge>
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
          </CardContent>
        </Card>
      )}

      {/* Key Management Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Key Management</CardTitle>
          <CardDescription>
            Generate, rotate, and manage your quantum-resistant keys
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={handleGenerateKey} 
              disabled={isGenerating}
              className="flex items-center space-x-2"
            >
              <Key className="h-4 w-4" />
              <span>{isGenerating ? 'Generating...' : 'Generate New Key'}</span>
            </Button>
            <Button 
              onClick={handleRotateKey} 
              disabled={!currentKey || isGenerating}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Rotate Key</span>
            </Button>
            <Button 
              onClick={checkRotation}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Clock className="h-4 w-4" />
              <span>Check Rotation</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Operations */}
      <Tabs defaultValue="signing" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="signing">Signing</TabsTrigger>
          <TabsTrigger value="export">Export/Import</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="signing">
          <Card>
            <CardHeader>
              <CardTitle>Quantum Signing</CardTitle>
              <CardDescription>
                Test ML-DSA quantum-resistant signatures
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="message">Test Message</Label>
                <Input
                  id="message"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Enter message to sign"
                />
              </div>
              <div className="flex space-x-4">
                <Button onClick={handleSignMessage} disabled={!currentKey}>
                  Sign Message
                </Button>
                <Button 
                  onClick={handleVerifySignature} 
                  disabled={!signature}
                  variant="outline"
                >
                  Verify Signature
                </Button>
              </div>
              {signature && (
                <div>
                  <Label>Signature</Label>
                  <Textarea
                    value={Array.from(signature).map(b => b.toString(16).padStart(2, '0')).join('')}
                    readOnly
                    className="font-mono text-xs"
                    rows={3}
                  />
                </div>
              )}
              {verificationResult !== null && (
                <Alert className={verificationResult ? 'border-green-500' : 'border-red-500'}>
                  <CheckCircle className={`h-4 w-4 ${verificationResult ? 'text-green-500' : 'text-red-500'}`} />
                  <AlertDescription>
                    Signature is {verificationResult ? 'valid' : 'invalid'}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export">
          <Card>
            <CardHeader>
              <CardTitle>Export/Import Keys</CardTitle>
              <CardDescription>
                Securely backup and restore your quantum keys
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="password">Encryption Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter strong password"
                />
              </div>
              <div className="flex space-x-4">
                <Button onClick={handleExportKeys} disabled={!password}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Keys
                </Button>
                <Button onClick={handleImportKeys} disabled={!password || !importData} variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Keys
                </Button>
              </div>
              {exportData && (
                <div>
                  <Label>Exported Data (Base64)</Label>
                  <Textarea
                    value={exportData}
                    readOnly
                    className="font-mono text-xs"
                    rows={6}
                  />
                </div>
              )}
              <div>
                <Label htmlFor="import">Import Data (Base64)</Label>
                <Textarea
                  id="import"
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder="Paste exported key data"
                  className="font-mono text-xs"
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Configuration</CardTitle>
              <CardDescription>
                Configure advanced quantum key settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Advanced features coming soon: Multi-party computation, threshold signatures, and HSM integration.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
