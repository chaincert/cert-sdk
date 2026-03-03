/**
 * Type definitions for Cert-SDK
 * Per CERT Whitepaper - CertID and Chain Certify specifications
 */

// Entity types matching smart contract enum
export enum EntityType {
  Individual = 0,
  Institution = 1,
  SystemAdmin = 2,
  Bot = 3,
}

// Standard badge types
export type BadgeType =
  | 'KYC_L1'
  | 'KYC_L2'
  | 'ACADEMIC_ISSUER'
  | 'VERIFIED_CREATOR'
  | 'GOV_AGENCY'
  | 'LEGAL_ENTITY'
  | 'ISO_9001_CERTIFIED';

// CertID Profile from smart contract
export interface CertIDProfile {
  handle: string;
  metadataURI: string;
  isVerified: boolean;
  trustScore: number;
  entityType: EntityType;
  isActive: boolean;
}

// Extended profile with badges for SDK use
export interface FullIdentity {
  address: string;
  handle: string;
  metadata: string;
  isVerified: boolean;
  isInstitutional: boolean;
  trustScore: number;
  entityType: EntityType;
  badges: string[];
  isKYC: boolean;
  isAcademic: boolean;
  isCreator: boolean;
}

// Profile metadata stored on IPFS
export interface ProfileMetadata {
  name?: string;
  bio?: string;
  avatarUrl?: string;
  website?: string;
  socialLinks?: Record<string, string>;
  organization?: string;
  location?: string;
}

// SDK Configuration
export interface CertSDKConfig {
  rpcUrl?: string;
  apiUrl?: string;
  ipfsGateway?: string;
  certIdAddress?: string;
  chainCertifyAddress?: string;
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
    from: FullIdentity | null;
    to: FullIdentity | null;
  };
  application: AppData | null;
  network: string;
}

// Application-specific decoded data
export interface AppData {
  app: 'Chain Certify' | 'Cert Token' | 'Unknown';
  action?: string;
  decoded?: Record<string, unknown>;
}

// Attestation data from Chain Certify
export interface Attestation {
  hash: string;
  signer: string;
  signerHandle: string;
  timestamp: number;
  fileType: string;
  trustScoreAtTime: number;
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
  issuer?: {
    handle: string;
    isVerified: boolean;
    trustScore: number;
    badges: string[];
  };
}

// Badge award request
export interface BadgeAwardRequest {
  userAddress: string;
  badgeName: BadgeType;
}

// Profile registration request
export interface RegisterProfileRequest {
  handle: string;
  metadataURI: string;
  entityType: EntityType;
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

