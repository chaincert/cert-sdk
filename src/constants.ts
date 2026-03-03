/**
 * Constants for Cert-SDK
 * Network configuration and contract addresses
 */

// Network Configuration
export const CERT_CHAIN_ID = 'cert_4283207343-1';
export const CERT_EVM_CHAIN_ID = 4283207343;
export const CERT_RPC_URL = 'https://rpc.c3rt.org';
export const CERT_API_URL = 'https://api.c3rt.org/api/v1';
export const CERT_IPFS_GATEWAY = 'https://ipfs.c3rt.org';

// Contract Addresses (deployed on Cert Blockchain)
export const CONTRACT_ADDRESSES = {
  CERT_ID: process.env.CERT_ID_ADDRESS || '0xBB74d00D1588DF111e9df04DCdf1a3C22Ad7df3a',
  CHAIN_CERTIFY: process.env.CHAIN_CERTIFY_ADDRESS || '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640',
  CERT_TOKEN: process.env.CERT_TOKEN_ADDRESS || '0xc3rt000000000000000000000000000000000001',
  EAS: '0x0000000000000000000000000000000000000002',
  SCHEMA_REGISTRY: '0x0000000000000000000000000000000000000001',
};

// Standard Badge IDs (keccak256 hashes)
export const BADGE_IDS = {
  KYC_L1: '0x' + Buffer.from('KYC_L1').toString('hex').padEnd(64, '0'),
  KYC_L2: '0x' + Buffer.from('KYC_L2').toString('hex').padEnd(64, '0'),
  ACADEMIC_ISSUER: '0x' + Buffer.from('ACADEMIC_ISSUER').toString('hex').padEnd(64, '0'),
  VERIFIED_CREATOR: '0x' + Buffer.from('VERIFIED_CREATOR').toString('hex').padEnd(64, '0'),
  GOV_AGENCY: '0x' + Buffer.from('GOV_AGENCY').toString('hex').padEnd(64, '0'),
  LEGAL_ENTITY: '0x' + Buffer.from('LEGAL_ENTITY').toString('hex').padEnd(64, '0'),
  ISO_9001_CERTIFIED: '0x' + Buffer.from('ISO_9001_CERTIFIED').toString('hex').padEnd(64, '0'),
};

// Standard badge names for display
export const BADGE_NAMES: Record<string, string> = {
  KYC_L1: 'KYC Level 1',
  KYC_L2: 'KYC Level 2',
  ACADEMIC_ISSUER: 'Academic Issuer',
  VERIFIED_CREATOR: 'Verified Creator',
  GOV_AGENCY: 'Government Agency',
  LEGAL_ENTITY: 'Legal Entity',
  ISO_9001_CERTIFIED: 'ISO 9001 Certified',
};

// Badge emoji icons for UI
export const BADGE_ICONS: Record<string, string> = {
  KYC_L1: '🆔',
  KYC_L2: '🛡️',
  ACADEMIC_ISSUER: '🎓',
  VERIFIED_CREATOR: '🎨',
  GOV_AGENCY: '🏛️',
  LEGAL_ENTITY: '⚖️',
  ISO_9001_CERTIFIED: '✅',
};

// Badge color codes (per visual standards)
export const BADGE_COLORS: Record<string, string> = {
  KYC_L1: '#00FF41',      // Matrix Green
  KYC_L2: '#00FF41',
  ACADEMIC_ISSUER: '#00F2FF', // Cyan
  VERIFIED_CREATOR: '#BC00FF', // Purple/Electric
  GOV_AGENCY: '#FF003C',      // Neon Red
  LEGAL_ENTITY: '#FFD700',    // Gold
  ISO_9001_CERTIFIED: '#00F2FF',
};

// CertID Contract ABI (essential functions)
export const CERT_ID_ABI = [
  'function registerProfile(string handle, string metadataURI, uint8 entityType) external',
  'function updateMetadata(string metadataURI) external',
  'function awardBadge(address user, string badgeName) external',
  'function revokeBadge(address user, string badgeName) external',
  'function updateTrustScore(address user, uint256 score) external',
  'function incrementTrustScore(address user, uint256 amount) external',
  'function setVerificationStatus(address user, bool verified) external',
  'function getProfile(address user) external view returns (string handle, string metadataURI, bool isVerified, uint256 trustScore, uint8 entityType, bool isActive)',
  'function hasBadge(address user, string badgeName) external view returns (bool)',
  'function getHandle(address user) external view returns (string)',
  'function resolveHandle(string handle) external view returns (address)',
  'function isProfileActive(address user) external view returns (bool)',
  'function getTrustScore(address user) external view returns (uint256)',
  'function registerHardwareIdentity(bytes publicKey) external payable',
  'function verifyBiometricLogin(bytes32 msgHash, bytes signature) external view returns (bool)',
  'function userPublicKeys(address user) external view returns (bytes)',
  'event ProfileCreated(address indexed user, string handle)',
  'event ProfileUpdated(address indexed user, string handle)',
  'event BadgeAwarded(address indexed user, bytes32 indexed badgeId, string badgeName)',
  'event BadgeRevoked(address indexed user, bytes32 indexed badgeId)',
  'event TrustScoreUpdated(address indexed user, uint256 oldScore, uint256 newScore)',
  'event VerificationStatusChanged(address indexed user, bool isVerified)',
];

// Chain Certify Contract ABI (essential functions)
export const CHAIN_CERTIFY_ABI = [
  'function attestFile(bytes32 fileHash, string fileType) external',
  'function getAttestation(bytes32 fileHash) external view returns (address signer, string handle, uint256 timestamp, string fileType)',
  'function isAttested(bytes32 fileHash) external view returns (bool)',
  'event FileAttested(bytes32 indexed fileHash, address indexed signer, string fileType)',
];

// Standard badges to check
export const STANDARD_BADGES = [
  'KYC_L1',
  'KYC_L2',
  'ACADEMIC_ISSUER',
  'VERIFIED_CREATOR',
  'GOV_AGENCY',
  'LEGAL_ENTITY',
  'ISO_9001_CERTIFIED',
];

// Trust score thresholds
export const TRUST_THRESHOLDS = {
  LOW: 30,
  MEDIUM: 60,
  HIGH: 90,
};

