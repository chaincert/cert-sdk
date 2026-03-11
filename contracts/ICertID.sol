// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

/**
 * @title ICertID
 * @dev The official interface for the CertID Sovereign Identity Layer.
 * Acts as the L1/L2 entrypoint for registering and verifying hardware
 * attestations routed to the Arbitrum Stylus Rust engine.
 */
interface ICertID {
    
    /**
     * @dev Registers a new device on Arbitrum L2.
     * @param device_id The 32-byte cryptographic identifier for the device.
     * @param owner The address of the device's human owner.
     */
    function registerDevice(bytes32 device_id, address owner) external;

    /**
     * @dev Updates the Trust Score of a registered device.
     * @param device_id The 32-byte cryptographic identifier for the device.
     * @param new_score The updated trust score (0-100).
     */
    function updateTrustScore(bytes32 device_id, uint256 new_score) external;

    /**
     * @dev Verifies a TEE Attestation via the Stylus Rust engine.
     * @param device_id The 32-byte cryptographic identifier for the device.
     * @param attestation_data The raw attestation payload from the device.
     * @return bool True if the attestation is mathematically valid.
     */
    function verifyTeeAttestation(bytes32 device_id, bytes calldata attestation_data) external returns (bool);

    /**
     * @dev Returns the trust score for a specific device ID.
     * @param device_id The 32-byte cryptographic identifier for the device.
     * @return The trust score.
     */
    function getDeviceTrust(bytes32 device_id) external view returns (uint256);
    
    /**
     * @dev Returns the owner address for a specific device ID.
     * @param device_id The 32-byte cryptographic identifier for the device.
     * @return The owner address.
     */
    function getDeviceOwner(bytes32 device_id) external view returns (address);

    /**
     * @dev Returns the total number of successful verifications across the protocol.
     * @return The total verifications count.
     */
    function getTotalVerifications() external view returns (uint256);
}
