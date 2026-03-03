/**
 * Cert-SDK - Official SDK for Cert Blockchain Ecosystem
 * Provides identity resolution, attestation verification, and badge management
 * 
 * @package certblockchain
 * @version 1.0.0
 */

import { ethers } from 'ethers';
import { IdentityModule } from './identity';
import { EcosystemResolver } from './resolver';
import {
  CERT_RPC_URL,
  CERT_API_URL,
  CONTRACT_ADDRESSES,
  CERT_ID_ABI,
  CHAIN_CERTIFY_ABI,
} from './constants';
import type {
  CertSDKConfig,
  CertIDProfile,
  FullIdentity,
  SDKResult,
  RegisterProfileRequest,
  EntityType,
} from './types';

// Re-export types and modules
export * from './types';
export * from './constants';
export { IdentityModule } from './identity';
export { EcosystemResolver } from './resolver';

/**
 * Main SDK class for interacting with the Cert Blockchain ecosystem
 */
export class CertSDK {
  public provider: ethers.JsonRpcProvider;
  public signer: ethers.Wallet | null = null;
  public identity: IdentityModule;
  public resolver: EcosystemResolver;

  public addresses: {
    certID: string;
    chainCertify: string;
    certToken: string;
  };

  public contracts: {
    certID: ethers.Contract;
    chainCertify: ethers.Contract;
  };

  private config: CertSDKConfig;

  constructor(config?: CertSDKConfig) {
    // Load configuration from environment or provided config
    this.config = {
      rpcUrl: config?.rpcUrl || process.env.CERT_RPC_URL || CERT_RPC_URL,
      apiUrl: config?.apiUrl || process.env.CERT_API_URL || CERT_API_URL,
      certIdAddress: config?.certIdAddress || CONTRACT_ADDRESSES.CERT_ID,
      chainCertifyAddress: config?.chainCertifyAddress || CONTRACT_ADDRESSES.CHAIN_CERTIFY,
      privateKey: config?.privateKey || process.env.CERT_PRIVATE_KEY,
    };

    // Initialize provider
    this.provider = new ethers.JsonRpcProvider(this.config.rpcUrl);

    // Set contract addresses
    this.addresses = {
      certID: this.config.certIdAddress!,
      chainCertify: this.config.chainCertifyAddress!,
      certToken: CONTRACT_ADDRESSES.CERT_TOKEN,
    };

    // Initialize contracts (read-only until autoConnect is called)
    this.contracts = {
      certID: new ethers.Contract(this.addresses.certID, CERT_ID_ABI, this.provider),
      chainCertify: new ethers.Contract(this.addresses.chainCertify, CHAIN_CERTIFY_ABI, this.provider),
    };

    // Initialize modules
    this.identity = new IdentityModule(this);
    this.resolver = new EcosystemResolver(this);
  }

  /**
   * Connect with a private key for write operations
   * Uses CERT_PRIVATE_KEY from environment if not provided
   */
  async autoConnect(privateKey?: string): Promise<boolean> {
    const key = privateKey || this.config.privateKey;
    if (!key) {
      throw new Error('CertSDK: No private key found. Set CERT_PRIVATE_KEY in .env or pass to autoConnect()');
    }

    this.signer = new ethers.Wallet(key, this.provider);
    
    // Reconnect contracts with signer for write operations
    this.contracts.certID = this.contracts.certID.connect(this.signer) as ethers.Contract;
    this.contracts.chainCertify = this.contracts.chainCertify.connect(this.signer) as ethers.Contract;

    return true;
  }

  /**
   * Get the connected wallet address
   */
  async getAddress(): Promise<string | null> {
    return this.signer ? await this.signer.getAddress() : null;
  }

  /**
   * Check if SDK is connected with a signer
   */
  isConnected(): boolean {
    return this.signer !== null;
  }

  /**
   * Get basic profile from CertID contract
   */
  async getProfile(address: string): Promise<CertIDProfile | null> {
    try {
      const result = await this.contracts.certID.getProfile(address);
      return {
        handle: result.handle,
        metadataURI: result.metadataURI,
        isVerified: result.isVerified,
        trustScore: Number(result.trustScore),
        entityType: Number(result.entityType) as EntityType,
        isActive: result.isActive,
      };
    } catch {
      return null;
    }
  }

  /**
   * Register a new CertID profile
   */
  async registerProfile(request: RegisterProfileRequest): Promise<SDKResult<string>> {
    if (!this.isConnected()) {
      return { success: false, error: 'SDK not connected. Call autoConnect() first.' };
    }

    try {
      const tx = await this.contracts.certID.registerProfile(
        request.handle,
        request.metadataURI,
        request.entityType
      );
      await tx.wait();
      return { success: true, txHash: tx.hash };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }

  /**
   * Resolve a handle to an address
   */
  async resolveHandle(handle: string): Promise<string | null> {
    try {
      const address = await this.contracts.certID.resolveHandle(handle);
      return address === ethers.ZeroAddress ? null : address;
    } catch {
      return null;
    }
  }

  /**
   * Check if an address has an active profile
   */
  async hasProfile(address: string): Promise<boolean> {
    try {
      return await this.contracts.certID.isProfileActive(address);
    } catch {
      return false;
    }
  }
}

// Default export for convenience
export default CertSDK;

