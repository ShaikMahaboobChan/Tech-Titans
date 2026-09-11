import React from 'react';
import { X, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { useVisionTrust } from '../../context/VisionTrustContext';

export const NotificationsDrawer: React.FC = () => {
  const {
    isNotificationsOpen,
    setIsNotificationsOpen,
    securityEvents,
    setActiveTab,
  } = useVisionTrust();

  if (!isNotificationsOpen) return null;

  return (
    <div
      className="modal-overlay"
      style={{ justifyContent: 'flex-end', padding: 0 }}
      onClick={() => setIsNotificationsOpen(false)}
    >
      <div
        className="modal-card"
        style={{
          width: '420px',
          height: '100vh',
          maxHeight: '100vh',
          borderRadius: 0,
          borderRight: 'none',
          borderTop: 'none',
          borderBottom: 'none',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-secondary)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header" style={{ padding: '16px 20px' }}>
          <div>
            <h3 className="card-title" style={{ margin: 0 }}>
              Security Event Telemetry
            </h3>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
              Real-time cryptographic audit trail
            </span>
          </div>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setIsNotificationsOpen(false)}
            style={{ padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {securityEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 16px' }}>
              <CheckCircle2 size={36} style={{ color: 'var(--status-verified)', opacity: 0.6, marginBottom: '12px' }} />
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
                No activity yet
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                No security alerts, telemetry violations, or audit entries found.
              </p>
            </div>
          ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {securityEvents.map((evt) => {
              const isCompromised = evt.status === 'compromised';
              const isWarning = evt.status === 'warning';

              return (
                <div
                  key={evt.id}
                  className="defense-card"
                  style={{
                    padding: '12px 14px',
                    borderColor: isCompromised
                      ? 'var(--status-compromised)'
                      : isWarning
                      ? 'var(--status-warning)'
                      : undefined,
                    backgroundColor: isCompromised
                      ? 'rgba(239, 68, 68, 0.05)'
                      : undefined,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    {isCompromised ? (
                      <ShieldAlert
                        size={17}
                        style={{ color: 'var(--status-compromised)', flexShrink: 0, marginTop: '2px' }}
                      />
                    ) : isWarning ? (
                      <AlertTriangle
                        size={17}
                        style={{ color: 'var(--status-warning)', flexShrink: 0, marginTop: '2px' }}
                      />
                    ) : (
                      <CheckCircle2
                        size={17}
                        style={{ color: 'var(--status-verified)', flexShrink: 0, marginTop: '2px' }}
                      />
                    )}

                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '13px',
                          color: isCompromised ? '#FCA5A5' : '#FFFFFF',
                          lineHeight: 1.3,
                        }}
                      >
                        {evt.eventType}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {evt.details}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: '8px',
                          fontSize: '11px',
                          color: 'var(--text-muted)',
                        }}
                      >
                        <span>{evt.timestamp}</span>
                        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {evt.artifactId}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setActiveTab('audit');
              setIsNotificationsOpen(false);
            }}
          >
            <span>View Full Audit Ledger</span>
            <ArrowRight size={13} />
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setIsNotificationsOpen(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
