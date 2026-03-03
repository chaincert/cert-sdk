/**
 * Identity Module for Cert-SDK
 * Handles full identity resolution including badges and trust metrics
 */

import { ethers } from 'ethers';
import type { CertSDK } from './index';
import { STANDARD_BADGES, BADGE_NAMES, BADGE_ICONS } from './constants';
import type { FullIdentity, EntityType, BadgeType, SDKResult } from './types';

/**
 * Module for managing CertID identities and Soulbound badges
 */
export class IdentityModule {
  private sdk: CertSDK;

  constructor(sdk: CertSDK) {
    this.sdk = sdk;
  }

  /**
   * Fetches a complete identity object including all badges
   * @param address - Wallet address to look up
   * @returns Full identity with badges and trust metrics
   */
  async getFullIdentity(address: string): Promise<FullIdentity | null> {
    try {
      const profile = await this.sdk.contracts.certID.getProfile(address);

      if (!profile.isActive) {
        return {
          address,
          handle: 'Anonymous',
          metadata: '',
          isVerified: false,
          isInstitutional: false,
          trustScore: 0,
          entityType: 0 as EntityType,
          badges: [],
          isKYC: false,
          isAcademic: false,
          isCreator: false,
        };
      }

      // Check all standard badges
      const badges = await this.checkStandardBadges(address);

      return {
        address,
        handle: profile.handle || 'Anonymous',
        metadata: profile.metadataURI,
        isVerified: profile.isVerified,
        isInstitutional: Number(profile.entityType) === 1, // Institution
        trustScore: Number(profile.trustScore),
        entityType: Number(profile.entityType) as EntityType,
        badges,
        isKYC: badges.includes('KYC_L1') || badges.includes('KYC_L2'),
        isAcademic: badges.includes('ACADEMIC_ISSUER'),
        isCreator: badges.includes('VERIFIED_CREATOR'),
      };
    } catch {
      return null;
    }
  }

  /**
   * Check all standard badges for an address
   * @param address - Address to check badges for
   * @returns Array of badge names the address holds
   */
  async checkStandardBadges(address: string): Promise<string[]> {
    const badges: string[] = [];

    const badgeChecks = await Promise.all(
      STANDARD_BADGES.map(async (badge) => {
        try {
          const hasBadge = await this.sdk.contracts.certID.hasBadge(address, badge);
          return { badge, hasBadge };
        } catch {
          return { badge, hasBadge: false };
        }
      })
    );

    for (const { badge, hasBadge } of badgeChecks) {
      if (hasBadge) {
        badges.push(badge);
      }
    }

    return badges;
  }

