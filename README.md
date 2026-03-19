> **MANDATORY UPDATE**: Users must update to version `0.1.18` or higher. This latest version is the only supported and good version. The underlying `CertIDManager` contract has been redeployed to a secure address (old versions will fail) and it has the corrected c3rt.org website domain. Previous versions will no longer function correctly.

# CertID SDK: Sovereign Edge Identity

The CertID SDK provides a hardware-anchored, keyless identity layer for L2 ecosystems. By utilizing W3C WebAuthn standards (P-256) and Arbitrum Stylus (Rust-WASM), CertID enables secure, sub-second biometric verification on-chain without the friction of browser-based wallet extensions.

## Getting Started

### 1. Installation

```bash
npm install @cert-id/sdk
```

> **Note**: The SDK bundles its own `ethers` v6 internally. If your project uses `ethers` v5 (e.g., with Hardhat or Chainlink), there will be no conflicts.


### 2. Initialization

Initialize the provider by pointing it to your CertIDManager contract address.

```javascript
import { CertIDProvider } from '@cert-id/sdk';

const certID = new CertIDProvider({
  rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
  contractAddress: "0xB05dBBAe660C4F2ebD917638760e608b3c263CaA"
});
```

### 3. Registering a Device

Trigger the hardware-anchored registration flow (requires user biometric interaction).

```javascript
const identity = await certID.registerDevice();
console.log("Device registered on-chain:", identity.txHash);
```

### 4. Biometric Verification

Authenticate the user via the `verify` method. This returns a boolean validity check after executing the on-chain Stylus verification.

```javascript
const isValid = await certID.verify();
if (isValid) {
  console.log("Welcome to the Sovereign Edge.");
}
```

## Protocol Architecture Overview

CertID operates across three integrated layers to provide a complete decentralized identity solution:

1. **Wallet Layer (MetaMask / EVM Identity)**: Controls the identity on-chain and initiates transactions (paying gas, linking devices).
2. **Hardware/SDK Layer (WebAuthn)**: Uses device features (Secure Enclave, TouchID, FaceID) to generate secure P-256 signatures tying physical human presence to the EVM identity.
3. **Smart Contract Layer**: 
   - **Solidity Manager (`CertID.sol`)**: Handles device registration, manages the identity mapping, and enforces monetization (Toll road).
   - **Arbitrum Stylus Verifier (Rust WASM)**: Rapidly and cheaply verifies the P-256 signatures on-chain.

## Dual Authentication Flow

The SDK enforces a robust Dual Authentication model by combining standard Web3 mechanics with advanced hardware biometrics:

- **Factor 1 - Web3 Possession (MetaMask)**: The user must possess the private key of their Ethereum wallet to sign the initial blockchain transaction.
- **Factor 2 - Hardware Inherence (CertID)**: The user must physically interact with their device (via WebAuthn/FIDO2) to generate a native P-256 signature, which is verified on-chain.

By requiring *both* the EVM signature and the Secure Enclave signature to authorize high-value actions, apps can achieve unparalleled security against remote attacks, phishing, and private key theft.

## Engineering Principles

- **Gas-Optimized**: Verified to execute within ~1.1M gas limits for Stylus verification.
- **Non-Custodial**: No seed phrases or private keys stored in the browser; your biometrics act as the signing authority.
- **Chain-Agnostic**: Logic is portable across EVM-compatible and WASM-based environments (Arbitrum, Stellar, Starknet).
  
## License

This project is licensed under the [Apache License 2.0](LICENSE).

## Website
For more information, visit [c3rt.org](https://c3rt.org).
