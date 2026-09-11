import React from 'react';
import { AlertTriangle, ShieldAlert, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDangerous?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Cancel',
  isDangerous = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isDangerous ? (
              <ShieldAlert size={20} style={{ color: 'var(--status-compromised)' }} />
            ) : (
              <AlertTriangle size={20} style={{ color: 'var(--status-warning)' }} />
            )}
            <h3 className="card-title" style={{ margin: 0 }}>
              {title}
            </h3>
          </div>
          <button
            type="button"
            className="btn-ghost"
            onClick={onCancel}
            style={{ padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#CBD5E1' }}>
            {message}
          </p>
          {isDangerous && (
            <div
              style={{
                marginTop: '16px',
                padding: '12px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '4px',
                display: 'flex',
                gap: '8px',
                fontSize: '12.5px',
                color: '#FCA5A5',
              }}
            >
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Defence Simulation Warning:</strong> This operation will actively alter
                cryptographic fingerprints in memory to trigger zero-trust failure alerts.
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn ${isDangerous ? 'btn-danger' : 'btn-primary'}`}
            onClick={() => {
              onConfirm();
              onCancel();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
