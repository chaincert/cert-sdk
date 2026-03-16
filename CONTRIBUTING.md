# Contributing to CertID

First off, thank you for considering contributing to CertID! We are building the "Silicon-to-Chain" sovereign identity layer, and ecosystem contributions are critical to making hardware-anchored security accessible to everyone.

This document outlines the process for contributing to the @cert-id/sdk and our Arbitrum Stylus (Rust-WASM) smart contracts.

## 🛡️ 1. Security First

CertID handles cryptographic identity and institutional-grade verification.
If you discover a security vulnerability, **DO NOT** open a public issue or PR. Please refer to our [SECURITY.md](SECURITY.md) for instructions on how to responsibly disclose vulnerabilities directly to the core team.

## 💻 2. Local Development & Environment Setup

Because the CertID SDK bridges WebAuthn (hardware cryptography) with Web3 dependencies (Ethers v6), local environments can be sensitive—especially on Windows.

### Prerequisites:
- Node.js (v18 or higher recommended)
- A modern browser with WebAuthn support (Chrome, Edge, Safari)

### The Windows / React 19 Survival Guide:
If you are developing on a Windows machine or integrating CertID into a React 19 environment, you may run into node-gyp C++ compilation errors or ERESOLVE peer dependency clashes with Web3 libraries.

To bypass this and install the repository cleanly, use the following flags:
```bash
npm install --legacy-peer-deps --ignore-scripts
```
**Note:** We strictly advise against running `npm audit fix` in this repository, as it frequently breaks legacy Web3 cryptographic dependency trees.

## 🏗️ 3. Architecture Context

Before submitting a PR, please understand our Dual-Signature Architecture:
- The SDK (TypeScript): Handles the frontend WebAuthn API prompt to extract the P-256 signature from the user's hardware Secure Enclave.
- The Smart Contracts (Rust/WASM): Our Arbitrum Stylus contracts intercept the payload and verify the NIST P-256 signature natively on-chain.

If you are contributing to the SDK, ensure your output perfectly matches the hex-encoded calldata expected by the Stylus verifier.

## 📝 4. Pull Request Process

We review all PRs to ensure they meet our standard for institutional resilience.
- **Fork & Branch:** Fork the repository and create your branch from main. Use descriptive branch names (e.g., feat/add-tax-vault-example or fix/webauthn-timeout).
- **Keep it Focused:** Submit one PR per feature or fix. Do not bundle massive architectural changes together.
- **Code Style:** * Match the existing formatting.*
  - Ensure your code is thoroughly commented, especially around cryptographic handoffs.
- **Draft the PR:** Clearly describe what you changed and why. If your PR resolves an open issue, link it (e.g., "Closes #12").
- **Review:** A core team member will review your PR. We may request changes to ensure gas optimization and security compliance.

🤝 5. Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). We expect all contributors to maintain a professional, respectful environment.