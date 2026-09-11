import React, { useState } from 'react';
import {
  ShieldAlert,
  Database,
  BrainCircuit,
  ScanSearch,
  FileCheck,
  AlertTriangle,
  RotateCcw,
  Play,
} from 'lucide-react';
import { useVisionTrust } from '../context/VisionTrustContext';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { StatusBadge } from '../components/common/StatusBadge';

export const AttackSimulatorView: React.FC = () => {
  const {
    tamperState,
    tamperDataset,
    tamperModel,
    tamperInference,
    tamperAudit,
    restoreIntegrity,
    runVerification,
    setActiveTab,
    models,
    datasets,
    auditBlocks,
  } = useVisionTrust();

  const [activeModalType, setActiveModalType] = useState<
    'dataset' | 'model' | 'inference' | 'audit' | null
  >(null);

  const isAnyTampered = Object.values(tamperState).some(Boolean);
  const primaryModel = models[0];
  const primaryDataset = datasets[0];
  const lastBlock = auditBlocks[auditBlocks.length - 1];

  const handleSimulateConfirm = () => {
    if (activeModalType === 'dataset') tamperDataset();
    if (activeModalType === 'model') tamperModel();
    if (activeModalType === 'inference') tamperInference();
    if (activeModalType === 'audit') tamperAudit();
    setActiveModalType(null);
  };

  return (
    <div className="page-container">
      {/* Header Banner */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h2 className="text-h2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={22} style={{ color: 'var(--status-compromised)' }} />
              <span>Integrity Attack Simulator & Adversarial Red-Team</span>
            </h2>
            <div className="text-meta" style={{ marginTop: '3px' }}>
              Controlled demonstration environment for validating VisionTrust zero-trust detection capabilities
            </div>
          </div>

          {isAnyTampered && (
            <button type="button" className="btn btn-secondary" onClick={restoreIntegrity}>
              <RotateCcw size={15} />
              <span>Reset & Restore Certified Baseline</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Attack Vector Action Cards */}
      <div className="grid-4" style={{ marginBottom: '28px' }}>
        {/* 1. Tamper Dataset */}
        <div
          className={`defense-card ${tamperState.datasetTampered ? 'alert-border' : ''}`}
          style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
        >
          <div>
            <div className="card-header" style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)' }}>
                VECTOR #01
              </span>
              <Database size={18} style={{ color: 'var(--accent-cyan)' }} />
            </div>

            <h3 style={{ fontSize: '15px', color: '#FFFFFF', marginBottom: '6px' }}>
              TAMPER DATASET
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
              Simulate silent byte corruption or adversarial data poisoning inside {primaryDataset ? primaryDataset.name : 'sensor frames'}.
            </p>
          </div>

          <div>
            <div style={{ marginBottom: '12px' }}>
              <StatusBadge
                status={tamperState.datasetTampered ? 'compromised' : 'verified'}
                label={tamperState.datasetTampered ? '✕ BYTES TAMPERED' : '✓ CLEAN DATASET'}
              />
            </div>

            <button
              type="button"
              className={`btn ${tamperState.datasetTampered ? 'btn-secondary' : 'btn-danger'} btn-sm`}
              style={{ width: '100%' }}
              onClick={() => setActiveModalType('dataset')}
              disabled={tamperState.datasetTampered}
            >
              <AlertTriangle size={13} />
              <span>{tamperState.datasetTampered ? 'Tampered' : 'Simulate Poisoning'}</span>
            </button>
          </div>
        </div>

        {/* 2. Tamper Model */}
        <div
          className={`defense-card ${tamperState.modelTampered ? 'alert-border' : ''}`}
          style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
        >
          <div>
            <div className="card-header" style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)' }}>
                VECTOR #02 (PRIMARY)
              </span>
              <BrainCircuit size={18} style={{ color: 'var(--accent-cyan)' }} />
            </div>

            <h3 style={{ fontSize: '15px', color: '#FFFFFF', marginBottom: '6px' }}>
              TAMPER MODEL WEIGHTS
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
              Simulate backdoor Trojan injection or unauthorized weights replacement in {primaryModel ? primaryModel.name : 'active model weights'}.
            </p>
          </div>

          <div>
            <div style={{ marginBottom: '12px' }}>
              <StatusBadge
                status={tamperState.modelTampered ? 'compromised' : 'verified'}
                label={tamperState.modelTampered ? '✕ WEIGHTS ALTERED' : '✓ VERIFIED WEIGHTS'}
              />
            </div>

            <button
              type="button"
              className={`btn ${tamperState.modelTampered ? 'btn-secondary' : 'btn-danger'} btn-sm`}
              style={{ width: '100%' }}
              onClick={() => setActiveModalType('model')}
              disabled={tamperState.modelTampered}
            >
              <AlertTriangle size={13} />
              <span>{tamperState.modelTampered ? 'Weights Tampered' : 'Simulate Model Attack'}</span>
            </button>
          </div>
        </div>

        {/* 3. Tamper Inference */}
        <div
          className={`defense-card ${tamperState.inferenceTampered ? 'alert-border' : ''}`}
          style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
        >
          <div>
            <div className="card-header" style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)' }}>
                VECTOR #03
              </span>
              <ScanSearch size={18} style={{ color: 'var(--accent-cyan)' }} />
            </div>

            <h3 style={{ fontSize: '15px', color: '#FFFFFF', marginBottom: '6px' }}>
              TAMPER INFERENCE
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
              Simulate target spoofing: alter detection classifications and break prediction proof digest.
            </p>
          </div>

          <div>
            <div style={{ marginBottom: '12px' }}>
              <StatusBadge
                status={tamperState.inferenceTampered ? 'compromised' : 'verified'}
                label={tamperState.inferenceTampered ? '✕ PREDICTION SPOOFED' : '✓ UNMODIFIED'}
              />
            </div>

            <button
              type="button"
              className={`btn ${tamperState.inferenceTampered ? 'btn-secondary' : 'btn-danger'} btn-sm`}
              style={{ width: '100%' }}
              onClick={() => setActiveModalType('inference')}
              disabled={tamperState.inferenceTampered}
            >
              <AlertTriangle size={13} />
              <span>{tamperState.inferenceTampered ? 'Inference Tampered' : 'Simulate Spoofing'}</span>
            </button>
          </div>
        </div>

        {/* 4. Tamper Audit Ledger */}
        <div
          className={`defense-card ${tamperState.auditTampered ? 'alert-border' : ''}`}
          style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
        >
          <div>
            <div className="card-header" style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)' }}>
                VECTOR #04
              </span>
              <FileCheck size={18} style={{ color: 'var(--accent-cyan)' }} />
            </div>

            <h3 style={{ fontSize: '15px', color: '#FFFFFF', marginBottom: '6px' }}>
              TAMPER AUDIT LEDGER
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
              {lastBlock
                ? `Mutate Block #${String(lastBlock.blockNumber).padStart(3, '0')} in the audit ledger to break the previous hash cryptographic chain.`
                : 'Mutate ledger blocks to break the previous hash cryptographic chain.'}
            </p>
          </div>

          <div>
            <div style={{ marginBottom: '12px' }}>
              <StatusBadge
                status={tamperState.auditTampered ? 'compromised' : 'verified'}
                label={tamperState.auditTampered ? '✕ CHAIN BROKEN' : '✓ 100% INTACT'}
              />
            </div>

            <button
              type="button"
              className={`btn ${tamperState.auditTampered ? 'btn-secondary' : 'btn-danger'} btn-sm`}
              style={{ width: '100%' }}
              onClick={() => setActiveModalType('audit')}
              disabled={tamperState.auditTampered}
            >
              <AlertTriangle size={13} />
              <span>{tamperState.auditTampered ? 'Ledger Mutated' : 'Simulate Block Break'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* BEFORE VS AFTER Cryptographic Comparison Result */}
      <div className="defense-card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Cryptographic State Transition (Before vs After Attack)</h3>
            <div className="card-subtitle">
              Live delta comparison of expected registry fingerprint versus detected runtime checksum
            </div>
          </div>

          {isAnyTampered ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setActiveTab('verification');
                  runVerification();
                }}
              >
                <Play size={13} />
                <span>Re-run Verification Now</span>
              </button>
            </div>
          ) : null}
        </div>

        <div className="grid-2" style={{ gap: '20px' }}>
          {/* BEFORE CARD */}
          <div
            style={{
              backgroundColor: '#0D1B2A',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '16px 20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                BASELINE EXPECTED STATE
              </span>
              <StatusBadge status="verified" label="✓ TRUSTED" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <span className="text-meta">Target Artifact:</span>
                <div style={{ fontWeight: 600, color: '#FFFFFF' }}>
                  {primaryModel ? `${primaryModel.id} (${primaryModel.name})` : 'No Model Registered'}
                </div>
              </div>

              <div>
                <span className="text-meta">Registered Certified SHA-256:</span>
                <div
                  className="font-mono"
                  style={{
                    fontSize: '12px',
                    color: '#38BDF8',
                    backgroundColor: '#07111F',
                    padding: '8px 10px',
                    borderRadius: '4px',
                    border: '1px solid #1E344F',
                    marginTop: '4px',
                    wordBreak: 'break-all',
                  }}
                >
                  {primaryModel ? primaryModel.expectedSha256 : 'Awaiting model weights upload...'}
                </div>
              </div>

              <div style={{ fontSize: '12px', color: primaryModel ? 'var(--status-verified)' : 'var(--text-muted)' }}>
                {primaryModel ? '✓ Cryptographic fingerprint validated with MoD Root CA certificate.' : 'Upload a model to establish certified baseline.'}
              </div>
            </div>
          </div>

          {/* AFTER CARD */}
          <div
            style={{
              backgroundColor: isAnyTampered ? 'rgba(239, 68, 68, 0.06)' : '#0D1B2A',
              border: `1px solid ${isAnyTampered ? 'var(--status-compromised)' : 'var(--border-subtle)'}`,
              borderRadius: '6px',
              padding: '16px 20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                ACTIVE RUNTIME STATE
              </span>
              <StatusBadge
                status={isAnyTampered ? 'compromised' : 'verified'}
                label={isAnyTampered ? '✕ COMPROMISED' : '✓ TRUSTED'}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <span className="text-meta">Detected Artifact State:</span>
                <div style={{ fontWeight: 600, color: isAnyTampered ? '#F87171' : '#FFFFFF' }}>
                  {isAnyTampered
                    ? 'Adversarially Injected Checksum Detected'
                    : primaryModel
                    ? 'Certified Release Checkpoint'
                    : 'No Active Model'}
                </div>
              </div>

              <div>
                <span className="text-meta">Calculated Runtime SHA-256:</span>
                <div
                  className="font-mono"
                  style={{
                    fontSize: '12px',
                    color: isAnyTampered ? '#F87171' : '#38BDF8',
                    backgroundColor: '#07111F',
                    padding: '8px 10px',
                    borderRadius: '4px',
                    border: `1px solid ${isAnyTampered ? 'rgba(239, 68, 68, 0.4)' : '#1E344F'}`,
                    marginTop: '4px',
                    wordBreak: 'break-all',
                  }}
                >
                  {primaryModel ? primaryModel.sha256 : 'Awaiting model weights upload...'}
                </div>
              </div>

              <div style={{ fontSize: '12px', color: isAnyTampered ? '#FCA5A5' : primaryModel ? 'var(--status-verified)' : 'var(--text-muted)' }}>
                {isAnyTampered
                  ? '✕ HASH MISMATCH: Runtime weights differ from baseline record. Zero-trust check fails.'
                  : primaryModel
                  ? '✓ Hashes match baseline 100%.'
                  : '— Upload model weights to run verification.'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Attack Injections */}
      <ConfirmModal
        isOpen={Boolean(activeModalType)}
        title={
          activeModalType === 'model'
            ? 'Simulate Model Weights Tampering?'
            : activeModalType === 'dataset'
            ? 'Simulate Dataset Payload Tampering?'
            : activeModalType === 'inference'
            ? 'Simulate Target Spoofing Attack?'
            : 'Simulate Audit Ledger Chain Mutation?'
        }
        message={
          activeModalType === 'model'
            ? `This will modify the in-memory SHA-256 fingerprint of ${primaryModel ? primaryModel.name : 'the model'} to represent an unauthorized weights modification. VisionTrust will immediately detect this hash mismatch.`
            : activeModalType === 'dataset'
            ? `This will mutate dataset bytes of ${primaryDataset ? primaryDataset.name : 'the dataset'} to demonstrate how VisionTrust flags corrupted or poisoned training frames.`
            : activeModalType === 'inference'
            ? 'This will modify detection labels and break the output hash binding to demonstrate target classification spoofing detection.'
            : `This will alter Block #${lastBlock ? String(lastBlock.blockNumber).padStart(3, '0') : '001'} in the audit ledger to prove how cryptographic chaining exposes unauthorized retroactive mutations.`
        }
        confirmLabel="Execute Attack Simulation"
        isDangerous
        onConfirm={handleSimulateConfirm}
        onCancel={() => setActiveModalType(null)}
      />
    </div>
  );
};
