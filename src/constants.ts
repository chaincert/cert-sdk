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
  'function registerDevice(bytes32 device_id, address owner) external',
  'function updateTrustScore(bytes32 device_id, uint256 new_score) external',
  'function verifyTeeAttestation(bytes32 device_id, bytes attestation_data) external returns (bool)',
  'function getDeviceTrust(bytes32 device_id) external view returns (uint256)',
  'function getDeviceOwner(bytes32 device_id) external view returns (address)',
  'function getTotalVerifications() external view returns (uint256)',
];

