/**
 * Cert ID Admin Portal - SBT Badge Issuance Dashboard
 * React component for managing Soulbound Token badges
 */

import React, { useState, useCallback } from 'react';
import { CertSDK } from '../src';
import { BADGE_ICONS, BADGE_COLORS, BADGE_NAMES } from '../src/constants';
import type { BadgeType } from '../src/types';

// Badge configuration for the admin panel
const BADGE_TYPES: Array<{ id: BadgeType; label: string; icon: string; color: string }> = [
  { id: 'KYC_L1', label: 'KYC Level 1', icon: BADGE_ICONS.KYC_L1, color: BADGE_COLORS.KYC_L1 },
  { id: 'KYC_L2', label: 'KYC Level 2', icon: BADGE_ICONS.KYC_L2, color: BADGE_COLORS.KYC_L2 },
  { id: 'ACADEMIC_ISSUER', label: 'Academic Issuer', icon: BADGE_ICONS.ACADEMIC_ISSUER, color: BADGE_COLORS.ACADEMIC_ISSUER },
  { id: 'VERIFIED_CREATOR', label: 'Verified Creator', icon: BADGE_ICONS.VERIFIED_CREATOR, color: BADGE_COLORS.VERIFIED_CREATOR },
  { id: 'GOV_AGENCY', label: 'Government Agency', icon: BADGE_ICONS.GOV_AGENCY, color: BADGE_COLORS.GOV_AGENCY },
  { id: 'LEGAL_ENTITY', label: 'Legal Entity', icon: BADGE_ICONS.LEGAL_ENTITY, color: BADGE_COLORS.LEGAL_ENTITY },
  { id: 'ISO_9001_CERTIFIED', label: 'ISO 9001 Certified', icon: BADGE_ICONS.ISO_9001_CERTIFIED, color: BADGE_COLORS.ISO_9001_CERTIFIED },
];

interface AdminPortalProps {
  privateKey?: string;
}

