import React, { useState } from 'react';
import {
  FileCheck,
  ShieldCheck,
  ShieldAlert,
  ArrowDown,
  RotateCcw,
  CheckCircle2,
  Play,
  FileText,
} from 'lucide-react';
import { useVisionTrust } from '../context/VisionTrustContext';
import type { AuditBlock } from '../types';
import { HashDisplay } from '../components/common/HashDisplay';
import { StatusBadge } from '../components/common/StatusBadge';

export const AuditLedgerView: React.FC = () => {
  const { auditBlocks, verifyAuditLedger, tamperState, restoreIntegrity, setActiveTab, runVerification } = useVisionTrust();

  const [ledgerVerified, setLedgerVerified] = useState<boolean | null>(null);

  const handleVerifyLedger = () => {
    if (auditBlocks.length === 0) {
      setLedgerVerified(true);
      return;
    }
    const isValid = verifyAuditLedger();
    setLedgerVerified(isValid);
  };

  const isChainBroken = tamperState.auditTampered;

  return (
    <div className="page-container">
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 className="text-h2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileCheck size={22} style={{ color: 'var(--accent-cyan)' }} />
            <span>Tamper-Evident Audit Ledger</span>
          </h2>
          <div className="text-meta" style={{ marginTop: '3px' }}>
            Cryptographically chained operational ledger verifying provenance sequence from genesis root
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setActiveTab('verification');
              runVerification();
            }}
          >
            <Play size={14} />
            <span>Pipeline Verification</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveTab('reports')}
          >
            <FileText size={14} />
            <span>Integrity Reports</span>
          </button>

          {isChainBroken && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={restoreIntegrity}>
              <RotateCcw size={14} />
              <span>Restore Ledger Hash Chain</span>
            </button>
          )}

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleVerifyLedger}
            disabled={auditBlocks.length === 0}
          >
            <ShieldCheck size={16} />
            <span>VERIFY LEDGER INTEGRITY</span>
          </button>
        </div>
      </div>

      {/* Ledger Verification Status Banner */}
      {ledgerVerified !== null && (
        <div
          className={`defense-card ${ledgerVerified ? '' : 'alert-border'}`}
          style={{
            marginBottom: '24px',
            backgroundColor: ledgerVerified
              ? 'rgba(16, 185, 129, 0.08)'
              : 'rgba(239, 68, 68, 0.08)',
            padding: '16px 20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {ledgerVerified ? (
                <CheckCircle2 size={24} style={{ color: 'var(--status-verified)' }} />
              ) : (
                <ShieldAlert size={24} style={{ color: 'var(--status-compromised)' }} />
              )}
              <div>
                <h3 style={{ color: ledgerVerified ? '#34D399' : '#F87171', fontSize: '16px', margin: 0 }}>
                  {ledgerVerified ? 'LEDGER INTEGRITY VERIFIED' : '✕ LEDGER INTEGRITY FAILURE DETECTED'}
                </h3>
                <p style={{ fontSize: '13px', color: '#CBD5E1', marginTop: '2px', marginBottom: 0 }}>
                  {ledgerVerified
                    ? `All ${auditBlocks.length} operational block(s) are cryptographically continuous with valid previous-hash signatures.`
                    : 'Ledger hash link break detected. Unauthorized retroactive block mutation identified!'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setActiveTab('reports')}
              >
                <FileText size={14} />
                <span>View Full Report</span>
              </button>
              <StatusBadge
                status={ledgerVerified ? 'verified' : 'compromised'}
                label={ledgerVerified ? '✓ 100% INTACT' : '✕ CHAIN BROKEN'}
              />
            </div>
          </div>
        </div>
      )}

      {/* Connected Block Chain Timeline or Empty State */}
      {auditBlocks.length === 0 ? (
        <div className="defense-card" style={{ textAlign: 'center', padding: '56px 24px' }}>
          <FileCheck size={48} style={{ color: 'var(--text-muted)', opacity: 0.35, marginBottom: '16px' }} />
          <h3 style={{ color: '#FFFFFF', marginBottom: '8px', fontSize: '18px' }}>
            No records found
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', maxWidth: '480px', margin: '0 auto 20px auto', lineHeight: '1.6' }}>
            The tamper-evident audit ledger is currently empty. Register datasets, models, or execute inferences to create cryptographically sealed blocks in the hash chain.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button type="button" className="btn btn-primary" onClick={() => setActiveTab('datasets')}>
              <span>Upload Dataset</span>
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setActiveTab('models')}>
              <span>Upload Model</span>
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0', maxWidth: '980px', margin: '0 auto' }}>
          {auditBlocks.map((block: AuditBlock, idx: number) => {
            const isBroken = block.status === 'compromised' || block.tampered;

            return (
              <React.Fragment key={block.blockNumber}>
                {/* Block Card */}
                <div
                  className={`defense-card ${isBroken ? 'alert-border' : ''}`}
                  style={{
                    backgroundColor: isBroken ? 'rgba(239, 68, 68, 0.06)' : 'var(--bg-card)',
                    padding: '18px 22px',
                  }}
                >
                  <div className="card-header" style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          padding: '4px 10px',
                          borderRadius: '4px',
                          backgroundColor: isBroken ? 'rgba(239, 68, 68, 0.2)' : 'rgba(56, 189, 248, 0.12)',
                          color: isBroken ? '#F87171' : '#38BDF8',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 800,
                          fontSize: '12.5px',
                          border: `1px solid ${isBroken ? 'rgba(239, 68, 68, 0.4)' : 'rgba(56, 189, 248, 0.3)'}`,
                        }}
                      >
                        BLOCK #{String(block.blockNumber).padStart(3, '0')}
                      </div>

                      <div>
                        <h3 style={{ fontSize: '15px', color: '#FFFFFF', margin: 0 }}>
                          {block.eventType}
                        </h3>
                        <div className="text-meta" style={{ marginTop: '2px' }}>
                          Artifact: <strong style={{ color: '#38BDF8' }}>{block.artifactId}</strong> • Timestamp: {block.timestamp}
                        </div>
                      </div>
                    </div>

                    <StatusBadge
                      status={isBroken ? 'compromised' : 'verified'}
                      label={isBroken ? '✕ BROKEN LINK' : '✓ VALID'}
                    />
                  </div>

                  <div className="grid-2" style={{ gap: '14px', marginBottom: '12px' }}>
                    {/* Previous Hash */}
                    <div style={{ backgroundColor: '#07111F', padding: '10px 12px', borderRadius: '4px', border: '1px solid #1E344F' }}>
                      <div className="text-meta" style={{ marginBottom: '4px' }}>PREVIOUS BLOCK HASH:</div>
                      <HashDisplay hash={block.previousHash} leadLength={12} trailLength={8} />
                    </div>

                    {/* Current Hash */}
                    <div
                      style={{
                        backgroundColor: '#07111F',
                        padding: '10px 12px',
                        borderRadius: '4px',
                        border: `1px solid ${isBroken ? 'rgba(239, 68, 68, 0.4)' : '#1E344F'}`,
                      }}
                    >
                      <div className="text-meta" style={{ marginBottom: '4px' }}>
                        CURRENT BLOCK SHA-256 HASH:
                      </div>
                      <HashDisplay
                        hash={block.currentHash}
                        expectedHash={block.expectedHash}
                        showMatchStatus
                        leadLength={12}
                        trailLength={8}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '11.5px',
                      color: 'var(--text-muted)',
                      paddingTop: '8px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <div>
                      Contributor: <span style={{ color: 'var(--text-secondary)' }}>{block.contributor}</span>
                    </div>
                    <div className="font-mono">
                      Cryptographic Seal: <span style={{ color: '#38BDF8' }}>{block.signature}</span>
                    </div>
                  </div>
                </div>

                {/* Connecting Line Downward Arrow */}
                {idx < auditBlocks.length - 1 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '8px 0',
                      color: isBroken ? 'var(--status-compromised)' : 'var(--border-hover)',
                    }}
                  >
                    <ArrowDown size={20} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};
