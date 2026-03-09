> **MANDATORY UPDATE**: Users must update to version `0.1.10` or higher. The underlying `CertIDManager` contract has been redeployed to a secure address (0xB05d...3CaA). Previous versions will no longer function correctly.

# CertID SDK: Sovereign Edge Identity

The CertID SDK provides a hardware-anchored, keyless identity layer for L2 ecosystems. By utilizing W3C WebAuthn standards (P-256) and Arbitrum Stylus (Rust-WASM), CertID enables secure, sub-second biometric verification on-chain without the friction of browser-based wallet extensions.

## Getting Started

### 1. Installation

Standard installation:
```bash
npm install @cert-id/sdk
```

If you encounter `ERESOLVE` or peer dependency conflicts (e.g., with `ethers` v5), use:
```bash
npm install @cert-id/sdk ethers@latest
```


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

## Engineering Principles

- **Gas-Optimized**: Verified to execute within ~1.1M gas limits for Stylus verification.
- **Non-Custodial**: No seed phrases or private keys stored in the browser; your biometrics act as the signing authority.
- **Chain-Agnostic**: Logic is portable across EVM-compatible and WASM-based environments (Arbitrum, Stellar, Starknet).
