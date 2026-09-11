import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Database, Cpu, Activity, User, ArrowRight } from 'lucide-react';
import { useVisionTrust } from '../../context/VisionTrustContext';
import { formatShortHash } from '../../crypto/sha256';

export const GlobalSearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    datasets,
    models,
    inferences,
    contributors,
    setActiveTab,
    setActiveDatasetId,
    setActiveModelId,
  } = useVisionTrust();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  const handleClose = () => {
    setQuery('');
    setIsSearchOpen(false);
  };

  if (!isSearchOpen) return null;

  const q = query.trim().toLowerCase();

  const filteredDatasets = q
    ? datasets.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.id.toLowerCase().includes(q) ||
          d.sha256.toLowerCase().includes(q) ||
          d.contributor.toLowerCase().includes(q)
      )
    : [];

  const filteredModels = q
    ? models.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q) ||
          m.sha256.toLowerCase().includes(q) ||
          m.framework.toLowerCase().includes(q)
      )
    : [];

  const filteredInferences = q
    ? inferences.filter(
        (inf) =>
          inf.id.toLowerCase().includes(q) ||
          inf.pipelineId.toLowerCase().includes(q) ||
          inf.name.toLowerCase().includes(q) ||
          inf.outputSha256.toLowerCase().includes(q)
      )
    : [];

  const filteredContributors = q
    ? contributors.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.organization.toLowerCase().includes(q) ||
          c.role.toLowerCase().includes(q)
      )
    : [];

  const totalResults =
    filteredDatasets.length +
    filteredModels.length +
    filteredInferences.length +
    filteredContributors.length;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-card"
        style={{ maxWidth: '680px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-input)',
          }}
        >
          <Search size={20} style={{ color: 'var(--text-muted)' }} />
          <input
            ref={inputRef}
            type="text"
            className="form-input"
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              padding: 0,
              fontSize: '15px',
              color: '#FFFFFF',
            }}
            placeholder="Search datasets, models, inferences, hashes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="button"
            className="btn-ghost"
            onClick={handleClose}
            style={{ padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '420px', padding: '16px 20px' }}>
          {!q ? (
            <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)' }}>
              <Search size={32} style={{ opacity: 0.3, marginBottom: '10px' }} />
              <p style={{ fontSize: '13px' }}>
                Type to search across cryptographic registry, pipelines, and audit artifacts.
              </p>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '12px',
                  fontSize: '11px',
                }}
              >
                <span className="search-kbd-shortcut">ESC</span> to close
                <span className="search-kbd-shortcut">Ctrl + K</span> to toggle
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)' }}>
              <p>No matching artifacts or hashes found for "{query}".</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Datasets */}
              {filteredDatasets.length > 0 && (
                <div>
                  <div className="nav-section-label" style={{ paddingLeft: 0 }}>
                    Datasets ({filteredDatasets.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {filteredDatasets.map((d) => (
                      <div
                        key={d.id}
                        className="defense-card"
                        style={{
                          padding: '10px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          setActiveDatasetId(d.id);
                          setActiveTab('datasets');
                          handleClose();
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Database size={16} style={{ color: 'var(--accent-cyan)' }} />
                          <div>
                            <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '13px' }}>
                              {d.name} <span style={{ color: 'var(--text-muted)' }}>{d.version}</span>
                            </div>
                            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                              {d.id} • SHA-256: {formatShortHash(d.sha256, 6, 4)}
                            </div>
                          </div>
                        </div>
                        <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Models */}
              {filteredModels.length > 0 && (
                <div>
                  <div className="nav-section-label" style={{ paddingLeft: 0 }}>
                    Models ({filteredModels.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {filteredModels.map((m) => (
                      <div
                        key={m.id}
                        className="defense-card"
                        style={{
                          padding: '10px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          setActiveModelId(m.id);
                          setActiveTab('models');
                          handleClose();
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Cpu size={16} style={{ color: 'var(--accent-cyan)' }} />
                          <div>
                            <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '13px' }}>
                              {m.name} <span style={{ color: 'var(--text-muted)' }}>{m.version}</span>
                            </div>
                            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                              {m.id} • {m.framework} • SHA: {formatShortHash(m.sha256, 6, 4)}
                            </div>
                          </div>
                        </div>
                        <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inferences */}
              {filteredInferences.length > 0 && (
                <div>
                  <div className="nav-section-label" style={{ paddingLeft: 0 }}>
                    Inferences ({filteredInferences.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {filteredInferences.map((inf) => (
                      <div
                        key={inf.id}
                        className="defense-card"
                        style={{
                          padding: '10px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          setActiveTab('inference');
                          handleClose();
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Activity size={16} style={{ color: 'var(--status-info)' }} />
                          <div>
                            <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '13px' }}>
                              {inf.id} — {inf.name}
                            </div>
                            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                              Output Hash: {formatShortHash(inf.outputSha256, 6, 4)}
                            </div>
                          </div>
                        </div>
                        <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contributors */}
              {filteredContributors.length > 0 && (
                <div>
                  <div className="nav-section-label" style={{ paddingLeft: 0 }}>
                    Contributors ({filteredContributors.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {filteredContributors.map((c) => (
                      <div
                        key={c.id}
                        className="defense-card"
                        style={{
                          padding: '10px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          setActiveTab('contributors');
                          handleClose();
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <User size={16} style={{ color: 'var(--text-secondary)' }} />
                          <div>
                            <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '13px' }}>
                              {c.name}
                            </div>
                            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                              {c.organization} • {c.role}
                            </div>
                          </div>
                        </div>
                        <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
