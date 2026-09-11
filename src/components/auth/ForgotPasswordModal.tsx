import React, { useState } from 'react';
import { ShieldCheck, Mail, AlertCircle, CheckCircle2, X, KeyRound, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  defaultEmail = '',
}) => {
  const { forgotPassword } = useAuth();
  const [identifier, setIdentifier] = useState(defaultEmail);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ token: string; email: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const target = identifier.trim();
    if (!target) {
      setError('Please provide your authorized defense email or clearance identifier.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await forgotPassword(target);
      if (res.success) {
        const simulatedToken = `VT-${Math.floor(100000 + Math.random() * 900000)}`;
        setSuccessInfo({ token: simulatedToken, email: target });
      } else {
        setError(res.message);
      }
    } catch {
      setError('Failed to contact zero-trust key management service. Try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetDialog = () => {
    setSuccessInfo(null);
    setError('');
    setIdentifier('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleResetDialog}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <KeyRound size={20} style={{ color: 'var(--accent-cyan)' }} />
            <h3 className="card-title" style={{ margin: 0 }}>
              Access Clearance Recovery
            </h3>
          </div>
          <button
            type="button"
            className="btn-ghost"
            onClick={handleResetDialog}
            style={{ padding: '4px' }}
            aria-label="Close recovery dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {successInfo ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center', padding: '12px 0' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid var(--status-verified)',
                  color: 'var(--status-verified)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                }}
              >
                <CheckCircle2 size={32} />
              </div>

              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginBottom: '6px' }}>
                  Recovery Dispatch Issued
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  A cryptographic verification signal has been dispatched for{' '}
                  <strong style={{ color: '#38BDF8' }}>{successInfo.email}</strong>.
                </p>
              </div>

              <div
                style={{
                  background: 'rgba(11, 23, 38, 0.8)',
                  border: '1px solid #1E3A5F',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Simulated Emergency Auth Token
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="font-mono" style={{ fontSize: '18px', fontWeight: 700, color: '#38BDF8', letterSpacing: '2px' }}>
                    {successInfo.token}
                  </span>
                  <span className="status-badge badge-verified" style={{ fontSize: '10px' }}>
                    VALID FOR 15 MIN
                  </span>
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  In production, operators authenticate with their hardware YubiKey / CAC token to establish new session credentials.
                </div>
              </div>

              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Demo hint: You can immediately log in using any demo account or password.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Enter your registered defense email address or operational callsign. The Zero-Trust Identity Controller will issue an emergency credential reset dispatch.
              </p>

              {error && (
                <div
                  style={{
                    padding: '10px 14px',
                    backgroundColor: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '12.5px',
                    color: '#FCA5A5',
                  }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" htmlFor="recovery-identity">
                  Defence Email or Operator ID
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  />
                  <input
                    id="recovery-identity"
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '38px' }}
                    placeholder="e.g. admin@visiontrust.mil or admin"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (error) setError('');
                    }}
                    autoFocus
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '11.5px',
                  color: 'var(--text-muted)',
                  padding: '8px 12px',
                  backgroundColor: 'rgba(56, 189, 248, 0.05)',
                  border: '1px solid rgba(56, 189, 248, 0.15)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <ShieldCheck size={14} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
                <span>Zero-Trust Protocol: Clearance resets are logged to the immutable audit ledger.</span>
              </div>

              <div className="modal-footer" style={{ margin: '8px -22px -22px -22px' }}>
                <button type="button" className="btn btn-secondary" onClick={handleResetDialog}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="spin-animation" />
                      <span>Verifying Identity...</span>
                    </>
                  ) : (
                    <span>Dispatch Recovery Signal</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {successInfo && (
          <div className="modal-footer">
            <button type="button" className="btn btn-primary" onClick={handleResetDialog} style={{ width: '100%' }}>
              Return to Login Portal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
