#!/usr/bin/env node

/**
 * Cert-Verify CLI Tool
 * Verify documents and resolve identities from the command line
 * 
 * Usage:
 *   cert-verify <tx-hash>           Verify a transaction
 *   cert-verify --file <path>       Verify a local file
 *   cert-verify --hash <sha256>     Verify a file hash
 *   cert-verify --identity <addr>   Look up a CertID profile
 */

const { CertSDK } = require('../dist/index.js');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
};

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    printHelp();
    process.exit(0);
  }

  const sdk = new CertSDK();

  // Handle --file flag
  if (args[0] === '--file' && args[1]) {
    await verifyFile(sdk, args[1]);
    return;
  }

  // Handle --hash flag
  if (args[0] === '--hash' && args[1]) {
    await verifyHash(sdk, args[1]);
    return;
  }

  // Handle --identity flag
  if (args[0] === '--identity' && args[1]) {
    await lookupIdentity(sdk, args[1]);
    return;
  }

  // Default: treat as transaction hash
  await verifyTransaction(sdk, args[0]);
}

async function verifyTransaction(sdk, txHash) {
  console.log(`${colors.cyan}🔍 Resolving transaction...${colors.reset}\n`);

  const result = await sdk.resolver.resolve(txHash);

  if (!result) {
    console.log(`${colors.red}❌ Transaction not found${colors.reset}`);
    process.exit(1);
  }

  console.log(`${colors.bold}Transaction: ${result.hash}${colors.reset}`);
  console.log(`Status: ${result.status === 'Success' ? colors.green + '✓ ' : colors.red + '✗ '}${result.status}${colors.reset}`);
  console.log(`Timestamp: ${result.timestamp}`);
  console.log(`Value: ${result.value} CERT`);
  console.log(`Gas Fee: ${result.gasFee} CERT\n`);

  console.log(`${colors.cyan}From:${colors.reset} ${result.participants.from?.handle || 'Anonymous'}`);
  if (result.participants.from?.isVerified) {
    console.log(`  ${colors.green}✓ Verified${colors.reset} | Trust Score: ${result.participants.from.trustScore}`);
    if (result.participants.from.badges.length > 0) {
      console.log(`  Badges: ${result.participants.from.badges.join(', ')}`);
    }
  }

  console.log(`\n${colors.cyan}To:${colors.reset} ${result.participants.to?.handle || 'Contract'}`);

  if (result.application) {
    console.log(`\n${colors.yellow}Application:${colors.reset} ${result.application.app}`);
    if (result.application.decoded) {
      console.log(`  ${JSON.stringify(result.application.decoded, null, 2)}`);
    }
  }
}

async function verifyFile(sdk, filePath) {
  const fullPath = path.resolve(filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`${colors.red}❌ File not found: ${fullPath}${colors.reset}`);
    process.exit(1);
  }

  console.log(`${colors.cyan}📄 Hashing file...${colors.reset}`);
  
  const fileBuffer = fs.readFileSync(fullPath);
  const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
  
  console.log(`SHA-256: 0x${hash}\n`);
  await verifyHash(sdk, '0x' + hash);
}

async function verifyHash(sdk, fileHash) {
  console.log(`${colors.cyan}🔍 Checking attestation...${colors.reset}\n`);

  try {
    const attestation = await sdk.contracts.chainCertify.getAttestation(fileHash);
    
    if (!attestation || attestation.signer === '0x0000000000000000000000000000000000000000') {
      console.log(`${colors.red}❌ File hash not found on Cert Blockchain${colors.reset}`);
      process.exit(1);
    }

    console.log(`${colors.green}✓ AUTHENTICATED${colors.reset}\n`);
    console.log(`Signer: ${attestation.handle || attestation.signer}`);
    console.log(`File Type: ${attestation.fileType}`);
    console.log(`Timestamp: ${new Date(Number(attestation.timestamp) * 1000).toISOString()}`);

    // Look up signer identity
    const identity = await sdk.identity.getFullIdentity(attestation.signer);
    if (identity?.isVerified) {
      console.log(`\n${colors.green}✓ Signer is verified${colors.reset}`);
      console.log(`Trust Score: ${identity.trustScore}/100`);
    }
  } catch (error) {
    console.log(`${colors.red}❌ Verification failed: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

async function lookupIdentity(sdk, address) {
  console.log(`${colors.cyan}🆔 Looking up CertID...${colors.reset}\n`);

  const identity = await sdk.identity.getFullIdentity(address);

  if (!identity || identity.handle === 'Anonymous') {
    console.log(`${colors.yellow}No CertID profile found for this address${colors.reset}`);
    process.exit(0);
  }

  console.log(`${colors.bold}Handle:${colors.reset} ${identity.handle}`);
  console.log(`Address: ${identity.address}`);
  console.log(`Verified: ${identity.isVerified ? colors.green + '✓ Yes' : colors.dim + '✗ No'}${colors.reset}`);
  console.log(`Trust Score: ${identity.trustScore}/100`);
  console.log(`Entity Type: ${['Individual', 'Institution', 'SystemAdmin', 'Bot'][identity.entityType]}`);
  
  if (identity.badges.length > 0) {
    console.log(`\n${colors.cyan}Badges:${colors.reset}`);
    identity.badges.forEach(badge => {
      console.log(`  • ${badge}`);
    });
  }
}

function printHelp() {
  console.log(`
${colors.cyan}${colors.bold}Cert-Verify CLI${colors.reset}
Verify documents and identities on Cert Blockchain

${colors.bold}Usage:${colors.reset}
  cert-verify <tx-hash>            Resolve a transaction
  cert-verify --file <path>        Verify a local file
  cert-verify --hash <sha256>      Verify a file hash
  cert-verify --identity <address> Look up a CertID profile

${colors.bold}Examples:${colors.reset}
  cert-verify 0x7a250d...
  cert-verify --file ./contract.pdf
  cert-verify --identity 0x123...

${colors.dim}Documentation: https://c3rt.org/docs${colors.reset}
`);
}

main().catch(err => {
  console.error(`${colors.red}Error: ${err.message}${colors.reset}`);
  process.exit(1);
});

