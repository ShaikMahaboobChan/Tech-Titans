import React from 'react';
import { Cpu, Database, Activity, FileCheck } from 'lucide-react';
import { useVisionTrust } from '../../context/VisionTrustContext';

export const SystemHealthMeter: React.FC = () => {
  const { datasets, models, inferences, auditBlocks, tamperState } = useVisionTrust();

  const isAnyTampered = Object.values(tamperState).some(Boolean);

  const totalDatasets = datasets.length;
  const verifiedDatasets = datasets.filter((d) => d.status === 'verified').length;

  const totalModels = models.length;
  const verifiedModels = models.filter((m) => m.status === 'verified').length;

  const totalInferences = inferences.length;
  const verifiedInferences = inferences.filter((i) => i.status === 'verified').length;

  const totalBlocks = auditBlocks.length;
  const verifiedBlocks = auditBlocks.filter((b) => b.status === 'verified').length;

  const totalItems = totalDatasets + totalModels + totalInferences + totalBlocks;
  const verifiedItems = verifiedDatasets + verifiedModels + verifiedInferences + verifiedBlocks;

  let healthPercent = 100;
  let statusText = 'STANDBY';

  if (totalItems > 0) {
    healthPercent = Math.round((verifiedItems / totalItems) * 100);
    statusText = isAnyTampered ? 'DEGRADED' : 'INTEGRITY';
  } else if (isAnyTampered) {
    healthPercent = 0;
    statusText = 'ALERT';
  }

  const strokeDashoffset = 283 - (283 * healthPercent) / 100;
  const strokeColor = isAnyTampered ? '#EF4444' : totalItems === 0 ? '#38BDF8' : '#10B981';

  return (
    <div className="defense-card">
      <div className="card-header" style={{ marginBottom: '14px' }}>
        <div>
          <h3 className="card-title">System Health & Telemetry</h3>
          <div className="card-subtitle">Zero-trust cryptographic health score</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '16px' }}>
        {/* Radial Gauge */}
        <div style={{ position: 'relative', width: '110px', height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="110" height="110" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              stroke="#162B44"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              stroke={strokeColor}
              strokeWidth="8"
              strokeDasharray="283"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.4s ease' }}
            />
          </svg>

          <div style={{ position: 'absolute', textAlign: 'center' }}>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1 }}>
              {totalItems === 0 && !isAnyTampered ? '100%' : `${healthPercent}%`}
            </div>
            <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {statusText}
            </div>
          </div>
        </div>

        {/* Supporting Sub-metrics */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
              <Database size={13} style={{ color: 'var(--accent-cyan)' }} />
              Datasets
            </span>
            <strong style={{ color: tamperState.datasetTampered ? 'var(--status-compromised)' : '#FFFFFF' }}>
              {totalDatasets === 0 ? '0/0' : `${verifiedDatasets}/${totalDatasets}`}
            </strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
              <Cpu size={13} style={{ color: 'var(--accent-cyan)' }} />
              Models
            </span>
            <strong style={{ color: tamperState.modelTampered ? 'var(--status-compromised)' : '#FFFFFF' }}>
              {totalModels === 0 ? '0/0' : `${verifiedModels}/${totalModels}`}
            </strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
              <Activity size={13} style={{ color: 'var(--accent-cyan)' }} />
              Inferences
            </span>
            <strong style={{ color: tamperState.inferenceTampered ? 'var(--status-warning)' : '#FFFFFF' }}>
              {totalInferences === 0 ? '0/0' : `${verifiedInferences}/${totalInferences}`}
            </strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
              <FileCheck size={13} style={{ color: 'var(--accent-cyan)' }} />
              Ledger Blocks
            </span>
            <strong style={{ color: tamperState.auditTampered ? 'var(--status-compromised)' : '#FFFFFF' }}>
              {totalBlocks === 0
                ? '0 Blocks'
                : tamperState.auditTampered
                ? `${verifiedBlocks}/${totalBlocks} (Broken)`
                : `${verifiedBlocks}/${totalBlocks} Valid`}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
