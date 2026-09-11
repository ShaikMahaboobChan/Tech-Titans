import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { useVisionTrust } from '../../context/VisionTrustContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useVisionTrust();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let iconColor = 'var(--status-verified)';

        if (toast.type === 'error') {
          Icon = XCircle;
          iconColor = 'var(--status-compromised)';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          iconColor = 'var(--status-warning)';
        } else if (toast.type === 'info') {
          Icon = Info;
          iconColor = 'var(--status-info)';
        }

        return (
          <div key={toast.id} className={`toast-item ${toast.type}`}>
            <Icon size={18} style={{ color: iconColor, flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '13px', color: '#FFFFFF' }}>
                {toast.title}
              </div>
              <div style={{ fontSize: '12px', color: '#CBD5E1', marginTop: '2px' }}>
                {toast.message}
              </div>
            </div>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => removeToast(toast.id)}
              style={{ padding: '2px', marginLeft: '6px' }}
              aria-label="Close notification"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
