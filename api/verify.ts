/**
 * Verification Gateway API for Cert-SDK
 * Provides document verification via QR code scanning
 * 
 * Endpoint: /api/verify?tx=[HASH]
 */

import { CertSDK } from '../src';
import type { VerificationResult } from '../src/types';

// Initialize SDK (server-side)
const sdk = new CertSDK();

/**
 * Validates a document hash and resolves the issuer's identity
 * Returns a "Trust Package" with complete issuer credentials
 * 
 * @param txHash - Transaction hash from QR code
 * @returns Verification result with issuer profile
 */
export async function verifyDocument(txHash: string): Promise<VerificationResult> {
  try {
    // Resolve the transaction from blockchain
    const txData = await sdk.resolver.resolve(txHash);

    if (!txData) {
      return {
        status: 'INVALID',
        message: 'Transaction not found on network.',
      };
    }

    if (txData.application?.app !== 'CertID') {
      return {
        status: 'INVALID',
        message: 'Transaction not recognized as a CertID operation.',
      };
    }

    // Get issuer profile
    const issuerProfile = txData.participants.from;

    if (!issuerProfile) {
      return {
        status: 'INVALID',
        message: 'Could not resolve issuer identity.',
      };
    }

    // Return the "Trust Package"
    return {
      status: 'AUTHENTIC',
      timestamp: txData.timestamp,
      document: {
        hash: txData.application.decoded?.fileHash as string || 'Unknown',
        type: txData.application.decoded?.fileType as string || 'Unknown',
      },
      issuer: {
        handle: issuerProfile.handle,
        isVerified: issuerProfile.isVerified,
        trustScore: issuerProfile.trustScore,
        badges: issuerProfile.badges,
      },
    };
  } catch (error) {
    console.error('Verification Gateway Error:', error);
    return {
      status: 'ERROR',
      message: 'Failed to connect to network.',
    };
  }
}

/**
 * Express.js/Next.js compatible handler
 */
export async function handler(req: { query: { tx?: string } }, res: { json: (data: VerificationResult) => void }) {
  const { tx } = req.query;

  if (tx) {
    const result = await verifyDocument(tx);
    return res.json(result);
  }

  return res.json({
    status: 'ERROR',
    message: 'Missing required parameter: tx',
  });
}

export default handler;

