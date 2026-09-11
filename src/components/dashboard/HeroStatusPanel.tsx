import React from 'react';
import { ShieldCheck, ShieldAlert, Play, ArrowUpRight, RotateCcw } from 'lucide-react';
import { useVisionTrust } from '../../context/VisionTrustContext';

export const HeroStatusPanel: React.FC = () => {
  const {
    tamperState,
    runVerification,
    isVerifying,
    setActiveTab,
    restoreIntegrity,
    datasets,
    models,
    verificationResult,
  } = useVisionTrust();

  const isAnyTampered = Object.values(tamperState).some(Boolean);
  const violationCount = Object.values(tamperState).filter(Boolean).length;
  const totalArtifacts = datasets.length + models.length;

  return (
    <div
      className={`defense-card ${isAnyTampered ? 'alert-border' : ''}`}
      style={{
        padding: '24px 28px',
        marginBottom: '24px',
        background: isAnyTampered
          ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(13, 27, 42, 0.95) 100%)'
          : 'linear-gradient(135deg, rgba(16, 185, 129, 0.07) 0%, rgba(13, 27, 42, 0.95) 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle background circuit watermark */}
      <div
        style={{
          position: 'absolute',
          right: '-20px',
          top: '-20px',
          opacity: 0.04,
          pointerEvents: 'none',
          fontSize: '220px',
          lineHeight: 1,
          fontWeight: 900,
          userSelect: 'none',
          fontFamily: 'var(--font-heading)',
        }}
      >
        VT
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Left Status Hero Info */}
        <div style={{ maxWidth: '640px' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: isAnyTampered ? '#F87171' : '#38BDF8',
              marginBottom: '6px',
            }}
          >
            VISIONTRUST COMMAND STATUS
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            {isAnyTampered ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--status-compromised)',
                  fontSize: '24px',
                  fontWeight: 800,
                  fontFamily: 'var(--font-heading)',
                }}
              >
                <ShieldAlert size={28} />
                <span>✕ INTEGRITY COMPROMISED</span>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--status-verified)',
                  fontSize: '24px',
                  fontWeight: 800,
                  fontFamily: 'var(--font-heading)',
                }}
              >
                <ShieldCheck size={28} />
                <span>● {totalArtifacts === 0 ? 'SYSTEM READY (STANDBY)' : 'TRUSTED'}</span>
              </div>
            )}
          </div>

          <p style={{ fontSize: '14.5px', color: '#CBD5E1', lineHeight: '1.5' }}>
            {isAnyTampered
              ? 'Adversarial tampering detected in AI pipeline chain. One or more cryptographic hashes fail zero-trust verification.'
              : totalArtifacts === 0
              ? 'Zero-trust verification pipeline is active. Register contributors, datasets, and models to establish cryptographic proof chains.'
              : 'All registered AI pipeline artifacts (Datasets, Model Weights, Inferences, and Audit Ledger) are currently verified.'}
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '24px',
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Last Verification
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#F1F5F9', marginTop: '2px' }}>
                {verificationResult ? verificationResult.timestamp : 'Pending First Run'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Verified Pipelines
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#F1F5F9', marginTop: '2px' }}>
                {totalArtifacts === 0
                  ? '0 Registered'
                  : isAnyTampered
                  ? `${Math.max(0, totalArtifacts - 1)} / ${totalArtifacts} Active`
                  : `${totalArtifacts} / ${totalArtifacts} Active`}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Integrity Violations
              </div>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: isAnyTampered ? 'var(--status-compromised)' : 'var(--status-verified)',
                  marginTop: '2px',
                }}
              >
                {isAnyTampered
                  ? `${violationCount} VIOLATION${violationCount > 1 ? 'S' : ''} DETECTED`
                  : '0 (Tamper Free)'}
              </div>
            </div>
          </div>
        </div>

        {/* Right CTA Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '220px' }}>
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={() => {
              setActiveTab('verification');
              runVerification();
            }}
            disabled={isVerifying}
          >
            <Play size={16} />
            <span>{isVerifying ? 'Verifying Pipeline...' : 'Verify Pipeline'}</span>
          </button>

          {isAnyTampered ? (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={restoreIntegrity}
              title="Reset all tampered artifacts to certified baseline"
            >
              <RotateCcw size={15} />
              <span>Restore Pure State</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setActiveTab('attack-simulator')}
            >
              <ShieldAlert size={15} />
              <span>Attack Simulator</span>
              <ArrowUpRight size={13} style={{ marginLeft: 'auto' }} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
