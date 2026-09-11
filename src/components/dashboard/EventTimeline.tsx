import React from 'react';
import { CheckCircle2, ShieldAlert, AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import { useVisionTrust } from '../../context/VisionTrustContext';

export const EventTimeline: React.FC = () => {
  const { securityEvents, setActiveTab } = useVisionTrust();

  return (
    <div className="defense-card">
      <div className="card-header">
        <div>
          <h3 className="card-title">Recent Security Events</h3>
          <div className="card-subtitle">Immutable timeline of cryptographic operations and telemetry alerts</div>
        </div>
      </div>

      {securityEvents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '36px 16px' }}>
          <Clock size={36} style={{ color: 'var(--text-muted)', opacity: 0.35, marginBottom: '12px' }} />
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
            No activity yet
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', maxWidth: '360px', margin: '0 auto', lineHeight: 1.5 }}>
            Cryptographic operations, verifications, and security alerts will appear here in chronological order.
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0', position: 'relative' }}>
            {/* Continuous timeline line */}
            <div
              style={{
                position: 'absolute',
                left: '15px',
                top: '12px',
                bottom: '12px',
                width: '2px',
                backgroundColor: 'var(--border-card)',
                zIndex: 1,
              }}
            />

            {securityEvents.map((evt) => {
              const isCompromised = evt.status === 'compromised';
              const isWarning = evt.status === 'warning';

              return (
                <div
                  key={evt.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    padding: '10px 0',
                    position: 'relative',
                    zIndex: 2,
                  }}
                >
                  {/* Event Marker */}
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: isCompromised
                        ? 'rgba(239, 68, 68, 0.2)'
                        : isWarning
                        ? 'rgba(245, 158, 11, 0.2)'
                        : 'rgba(16, 185, 129, 0.2)',
                      border: `2px solid ${
                        isCompromised
                          ? 'var(--status-compromised)'
                          : isWarning
                          ? 'var(--status-warning)'
                          : 'var(--status-verified)'
                      }`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {isCompromised ? (
                      <ShieldAlert size={15} style={{ color: 'var(--status-compromised)' }} />
                    ) : isWarning ? (
                      <AlertTriangle size={15} style={{ color: 'var(--status-warning)' }} />
                    ) : (
                      <CheckCircle2 size={15} style={{ color: 'var(--status-verified)' }} />
                    )}
                  </div>

                  {/* Event Content */}
                  <div
                    style={{
                      flex: 1,
                      backgroundColor: isCompromised
                        ? 'rgba(239, 68, 68, 0.05)'
                        : 'var(--bg-secondary)',
                      border: `1px solid ${
                        isCompromised ? 'var(--status-compromised)' : 'var(--border-subtle)'
                      }`,
                      borderRadius: '6px',
                      padding: '10px 14px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '13px',
                          color: isCompromised ? '#FCA5A5' : '#FFFFFF',
                        }}
                      >
                        {evt.eventType}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          color: 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Clock size={11} />
                        {evt.timestamp}
                      </span>
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {evt.details}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginTop: '8px',
                        paddingTop: '6px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                        fontSize: '11px',
                      }}
                    >
                      <span style={{ color: 'var(--text-muted)' }}>
                        Artifact:{' '}
                        <strong style={{ color: '#38BDF8' }}>{evt.artifact}</strong>
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        By: <span style={{ color: 'var(--text-secondary)' }}>{evt.contributor}</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* View Full Ledger Link */}
          <div style={{ textAlign: 'center', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)', marginTop: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTab('audit')}
              style={{ margin: '0 auto' }}
            >
              <span>View Full Audit Ledger</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
