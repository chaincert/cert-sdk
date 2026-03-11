/**
 * Identity Module for Cert-SDK
 * Handles hardware identity registration and verification
 */

import type { CertSDK } from './index';
import type { SDKResult } from './types';

/**
 * Module for managing CertID hardware identities
 */
export class IdentityModule {
  private sdk: CertSDK;

  constructor(sdk: CertSDK) {
    this.sdk = sdk;
  }

  /**
   * Register a new device on Arbitrum L2.
   * @param deviceId - Device ID (bytes32)
   * @param owner - Owner Address
   */
  async registerDevice(deviceId: string, owner: string): Promise<SDKResult<string>> {
    if (!this.sdk.isConnected()) {
      return { success: false, error: 'SDK not connected. Call autoConnect() first.' };
    }

    try {
      const tx = await this.sdk.contracts.certID.registerDevice(deviceId, owner);
      await tx.wait();
      return { success: true, txHash: tx.hash };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }

  /**
   * Update the Trust Score of a registered device.
   * @param deviceId - Device ID (bytes32)
   * @param newScore - Trust Score (0-100)
   */
  async updateTrustScore(deviceId: string, newScore: number | bigint): Promise<SDKResult<string>> {
    if (!this.sdk.isConnected()) {
      return { success: false, error: 'SDK not connected. Call autoConnect() first.' };
    }

    try {
      const tx = await this.sdk.contracts.certID.updateTrustScore(deviceId, newScore);
      await tx.wait();
      return { success: true, txHash: tx.hash };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }

  /**
   * Verify a TEE Attestation
   * @param deviceId - Device ID (bytes32)
   * @param attestationData - Attestation Data bytes
   * @param address - Address of the operator executing this call
   */
  async verifyTeeAttestation(deviceId: string, attestationData: string, address: string): Promise<boolean> {
    try {
      const safeData = attestationData.startsWith('0x') ? attestationData : '0x' + attestationData;

      const isValid = await this.sdk.contracts.certID.verifyTeeAttestation(
        deviceId,
        safeData,
        {
          gasLimit: 2_000_000,
          from: address
        }
      );

      return isValid;
    } catch (error) {
      console.error('[CertSDK] verifyTeeAttestation failed:', error);
      return false;
    }
  }

  /**
   * Get the trust score for a device
   * @param deviceId - Device ID (bytes32)
   */
  async getDeviceTrust(deviceId: string): Promise<bigint | null> {
    try {
      return await this.sdk.contracts.certID.getDeviceTrust(deviceId);
    } catch (error) {
      console.error('[CertSDK] getDeviceTrust failed:', error);
      return null;
    }
  }

  /**
   * Get the owner address of a device
   * @param deviceId - Device ID (bytes32)
   */
  async getDeviceOwner(deviceId: string): Promise<string | null> {
    try {
      return await this.sdk.contracts.certID.getDeviceOwner(deviceId);
    } catch (error) {
      console.error('[CertSDK] getDeviceOwner failed:', error);
      return null;
    }
  }

  /**
   * Get total successful attestation verifications
   */
  async getTotalVerifications(): Promise<bigint | null> {
    try {
      return await this.sdk.contracts.certID.getTotalVerifications();
    } catch (error) {
      console.error('[CertSDK] getTotalVerifications failed:', error);
      return null;
    }
  }
}
