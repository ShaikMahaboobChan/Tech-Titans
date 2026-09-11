import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Play,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RotateCcw,
  FileText,
} from 'lucide-react';
import { useVisionTrust } from '../context/VisionTrustContext';
import type { VerificationCheckStep } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';

export const VerificationCenterView: React.FC = () => {
  const {
    runVerification,
    verificationResult,
    isVerifying,
    verificationProgress,
    verificationStageText,
    restoreIntegrity,
    setActiveTab,
    inferences,
  } = useVisionTrust();

  const availablePipelines = Array.from(new Set(inferences.map((inf) => inf.pipelineId))).filter(Boolean);
  const [pipelineIdInput, setPipelineIdInput] = useState('');

  const activePipelineId = pipelineIdInput && availablePipelines.includes(pipelineIdInput)
    ? pipelineIdInput
    : availablePipelines[0] || 'VT-PIPE-STANDBY';

  const handleRunVerify = () => {
    runVerification(activePipelineId);
  };

  const isTrusted = verificationResult?.isTrusted;

  return (
    <div className="page-container">
      {/* Header Banner */}
      <div style={{ marginBottom: '24px' }}>
        <h2 className="text-h2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={22} style={{ color: 'var(--accent-cyan)' }} />
          <span>Pipeline Integrity Verification Center</span>
        </h2>
        <div className="text-meta" style={{ marginTop: '3px' }}>
          End-to-end zero-trust cryptographic audit of AI pipeline provenance from contributor identity to audit ledger
        </div>
      </div>

      {/* Input / Control Bar */}
      <div className="defense-card" style={{ marginBottom: '24px', padding: '18px 24px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              TARGET PIPELINE ID:
            </span>
            <select
              className="form-select font-mono"
              value={activePipelineId}
              onChange={(e) => setPipelineIdInput(e.target.value)}
              style={{ maxWidth: '280px', fontWeight: 600, color: '#38BDF8' }}
              disabled={isVerifying}
            >
              {availablePipelines.length === 0 ? (
                <option value="VT-PIPE-STANDBY">VT-PIPE-STANDBY (System Baseline)</option>
              ) : (
                availablePipelines.map((pipe) => (
                  <option key={pipe} value={pipe}>
                    {pipe}
                  </option>
                ))
              )}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={handleRunVerify}
              disabled={isVerifying}
              style={{ minWidth: '180px' }}
            >
              <Play size={16} />
              <span>{isVerifying ? 'Auditing Pipeline...' : 'VERIFY PIPELINE'}</span>
            </button>
          </div>
        </div>

        {/* Verification Progress Stepper animation */}
        {isVerifying && (
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#38BDF8' }}>
                {verificationStageText}
              </span>
              <span className="font-mono" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {verificationProgress}%
              </span>
            </div>

            <div
              style={{
                width: '100%',
                height: '6px',
                backgroundColor: '#0B1726',
                borderRadius: '3px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${verificationProgress}%`,
                  height: '100%',
                  backgroundColor: '#38BDF8',
                  transition: 'width 250ms ease-in-out',
                  boxShadow: '0 0 8px rgba(56, 189, 248, 0.7)',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Result Display: Only shows once verified */}
      {verificationResult ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Main Verdict Card */}
          <div
            className={`defense-card ${!isTrusted ? 'alert-border' : ''}`}
            style={{
              padding: '24px 28px',
              background: isTrusted
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(13, 27, 42, 0.95) 100%)'
                : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(13, 27, 42, 0.95) 100%)',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '8px',
                    backgroundColor: isTrusted ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.2)',
                    border: `1px solid ${isTrusted ? 'var(--status-verified)' : 'var(--status-compromised)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isTrusted ? (
                    <ShieldCheck size={36} style={{ color: 'var(--status-verified)' }} />
                  ) : (
                    <ShieldAlert size={36} style={{ color: 'var(--status-compromised)' }} />
                  )}
                </div>

                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                    OFFICIAL ZERO-TRUST VERDICT
                  </div>
                  <h1 style={{ fontSize: '26px', color: isTrusted ? '#34D399' : '#F87171', margin: '2px 0' }}>
                    {isTrusted ? 'PIPELINE VERIFIED — TRUSTED' : 'INTEGRITY COMPROMISED'}
                  </h1>
                  <p style={{ fontSize: '14px', color: '#CBD5E1', maxWidth: '640px' }}>
                    {verificationResult.verdictReason}
                  </p>
                </div>
              </div>

              {/* Integrity Score Visual */}
              <div
                style={{
                  backgroundColor: '#07111F',
                  border: '1px solid #1E344F',
                  borderRadius: '8px',
                  padding: '14px 20px',
                  textAlign: 'center',
                  minWidth: '150px',
                }}
              >
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Integrity Score
                </div>
                <div
                  style={{
                    fontSize: '28px',
                    fontWeight: 800,
                    color: isTrusted ? '#10B981' : '#EF4444',
                    lineHeight: 1.1,
                    marginTop: '2px',
                  }}
                >
                  {verificationResult.score} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/ 100</span>
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Authoritative: <strong>{verificationResult.overallStatus}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Mismatch Alert Panel (If Compromised) */}
          {verificationResult.mismatchDetails && (
            <div
              className="defense-card alert-border"
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.04)', padding: '20px 24px' }}
            >
              <div className="card-header" style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldAlert size={20} style={{ color: 'var(--status-compromised)' }} />
                  <h3 className="card-title" style={{ color: '#FCA5A5', margin: 0 }}>
                    ✕ HASH MISMATCH BREAKDOWN (AUDIT REPORT)
                  </h3>
                </div>

                <span className="status-badge badge-compromised">CRITICAL FAILURE</span>
              </div>

              <p style={{ fontSize: '13.5px', color: '#FCA5A5', marginBottom: '18px' }}>
                {verificationResult.mismatchDetails.reason}
              </p>

              <div className="grid-2" style={{ marginBottom: '16px' }}>
                {/* Expected */}
                <div style={{ backgroundColor: '#07111F', padding: '12px 14px', borderRadius: '6px', border: '1px solid #1E344F' }}>
                  <div className="text-meta" style={{ color: 'var(--status-verified)', fontWeight: 700 }}>
                    REGISTERED EXPECTED SHA-256:
                  </div>
                  <code className="font-mono" style={{ fontSize: '12.5px', color: '#94A3B8', display: 'block', marginTop: '6px' }}>
                    {verificationResult.mismatchDetails.expectedHash}
                  </code>
                </div>

                {/* Actual */}
                <div style={{ backgroundColor: '#07111F', padding: '12px 14px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                  <div className="text-meta" style={{ color: 'var(--status-compromised)', fontWeight: 700 }}>
                    ACTUAL RUNTIME HASH (TAMPERED):
                  </div>
                  <code className="font-mono" style={{ fontSize: '12.5px', color: '#F87171', display: 'block', marginTop: '6px' }}>
                    {verificationResult.mismatchDetails.actualHash}
                  </code>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                  Affected Downstream Artifacts:{' '}
                  <strong style={{ color: '#FFFFFF' }}>
                    {verificationResult.mismatchDetails.affectedArtifacts.join(' → ')}
                  </strong>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={restoreIntegrity}
                >
                  <RotateCcw size={14} />
                  <span>Restore Baseline Integrity</span>
                </button>
              </div>
            </div>
          )}

          {/* Vertical Verification Chain */}
          <div className="defense-card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Vertical Zero-Trust Cryptographic Chain</h3>
                <div className="card-subtitle">
                  Linear validation status across contributor, dataset, model, inference, and audit ledger
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {verificationResult.steps.map((step: VerificationCheckStep, idx: number) => {
                const isStepOk = step.status === 'verified';
                const isStepCompromised = step.status === 'compromised';

                return (
                  <div
                    key={step.id}
                    style={{
                      backgroundColor: isStepCompromised
                        ? 'rgba(239, 68, 68, 0.06)'
                        : 'var(--bg-secondary)',
                      border: `1px solid ${
                        isStepCompromised
                          ? 'var(--status-compromised)'
                          : 'var(--border-subtle)'
                      }`,
                      borderRadius: '6px',
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: isStepOk
                            ? 'rgba(16, 185, 129, 0.15)'
                            : isStepCompromised
                            ? 'rgba(239, 68, 68, 0.2)'
                            : 'rgba(245, 158, 11, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {isStepOk ? (
                          <CheckCircle2 size={16} style={{ color: 'var(--status-verified)' }} />
                        ) : isStepCompromised ? (
                          <XCircle size={16} style={{ color: 'var(--status-compromised)' }} />
                        ) : (
                          <AlertTriangle size={16} style={{ color: 'var(--status-warning)' }} />
                        )}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>
                            STEP {idx + 1}
                          </span>
                          <strong style={{ color: '#FFFFFF', fontSize: '14px' }}>{step.name}</strong>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            [{step.target}]
                          </span>
                        </div>
                        <div style={{ fontSize: '12.5px', color: isStepCompromised ? '#FCA5A5' : 'var(--text-secondary)', marginTop: '2px' }}>
                          {step.message} • <span style={{ color: 'var(--text-muted)' }}>{step.details}</span>
                        </div>
                      </div>
                    </div>

                    <StatusBadge status={step.status} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick links to Reports & Attack Simulator */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setActiveTab('reports')}
            >
              <FileText size={15} />
              <span>Generate Official Integrity Report</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setActiveTab('attack-simulator')}
            >
              <ShieldAlert size={15} />
              <span>Open Attack Simulator</span>
            </button>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="defense-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <ShieldCheck size={48} style={{ color: 'var(--accent-cyan)', opacity: 0.6, marginBottom: '14px' }} />
          <h3 style={{ fontSize: '18px', color: '#FFFFFF', marginBottom: '8px' }}>
            Ready to Verify Pipeline Provenance
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '480px', margin: '0 auto 20px auto' }}>
            Click <strong>VERIFY PIPELINE</strong> above to execute a full cryptographic audit comparing
            runtime hashes against the immutable tamper-evident ledger.
          </p>
          <button type="button" className="btn btn-primary btn-lg" onClick={handleRunVerify}>
            <Play size={16} />
            <span>Verify Pipeline Now</span>
          </button>
        </div>
      )}
    </div>
  );
};
