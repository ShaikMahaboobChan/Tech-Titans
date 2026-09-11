import React from 'react';
import { ArrowLeft, BrainCircuit, ShieldCheck, ShieldAlert, Download, ScanSearch, FileCheck, Play } from 'lucide-react';
import { useVisionTrust } from '../context/VisionTrustContext';
import type { ModelItem, ModelVersion } from '../types';
import { HashDisplay } from '../components/common/HashDisplay';
import { StatusBadge } from '../components/common/StatusBadge';

interface ModelDetailViewProps {
  modelId: string;
  onBack: () => void;
}

export const ModelDetailView: React.FC<ModelDetailViewProps> = ({ modelId, onBack }) => {
  const { models, tamperState, addToast, setActiveTab, runVerification } = useVisionTrust();

  const model = models.find((m: ModelItem) => m.id === modelId) || models[0];
  if (!model) return null;

  const isTampered = model.status === 'compromised' || model.tampered || tamperState.modelTampered;

  const handleExportMetadata = () => {
    const metaStr = JSON.stringify(model, null, 2);
    const blob = new Blob([metaStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${model.id}_weights_spec.json`;
    a.click();
    addToast('info', 'Metadata Exported', `${model.id} model specification downloaded.`);
  };

  return (
    <div className="page-container">
      {/* Top action bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onBack}>
          <ArrowLeft size={14} />
          <span>Back to Models</span>
        </button>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleExportMetadata}>
            <Download size={14} />
            <span>Export Fingerprint</span>
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setActiveTab('inference')}>
            <ScanSearch size={14} />
            <span>Run Inference</span>
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => { setActiveTab('verification'); runVerification(); }}>
            <Play size={14} />
            <span>Verify Pipeline</span>
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setActiveTab('audit')}>
            <FileCheck size={14} />
            <span>Audit Ledger</span>
          </button>
        </div>
      </div>

      {/* Overview 2-Column */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        {/* Left: Model Details */}
        <div className="defense-card">
          <div className="card-header">
            <div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                MODEL ARCHITECTURE SPECIFICATION
              </span>
              <h2 className="card-title" style={{ marginTop: '2px' }}>
                <BrainCircuit size={18} style={{ color: 'var(--accent-cyan)' }} />
                {model.name}
              </h2>
            </div>
            <StatusBadge status={isTampered ? 'compromised' : model.status} />
          </div>

          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
            {model.description}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div>
              <div className="text-meta">MODEL ID</div>
              <div style={{ fontWeight: 600, color: '#FFFFFF', marginTop: '2px' }}>{model.id}</div>
            </div>
            <div>
              <div className="text-meta">ACTIVE DEPLOYED VERSION</div>
              <div style={{ fontWeight: 600, color: '#38BDF8', marginTop: '2px' }}>{model.activeVersion}</div>
            </div>
            <div>
              <div className="text-meta">RUNTIME & FRAMEWORK</div>
              <div style={{ fontWeight: 600, color: '#FFFFFF', marginTop: '2px' }}>{model.framework}</div>
            </div>
            <div>
              <div className="text-meta">NEURAL BACKBONE</div>
              <div style={{ fontWeight: 600, color: '#FFFFFF', marginTop: '2px' }}>{model.architecture}</div>
            </div>
            <div>
              <div className="text-meta">AUTHORITATIVE PROVIDER</div>
              <div style={{ fontWeight: 600, color: '#FFFFFF', marginTop: '2px' }}>{model.contributor}</div>
            </div>
            <div>
              <div className="text-meta">EVALUATION ACCURACY</div>
              <div style={{ fontWeight: 600, color: model.accuracy ? '#10B981' : 'var(--text-muted)', marginTop: '2px' }}>
                {model.accuracy ? `${model.accuracy}% mAP50-95` : '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Cryptographic Checksum Panel */}
        <div className={`defense-card ${isTampered ? 'alert-border' : ''}`}>
          <div className="card-header">
            <div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                WEIGHTS INTEGRITY AUDIT
              </span>
              <h3 className="card-title" style={{ marginTop: '2px' }}>
                {isTampered ? (
                  <ShieldAlert size={18} style={{ color: 'var(--status-compromised)' }} />
                ) : (
                  <ShieldCheck size={18} style={{ color: 'var(--status-verified)' }} />
                )}
                <span>Active Weights SHA-256</span>
              </h3>
            </div>
            <StatusBadge
              status={isTampered ? 'compromised' : 'verified'}
              label={isTampered ? '✕ INTEGRITY FAILURE' : '✓ MODEL VERIFIED'}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div className="text-meta" style={{ marginBottom: '6px' }}>
              CURRENT WEIGHTS SHA-256 CHECKSUM:
            </div>
            <div
              style={{
                backgroundColor: '#07111F',
                border: '1px solid #1E344F',
                borderRadius: '6px',
                padding: '12px',
                wordBreak: 'break-all',
              }}
            >
              <code
                className="font-mono"
                style={{
                  fontSize: '12.5px',
                  color: isTampered ? '#F87171' : '#38BDF8',
                  lineHeight: 1.6,
                }}
              >
                {model.sha256}
              </code>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div className="text-meta" style={{ marginBottom: '6px' }}>
              REGISTERED CERTIFICATE EXPECTED HASH:
            </div>
            <div
              style={{
                backgroundColor: '#07111F',
                border: '1px solid #1E344F',
                borderRadius: '6px',
                padding: '12px',
                wordBreak: 'break-all',
              }}
            >
              <code className="font-mono" style={{ fontSize: '12.5px', color: '#94A3B8', lineHeight: 1.6 }}>
                {model.expectedSha256}
              </code>
            </div>
          </div>

          <div
            style={{
              padding: '12px',
              borderRadius: '6px',
              backgroundColor: isTampered ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.08)',
              border: `1px solid ${isTampered ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
            }}
          >
            <div style={{ fontSize: '12.5px', fontWeight: 600, color: isTampered ? '#FCA5A5' : '#6EE7B7' }}>
              {isTampered
                ? 'CRITICAL ALERT: Current model weights fingerprint does not match the registered baseline. Potential adversarial Trojan or unauthorized fine-tuning detected.'
                : 'VERIFIED: Checksum matches Ministry of Defence certified release certificate.'}
            </div>
          </div>
        </div>
      </div>

      {/* Version History Table */}
      <div className="defense-card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Model Version Lineage & Release Audit</h3>
            <div className="card-subtitle">Every model revision is cryptographically sealed and independently verifiable</div>
          </div>
        </div>

        <div className="table-container">
          <table className="defense-table">
            <thead>
              <tr>
                <th>Release Version</th>
                <th>Status</th>
                <th>Weights SHA-256 Fingerprint</th>
                <th>Registered Timestamp</th>
                <th>Verification Notes</th>
                <th style={{ textAlign: 'right' }}>Integrity</th>
              </tr>
            </thead>
            <tbody>
              {model.versions.map((v: ModelVersion) => {
                const isCurrentActive = v.version === model.activeVersion;
                const rowTampered = isCurrentActive && isTampered;

                return (
                  <tr
                    key={v.version}
                    style={{
                      backgroundColor: isCurrentActive ? 'rgba(56, 189, 248, 0.03)' : undefined,
                    }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ color: isCurrentActive ? '#38BDF8' : '#FFFFFF' }}>
                          {v.version}
                        </strong>
                        {isCurrentActive && (
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 800,
                              backgroundColor: 'rgba(56, 189, 248, 0.15)',
                              color: '#38BDF8',
                              padding: '1px 6px',
                              borderRadius: '3px',
                              border: '1px solid rgba(56, 189, 248, 0.3)',
                            }}
                          >
                            ACTIVE
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="text-meta">
                        {isCurrentActive ? 'Production Serving' : 'Archived Baseline'}
                      </span>
                    </td>
                    <td>
                      <HashDisplay
                        hash={rowTampered ? model.sha256 : v.sha256}
                        expectedHash={v.sha256}
                        showMatchStatus
                      />
                    </td>
                    <td style={{ fontSize: '12px' }}>{v.registeredDate}</td>
                    <td style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{v.notes}</td>
                    <td style={{ textAlign: 'right' }}>
                      <StatusBadge status={rowTampered ? 'compromised' : v.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