  /**
   * Award a badge to a user (requires authorized signer)
   * @param userAddress - Address to award badge to
   * @param badgeName - Name of badge to award
   */
  async awardBadge(userAddress: string, badgeName: BadgeType): Promise<SDKResult<string>> {
    if (!this.sdk.isConnected()) {
      return { success: false, error: 'SDK not connected. Call autoConnect() first.' };
    }

    try {
      const tx = await this.sdk.contracts.certID.awardBadge(userAddress, badgeName);
      await tx.wait();
      return { success: true, txHash: tx.hash };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }

  /**
   * Revoke a badge from a user (requires authorized signer)
   * @param userAddress - Address to revoke badge from
   * @param badgeName - Name of badge to revoke
   */
  async revokeBadge(userAddress: string, badgeName: BadgeType): Promise<SDKResult<string>> {
    if (!this.sdk.isConnected()) {
      return { success: false, error: 'SDK not connected. Call autoConnect() first.' };
    }

    try {
      const tx = await this.sdk.contracts.certID.revokeBadge(userAddress, badgeName);
      await tx.wait();
      return { success: true, txHash: tx.hash };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }

  /**
   * Update trust score for a user (requires authorized signer)
   */
  async updateTrustScore(userAddress: string, score: number): Promise<SDKResult<string>> {
    if (!this.sdk.isConnected()) {
      return { success: false, error: 'SDK not connected. Call autoConnect() first.' };
    }

    if (score < 0 || score > 100) {
      return { success: false, error: 'Score must be between 0 and 100' };
    }

    try {
      const tx = await this.sdk.contracts.certID.updateTrustScore(userAddress, score);
      await tx.wait();
      return { success: true, txHash: tx.hash };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }

  /**
   * Set verification status for a user (requires authorized signer)
   */
  async setVerificationStatus(userAddress: string, verified: boolean): Promise<SDKResult<string>> {
    if (!this.sdk.isConnected()) {
      return { success: false, error: 'SDK not connected. Call autoConnect() first.' };
    }

    try {
      const tx = await this.sdk.contracts.certID.setVerificationStatus(userAddress, verified);
      await tx.wait();
      return { success: true, txHash: tx.hash };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }

  /**
   * Register a hardware passkey on-chain
   * @param publicKeyHex - Raw public key from WebAuthn
   */
  async registerHardwareIdentity(publicKeyHex: string): Promise<SDKResult<string>> {
    if (!this.sdk.isConnected()) {
      return { success: false, error: 'SDK not connected. Call autoConnect() first.' };
    }

    try {
      let safePublicKey = publicKeyHex.startsWith('0x') ? publicKeyHex : '0x' + publicKeyHex;
      // Strip 0x04 uncompressed prefix → send only the raw 64-byte x‖y
      if (safePublicKey.startsWith('0x04') && safePublicKey.length === 132) {
        safePublicKey = '0x' + safePublicKey.slice(4);
      }

      const tx = await this.sdk.contracts.certID.registerHardwareIdentity(
        safePublicKey,
        { value: ethers.parseEther('0.0005') }
      );
      await tx.wait();
      return { success: true, txHash: tx.hash };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }

  /**
   * Verify a WebAuthn biometric login signature on-chain
   * @param authDataHex - authenticatorData from WebAuthn
   * @param clientDataJSONHex - clientDataJSON from WebAuthn
   * @param rHex - R component of signature
   * @param sHex - S component of signature
   * @param address - Address of the user (to resolve on-chain key)
   */
  async verifyBiometricLogin(
    authDataHex: string,
    clientDataJSONHex: string,
    rHex: string,
    sHex: string,
    address: string
  ): Promise<boolean> {
    try {
      const cleanR = rHex.replace('0x', '');
      const cleanS = sHex.replace('0x', '');
      const signatureBytes = '0x' + cleanR + cleanS;

      const safeAuthData = authDataHex.startsWith('0x') ? authDataHex : '0x' + authDataHex;
      const safeClientData = clientDataJSONHex.startsWith('0x') ? clientDataJSONHex : '0x' + clientDataJSONHex;

      const clientDataHash = ethers.sha256(safeClientData);
      const signedDataBytes = ethers.concat([safeAuthData, clientDataHash]);
      const messageToVerify = ethers.sha256(signedDataBytes);

      const isValid = await this.sdk.contracts.certID.verifyBiometricLogin.staticCall(
        messageToVerify,
        signatureBytes,
        {
          gasLimit: 2_000_000,
          from: address
        }
      );

      return isValid;
    } catch (error) {
      console.error('[CertSDK] verifyBiometricLogin failed:', error);
      return false;
    }
  }

  /**
   * Get human-readable badge display info
   */
  getBadgeDisplayInfo(badgeName: string): { name: string; icon: string } {
    return {
      name: BADGE_NAMES[badgeName] || badgeName,
      icon: BADGE_ICONS[badgeName] || '🏷️',
    };
  }

  /**
   * Format badges for display with icons
   */
  formatBadgesForDisplay(badges: string[]): Array<{ id: string; name: string; icon: string }> {
    return badges.map(badge => ({
      id: badge,
      ...this.getBadgeDisplayInfo(badge),
    }));
  }
}

