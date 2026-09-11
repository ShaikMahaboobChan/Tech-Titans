import React from 'react';
import {
  Database,
  Key,
  BrainCircuit,
  ScanSearch,
  Hash,
  FileCheck,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { useVisionTrust } from '../../context/VisionTrustContext';
import { formatShortHash } from '../../crypto/sha256';

export const PipelineVisualizer: React.FC = () => {
  const {
    datasets,
    models,
    inferences,
    tamperState,
    setActiveTab,
    auditBlocks,
  } = useVisionTrust();

  const currentDataset = datasets[0];
  const currentModel = models[0];
  const currentInference = inferences[0];

  const datasetStatus = !currentDataset ? 'pending' : tamperState.datasetTampered ? 'compromised' : 'verified';
  const modelStatus = !currentModel ? 'pending' : tamperState.modelTampered ? 'compromised' : 'verified';
  const inferenceStatus = !currentInference
    ? 'pending'
    : tamperState.inferenceTampered
    ? 'compromised'
    : tamperState.modelTampered || tamperState.datasetTampered
    ? 'warning'
    : 'verified';
  const ledgerStatus = auditBlocks.length === 0 ? 'pending' : tamperState.auditTampered ? 'compromised' : 'verified';

  const isPipelineTrusted =
    (datasets.length > 0 || models.length > 0) &&
    datasetStatus === 'verified' &&
    modelStatus === 'verified' &&
    (inferenceStatus === 'verified' || !currentInference) &&
    ledgerStatus === 'verified';

  const nodes = [
    {
      id: 'node-dataset',
      type: 'DATASET',
      name: currentDataset?.name || 'Dataset Ingress',
      sub: currentDataset?.version || 'Upload Data File',
      hash: currentDataset?.sha256,
      status: datasetStatus,
      icon: Database,
      tab: 'datasets',
    },
    {
      id: 'node-dataset-hash',
      type: 'DATA HASH',
      name: currentDataset ? 'SHA-256 Fingerprint' : 'Hash Pending',
      sub: currentDataset ? (currentDataset.fileCount ? `${currentDataset.fileCount.toLocaleString()} Files` : currentDataset.size) : 'No Ingress Bytes',
      hash: currentDataset?.sha256,
      status: datasetStatus,
      icon: Key,
      tab: 'datasets',
    },
    {
      id: 'node-model',
      type: 'MODEL',
      name: currentModel?.name || 'Neural Model',
      sub: currentModel ? `${currentModel.activeVersion} Active` : 'Upload Model Weights',
      hash: currentModel?.sha256,
      status: modelStatus,
      icon: BrainCircuit,
      tab: 'models',
    },
    {
      id: 'node-inference',
      type: 'INFERENCE',
      name: currentInference?.id || 'Inference Session',
      sub: currentInference ? `${currentInference.detections.length} Targets (${currentInference.processingTimeMs}ms)` : 'Awaiting Execution',
      hash: currentInference?.inputSha256,
      status: inferenceStatus,
      icon: ScanSearch,
      tab: 'inference',
    },
    {
      id: 'node-output-hash',
      type: 'OUTPUT HASH',
      name: 'Prediction Digest',
      sub: currentInference ? 'Cryptographically Bound' : 'Awaiting Session',
      hash: currentInference?.outputSha256,
      status: inferenceStatus,
      icon: Hash,
      tab: 'inference',
    },
    {
      id: 'node-audit',
      type: 'AUDIT LEDGER',
      name: 'Tamper-Evident Ledger',
      sub: auditBlocks.length > 0 ? `Block #001 - #${String(auditBlocks.length).padStart(3, '0')}` : '0 Blocks Sealed',
      hash: auditBlocks.length > 0 ? auditBlocks[0].currentHash : undefined,
      status: ledgerStatus,
      icon: FileCheck,
      tab: 'audit',
    },
    {
      id: 'node-verification',
      type: 'VERIFICATION',
      name: 'Zero-Trust Decision',
      sub: (datasets.length === 0 && models.length === 0)
        ? 'System Ready'
        : isPipelineTrusted
        ? 'All Artifacts Valid'
        : 'Integrity Broken',
      status: (datasets.length === 0 && models.length === 0)
        ? 'pending'
        : isPipelineTrusted
        ? 'verified'
        : 'compromised',
      icon: ((datasets.length === 0 && models.length === 0) || isPipelineTrusted) ? ShieldCheck : ShieldAlert,
      tab: 'verification',
    },
  ];

  return (
    <div className="defense-card" style={{ marginBottom: '24px' }}>
      <div className="card-header">
        <div>
          <h2 className="card-title">
            <span>Cryptographic AI Pipeline Provenance Chain</span>
          </h2>
          <div className="card-subtitle">
            Continuous zero-trust verification topology from sensor payload to tamper-evident audit ledger
          </div>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setActiveTab('verification')}
        >
          <span>Run Verification</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* Pipeline Node Flow */}
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          gap: '8px',
          overflowX: 'auto',
          padding: '8px 2px 14px 2px',
        }}
      >
        {nodes.map((node, idx) => {
          const Icon = node.icon;
          const isCompromised = node.status === 'compromised';
          const isWarning = node.status === 'warning';
          const isPending = node.status === 'pending';

          const borderColor = isCompromised
            ? 'var(--status-compromised)'
            : isWarning
            ? 'var(--status-warning)'
            : 'var(--border-card)';

          const badgeColor = isCompromised
            ? 'var(--status-compromised)'
            : isWarning
            ? 'var(--status-warning)'
            : isPending
            ? 'var(--text-muted)'
            : 'var(--status-verified)';

          const badgeText = isCompromised
            ? '✕ COMPROMISED'
            : isWarning
            ? '⚠ AFFECTED'
            : isPending
            ? '● STANDBY'
            : '✓ VERIFIED';

          return (
            <React.Fragment key={node.id}>
              {/* Node Card */}
              <div
                style={{
                  flex: '1 0 160px',
                  minWidth: '155px',
                  backgroundColor: isCompromised
                    ? 'rgba(239, 68, 68, 0.08)'
                    : 'var(--bg-secondary)',
                  border: `1px solid ${borderColor}`,
                  borderRadius: '6px',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all var(--transition-quick)',
                }}
                onClick={() => setActiveTab(node.tab)}
                title={`Click to inspect ${node.name}`}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        color: 'var(--text-muted)',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {node.type}
                    </span>
                    <Icon
                      size={15}
                      style={{
                        color: isCompromised
                          ? 'var(--status-compromised)'
                          : 'var(--accent-cyan)',
                      }}
                    />
                  </div>

                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      lineHeight: 1.2,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {node.name}
                  </div>

                  <div
                    style={{
                      fontSize: '11.5px',
                      color: 'var(--text-secondary)',
                      marginTop: '3px',
                    }}
                  >
                    {node.sub}
                  </div>
                </div>

                <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  {node.hash ? (
                    <div
                      className="font-mono"
                      style={{
                        fontSize: '10.5px',
                        color: isCompromised ? '#F87171' : 'var(--text-muted)',
                        marginBottom: '6px',
                      }}
                    >
                      {formatShortHash(node.hash, 5, 4)}
                    </div>
                  ) : null}

                  <div
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 800,
                      color: badgeColor,
                      letterSpacing: '0.04em',
                    }}
                  >
                    {badgeText}
                  </div>
                </div>
              </div>

              {/* Connector Arrow between nodes */}
              {idx < nodes.length - 1 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isCompromised ? 'var(--status-compromised)' : 'var(--border-hover)',
                    flexShrink: 0,
                  }}
                >
                  <ArrowRight size={16} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
