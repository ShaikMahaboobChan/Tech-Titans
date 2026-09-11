import React, { useState } from 'react';
import { Users, Search, X, ShieldCheck, UserPlus, Database, BrainCircuit } from 'lucide-react';
import { useVisionTrust } from '../context/VisionTrustContext';
import type { Contributor } from '../types';
import { HashDisplay } from '../components/common/HashDisplay';
import { StatusBadge } from '../components/common/StatusBadge';

export const ContributorsView: React.FC = () => {
  const { contributors, addContributor, addToast, setActiveTab } = useVisionTrust();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formName, setFormName] = useState('');
  const [formOrg, setFormOrg] = useState('');
  const [formRole, setFormRole] = useState<Contributor['role']>('DATA PROVIDER');

  const filteredContributors = contributors.filter(
    (c: Contributor) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      addToast('warning', 'Validation Error', 'Contributor name is required.');
      return;
    }
    if (!formOrg.trim()) {
      addToast('warning', 'Validation Error', 'Organization name is required.');
      return;
    }
    addContributor({ name: formName, organization: formOrg, role: formRole });
    setIsAddOpen(false);
    setFormName('');
    setFormOrg('');
    setFormRole('DATA PROVIDER');
  };

  return (
    <div className="page-container">
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 className="text-h2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={22} style={{ color: 'var(--accent-cyan)' }} />
            <span>Authorized Contributors & PKI Certificates</span>
          </h2>
          <div className="text-meta" style={{ marginTop: '3px' }}>
            Register organizations and individuals authorized to contribute datasets and models. Each contributor gets a generated PKI keypair.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '32px', fontSize: '13px' }}
              placeholder="Search contributors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="button" className="btn btn-primary" onClick={() => setIsAddOpen(true)}>
            <UserPlus size={16} />
            <span>Add Contributor</span>
          </button>
        </div>
      </div>

      {/* Contributors Table or Empty State */}
      {filteredContributors.length === 0 ? (
        <div className="defense-card" style={{ textAlign: 'center', padding: '56px 24px' }}>
          <Users size={44} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: '16px' }} />
          <h3 style={{ color: '#FFFFFF', marginBottom: '8px', fontSize: '18px' }}>No Contributors Registered</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', maxWidth: '480px', margin: '0 auto 20px auto', lineHeight: '1.6' }}>
            {searchQuery
              ? `No contributors match "${searchQuery}".`
              : 'Register the organizations and individuals who will upload datasets and models. Contributors are referenced when registering artifacts.'}
          </p>
          <button type="button" className="btn btn-primary" onClick={() => setIsAddOpen(true)}>
            <UserPlus size={15} />
            <span>Add First Contributor</span>
          </button>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="defense-table">
              <thead>
                <tr>
                  <th>Contributor & Unit</th>
                  <th>Organization</th>
                  <th>Operational Role</th>
                  <th>Public Key Fingerprint</th>
                  <th>Registered Artifacts</th>
                  <th>Registered</th>
                  <th style={{ textAlign: 'right' }}>PKI Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredContributors.map((c: Contributor) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{c.name}</div>
                      <div className="text-meta font-mono">{c.id}</div>
                    </td>
                    <td>
                      <span style={{ color: '#E2E8F0', fontSize: '13px' }}>{c.organization}</span>
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor:
                            c.role === 'DATA PROVIDER'
                              ? 'rgba(56, 189, 248, 0.12)'
                              : c.role === 'MODEL PROVIDER'
                              ? 'rgba(16, 185, 129, 0.12)'
                              : c.role === 'AUDITOR'
                              ? 'rgba(245, 158, 11, 0.12)'
                              : 'rgba(148, 163, 184, 0.12)',
                          color:
                            c.role === 'DATA PROVIDER'
                              ? '#38BDF8'
                              : c.role === 'MODEL PROVIDER'
                              ? '#34D399'
                              : c.role === 'AUDITOR'
                              ? '#FBBF24'
                              : '#CBD5E1',
                          fontWeight: 700,
                          fontSize: '11px',
                        }}
                      >
                        {c.role}
                      </span>
                    </td>
                    <td>
                      <HashDisplay hash={c.publicKey} algorithm="ECDSA" leadLength={8} trailLength={6} />
                    </td>
                    <td>
                      <strong style={{ color: '#FFFFFF' }}>{c.artifactsCount}</strong>{' '}
                      <span className="text-meta">signed</span>
                    </td>
                    <td style={{ fontSize: '12px' }}>{c.registeredDate}</td>
                    <td style={{ textAlign: 'right' }}>
                      <StatusBadge status={c.verifiedStatus} label={c.verifiedStatus === 'verified' ? '✓ ROOT CERTIFIED' : '⏳ PKI PENDING'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Next Steps Prompt */}
          <div
            className="defense-card"
            style={{
              marginTop: '20px',
              padding: '18px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px',
              backgroundColor: 'rgba(56, 189, 248, 0.04)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-cyan)', textTransform: 'uppercase', marginBottom: '2px' }}>
                NEXT STEPS
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                PKI certificates active. Proceed to ingest datasets or register model weights under authorized contributors.
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setActiveTab('datasets')}
              >
                <Database size={14} />
                <span>Upload Dataset</span>
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setActiveTab('models')}
              >
                <BrainCircuit size={14} />
                <span>Register Model</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Add Contributor Modal */}
      {isAddOpen && (
        <div className="modal-overlay" onClick={() => setIsAddOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <UserPlus size={20} style={{ color: 'var(--accent-cyan)' }} />
                  <h3 className="card-title" style={{ margin: 0 }}>Register New Contributor</h3>
                </div>
                <button type="button" className="btn-ghost" onClick={() => setIsAddOpen(false)} style={{ padding: '4px' }}>
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body">
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(56, 189, 248, 0.07)',
                    border: '1px solid rgba(56, 189, 248, 0.18)',
                    marginBottom: '20px',
                    fontSize: '12.5px',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.6',
                  }}
                >
                  An ECDSA-P256 keypair will be generated for this contributor. Once registered, they can be selected when uploading datasets or models.
                </div>

                <div className="input-group">
                  <label className="input-label">Name / Unit Designation *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. DRDO AI Research Division B"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Organization / Parent Command *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Ministry of Defence Cyber Command"
                    value={formOrg}
                    onChange={(e) => setFormOrg(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Operational Role</label>
                  <select
                    className="form-select"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as Contributor['role'])}
                  >
                    <option value="DATA PROVIDER">DATA PROVIDER — uploads training datasets</option>
                    <option value="MODEL PROVIDER">MODEL PROVIDER — submits model weights</option>
                    <option value="AUDITOR">AUDITOR — reviews and certifies artifacts</option>
                    <option value="ANALYST">ANALYST — runs inferences and reports</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <ShieldCheck size={16} />
                  <span>Generate Keys & Register</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
