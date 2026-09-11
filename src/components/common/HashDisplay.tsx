import React, { useState } from 'react';
import { Copy, Check, ShieldCheck, ShieldAlert } from 'lucide-react';
import { formatShortHash } from '../../crypto/sha256';

interface HashDisplayProps {
  hash: string;
  expectedHash?: string;
  algorithm?: string;
  showMatchStatus?: boolean;
  leadLength?: number;
  trailLength?: number;
}

export const HashDisplay: React.FC<HashDisplayProps> = ({
  hash,
  expectedHash,
  algorithm = 'SHA-256',
  showMatchStatus = false,
  leadLength = 8,
  trailLength = 6,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isMatch = expectedHash ? hash.toLowerCase() === expectedHash.toLowerCase() : true;

  return (
    <div
      className="hash-display-pill"
      data-tooltip={`Full Hash: ${hash}`}
      style={{
        borderColor: showMatchStatus
          ? isMatch
            ? 'var(--status-verified-border)'
            : 'var(--status-compromised-border)'
          : undefined,
      }}
    >
      {algorithm && <span className="hash-algorithm">{algorithm}</span>}
      <span className="hash-code">{formatShortHash(hash, leadLength, trailLength)}</span>

      <button
        type="button"
        className="hash-copy-btn"
        onClick={handleCopy}
        title={copied ? 'Copied full hash' : 'Copy complete SHA-256 hash'}
        aria-label="Copy hash"
      >
        {copied ? (
          <Check size={13} style={{ color: 'var(--status-verified)' }} />
        ) : (
          <Copy size={13} />
        )}
      </button>

      {showMatchStatus && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            fontSize: '10.5px',
            fontWeight: 700,
            paddingLeft: '4px',
            borderLeft: '1px solid #1E344F',
            color: isMatch ? 'var(--status-verified)' : 'var(--status-compromised)',
          }}
        >
          {isMatch ? (
            <>
              <ShieldCheck size={12} />
              <span>✓ MATCH</span>
            </>
          ) : (
            <>
              <ShieldAlert size={12} />
              <span>✕ MISMATCH</span>
            </>
          )}
        </span>
      )}
    </div>
  );
};
