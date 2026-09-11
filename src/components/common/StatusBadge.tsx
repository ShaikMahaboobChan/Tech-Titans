import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, Clock } from 'lucide-react';
import type { VerificationStatus } from '../../types';

interface StatusBadgeProps {
  status: VerificationStatus;
  label?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
}) => {
  const iconSize = size === 'sm' ? 12 : 14;

  switch (status) {
    case 'verified':
      return (
        <span className="status-badge badge-verified">
          <CheckCircle2 size={iconSize} />
          <span>{label || '✓ VERIFIED'}</span>
        </span>
      );
    case 'compromised':
      return (
        <span className="status-badge badge-compromised">
          <XCircle size={iconSize} />
          <span>{label || '✕ COMPROMISED'}</span>
        </span>
      );
    case 'warning':
      return (
        <span className="status-badge badge-warning">
          <AlertTriangle size={iconSize} />
          <span>{label || '⚠ WARNING'}</span>
        </span>
      );
    case 'information':
      return (
        <span className="status-badge badge-info">
          <Info size={iconSize} />
          <span>{label || 'ℹ INFO'}</span>
        </span>
      );
    case 'pending':
    default:
      return (
        <span className="status-badge badge-pending">
          <Clock size={iconSize} />
          <span>{label || '● PENDING'}</span>
        </span>
      );
  }
};

export const VerifiedBadge: React.FC<{ text?: string }> = ({ text = '✓ VERIFIED' }) => (
  <StatusBadge status="verified" label={text} />
);

export const CompromisedBadge: React.FC<{ text?: string }> = ({ text = '✕ COMPROMISED' }) => (
  <StatusBadge status="compromised" label={text} />
);

export const WarningBadge: React.FC<{ text?: string }> = ({ text = '⚠ WARNING' }) => (
  <StatusBadge status="warning" label={text} />
);

export const PendingBadge: React.FC<{ text?: string }> = ({ text = '● PENDING' }) => (
  <StatusBadge status="pending" label={text} />
);
