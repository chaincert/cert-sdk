import { CertSDK, IdentityModule, EcosystemResolver } from '../index';
import { ethers } from 'ethers';

describe('CertSDK', () => {
  let sdk: CertSDK;

  beforeEach(() => {
    sdk = new CertSDK({
      rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
      certIDAddress: '0x0000000000000000000000000000000000000000'
    });
  });

  test('should initialize successfully', () => {
    expect(sdk).toBeDefined();
    expect(sdk.provider).toBeDefined();
    expect(sdk.identity).toBeInstanceOf(IdentityModule);
    expect(sdk.resolver).toBeInstanceOf(EcosystemResolver);
  });

  test('should not be connected initially without a private key', () => {
    expect(sdk.isConnected()).toBe(false);
  });

  test('should have the correct addresses configured', () => {
    expect(sdk.addresses.certID).toBe('0x0000000000000000000000000000000000000000');
  });
});
