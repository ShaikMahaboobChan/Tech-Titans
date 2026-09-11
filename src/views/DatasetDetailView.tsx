import React from 'react';
import { ArrowLeft, Database, Download, ShieldCheck, ShieldAlert, BrainCircuit, FileCheck, Play } from 'lucide-react';
import { useVisionTrust } from '../context/VisionTrustContext';
import type { DatasetItem } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';

interface DatasetDetailViewProps {
  datasetId: string;
  onBack: () => void;
}

export const DatasetDetailView: React.FC<DatasetDetailViewProps> = ({ datasetId, onBack }) => {
  const { datasets, models, inferences, tamperState, addToast, setActiveTab, runVerification } = useVisionTrust();

  const dataset = datasets.find((d: DatasetItem) => d.id === datasetId) || datasets[0];
  if (!dataset) return null;

  // Find real inference bound to this dataset; for model, show first registered model
  const boundModel = models[0] || null;
  const boundInference = inferences.find((inf) => inf.datasetId === dataset.id) || inferences[0] || null;

  const isTampered = dataset.status === 'compromised' || tamperState.datasetTampered;

  const handleDownloadMetadata = () => {
    const metaStr = JSON.stringify(dataset, null, 2);
    const blob = new Blob([metaStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dataset.id}_cryptographic_metadata.json`;
    a.click();
    addToast('info', 'Metadata Downloaded', `${dataset.id} JSON metadata downloaded.`);
  };

  return (
    <div className="page-container">
      {/* Top action bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onBack}>
          <ArrowLeft size={14} />
          <span>Back to Datasets</span>
        </button>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleDownloadMetadata}>
            <Download size={14} />
            <span>Export Metadata</span>
          </button>
          {boundModel && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setActiveTab('models'); }}>
              <BrainCircuit size={14} />
              <span>View Model Registry</span>
            </button>
          )}
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

      {/* 2-Column Layout */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        {/* LEFT COLUMN: Dataset Information */}
        <div className="defense-card">
          <div className="card-header">
            <div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                DATASET SPECIFICATION
              </span>
              <h2 className="card-title" style={{ marginTop: '2px' }}>
                <Database size={18} style={{ color: 'var(--accent-cyan)' }} />
                {dataset.name}
              </h2>
            </div>
            <StatusBadge status={isTampered ? 'compromised' : dataset.status} />
          </div>

          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
            {dataset.description}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div>
              <div className="text-meta">DATASET ID</div>
              <div style={{ fontWeight: 600, color: '#FFFFFF', marginTop: '2px' }}>{dataset.id}</div>
            </div>
            <div>
              <div className="text-meta">VERSION</div>
              <div style={{ fontWeight: 600, color: '#FFFFFF', marginTop: '2px' }}>{dataset.version}</div>
            </div>
            <div>
              <div className="text-meta">AUTHORITATIVE CONTRIBUTOR</div>
              <div style={{ fontWeight: 600, color: '#FFFFFF', marginTop: '2px' }}>{dataset.contributor}</div>
            </div>
            <div>
              <div className="text-meta">REGISTERED TIMESTAMP</div>
              <div style={{ fontWeight: 600, color: '#FFFFFF', marginTop: '2px' }}>{dataset.createdDate}</div>
            </div>
            <div>
              <div className="text-meta">TOTAL FOOTPRINT</div>
              <div style={{ fontWeight: 600, color: '#FFFFFF', marginTop: '2px' }}>{dataset.size}</div>
            </div>
            <div>
              <div className="text-meta">TOTAL ARTIFACTS / FRAMES</div>
              <div style={{ fontWeight: 600, color: '#FFFFFF', marginTop: '2px' }}>
                {dataset.fileCount.toLocaleString()} raw files
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Cryptographic Integrity Panel */}
        <div className={`defense-card ${isTampered ? 'alert-border' : ''}`}>
          <div className="card-header">
            <div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                CRYPTOGRAPHIC VERIFICATION
              </span>
              <h3 className="card-title" style={{ marginTop: '2px' }}>
                {isTampered ? (
                  <ShieldAlert size={18} style={{ color: 'var(--status-compromised)' }} />
                ) : (
                  <ShieldCheck size={18} style={{ color: 'var(--status-verified)' }} />
                )}
                <span>SHA-256 Merkle Fingerprint</span>
              </h3>
            </div>
            <StatusBadge status={isTampered ? 'compromised' : 'verified'} label={isTampered ? '✕ HASH MISMATCH' : '✓ HASH VERIFIED'} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div className="text-meta" style={{ marginBottom: '6px' }}>
              CURRENT COMPUTE SHA-256:
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
                {dataset.sha256}
              </code>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div className="text-meta" style={{ marginBottom: '6px' }}>
              REGISTERED LEDGER EXPECTED SHA-256:
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
                {dataset.expectedSha256}
              </code>
            </div>
          </div>

          <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: isTampered ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.08)', border: `1px solid ${isTampered ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}` }}>
            <div style={{ fontSize: '12.5px', fontWeight: 600, color: isTampered ? '#FCA5A5' : '#6EE7B7' }}>
              {isTampered
                ? 'CRITICAL ALERT: Current dataset byte content does not match the registered baseline hash. Adversarial modification detected.'
                : 'VERIFIED: Cryptographic byte integrity confirmed. Matches genesis block registration record.'}
            </div>
          </div>
        </div>
      </div>

      {/* Metadata Telemetry Breakdown */}
      <div className="defense-card" style={{ marginBottom: '24px' }}>
        <h3 className="card-title" style={{ marginBottom: '14px' }}>Sensor & Ingestion Metadata</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <div style={{ backgroundColor: '#0D1B2A', padding: '12px 16px', borderRadius: '6px', border: '1px solid #1B3047' }}>
            <div className="text-meta">FILE ENCODING</div>
            <div style={{ fontWeight: 600, color: '#FFFFFF', marginTop: '4px' }}>{dataset.fileType}</div>
          </div>
          <div style={{ backgroundColor: '#0D1B2A', padding: '12px 16px', borderRadius: '6px', border: '1px solid #1B3047' }}>
            <div className="text-meta">FRAME RESOLUTION</div>
            <div style={{ fontWeight: 600, color: '#FFFFFF', marginTop: '4px' }}>{dataset.resolution}</div>
          </div>
          <div style={{ backgroundColor: '#0D1B2A', padding: '12px 16px', borderRadius: '6px', border: '1px solid #1B3047' }}>
            <div className="text-meta">SECURE SOURCE UPLINK</div>
            <div style={{ fontWeight: 600, color: '#FFFFFF', marginTop: '4px' }}>{dataset.uploadSource}</div>
          </div>
          <div style={{ backgroundColor: '#0D1B2A', padding: '12px 16px', borderRadius: '6px', border: '1px solid #1B3047' }}>
            <div className="text-meta">MERKLE LEAVES</div>
            <div style={{ fontWeight: 600, color: '#FFFFFF', marginTop: '4px' }}>256 Balanced Roots</div>
          </div>
        </div>
      </div>

      {/* Provenance Flow Stepper */}
      <div className="defense-card">
        <h3 className="card-title" style={{ marginBottom: '16px' }}>Cryptographic Provenance Lineage</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflowX: 'auto', paddingBottom: '10px' }}>
          <div style={{ padding: '10px 16px', borderRadius: '6px', backgroundColor: '#0D1B2A', border: '1px solid #1B3047' }}>
            <div className="text-meta">1. Contributor</div>
            <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '13px' }}>{dataset.contributor}</div>
          </div>
          <span style={{ color: 'var(--text-muted)' }}>→</span>
          <div style={{ padding: '10px 16px', borderRadius: '6px', backgroundColor: '#0D1B2A', border: '1px solid #1B3047' }}>
            <div className="text-meta">2. Dataset Ingestion</div>
            <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '13px' }}>{dataset.name} {dataset.version}</div>
          </div>
          <span style={{ color: 'var(--text-muted)' }}>→</span>
          <div style={{ padding: '10px 16px', borderRadius: '6px', backgroundColor: '#0D1B2A', border: '1px solid #1B3047' }}>
            <div className="text-meta">3. SHA-256 Digest</div>
            <div className="font-mono" style={{ fontWeight: 700, color: 'var(--accent-cyan)', fontSize: '12px' }}>
              {dataset.sha256.slice(0, 12)}...
            </div>
          </div>
          <span style={{ color: 'var(--text-muted)' }}>→</span>
          <div style={{ padding: '10px 16px', borderRadius: '6px', backgroundColor: '#0D1B2A', border: '1px solid #1B3047' }}>
            <div className="text-meta">4. Model Binding</div>
            <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '13px' }}>
              {boundModel ? `${boundModel.id} (${boundModel.activeVersion})` : '— No model bound'}
            </div>
          </div>
          <span style={{ color: 'var(--text-muted)' }}>→</span>
          <div style={{ padding: '10px 16px', borderRadius: '6px', backgroundColor: '#0D1B2A', border: '1px solid #1B3047' }}>
            <div className="text-meta">5. Sealed Inference</div>
            <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '13px' }}>
              {boundInference ? `${boundInference.id}` : '— No inference run'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
