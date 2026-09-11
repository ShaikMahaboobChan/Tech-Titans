import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Activity } from 'lucide-react';
import { useVisionTrust } from '../../context/VisionTrustContext';

type TimeRange = '24H' | '7D' | '30D' | '90D';

interface TelemetryPoint {
  time: string;
  verified: number;
  warnings: number;
  compromised: number;
}

export const IntegrityChart: React.FC = () => {
  const [range, setRange] = useState<TimeRange>('7D');
  const { inferences, securityEvents, tamperState } = useVisionTrust();

  // Compute real telemetry from inferences & security events, if any
  const hasRealData = inferences.length > 0 || securityEvents.length > 0;

  // Build telemetry data points dynamically only if real data exists
  const chartData: TelemetryPoint[] = React.useMemo(() => {
    if (!hasRealData) {
      return [];
    }

    // Group actual inferences and events
    const verifiedCount = inferences.filter((i) => i.status === 'verified').length;
    const warningCount = inferences.filter((i) => i.status === 'warning').length;
    const compromisedCount =
      inferences.filter((i) => i.status === 'compromised').length +
      securityEvents.filter((e) => e.status === 'compromised').length +
      (tamperState.datasetTampered ? 1 : 0) +
      (tamperState.modelTampered ? 1 : 0) +
      (tamperState.inferenceTampered ? 1 : 0) +
      (tamperState.auditTampered ? 1 : 0);

    return [
      { time: 'Initial', verified: 0, warnings: 0, compromised: 0 },
      { time: 'Current', verified: verifiedCount, warnings: warningCount, compromised: compromisedCount },
    ];
  }, [hasRealData, inferences, securityEvents, tamperState]);

  return (
    <div className="defense-card">
      <div className="card-header">
        <div>
          <h3 className="card-title">Integrity Verification Telemetry</h3>
          <div className="card-subtitle">Cryptographic verification volume and anomaly detection trend</div>
        </div>

        {/* Time range filters */}
        <div style={{ display: 'flex', gap: '4px', backgroundColor: '#0B1726', padding: '3px', borderRadius: '4px', border: '1px solid #1E344F' }}>
          {(['24H', '7D', '30D', '90D'] as TimeRange[]).map((r) => (
            <button
              key={r}
              type="button"
              className={`btn btn-sm ${range === r ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '3px 10px', fontSize: '11.5px', fontWeight: 600 }}
              onClick={() => setRange(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div style={{ width: '100%', height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {!hasRealData || chartData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 16px' }}>
            <Activity size={36} style={{ color: 'var(--text-muted)', opacity: 0.35, marginBottom: '12px' }} />
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
              No telemetry data available
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto', lineHeight: 1.5 }}>
              Verification telemetry volume and anomaly trends will appear here as pipeline verifications and tactical inferences are performed.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorWarning" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCompromised" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#162B44" vertical={false} />
              <XAxis dataKey="time" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0D1B2A',
                  borderColor: '#1E3A5F',
                  borderRadius: '6px',
                  color: '#F1F5F9',
                  fontSize: '12px',
                }}
                labelStyle={{ fontWeight: 700, color: '#38BDF8' }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11.5px', paddingTop: '10px' }}
                iconType="circle"
              />
              <Area
                type="monotone"
                dataKey="verified"
                name="Verified"
                stroke="#10B981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorVerified)"
              />
              <Area
                type="monotone"
                dataKey="warnings"
                name="Warnings"
                stroke="#F59E0B"
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#colorWarning)"
              />
              <Area
                type="monotone"
                dataKey="compromised"
                name="Compromised"
                stroke="#EF4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCompromised)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
