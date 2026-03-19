/**
 * Constants for Cert-SDK
 * Network configuration and contract addresses
 */



// Contract Addresses
export const CONTRACT_ADDRESSES = {
  CERT_ID: process.env.CERT_ID_ADDRESS || '0xB05dBBAe660C4F2ebD917638760e608b3c263CaA',
};

// CertID Contract ABI (essential features for Hardware Biometric Verification)
export const CERT_ID_ABI = [
  'function registerHardwareIdentity(bytes publicKey) external payable',
  'function verifyBiometricLogin(bytes32 msgHash, bytes signature) external view returns (bool)',
];

