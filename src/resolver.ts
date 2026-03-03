/**
 * Ecosystem Resolver for Cert-SDK
 * Resolves transaction hashes into human-readable identity-aware data
 */

import { ethers } from 'ethers';
import type { CertSDK } from './index';
import type { ResolvedTransaction, FullIdentity, AppData } from './types';

/**
 * Resolves blockchain transactions to ecosystem-aware data objects
 * Transforms raw hex data into human-readable identity information
 */
export class EcosystemResolver {
  private sdk: CertSDK;

  constructor(sdk: CertSDK) {
    this.sdk = sdk;
  }

  /**
   * Resolve a transaction hash into a comprehensive ecosystem data object
   * @param txHash - Transaction hash to resolve
   * @returns Resolved transaction with identity and application data
   */
  async resolve(txHash: string): Promise<ResolvedTransaction | null> {
    try {
      // Fetch raw transaction data
      const [tx, receipt] = await Promise.all([
        this.sdk.provider.getTransaction(txHash),
        this.sdk.provider.getTransactionReceipt(txHash),
      ]);

      if (!tx) {
        return null;
      }

      // Resolve identities for participants
      const [fromIdentity, toIdentity] = await Promise.all([
        this.sdk.identity.getFullIdentity(tx.from),
        tx.to ? this.sdk.identity.getFullIdentity(tx.to) : Promise.resolve(null),
      ]);

      // Detect application-specific context
      const appData = await this.detectApplication(tx);

      // Get block for timestamp
      let timestamp = new Date().toISOString();
      if (receipt && receipt.blockNumber) {
        const block = await this.sdk.provider.getBlock(receipt.blockNumber);
        if (block) {
          timestamp = new Date(Number(block.timestamp) * 1000).toISOString();
        }
      }

      // Calculate gas fee
      const gasFee = receipt
        ? ethers.formatEther(receipt.gasUsed * (tx.gasPrice || 0n))
        : '0';

      return {
        hash: tx.hash,
        status: receipt ? (receipt.status === 1 ? 'Success' : 'Failed') : 'Pending',
        timestamp,
        value: ethers.formatEther(tx.value),
        gasFee,
        participants: {
          from: fromIdentity || this.createAnonymousIdentity(tx.from),
          to: tx.to ? (toIdentity || this.createAnonymousIdentity(tx.to)) : this.createContractCreation(),
        },
        application: appData,
        network: 'Cert Mainnet',
      };
    } catch (error) {
      console.error('EcosystemResolver: Failed to resolve transaction', error);
      return null;
    }
  }

  /**
   * Detect if transaction interacted with a known ecosystem application
   */
  private async detectApplication(tx: ethers.TransactionResponse): Promise<AppData | null> {
    if (!tx.to) {
      return { app: 'Unknown', action: 'Contract Creation' };
    }

    const toAddress = tx.to.toLowerCase();

    // Check if Chain Certify transaction
    if (toAddress === this.sdk.addresses.chainCertify.toLowerCase()) {
      return {
        app: 'Chain Certify',
        action: 'File Attestation',
        decoded: this.decodeChainCertifyCall(tx.data),
      };
    }

    // Check if Cert Token transaction
    if (toAddress === this.sdk.addresses.certToken.toLowerCase()) {
      return {
        app: 'Cert Token',
        action: 'Token Transfer',
      };
    }

    // Check if CertID transaction
    if (toAddress === this.sdk.addresses.certID.toLowerCase()) {
      return {
        app: 'Unknown',
        action: 'CertID Operation',
        decoded: this.decodeCertIDCall(tx.data),
      };
    }

    return null;
  }

  /**
   * Decode Chain Certify contract call data
   */
  private decodeChainCertifyCall(data: string): Record<string, unknown> {
    try {
      const iface = new ethers.Interface([
        'function attestFile(bytes32 fileHash, string fileType)',
      ]);
      const decoded = iface.parseTransaction({ data });
      if (decoded) {
        return {
          method: decoded.name,
          fileHash: decoded.args[0],
          fileType: decoded.args[1],
        };
      }
    } catch {
      // Unable to decode
    }
    return { raw: data };
  }

  /**
   * Decode CertID contract call data
   */
  private decodeCertIDCall(data: string): Record<string, unknown> {
    try {
      const iface = new ethers.Interface([
        'function registerProfile(string handle, string metadataURI, uint8 entityType)',
        'function awardBadge(address user, string badgeName)',
        'function updateTrustScore(address user, uint256 score)',
      ]);
      const decoded = iface.parseTransaction({ data });
      if (decoded) {
        return {
          method: decoded.name,
          args: decoded.args,
        };
      }
    } catch {
      // Unable to decode
    }
    return { raw: data };
  }

  /**
   * Create anonymous identity placeholder
   */
  private createAnonymousIdentity(address: string): FullIdentity {
    return {
      address,
      handle: 'Anonymous',
      metadata: '',
      isVerified: false,
      isInstitutional: false,
      trustScore: 0,
      entityType: 0,
      badges: [],
      isKYC: false,
      isAcademic: false,
      isCreator: false,
    };
  }

  /**
   * Create contract creation placeholder
   */
  private createContractCreation(): FullIdentity {
    return {
      address: '0x0',
      handle: 'Contract Creation',
      metadata: '',
      isVerified: false,
      isInstitutional: false,
      trustScore: 0,
      entityType: 0,
      badges: [],
      isKYC: false,
      isAcademic: false,
      isCreator: false,
    };
  }
}