export default function AdminPortal({ privateKey }: AdminPortalProps) {
  const [targetAddress, setTargetAddress] = useState('');
  const [trustScore, setTrustScore] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error' | ''>('');

  const sdk = new CertSDK();

  const connectSDK = useCallback(async () => {
    try {
      await sdk.autoConnect(privateKey);
      return true;
    } catch (error) {
      setStatus(`Connection Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setStatusType('error');
      return false;
    }
  }, [privateKey, sdk]);

  const handleIssueBadge = async (badgeId: BadgeType) => {
    if (!targetAddress) {
      setStatus('Please enter a wallet address');
      setStatusType('error');
      return;
    }

    setLoading(true);
    setStatus(`Issuing ${BADGE_NAMES[badgeId]} to ${targetAddress}...`);

    const connected = await connectSDK();
    if (!connected) {
      setLoading(false);
      return;
    }

    const result = await sdk.identity.awardBadge(targetAddress, badgeId);

    if (result.success) {
      setStatus(`✅ Success! Badge issued. TX: ${result.txHash?.substring(0, 18)}...`);
      setStatusType('success');
    } else {
      setStatus(`❌ Error: ${result.error}`);
      setStatusType('error');
    }

    setLoading(false);
  };

  const handleRevokeBadge = async (badgeId: BadgeType) => {
    if (!targetAddress) {
      setStatus('Please enter a wallet address');
      setStatusType('error');
      return;
    }

    setLoading(true);
    setStatus(`Revoking ${BADGE_NAMES[badgeId]} from ${targetAddress}...`);

    const connected = await connectSDK();
    if (!connected) {
      setLoading(false);
      return;
    }

    const result = await sdk.identity.revokeBadge(targetAddress, badgeId);

    if (result.success) {
      setStatus(`✅ Badge revoked. TX: ${result.txHash?.substring(0, 18)}...`);
      setStatusType('success');
    } else {
      setStatus(`❌ Error: ${result.error}`);
      setStatusType('error');
    }

    setLoading(false);
  };

  const handleUpdateTrustScore = async () => {
    if (!targetAddress || !trustScore) {
      setStatus('Please enter address and score');
      setStatusType('error');
      return;
    }

    const score = parseInt(trustScore, 10);
    if (isNaN(score) || score < 0 || score > 100) {
      setStatus('Score must be between 0 and 100');
      setStatusType('error');
      return;
    }

    setLoading(true);
    setStatus(`Updating trust score to ${score}...`);

    const connected = await connectSDK();
    if (!connected) {
      setLoading(false);
      return;
    }

    const result = await sdk.identity.updateTrustScore(targetAddress, score);

    if (result.success) {
      setStatus(`✅ Trust score updated. TX: ${result.txHash?.substring(0, 18)}...`);
      setStatusType('success');
    } else {
      setStatus(`❌ Error: ${result.error}`);
      setStatusType('error');
    }

    setLoading(false);
  };

  const handleSetVerified = async (verified: boolean) => {
    if (!targetAddress) {
      setStatus('Please enter a wallet address');
      setStatusType('error');
      return;
    }

    setLoading(true);
    setStatus(`Setting verification status to ${verified}...`);

    const connected = await connectSDK();
    if (!connected) {
      setLoading(false);
      return;
    }

    const result = await sdk.identity.setVerificationStatus(targetAddress, verified);

    if (result.success) {
      setStatus(`✅ Verification ${verified ? 'granted' : 'revoked'}. TX: ${result.txHash?.substring(0, 18)}...`);
      setStatusType('success');
    } else {
      setStatus(`❌ Error: ${result.error}`);
      setStatusType('error');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#05080a] text-[#00f2ff] p-10 font-mono">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 tracking-tighter">Cert ID | Admin SBT Portal</h1>
        <p className="text-slate-500 mb-8">Manage Soulbound Token badges and verification status</p>

        {/* Target Address Input */}
        <div className="mb-8">
          <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2">
            Target Wallet Address
          </label>
          <input
            type="text"
            placeholder="0x..."
            value={targetAddress}
            onChange={(e) => setTargetAddress(e.target.value)}
            className="w-full p-4 bg-[#0a1116] border border-[#00f2ff]/30 rounded-lg text-white focus:border-[#00f2ff] focus:outline-none transition-colors"
          />
        </div>

        {/* Badge Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4">Issue Soulbound Badges</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {BADGE_TYPES.map((badge) => (
              <div key={badge.id} className="bg-[#0a1116] border border-slate-800 rounded-lg p-4">
                <div className="text-3xl mb-2">{badge.icon}</div>
                <p className="text-sm font-bold text-white mb-3">{badge.label}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleIssueBadge(badge.id)}
                    disabled={loading}
                    className="flex-1 py-2 px-3 text-xs bg-[#00f2ff]/20 border border-[#00f2ff]/40 rounded hover:bg-[#00f2ff]/30 transition-colors disabled:opacity-50"
                  >
                    Issue
                  </button>
                  <button
                    onClick={() => handleRevokeBadge(badge.id)}
                    disabled={loading}
                    className="flex-1 py-2 px-3 text-xs bg-red-500/20 border border-red-500/40 text-red-400 rounded hover:bg-red-500/30 transition-colors disabled:opacity-50"
                  >
                    Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Score & Verification */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#0a1116] border border-slate-800 rounded-lg p-6">
            <h3 className="text-sm font-bold mb-4">Update Trust Score</h3>
            <input
              type="number"
              min="0"
              max="100"
              placeholder="Score (0-100)"
              value={trustScore}
              onChange={(e) => setTrustScore(e.target.value)}
              className="w-full p-3 mb-4 bg-[#05080a] border border-slate-700 rounded text-white"
            />
            <button
              onClick={handleUpdateTrustScore}
              disabled={loading}
              className="w-full py-3 bg-[#00f2ff]/20 border border-[#00f2ff]/40 rounded hover:bg-[#00f2ff]/30 transition-colors disabled:opacity-50"
            >
              Update Score
            </button>
          </div>

          <div className="bg-[#0a1116] border border-slate-800 rounded-lg p-6">
            <h3 className="text-sm font-bold mb-4">Verification Status</h3>
            <div className="flex gap-4">
              <button
                onClick={() => handleSetVerified(true)}
                disabled={loading}
                className="flex-1 py-3 bg-green-500/20 border border-green-500/40 text-green-400 rounded hover:bg-green-500/30 transition-colors disabled:opacity-50"
              >
                ✓ Verify
              </button>
              <button
                onClick={() => handleSetVerified(false)}
                disabled={loading}
                className="flex-1 py-3 bg-red-500/20 border border-red-500/40 text-red-400 rounded hover:bg-red-500/30 transition-colors disabled:opacity-50"
              >
                ✕ Unverify
              </button>
            </div>
          </div>
        </div>

        {/* Status Display */}
        {status && (
          <div className={`p-4 rounded-lg border ${
            statusType === 'success' ? 'bg-green-500/10 border-green-500/40 text-green-400' :
            statusType === 'error' ? 'bg-red-500/10 border-red-500/40 text-red-400' :
            'bg-slate-800/50 border-slate-700 text-slate-400'
          }`}>
            {loading && <span className="animate-pulse mr-2">⏳</span>}
            {status}
          </div>
        )}
      </div>
    </div>
  );
}

