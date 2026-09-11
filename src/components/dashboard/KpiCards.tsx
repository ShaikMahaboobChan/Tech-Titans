import React from 'react';
import { Database, BrainCircuit, Activity, ShieldAlert, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { useVisionTrust } from '../../context/VisionTrustContext';

export const KpiCards: React.FC = () => {
  const { datasets, models, inferences, tamperState, setActiveTab } = useVisionTrust();

  const isAnyTampered = Object.values(tamperState).some(Boolean);
  const violationCount = Object.values(tamperState).filter(Boolean).length;

  const verifiedDatasetsCount = datasets.filter((d) => d.status === 'verified').length;
  const verifiedModelsCount = models.filter((m) => m.status === 'verified').length;
  const verifiedInferencesCount = inferences.filter((i) => i.status === 'verified').length;

  const inferenceRateText =
    inferences.length > 0
      ? `${((verifiedInferencesCount / inferences.length) * 100).toFixed(1)}% integrity rate`
      : '—';

  return (
    <div className="grid-4" style={{ marginBottom: '24px' }}>
      {/* 1. Datasets Verified */}
      <div
        className="defense-card"
        style={{ cursor: 'pointer' }}
        onClick={() => setActiveTab('datasets')}
      >
        <div className="card-header" style={{ marginBottom: '10px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            DATASETS VERIFIED
          </span>
          <div
            style={{
              padding: '6px',
              borderRadius: '4px',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              color: 'var(--accent-cyan)',
            }}
          >
            <Database size={17} />
          </div>
        </div>

        <div style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1 }}>
          {verifiedDatasetsCount}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {datasets.length > 0 ? `${datasets.length} registered` : 'No datasets registered'}
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 700,
              color:
                datasets.length === 0
                  ? 'var(--text-muted)'
                  : tamperState.datasetTampered
                  ? 'var(--status-compromised)'
                  : 'var(--status-verified)',
            }}
          >
            {datasets.length === 0 ? (
              <>
                <Clock size={12} />
                <span>● STANDBY</span>
              </>
            ) : tamperState.datasetTampered ? (
              <>
                <AlertTriangle size={12} />
                <span>✕ TAMPERED</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={12} />
                <span>✓ VERIFIED</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* 2. Models Verified */}
      <div
        className="defense-card"
        style={{ cursor: 'pointer' }}
        onClick={() => setActiveTab('models')}
      >
        <div className="card-header" style={{ marginBottom: '10px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            MODELS VERIFIED
          </span>
          <div
            style={{
              padding: '6px',
              borderRadius: '4px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: 'var(--status-verified)',
            }}
          >
            <BrainCircuit size={17} />
          </div>
        </div>

        <div style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1 }}>
          {verifiedModelsCount}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {models.length > 0 ? `${models.length} tracked` : 'No models registered'}
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 700,
              color:
                models.length === 0
                  ? 'var(--text-muted)'
                  : tamperState.modelTampered
                  ? 'var(--status-compromised)'
                  : 'var(--status-verified)',
            }}
          >
            {models.length === 0 ? (
              <>
                <Clock size={12} />
                <span>● STANDBY</span>
              </>
            ) : tamperState.modelTampered ? (
              <>
                <AlertTriangle size={12} />
                <span>✕ TAMPERED</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={12} />
                <span>✓ VERIFIED</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* 3. Inferences Verified */}
      <div
        className="defense-card"
        style={{ cursor: 'pointer' }}
        onClick={() => setActiveTab('inference')}
      >
        <div className="card-header" style={{ marginBottom: '10px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            INFERENCES VERIFIED
          </span>
          <div
            style={{
              padding: '6px',
              borderRadius: '4px',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              color: 'var(--status-info)',
            }}
          >
            <Activity size={17} />
          </div>
        </div>

        <div style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1 }}>
          {verifiedInferencesCount}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {inferenceRateText}
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 700,
              color:
                inferences.length === 0
                  ? 'var(--text-muted)'
                  : tamperState.inferenceTampered
                  ? 'var(--status-warning)'
                  : 'var(--status-verified)',
            }}
          >
            {inferences.length === 0 ? (
              <>
                <Clock size={12} />
                <span>● STANDBY</span>
              </>
            ) : tamperState.inferenceTampered ? (
              <>
                <AlertTriangle size={12} />
                <span>⚠ WARNING</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={12} />
                <span>✓ ACTIVE</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* 4. Integrity Violations */}
      <div
        className={`defense-card ${isAnyTampered ? 'alert-border' : ''}`}
        style={{ cursor: 'pointer' }}
        onClick={() => setActiveTab('attack-simulator')}
      >
        <div className="card-header" style={{ marginBottom: '10px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            INTEGRITY VIOLATIONS
          </span>
          <div
            style={{
              padding: '6px',
              borderRadius: '4px',
              backgroundColor: isAnyTampered ? 'rgba(239, 68, 68, 0.15)' : 'rgba(100, 116, 139, 0.1)',
              color: isAnyTampered ? 'var(--status-compromised)' : 'var(--text-muted)',
            }}
          >
            <ShieldAlert size={17} />
          </div>
        </div>

        <div
          style={{
            fontSize: '28px',
            fontWeight: 800,
            color: isAnyTampered ? 'var(--status-compromised)' : '#FFFFFF',
            lineHeight: 1.1,
          }}
        >
          {violationCount}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
          <span style={{ fontSize: '12px', color: isAnyTampered ? '#FCA5A5' : 'var(--text-secondary)' }}>
            {isAnyTampered ? 'Requires attention' : 'Zero violations'}
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 700,
              color: isAnyTampered ? 'var(--status-compromised)' : 'var(--status-verified)',
            }}
          >
            {isAnyTampered ? (
              <>
                <ShieldAlert size={12} />
                <span>✕ CRITICAL</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={12} />
                <span>✓ SECURE</span>
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
