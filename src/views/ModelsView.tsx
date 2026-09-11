import React, { useState, useRef, useCallback } from 'react';
import {
  BrainCircuit,
  Plus,
  Eye,
  ShieldCheck,
  Download,
  Search,
  X,
  Upload,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { useVisionTrust } from '../context/VisionTrustContext';
import type { ModelItem } from '../types';
import { HashDisplay } from '../components/common/HashDisplay';
import { StatusBadge } from '../components/common/StatusBadge';
import { ModelDetailView } from './ModelDetailView';
import { computeSha256 } from '../crypto/sha256';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export const ModelsView: React.FC = () => {
  const {
    models,
    contributors,
    activeModelId,
    setActiveModelId,
    registerModel,
    setActiveTab,
    runVerification,
    addToast,
  } = useVisionTrust();

  const [searchQuery, setSearchQuery] = useState('');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Upload & form state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedHash, setUploadedHash] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isHashing, setIsHashing] = useState(false);

  const [formName, setFormName] = useState('');
  const [formVersion, setFormVersion] = useState('v1.0');
  const [formFramework, setFormFramework] = useState('PyTorch');
  const [formArchitecture, setFormArchitecture] = useState('');
  const [formAccuracy, setFormAccuracy] = useState('');
  const [formContributor, setFormContributor] = useState('');
  const [formDescription, setFormDescription] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredModels = models.filter(
    (m: ModelItem) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.framework.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.contributor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const processFile = useCallback(async (file: File) => {
    setUploadedFile(file);
    setIsHashing(true);
    setUploadedHash('');
    try {
      const buffer = await file.arrayBuffer();
      const hash = await computeSha256(buffer);
      setUploadedHash(hash);
      setFormName((prev) => prev || file.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' '));
      // Auto-detect framework from extension
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'pt' || ext === 'pth') setFormFramework('PyTorch');
      else if (ext === 'onnx') setFormFramework('ONNX Runtime');
      else if (ext === 'engine' || ext === 'trt') setFormFramework('TensorRT');
      else if (ext === 'h5' || ext === 'keras') setFormFramework('TensorFlow / Keras');
      else if (ext === 'pb') setFormFramework('TensorFlow SavedModel');
      addToast('success', 'Weights Fingerprinted', `SHA-256: ${hash.slice(0, 16)}... Ready to register.`);
    } catch {
      addToast('error', 'Hash Error', 'Could not compute weights checksum. Try again.');
    } finally {
      setIsHashing(false);
    }
  }, [addToast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      addToast('warning', 'Validation Error', 'Model name is required.');
      return;
    }
    if (!uploadedFile || !uploadedHash) {
      addToast('warning', 'No Weights File', 'Upload a model weights file to compute a real SHA-256 fingerprint.');
      return;
    }

    const selectedContributor = contributors.find((c) => c.id === formContributor) || null;

    await registerModel(
      {
        name: formName,
        version: formVersion,
        framework: formFramework,
        architecture: formArchitecture || 'Custom',
        contributor: selectedContributor?.name || 'Unknown Contributor',
        contributorId: selectedContributor?.id || 'CONTRIB-UNKNOWN',
        description: formDescription || `Uploaded model weights: ${uploadedFile.name}`,
        accuracy: formAccuracy ? parseFloat(formAccuracy) || 0 : 0,
      },
      uploadedHash
    );

    // Reset form
    setIsRegisterOpen(false);
    setFormName('');
    setFormVersion('v1.0');
    setFormFramework('PyTorch');
    setFormArchitecture('');
    setFormAccuracy('');
    setFormContributor('');
    setFormDescription('');
    setUploadedFile(null);
    setUploadedHash('');
  };

  const handleExportModelSpec = (model: ModelItem) => {
    const metaStr = JSON.stringify(model, null, 2);
    const blob = new Blob([metaStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${model.id}_certificate.json`;
    a.click();
    addToast('info', 'Certificate Exported', `Exported cryptographic record for ${model.id}`);
  };

  if (activeModelId) {
    return <ModelDetailView modelId={activeModelId} onBack={() => setActiveModelId(null)} />;
  }

  return (
    <div className="page-container">
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 className="text-h2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BrainCircuit size={22} style={{ color: 'var(--accent-cyan)' }} />
            <span>Enterprise Model Registry</span>
          </h2>
          <div className="text-meta" style={{ marginTop: '3px' }}>
            Upload and cryptographically seal model weights — SHA-256 computed directly from your weights file
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '32px', fontSize: '13px' }}
              placeholder="Filter models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsRegisterOpen(true)}
          >
            <Plus size={16} />
            <span>Upload Model</span>
          </button>
        </div>
      </div>

      {/* Models Table */}
      {filteredModels.length === 0 ? (
        <div className="defense-card" style={{ textAlign: 'center', padding: '56px 24px' }}>
          <BrainCircuit size={44} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: '16px' }} />
          <h3 style={{ color: '#FFFFFF', marginBottom: '8px', fontSize: '18px' }}>No Models Registered</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', maxWidth: '480px', margin: '0 auto 20px auto', lineHeight: '1.6' }}>
            {searchQuery
              ? `No models match "${searchQuery}".`
              : 'Upload your model weights file (.pt, .onnx, .engine, etc). VisionTrust hashes the actual weights bytes and seals the fingerprint in the audit ledger.'}
          </p>
          <button type="button" className="btn btn-primary" onClick={() => setIsRegisterOpen(true)}>
            <Upload size={15} />
            <span>Upload Model Weights</span>
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="defense-table">
            <thead>
              <tr>
                <th>Model Identifier</th>
                <th>Active Version</th>
                <th>Framework & Runtime</th>
                <th>Contributor</th>
                <th>Weights SHA-256</th>
                <th>Registered</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredModels.map((m: ModelItem) => (
                <tr key={m.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{m.name}</div>
                    <div className="text-meta font-mono">{m.id}</div>
                  </td>
                  <td>
                    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38BDF8', fontWeight: 700, fontSize: '12px', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                      {m.activeVersion}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '13px', color: '#E2E8F0' }}>{m.framework}</div>
                    <div className="text-meta">{m.architecture}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '13px' }}>{m.contributor}</div>
                  </td>
                  <td>
                    <HashDisplay hash={m.sha256} expectedHash={m.expectedSha256} showMatchStatus />
                  </td>
                  <td style={{ fontSize: '12px' }}>{m.registeredDate}</td>
                  <td>
                    <StatusBadge status={m.status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setActiveModelId(m.id)}>
                        <Eye size={13} />
                        <span>View</span>
                      </button>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setActiveTab('verification'); runVerification(); }}>
                        <ShieldCheck size={13} />
                        <span>Verify</span>
                      </button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleExportModelSpec(m)} aria-label="Export certificate">
                        <Download size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload & Register Modal */}
      {isRegisterOpen && (
        <div className="modal-overlay" onClick={() => setIsRegisterOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '620px' }} onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleRegisterSubmit}>
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <BrainCircuit size={20} style={{ color: 'var(--accent-cyan)' }} />
                  <h3 className="card-title" style={{ margin: 0 }}>Upload Model Weights & Register</h3>
                </div>
                <button type="button" className="btn-ghost" onClick={() => setIsRegisterOpen(false)} style={{ padding: '4px' }}>
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body">
                {/* Drag-and-drop upload zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  style={{
                    border: `2px dashed ${isDragging ? 'var(--accent-cyan)' : uploadedFile ? 'var(--status-verified)' : 'var(--border-accent)'}`,
                    borderRadius: '8px',
                    padding: '28px 20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: isDragging ? 'rgba(56, 189, 248, 0.06)' : uploadedFile ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-input)',
                    transition: 'all 0.2s ease',
                    marginBottom: '20px',
                  }}
                >
                  <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleFileChange} id="model-file-upload" />

                  {isHashing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <Loader2 size={32} style={{ color: 'var(--accent-cyan)', animation: 'spin 1s linear infinite' }} />
                      <span style={{ color: 'var(--accent-cyan)', fontSize: '13px', fontWeight: 600 }}>Computing weights SHA-256...</span>
                    </div>
                  ) : uploadedFile && uploadedHash ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={32} style={{ color: 'var(--status-verified)' }} />
                      <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '14px' }}>{uploadedFile.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {formatBytes(uploadedFile.size)} · {uploadedFile.name.split('.').pop()?.toUpperCase()}
                      </div>
                      <div className="font-mono" style={{ fontSize: '11px', color: 'var(--status-verified)', backgroundColor: 'rgba(16, 185, 129, 0.08)', padding: '4px 10px', borderRadius: '4px', marginTop: '4px', wordBreak: 'break-all' }}>
                        SHA-256: {uploadedHash.slice(0, 32)}...
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Click to replace file</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <Upload size={32} style={{ color: 'var(--text-muted)', opacity: 0.6 }} />
                      <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '14px' }}>Drop weights file here or click to browse</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>.pt · .pth · .onnx · .engine · .h5 · .pb or any file</div>
                    </div>
                  )}
                </div>

                <div className="input-group">
                  <label className="input-label">Model Name / Designation *</label>
                  <input type="text" className="form-input" placeholder="e.g. YOLOv9 Tactical Object Detector" value={formName} onChange={(e) => setFormName(e.target.value)} required />
                </div>

                <div className="grid-2">
                  <div className="input-group">
                    <label className="input-label">Version</label>
                    <input type="text" className="form-input" value={formVersion} onChange={(e) => setFormVersion(e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Framework</label>
                    <input type="text" className="form-input" value={formFramework} onChange={(e) => setFormFramework(e.target.value)} placeholder="PyTorch, ONNX, TensorRT..." />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="input-group">
                    <label className="input-label">Architecture</label>
                    <input type="text" className="form-input" value={formArchitecture} onChange={(e) => setFormArchitecture(e.target.value)} placeholder="YOLOv9, ViT-B/16, ResNet-50..." />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Evaluation Accuracy (mAP %)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      className="form-input"
                      value={formAccuracy}
                      onChange={(e) => setFormAccuracy(e.target.value)}
                      placeholder="e.g. 94.2"
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Contributor</label>
                  <select className="form-select" value={formContributor} onChange={(e) => setFormContributor(e.target.value)}>
                    <option value="">— Select Contributor —</option>
                    {contributors.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.role})</option>
                    ))}
                  </select>
                  {contributors.length === 0 && (
                    <div style={{ fontSize: '11px', color: 'var(--status-warning)', marginTop: '4px' }}>
                      No contributors.{' '}
                      <button type="button" style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: '11px', padding: 0 }}
                        onClick={() => { setIsRegisterOpen(false); setActiveTab('contributors'); }}>
                        Add one →
                      </button>
                    </div>
                  )}
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Notes / Mission Scope</label>
                  <textarea className="form-textarea" rows={3} placeholder="Training parameters, quantization mode, certified use case..." value={formDescription} onChange={(e) => setFormDescription(e.target.value)} />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsRegisterOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isHashing || !uploadedHash} title={!uploadedHash ? 'Upload a weights file first' : ''}>
                  {isHashing ? (
                    <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /><span>Computing Hash...</span></>
                  ) : (
                    <><ShieldCheck size={16} /><span>Register & Seal to Ledger</span></>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
