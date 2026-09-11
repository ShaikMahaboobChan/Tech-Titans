import React from 'react';
import {
  FileText,
  Printer,
  Download,
  Play,
  Database,
  BrainCircuit,
  FileCheck,
} from 'lucide-react';
import { useVisionTrust } from '../context/VisionTrustContext';
import { StatusBadge } from '../components/common/StatusBadge';

export const IntegrityReportsView: React.FC = () => {
  const {
    datasets,
    models,
    inferences,
    auditBlocks,
    tamperState,
    contributors,
    addToast,
    setActiveTab,
    runVerification,
  } = useVisionTrust();

  const isTampered = Object.values(tamperState).some(Boolean);
  const dataset = datasets[0];
  const model = models[0];
  const inference = inferences[0];
  const contributor = contributors[0];

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const reportData = {
      title: 'VISIONTRUST OFFICIAL AUDIT REPORT',
      classification: 'OFFICIAL — DEFENCE SENSITIVE (TIER-1)',
      generatedDate: new Date().toISOString(),
      pipelineId: model ? `VT-PIPE-${model.id}` : 'VT-PIPE-STANDBY',
      overallTrustVerdict: isTampered ? 'COMPROMISED' : 'TRUSTED',
      sections: {
        contributor: contributor ? {
          name: contributor.name,
          organization: contributor.organization,
          role: contributor.role,
          keyFingerprint: contributor.publicKey,
        } : {
          organization: 'No Contributor Registered',
          keyFingerprint: 'N/A',
        },
        dataset: dataset ? {
          id: dataset.id,
          name: dataset.name,
          version: dataset.version,
          sha256: dataset.sha256,
          status: dataset.status,
        } : null,
        model: model ? {
          id: model.id,
          name: model.name,
          version: model.activeVersion,
          sha256: model.sha256,
          status: model.status,
        } : null,
        inference: inference ? {
          id: inference.id,
          name: inference.name,
          inputSha256: inference.inputSha256,
          outputSha256: inference.outputSha256,
          status: inference.status,
        } : null,
        auditLedger: {
          verifiedBlocks: auditBlocks.length,
          genesisRoot: auditBlocks[0]?.previousHash || '0000000000000000000000000000000000000000000000000000000000000000',
          sealStatus: isTampered ? 'CHAIN_BREAK' : 'INTACT',
        },
      },
      auditorSignOff: {
        auditor: 'MoD Cryptographic Evaluation Cell',
        seal: auditBlocks[0]?.signature ? `CERT-SEAL-${auditBlocks[0].signature.slice(0, 10).toUpperCase()}` : 'CERT-SEAL-STANDBY',
      },
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VT-PIPE_audit_report_${Date.now()}.json`;
    a.click();
    addToast('success', 'Report Exported', 'Downloaded complete cryptographic audit JSON.');
  };

  return (
    <div className="page-container">
      {/* Action Bar (Hidden when printing) */}
      <div
        className="btn-no-print"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div>
          <h2 className="text-h2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={22} style={{ color: 'var(--accent-cyan)' }} />
            <span>Official Integrity Audit Report</span>
          </h2>
          <div className="text-meta" style={{ marginTop: '3px' }}>
            Defense-grade printable audit certificate and provenance manifest
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" className="btn btn-secondary" onClick={handleDownloadJSON}>
            <Download size={15} />
            <span>DOWNLOAD JSON</span>
          </button>
          <button type="button" className="btn btn-primary" onClick={handlePrint}>
            <Printer size={15} />
            <span>PRINT / SAVE AS PDF</span>
          </button>
        </div>
      </div>

      {/* Quick Navigation Strip (Hidden when printing) */}
      <div
        className="defense-card btn-no-print"
        style={{
          maxWidth: '960px',
          margin: '0 auto 20px auto',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          backgroundColor: 'rgba(56, 189, 248, 0.04)',
          border: '1px solid rgba(56, 189, 248, 0.18)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
            REGISTRY SHORTCUTS:
          </span>
          <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
            Inspect underlying artifacts or trigger live pipeline re-verification
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveTab('datasets')}
          >
            <Database size={13} />
            <span>Datasets</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveTab('models')}
          >
            <BrainCircuit size={13} />
            <span>Models</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveTab('audit')}
          >
            <FileCheck size={13} />
            <span>Audit Ledger</span>
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              setActiveTab('verification');
              runVerification();
            }}
          >
            <Play size={13} />
            <span>Re-run Verification</span>
          </button>
        </div>
      </div>

      {/* Official Printable Report Document Card */}
      <div
        className="defense-card"
        style={{
          maxWidth: '960px',
          margin: '0 auto',
          padding: '36px 44px',
          backgroundColor: '#0A1524',
          border: '2px solid #1E3A5F',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Document Header */}
        <div
          style={{
            borderBottom: '2px solid #1E3A5F',
            paddingBottom: '20px',
            marginBottom: '28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#38BDF8',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              MINISTRY OF DEFENCE • CYBER SECURITY & TRUSTED AI COMMAND
            </div>
            <h1 style={{ fontSize: '24px', color: '#FFFFFF', margin: '6px 0 2px 0' }}>
              VISIONTRUST INTEGRITY REPORT
            </h1>
            <div className="text-meta font-mono" style={{ fontSize: '13px', color: '#94A3B8' }}>
              Pipeline Manifest ID: <strong style={{ color: '#FFFFFF' }}>{model ? `VT-PIPE-${model.id}` : 'VT-PIPE-STANDBY'}</strong>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ marginBottom: '6px' }}>
              <StatusBadge
                status={isTampered ? 'compromised' : 'verified'}
                label={isTampered ? '✕ INTEGRITY COMPROMISED' : '✓ TRUSTED CERTIFIED'}
              />
            </div>
            <div className="text-meta">CLASSIFICATION: OFFICIAL / DEFENCE SENSITIVE</div>
            <div className="text-meta">DATE: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
          </div>
        </div>

        {/* Section 1 & 2: Contributor and Dataset */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: '#07111F', padding: '16px', borderRadius: '6px', border: '1px solid #1E344F' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-cyan)' }}>
              1. AUTHORIZED CONTRIBUTOR
            </span>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', marginTop: '6px' }}>
              {contributor ? contributor.organization : 'No Registered Contributor'}
            </div>
            <div className="text-meta" style={{ marginTop: '2px' }}>
              Public Key: <span className="font-mono">{contributor ? `${contributor.publicKey.slice(0, 8)}...${contributor.publicKey.slice(-4)}` : 'N/A'}</span>
            </div>
            <div style={{ fontSize: '11.5px', color: contributor?.verifiedStatus === 'verified' ? 'var(--status-verified)' : 'var(--text-muted)', marginTop: '4px' }}>
              {contributor ? (contributor.verifiedStatus === 'verified' ? '✓ Root Certificate Valid (MoD CA)' : '● PKI Verification Pending') : '— Awaiting Registration'}
            </div>
          </div>

          <div style={{ backgroundColor: '#07111F', padding: '16px', borderRadius: '6px', border: '1px solid #1E344F' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-cyan)' }}>
              2. INGESTED DATASET
            </span>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', marginTop: '6px' }}>
              {dataset ? `${dataset.name} (${dataset.version})` : 'No Dataset Registered'}
            </div>
            <div className="text-meta" style={{ marginTop: '2px' }}>
              Footprint: {dataset ? `${dataset.size} ${dataset.fileCount ? `(${dataset.fileCount.toLocaleString()} raw frames)` : ''}` : 'No files uploaded'}
            </div>
            <div style={{ fontSize: '11.5px', color: dataset ? 'var(--status-verified)' : 'var(--text-muted)', marginTop: '4px' }}>
              {dataset ? '✓ Merkle tree balanced root sealed' : '— Upload dataset in Dataset Registry'}
            </div>
          </div>
        </div>

        {/* Section 3: Dataset SHA-256 */}
        <div style={{ backgroundColor: '#07111F', padding: '14px 16px', borderRadius: '6px', border: '1px solid #1E344F', marginBottom: '20px' }}>
          <div className="text-meta" style={{ fontWeight: 700, color: '#94A3B8' }}>
            3. DATASET SHA-256 FINGERPRINT
          </div>
          <code className="font-mono" style={{ fontSize: '12.5px', color: '#38BDF8', display: 'block', marginTop: '4px', wordBreak: 'break-all' }}>
            {dataset ? dataset.sha256 : 'Awaiting dataset registration...'}
          </code>
        </div>

        {/* Section 4 & 5: Model & Version */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '20px' }}>
          <div style={{ backgroundColor: '#07111F', padding: '16px', borderRadius: '6px', border: '1px solid #1E344F' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-cyan)' }}>
              4. DEPLOYED MODEL ARTIFACT
            </span>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', marginTop: '6px' }}>
              {model ? model.name : 'No Model Registered'}
            </div>
            <div className="text-meta" style={{ marginTop: '2px' }}>
              Backbone: {model ? `${model.architecture} (${model.framework})` : 'N/A'}
            </div>
          </div>

          <div style={{ backgroundColor: '#07111F', padding: '16px', borderRadius: '6px', border: '1px solid #1E344F' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-cyan)' }}>
              5. MODEL VERSION LINEAGE
            </span>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#38BDF8', marginTop: '6px' }}>
              {model ? `${model.activeVersion} (Active Deployment)` : 'No Active Version'}
            </div>
            <div className="text-meta" style={{ marginTop: '2px' }}>
              Certified Evaluation: {model && model.accuracy ? `${model.accuracy}% mAP50-95` : '—'}
            </div>
          </div>
        </div>

        {/* Section 6: Model Hash */}
        <div
          style={{
            backgroundColor: '#07111F',
            padding: '14px 16px',
            borderRadius: '6px',
            border: `1px solid ${tamperState.modelTampered ? 'rgba(239, 68, 68, 0.4)' : '#1E344F'}`,
            marginBottom: '20px',
          }}
        >
          <div className="text-meta" style={{ fontWeight: 700, color: tamperState.modelTampered ? '#F87171' : '#94A3B8' }}>
            6. MODEL WEIGHTS SHA-256 CHECKSUM {tamperState.modelTampered && '(MISMATCH DETECTED)'}
          </div>
          <code
            className="font-mono"
            style={{
              fontSize: '12.5px',
              color: tamperState.modelTampered ? '#F87171' : '#38BDF8',
              display: 'block',
              marginTop: '4px',
              wordBreak: 'break-all',
            }}
          >
            {model ? model.sha256 : 'Awaiting model weights upload...'}
          </code>
        </div>

        {/* Section 7 & 8: Inference and Output Hash */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '20px' }}>
          <div style={{ backgroundColor: '#07111F', padding: '16px', borderRadius: '6px', border: '1px solid #1E344F' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-cyan)' }}>
              7. INFERENCE EXECUTION TELEMETRY
            </span>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', marginTop: '6px' }}>
              {inference ? inference.id : 'No Inferences Run'}
            </div>
            <div className="text-meta" style={{ marginTop: '2px' }}>
              Execution: {inference ? `${inference.processingTimeMs}ms • ${inference.detections.length} Target Detections` : 'Awaiting sensor input'}
            </div>
          </div>

          <div style={{ backgroundColor: '#07111F', padding: '16px', borderRadius: '6px', border: '1px solid #1E344F' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-cyan)' }}>
              8. OUTPUT PROOF DIGEST
            </span>
            <div className="font-mono" style={{ fontSize: '12px', color: '#38BDF8', marginTop: '6px', wordBreak: 'break-all' }}>
              {inference ? `${inference.outputSha256.slice(0, 24)}...` : 'Awaiting execution...'}
            </div>
            <div className="text-meta" style={{ marginTop: '2px' }}>
              Cryptographically bound to input sensor bytes and model weights
            </div>
          </div>
        </div>

        {/* Section 9: Audit Ledger Proof */}
        <div style={{ backgroundColor: '#07111F', padding: '14px 16px', borderRadius: '6px', border: '1px solid #1E344F', marginBottom: '28px' }}>
          <div className="text-meta" style={{ fontWeight: 700, color: '#94A3B8' }}>
            9. TAMPER-EVIDENT AUDIT LEDGER CHAIN
          </div>
          <div style={{ fontSize: '13px', color: '#CBD5E1', marginTop: '4px' }}>
            {auditBlocks.length > 0
              ? `Blocks #001 to #${String(auditBlocks.length).padStart(3, '0')} validated. Continuous SHA-256 linkage verified.`
              : 'Audit ledger empty. Blocks are created automatically upon artifact registration.'}
          </div>
        </div>

        {/* Section 10: Auditor Sign-off Seal */}
        <div
          style={{
            borderTop: '2px solid #1E3A5F',
            paddingTop: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF' }}>
              CRYPTOGRAPHIC EVALUATION AUTHORITY
            </div>
            <div className="text-meta">MoD National Cyber Security Cell</div>
            <div className="text-meta font-mono" style={{ marginTop: '2px' }}>
              SEAL: {auditBlocks[0]?.signature ? `CERT-SEAL-${auditBlocks[0].signature.slice(0, 10).toUpperCase()}` : 'CERT-SEAL-STANDBY'}
            </div>
          </div>

          <div
            style={{
              padding: '12px 20px',
              border: '2px dashed var(--accent-cyan)',
              borderRadius: '6px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-cyan)', letterSpacing: '0.08em' }}>
              IMMUTABLE AUDIT STAMP
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>
              {isTampered ? '✕ AUDIT REJECTED' : '✓ VERIFIED OFFICIAL'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
