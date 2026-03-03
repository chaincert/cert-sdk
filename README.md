# @certid/sdk

The official SDK for integrating the **CertID Sovereign Identity Layer** into your dApps and smart contracts.

CertID allows you to leverage hardware-anchored identity verification using Apple FaceID, TouchID, and Android Biometrics directly from your smart contracts. It securely verifies passkeys generated in the device's Secure Enclave against an Arbitrum Stylus Rust engine.

## Installation

```bash
npm install @certid/sdk
```

## Smart Contract Integration (`ICertID.sol`)

Your smart contract can easily interface with the CertID Manager on Arbitrum Sepolia.

Use the `ICertID.sol` interface to easily hook into the deployed contract:

```solidity
import "@certid/sdk/contracts/ICertID.sol";

contract MyDePINDApp {
    // Arbitrum Sepolia CertIDManager Address
    ICertID public certId = ICertID(0x67921Ae6eFA1c1Ca024725F425056FFaf7705c1E);

    function doHighSecurityAction(bytes32 msgHash, bytes calldata signature) public {
        // 1. Ask CertID to verify the FaceID signature
        bool isHuman = certId.verifyBiometricLogin(msgHash, signature);
        require(isHuman, "Biometric proof failed!");

        // 2. Execute their dApp's logic...
    }
}
```

## Frontend Integration (`CertIDClient`)

Use the included helper functions to orchestrate WebAuthn generation, formatting, and submission via Ethers.js.

```typescript
import { CertIDClient } from '@certid/sdk';

// Initialize the client via browser wallet
const client = new CertIDClient();

// 1. Register a new Hardware Key (0.0005 ETH Fee)
const isRegistered = await client.registerHardwareIdentity(publicKeyHex);

// 2. Verify a Biometric Login Signature
const isValid = await client.verifyBiometricLogin(
    authDataHex, 
    clientDataJSONHex, 
    rHex, 
    sHex
);
```

## Supported Networks

- **Arbitrum Sepolia:** `0x67921Ae6eFA1c1Ca024725F425056FFaf7705c1E`
