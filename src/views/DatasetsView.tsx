import React, { useState, useRef, useCallback } from 'react';
import {
  Database,
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
import type { DatasetItem } from '../types';
import { HashDisplay } from '../components/common/HashDisplay';
import { StatusBadge } from '../components/common/StatusBadge';
import { DatasetDetailView } from './DatasetDetailView';
import { computeSha256 } from '../crypto/sha256';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export const DatasetsView: React.FC = () => {
  const {
    datasets,
    contributors,
    activeDatasetId,
    setActiveDatasetId,
    registerDataset,
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
  const [formContributor, setFormContributor] = useState('');
  const [formDescription, setFormDescription] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredDatasets = datasets.filter(
    (d: DatasetItem) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.contributor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const processFile = useCallback(async (file: File) => {
    setUploadedFile(file);
    setIsHashing(true);
    setUploadedHash('');
    try {
      const buffer = await file.arrayBuffer();
      const hash = await computeSha256(buffer);
      setUploadedHash(hash);
      // Auto-fill name if empty
      setFormName((prev) => prev || file.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' '));
      addToast('success', 'File Fingerprinted', `SHA-256: ${hash.slice(0, 16)}... Ready to register.`);
    } catch {
      addToast('error', 'Hash Error', 'Could not compute file hash. Try again.');
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
      addToast('warning', 'Validation Error', 'Dataset name is required.');
      return;
    }
    if (!uploadedFile || !uploadedHash) {
      addToast('warning', 'No File', 'Please upload a file to generate a real SHA-256 fingerprint.');
      return;
    }

    const selectedContributor = contributors.find((c) => c.id === formContributor) || null;

    await registerDataset(
      {
        name: formName,
        version: formVersion,
        contributor: selectedContributor?.name || 'Unknown Contributor',
        contributorId: selectedContributor?.id || 'CONTRIB-UNKNOWN',
        size: formatBytes(uploadedFile.size),
        fileCount: 1,
        fileType: uploadedFile.type || uploadedFile.name.split('.').pop()?.toUpperCase() || 'Binary',
        resolution: 'N/A',
        uploadSource: `Direct Upload: ${uploadedFile.name}`,
        description: formDescription || `Uploaded file: ${uploadedFile.name}`,
      },
      uploadedHash
    );

    // Reset form
    setIsRegisterOpen(false);
    setFormName('');
    setFormVersion('v1.0');
    setFormContributor('');
    setFormDescription('');
    setUploadedFile(null);
    setUploadedHash('');
  };

  const handleDownloadMetadata = (dataset: DatasetItem) => {
    const metaStr = JSON.stringify(dataset, null, 2);
    const blob = new Blob([metaStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dataset.id}_metadata.json`;
    a.click();
    addToast('info', 'Metadata Exported', `Exported JSON record for ${dataset.id}`);
  };

  // Show detail view when a dataset is selected
  if (activeDatasetId) {
    return (
      <DatasetDetailView
        datasetId={activeDatasetId}
        onBack={() => setActiveDatasetId(null)}
      />
    );
  }

  return (
    <div className="page-container">
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 className="text-h2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={22} style={{ color: 'var(--accent-cyan)' }} />
            <span>Dataset Registry & Provenance</span>
          </h2>
          <div className="text-meta" style={{ marginTop: '3px' }}>
            Tamper-evident registry of training datasets — each file is SHA-256 fingerprinted on upload
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '32px', fontSize: '13px' }}
              placeholder="Filter datasets..."
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
            <span>Upload Dataset</span>
          </button>
        </div>
      </div>

      {/* Dataset Table */}
      {filteredDatasets.length === 0 ? (
        <div className="defense-card" style={{ textAlign: 'center', padding: '56px 24px' }}>
          <Database size={44} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: '16px' }} />
          <h3 style={{ color: '#FFFFFF', marginBottom: '8px', fontSize: '18px' }}>No Datasets Registered</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', maxWidth: '480px', margin: '0 auto 20px auto', lineHeight: '1.6' }}>
            {searchQuery
              ? `No datasets match "${searchQuery}".`
              : 'Upload your first dataset file. VisionTrust will compute a real SHA-256 fingerprint and seal it in the tamper-evident audit ledger.'}
          </p>
          <button type="button" className="btn btn-primary" onClick={() => setIsRegisterOpen(true)}>
            <Upload size={15} />
            <span>Upload Dataset File</span>
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="defense-table">
            <thead>
              <tr>
                <th>Dataset Name</th>
                <th>Version</th>
                <th>Contributor</th>
                <th>Cryptographic SHA-256</th>
                <th>Size</th>
                <th>Registered</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDatasets.map((d: DatasetItem) => (
                <tr key={d.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{d.name}</div>
                    <div className="text-meta font-mono">{d.id}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#38BDF8', fontSize: '12.5px' }}>
                      {d.version}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '13px', color: '#E2E8F0' }}>{d.contributor}</div>
                    <div className="text-meta">{d.contributorId}</div>
                  </td>
                  <td>
                    <HashDisplay hash={d.sha256} expectedHash={d.expectedSha256} showMatchStatus />
                  </td>
                  <td>{d.size}</td>
                  <td style={{ fontSize: '12px' }}>{d.createdDate}</td>
                  <td>
                    <StatusBadge status={d.status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setActiveDatasetId(d.id)}
                        title="Inspect dataset provenance and metadata"
                      >
                        <Eye size={13} />
                        <span>View</span>
                      </button>

                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setActiveTab('verification');
                          runVerification();
                        }}
                        title="Run zero-trust pipeline check"
                      >
                        <ShieldCheck size={13} />
                        <span>Verify</span>
                      </button>

                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleDownloadMetadata(d)}
                        title="Download JSON metadata"
                        aria-label="Download metadata"
                      >
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
                  <Database size={20} style={{ color: 'var(--accent-cyan)' }} />
                  <h3 className="card-title" style={{ margin: 0 }}>Upload Dataset & Establish Provenance</h3>
                </div>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setIsRegisterOpen(false)}
                  style={{ padding: '4px' }}
                >
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
                    backgroundColor: isDragging
                      ? 'rgba(56, 189, 248, 0.06)'
                      : uploadedFile
                      ? 'rgba(16, 185, 129, 0.05)'
                      : 'var(--bg-input)',
                    transition: 'all 0.2s ease',
                    marginBottom: '20px',
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                    id="dataset-file-upload"
                  />

                  {isHashing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <Loader2 size={32} style={{ color: 'var(--accent-cyan)', animation: 'spin 1s linear infinite' }} />
                      <span style={{ color: 'var(--accent-cyan)', fontSize: '13px', fontWeight: 600 }}>
                        Computing SHA-256 fingerprint...
                      </span>
                    </div>
                  ) : uploadedFile && uploadedHash ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={32} style={{ color: 'var(--status-verified)' }} />
                      <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '14px' }}>{uploadedFile.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {formatBytes(uploadedFile.size)} · {uploadedFile.type || 'Binary'}
                      </div>
                      <div
                        className="font-mono"
                        style={{
                          fontSize: '11px',
                          color: 'var(--status-verified)',
                          backgroundColor: 'rgba(16, 185, 129, 0.08)',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          marginTop: '4px',
                          wordBreak: 'break-all',
                        }}
                      >
                        SHA-256: {uploadedHash.slice(0, 32)}...
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Click to replace file
                      </span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <Upload size={32} style={{ color: 'var(--text-muted)', opacity: 0.6 }} />
                      <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '14px' }}>
                        Drop file here or click to browse
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Any file type accepted · SHA-256 computed from actual file bytes
                      </div>
                    </div>
                  )}
                </div>

                <div className="input-group">
                  <label className="input-label">Dataset Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Tactical UAV Surveillance Run #109"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid-2">
                  <div className="input-group">
                    <label className="input-label">Version</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formVersion}
                      onChange={(e) => setFormVersion(e.target.value)}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Contributor</label>
                    <select
                      className="form-select"
                      value={formContributor}
                      onChange={(e) => setFormContributor(e.target.value)}
                    >
                      <option value="">— Select Contributor —</option>
                      {contributors.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.role})
                        </option>
                      ))}
                    </select>
                    {contributors.length === 0 && (
                      <div style={{ fontSize: '11px', color: 'var(--status-warning)', marginTop: '4px' }}>
                        No contributors registered.{' '}
                        <button
                          type="button"
                          style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: '11px', padding: 0 }}
                          onClick={() => { setIsRegisterOpen(false); setActiveTab('contributors'); }}
                        >
                          Add one first →
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Description</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Describe the dataset contents, source, and intended use..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsRegisterOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isHashing || !uploadedHash}
                  title={!uploadedHash ? 'Upload a file first' : ''}
                >
                  {isHashing ? (
                    <>
                      <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Computing Hash...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      <span>Register & Seal to Ledger</span>
                    </>
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
