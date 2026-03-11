/**
 * Ecosystem Resolver for Cert-SDK
 * Resolves transaction hashes into human-readable identity-aware data
 */

import { ethers } from 'ethers';
import type { CertSDK } from './index';
import type { ResolvedTransaction, AppData } from './types';

/**
 * Resolves blockchain transactions into basic CertID context
 */
export class EcosystemResolver {
  private sdk: CertSDK;

  constructor(sdk: CertSDK) {
    this.sdk = sdk;
  }

  /**
   * Resolve a transaction hash into a basic transaction object
   * @param txHash - Transaction hash to resolve
   * @returns Resolved transaction data
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
          from: tx.from,
          to: tx.to || null,
        },
        application: appData,
        network: 'Arbitrum Stylus',
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

    // Check if CertID transaction
    if (toAddress === this.sdk.addresses.certID.toLowerCase()) {
      return {
        app: 'CertID',
        action: 'CertID Operation',
        decoded: this.decodeCertIDCall(tx.data),
      };
    }

    return null;
  }

  /**
   * Decode CertID contract call data
   */
  private decodeCertIDCall(data: string): Record<string, unknown> {
    try {
      const iface = new ethers.Interface([
        'function registerDevice(bytes32 device_id, address owner)',
        'function updateTrustScore(bytes32 device_id, uint256 new_score)',
        'function verifyTeeAttestation(bytes32 device_id, bytes attestation_data)',
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
}

