import React, { useState } from 'react';
import {
  Shield,
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Radio,
  Loader2,
  Terminal,
} from 'lucide-react';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { ForgotPasswordModal } from '../components/auth/ForgotPasswordModal';
import { useVisionTrust } from '../context/VisionTrustContext';
import type { UserRole } from '../types';

interface LoginViewProps {
  onLoginSuccess?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const { login, rememberMePreference } = useAuth();
  const { setCurrentUserRole, addToast } = useVisionTrust();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(rememberMePreference);

  // Form errors
  const [identifierError, setIdentifierError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formAlert, setFormAlert] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Recovery modal
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  // Stable session telemetry ID
  const [sessionId] = useState(() => `VT-${Math.abs((Date.now() ^ 0xcafe) % 1000000).toString().padStart(6, '0')}`);

  // Autofill helper for 1-click demo evaluation
  const handleAutofillDemo = (roleKey: 'admin' | 'auditor' | 'secops') => {
    const demo = DEMO_USERS[roleKey];
    if (demo) {
      setIdentifier(demo.user.email);
      setPassword(demo.pass);
      setIdentifierError('');
      setPasswordError('');
      setFormAlert(null);
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;
    setIdentifierError('');
    setPasswordError('');
    setFormAlert(null);

    const trimmedId = identifier.trim();
    if (!trimmedId) {
      setIdentifierError('Identity clearance or defense email is required.');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Access password is required.');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters in length.');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setFormAlert(null);

    try {
      const result = await login({
        identifier,
        password,
        rememberMe,
      });

      if (!result.success) {
        setFormAlert(result.error || 'Authentication denied. Verify credentials.');
        setIsLoading(false);
        return;
      }

      // Check matched role to synchronize operational context
      const lower = identifier.toLowerCase().trim();
      let matchedRole: UserRole = 'ADMIN';
      if (lower.includes('auditor')) matchedRole = 'DEFENCE AUDITOR';
      else if (lower.includes('secops')) matchedRole = 'ML SEC-OPS';
      setCurrentUserRole(matchedRole);

      addToast(
        'success',
        'Identity Clearance Granted',
        `Authenticated as ${matchedRole}. Zero-trust cryptographic session established.`
      );

      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch {
      setFormAlert('System communication error during zero-trust cryptographic handshake.');
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      {/* Background Cybernetic Ambient Accents */}
      <div className="login-cyber-backdrop">
        <div className="cyber-glow-circle cyan" />
        <div className="cyber-glow-circle blue" />
        <div className="cyber-grid-overlay" />
      </div>

      <div className="login-container">
        {/* Top Operational Status Banner */}
        <div className="login-status-strip">
          <div className="login-status-pill">
            <Radio size={12} className="pulse-dot" style={{ color: 'var(--status-verified)' }} />
            <span>SECURE GATEWAY ENCRYPTED (TLS 1.3)</span>
          </div>
          <div className="login-status-pill font-mono">
            <Cpu size={12} style={{ color: 'var(--accent-cyan)' }} />
            <span>ZERO-TRUST V4.8</span>
          </div>
        </div>

        {/* Main Login Card */}
        <div className="login-card defense-card">
          {/* Card Header & Brand */}
          <div className="login-card-header">
            <div className="login-brand-icon">
              <Shield size={32} />
              <div className="brand-pulse-ring" />
            </div>
            <h1 className="login-title">VISIONTRUST</h1>
            <p className="login-subtitle">
              ENTERPRISE AI INTEGRITY & DEFENCE SEC-OPS GATEWAY
            </p>
            <div className="login-clearance-badge">
              <span>AUTHORIZED DEFENCE CLEARANCE REQUIRED</span>
            </div>
          </div>

          {/* 1-Click Demo Accounts Quick-Fill Bar */}
          <div className="login-demo-bar">
            <div className="demo-bar-title">
              <Terminal size={12} style={{ color: 'var(--accent-cyan)' }} />
              <span>1-Click Demo Evaluation Profiles</span>
            </div>
            <div className="demo-pills-row">
              <button
                type="button"
                className="demo-pill-btn"
                onClick={() => handleAutofillDemo('admin')}
                title="Autofill Administrator (admin@visiontrust.mil)"
              >
                <span className="demo-pill-role admin">ADMIN</span>
                <span className="demo-pill-user">Col. Sterling</span>
              </button>
              <button
                type="button"
                className="demo-pill-btn"
                onClick={() => handleAutofillDemo('auditor')}
                title="Autofill Defence Auditor (auditor@visiontrust.mil)"
              >
                <span className="demo-pill-role auditor">AUDITOR</span>
                <span className="demo-pill-user">Dr. Rostova</span>
              </button>
              <button
                type="button"
                className="demo-pill-btn"
                onClick={() => handleAutofillDemo('secops')}
                title="Autofill ML Sec-Ops (secops@visiontrust.mil)"
              >
                <span className="demo-pill-role secops">SEC-OPS</span>
                <span className="demo-pill-user">Maj. Vance</span>
              </button>
            </div>
          </div>

          {/* Form Alert Message */}
          {formAlert && (
            <div className="login-error-banner" role="alert">
              <AlertCircle size={18} className="error-banner-icon" />
              <div className="error-banner-text">
                <strong>Access Prohibited:</strong> {formAlert}
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form" noValidate>
            {/* Field: Identifier (Email / Callsign) */}
            <div className="input-group">
              <label className="input-label" htmlFor="login-identifier">
                Operator Identity or Defense Email
              </label>
              <div className={`login-input-wrapper ${identifierError ? 'has-error' : ''}`}>
                <div className="input-affix-icon">
                  <User size={16} />
                </div>
                <input
                  id="login-identifier"
                  type="text"
                  className="form-input login-input"
                  placeholder="e.g. admin@visiontrust.mil or admin"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (identifierError) setIdentifierError('');
                    if (formAlert) setFormAlert(null);
                  }}
                  autoComplete="username"
                  autoFocus
                  disabled={isLoading}
                />
              </div>
              {identifierError && (
                <div className="input-error-message">
                  <AlertCircle size={12} />
                  <span>{identifierError}</span>
                </div>
              )}
            </div>

            {/* Field: Password with Show/Hide */}
            <div className="input-group">
              <div className="input-label-row">
                <label className="input-label" htmlFor="login-password">
                  Security Passphrase
                </label>
                <button
                  type="button"
                  className="forgot-password-link"
                  onClick={() => setIsForgotModalOpen(true)}
                  tabIndex={0}
                >
                  Forgot Password?
                </button>
              </div>
              <div className={`login-input-wrapper ${passwordError ? 'has-error' : ''}`}>
                <div className="input-affix-icon">
                  <Lock size={16} />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input login-input password-input"
                  placeholder="Enter access passphrase"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                    if (formAlert) setFormAlert(null);
                  }}
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passwordError && (
                <div className="input-error-message">
                  <AlertCircle size={12} />
                  <span>{passwordError}</span>
                </div>
              )}
            </div>

            {/* Remember Me & Session Security Option */}
            <div className="login-options-row">
              <label className="remember-me-container">
                <input
                  type="checkbox"
                  className="remember-me-checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                />
                <span className="remember-me-custom-check">
                  <CheckCircle2 size={13} className="check-icon" />
                </span>
                <span className="remember-me-label">
                  Remember terminal credentials
                </span>
              </label>

              <span className="session-policy-tag font-mono">
                {rememberMe ? 'LOCAL PERSISTENCE' : 'SESSION ONLY'}
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary login-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="spin-animation" />
                  <span>Verifying Zero-Trust Handshake...</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Authenticate & Enter Command Center</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Security Policy & Telemetry Notice */}
          <div className="login-card-footer">
            <div className="security-notice-box">
              <Shield size={14} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
              <span>
                DEFENCE ZERO-TRUST ENVIRONMENT: All authentication handshakes, IP traces, and cryptographic signatures are audited in the immutable ledger.
              </span>
            </div>
            <div className="login-meta-telemetry">
              <span>SESSION ID: {sessionId}</span>
              <span>•</span>
              <span>CRYPTO ALGO: SHA-256 / ED25519</span>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        defaultEmail={identifier.includes('@') ? identifier : ''}
      />
    </div>
  );
};
