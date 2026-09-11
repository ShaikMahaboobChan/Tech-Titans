import React, { useState } from 'react';
import {
  Settings,
  Lock,
  Server,
  RotateCcw,
  Plus,
  Radio,
  X,
  Users,
  Database,
  BrainCircuit,
  ScanSearch,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useVisionTrust } from '../context/VisionTrustContext';
import { ConfirmModal } from '../components/common/ConfirmModal';

interface UplinkNode {
  id: string;
  name: string;
  protocol: string;
  endpoint: string;
}

export const SettingsView: React.FC = () => {
  const { restoreIntegrity, addToast, clearAllData, setActiveTab } = useVisionTrust();

  const [hashAlgo, setHashAlgo] = useState('SHA-256');
  const [autoVerify, setAutoVerify] = useState(true);
  const [telemetrySync, setTelemetrySync] = useState(true);

  const [uplinkNodes, setUplinkNodes] = useState<UplinkNode[]>([]);
  const [isAddNodeOpen, setIsAddNodeOpen] = useState(false);
  const [isWipeModalOpen, setIsWipeModalOpen] = useState(false);
  const [nodeName, setNodeName] = useState('');
  const [nodeProtocol, setNodeProtocol] = useState('TLS 1.3');
  const [nodeEndpoint, setNodeEndpoint] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('success', 'Settings Saved', 'Defence cryptographic parameters updated.');
  };

  const handleWipeConfirm = () => {
    clearAllData();
    setIsWipeModalOpen(false);
    setActiveTab('dashboard');
    addToast('info', 'System Cleared', 'All data reset. Begin fresh pipeline setup from Contributors or Datasets.');
  };

  const handleAddNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nodeName.trim() || !nodeEndpoint.trim()) {
      addToast('warning', 'Validation Error', 'Node name and endpoint are required.');
      return;
    }
    const newNode: UplinkNode = {
      id: `NODE-${Date.now().toString().slice(-4)}`,
      name: nodeName,
      protocol: nodeProtocol,
      endpoint: nodeEndpoint,
    };
    setUplinkNodes((prev) => [...prev, newNode]);
    setIsAddNodeOpen(false);
    setNodeName('');
    setNodeEndpoint('');
    addToast('success', 'Uplink Configured', `${newNode.name} added to defense network.`);
  };

  const handleRemoveNode = (id: string) => {
    setUplinkNodes((prev) => prev.filter((n) => n.id !== id));
    addToast('info', 'Uplink Removed', 'Network node endpoint deleted.');
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: '20px' }}>
        <h2 className="text-h2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Settings size={22} style={{ color: 'var(--accent-cyan)' }} />
          <span>Security & System Settings</span>
        </h2>
        <div className="text-meta" style={{ marginTop: '3px' }}>
          Cryptographic standards, zero-trust alert thresholds, and defense node telemetries
        </div>
      </div>

      <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Pipeline Quick-Start Navigation */}
        <div className="defense-card">
          <div className="card-header">
            <h3 className="card-title">
              <Sparkles size={16} style={{ color: 'var(--accent-cyan)' }} />
              <span>Pipeline Quick-Start Navigation</span>
            </h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            Quickly navigate across the defense pipeline to configure identity, upload artifacts, or inspect telemetry.
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setActiveTab('contributors')}>
              <Users size={14} />
              <span>1. Contributors</span>
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setActiveTab('datasets')}>
              <Database size={14} />
              <span>2. Datasets</span>
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setActiveTab('models')}>
              <BrainCircuit size={14} />
              <span>3. Models</span>
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setActiveTab('inference')}>
              <ScanSearch size={14} />
              <span>4. Inference</span>
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setActiveTab('verification')}>
              <ShieldCheck size={14} />
              <span>5. Verification</span>
            </button>
          </div>
        </div>

        {/* Cryptographic Standards */}
        <div className="defense-card">
          <div className="card-header">
            <h3 className="card-title">
              <Lock size={16} style={{ color: 'var(--accent-cyan)' }} />
              <span>Cryptographic Engine Standards</span>
            </h3>
          </div>

          <form onSubmit={handleSave}>
            <div className="input-group">
              <label className="input-label">Primary Hashing Algorithm</label>
              <select
                className="form-select font-mono"
                value={hashAlgo}
                onChange={(e) => setHashAlgo(e.target.value)}
              >
                <option value="SHA-256">SHA-256 (FIPS 180-4 Defence Standard - Active)</option>
                <option value="SHA-384">SHA-384 (High-Assurance Government Profile)</option>
                <option value="SHA-512">SHA-512 (Extended State Cryptography)</option>
              </select>
              <span className="text-meta" style={{ marginTop: '4px' }}>
                All pipeline artifacts, Merkle leaves, and ledger blocks use this cryptographic primitive.
              </span>
            </div>

            <div className="input-group">
              <label className="input-label">Digital Signature Scheme</label>
              <input
                type="text"
                className="form-input font-mono"
                value="ECDSA with curve secp256r1 (P-256) + SHA-256"
                disabled
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                <input
                  type="checkbox"
                  checked={autoVerify}
                  onChange={(e) => setAutoVerify(e.target.checked)}
                />
                Automatically re-verify pipeline upon sensor ingestion or weight change
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                <input
                  type="checkbox"
                  checked={telemetrySync}
                  onChange={(e) => setTelemetrySync(e.target.checked)}
                />
                Stream tamper detection alerts to MoD Joint Cyber Operations Center
              </label>
            </div>

            <div style={{ marginTop: '20px' }}>
              <button type="submit" className="btn btn-primary btn-sm">
                Save Configuration
              </button>
            </div>
          </form>
        </div>

        {/* Defense Network Node Uplinks */}
        <div className="defense-card">
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 className="card-title">
              <Server size={16} style={{ color: 'var(--accent-cyan)' }} />
              <span>Defence Network Node Uplinks</span>
            </h3>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsAddNodeOpen(true)}
            >
              <Plus size={14} />
              <span>Add Uplink Endpoint</span>
            </button>
          </div>

          {uplinkNodes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
              <Server size={36} style={{ opacity: 0.35, marginBottom: '10px' }} />
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
                No external network node uplinks configured
              </div>
              <p style={{ fontSize: '12.5px', maxWidth: '420px', margin: '0 auto 16px auto', lineHeight: 1.5 }}>
                Configure remote cluster or sensor endpoints to establish TLS 1.3 encrypted telemetry feeds.
              </p>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setIsAddNodeOpen(true)}
              >
                <Plus size={14} />
                <span>Configure First Uplink</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {uplinkNodes.map((node) => (
                <div
                  key={node.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#0D1B2A',
                    padding: '12px 14px',
                    borderRadius: '6px',
                    border: '1px solid #1E344F',
                  }}
                >
                  <div>
                    <strong style={{ color: '#FFFFFF', fontSize: '13px' }}>{node.name}</strong>
                    <div className="text-meta">Protocol: {node.protocol} • Endpoint: {node.endpoint}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--status-verified)', fontSize: '12px', fontWeight: 600 }}>
                      <Radio size={12} /> CONFIGURED
                    </span>
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => handleRemoveNode(node.id)}
                      style={{ padding: '4px' }}
                      title="Remove endpoint"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal to add an uplink endpoint */}
        {isAddNodeOpen && (
          <div className="modal-overlay" onClick={() => setIsAddNodeOpen(false)}>
            <div className="modal-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
              <form onSubmit={handleAddNode}>
                <div className="modal-header">
                  <h3 className="card-title" style={{ margin: 0 }}>Configure Network Uplink</h3>
                  <button type="button" className="btn-ghost" onClick={() => setIsAddNodeOpen(false)} style={{ padding: '4px' }}>
                    <X size={18} />
                  </button>
                </div>
                <div className="modal-body">
                  <div className="input-group">
                    <label className="input-label">Node Identifier *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Telemetry Ingestion Node #01"
                      value={nodeName}
                      onChange={(e) => setNodeName(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Protocol</label>
                    <select
                      className="form-select"
                      value={nodeProtocol}
                      onChange={(e) => setNodeProtocol(e.target.value)}
                    >
                      <option value="TLS 1.3">TLS 1.3 Encrypted Stream</option>
                      <option value="DTLS 1.2">DTLS 1.2 Datagram Tunnel</option>
                      <option value="gRPC / TLS">gRPC over HTTP/2 with mTLS</option>
                    </select>
                  </div>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">Remote Endpoint Address *</label>
                    <input
                      type="text"
                      className="form-input font-mono"
                      placeholder="e.g. node01.defence.internal:8443"
                      value={nodeEndpoint}
                      onChange={(e) => setNodeEndpoint(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setIsAddNodeOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Add Endpoint</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* System Reset */}
        <div className="defense-card">
          <div className="card-header">
            <h3 className="card-title" style={{ color: '#F87171' }}>
              <span>Baseline System Reset</span>
            </h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            Reset all memory states, clear simulated red-team tampering injections, and restore
            all artifacts to certified baseline fingerprints. Or permanently clear all browser storage to start from an empty state.
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-secondary" onClick={restoreIntegrity}>
              <RotateCcw size={14} />
              <span>Restore Pure State</span>
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => setIsWipeModalOpen(true)}
            >
              <span>Wipe All Storage & Reset</span>
            </button>
          </div>
        </div>

        <ConfirmModal
          isOpen={isWipeModalOpen}
          title="Wipe All Local Storage?"
          message="This will permanently delete all registered datasets, model checkpoints, inferences, and audit ledger blocks from browser storage and return to a clean baseline."
          confirmLabel="Wipe Everything"
          isDangerous={true}
          onConfirm={handleWipeConfirm}
          onCancel={() => setIsWipeModalOpen(false)}
        />
      </div>
    </div>
  );
};
