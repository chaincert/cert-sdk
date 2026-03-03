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
        message: 'Transaction not found on Cert Blockchain.',
      };
    }

    // Check if this is a Chain Certify attestation
    if (txData.application?.app !== 'Chain Certify') {
      return {
        status: 'INVALID',
        message: 'Transaction not recognized as an attestation.',
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
      message: 'Failed to connect to Cert Blockchain.',
    };
  }
}

/**
 * Verify a file by its hash (not transaction)
 * Used when the file hash is known but tx is not
 * 
 * @param fileHash - SHA-256 hash of the file
 * @returns Verification result
 */
export async function verifyFileHash(fileHash: string): Promise<VerificationResult> {
  try {
    // Query Chain Certify contract for this file hash
    const attestation = await sdk.contracts.chainCertify.getAttestation(fileHash);

    if (!attestation || attestation.signer === '0x0000000000000000000000000000000000000000') {
      return {
        status: 'INVALID',
        message: 'File hash not found on Cert Blockchain.',
      };
    }

    // Get full identity of the signer
    const signerIdentity = await sdk.identity.getFullIdentity(attestation.signer);

    return {
      status: 'AUTHENTIC',
      timestamp: new Date(Number(attestation.timestamp) * 1000).toISOString(),
      document: {
        hash: fileHash,
        type: attestation.fileType,
      },
      issuer: {
        handle: signerIdentity?.handle || attestation.handle || 'Anonymous',
        isVerified: signerIdentity?.isVerified || false,
        trustScore: signerIdentity?.trustScore || 0,
        badges: signerIdentity?.badges || [],
      },
    };
  } catch (error) {
    console.error('File Hash Verification Error:', error);
    return {
      status: 'ERROR',
      message: 'Failed to verify file hash.',
    };
  }
}

/**
 * Express.js/Next.js compatible handler
 */
export async function handler(req: { query: { tx?: string; hash?: string } }, res: { json: (data: VerificationResult) => void }) {
  const { tx, hash } = req.query;

  if (tx) {
    const result = await verifyDocument(tx);
    return res.json(result);
  }

  if (hash) {
    const result = await verifyFileHash(hash);
    return res.json(result);
  }

  return res.json({
    status: 'ERROR',
    message: 'Missing required parameter: tx or hash',
  });
}

export default handler;

