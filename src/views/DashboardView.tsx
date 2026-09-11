import React from 'react';
import { HeroStatusPanel } from '../components/dashboard/HeroStatusPanel';
import { KpiCards } from '../components/dashboard/KpiCards';
import { PipelineVisualizer } from '../components/dashboard/PipelineVisualizer';
import { IntegrityChart } from '../components/dashboard/IntegrityChart';
import { EventTimeline } from '../components/dashboard/EventTimeline';
import { SystemHealthMeter } from '../components/dashboard/SystemHealthMeter';

export const DashboardView: React.FC = () => {
  return (
    <div className="page-container">
      {/* 1. Hero / Command Center Status */}
      <HeroStatusPanel />

      {/* 2. Primary 4 KPI Cards */}
      <KpiCards />

      {/* 3. Interactive AI Pipeline Visualization */}
      <PipelineVisualizer />

      {/* 4. Telemetry Grid: Chart & System Health vs Event Timeline */}
      <div className="grid-2">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <IntegrityChart />
          <SystemHealthMeter />
        </div>
        <div>
          <EventTimeline />
        </div>
      </div>
    </div>
  );
};
