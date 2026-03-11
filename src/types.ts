/**
 * Type definitions for Cert-SDK
 * Per CertID Whitepaper specifications
 */

// SDK Configuration
export interface CertSDKConfig {
  rpcUrl?: string;
  apiUrl?: string;
  ipfsGateway?: string;
  certIDAddress?: string;
  privateKey?: string;
}

// Transaction resolution result
export interface ResolvedTransaction {
  hash: string;
  status: 'Success' | 'Failed' | 'Pending';
  timestamp: string;
  value: string;
  gasFee: string;
  participants: {
    from: string | null;
    to: string | null;
  };
  application: AppData | null;
  network: string;
}

// Application-specific decoded data
export interface AppData {
  app: 'CertID' | 'Unknown';
  action?: string;
  decoded?: Record<string, unknown>;
}

// Verification result from gateway
export interface VerificationResult {
  status: 'AUTHENTIC' | 'INVALID' | 'ERROR';
  message?: string;
  timestamp?: string;
  document?: {
    hash: string;
    type: string;
  };
  device?: {
    owner: string;
    trustScore?: number;
  };
}

// File verification request
export interface FileVerificationRequest {
  filePath?: string;
  fileHash?: string;
  txHash?: string;
}

// SDK method result wrapper
export interface SDKResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  txHash?: string;
}

