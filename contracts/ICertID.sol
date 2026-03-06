// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

/**
 * @title ICertID
 * @dev The official interface for the CertID Sovereign Identity Layer.
 * Use this interface to connect your dApp's smart contracts to the CertID 
 * hardware-to-chain verification engine on Arbitrum.
 */
interface ICertID {
    
    /**
     * @dev Registers a new user's hardware public key (Secure Enclave / Passkey).
     * This transaction requires a registration fee payable to the CertID protocol.
     * @param publicKey The 64-byte uncompressed P-256 public key (X and Y coordinates).
     */
    function registerHardwareIdentity(bytes calldata publicKey) external payable;

    /**
     * @dev Verifies a NIST P-256 hardware biometric signature against the user's registered key.
     * This calls the CertID Arbitrum Stylus Rust engine under the hood.
     * @param msgHash The sha256(authData || sha256(clientDataJSON)) representing the WebAuthn challenge.
     * @param signature The raw r||s signature (64 bytes) from the device's Secure Enclave.
     * @return bool True if the signature is mathematically valid and belongs to the caller.
     */
    function verifyBiometricLogin(bytes32 msgHash, bytes calldata signature) external view returns (bool);

    /**
     * @dev Returns the 64-byte public key registered to a specific Ethereum address.
     * @param user The address of the user.
     * @return The public key bytes.
     */
    function userPublicKeys(address user) external view returns (bytes memory);
    
    /**
     * @dev Returns the current registration fee required to onboard a new hardware identity.
     */
    function registrationFee() external view returns (uint256);
}
