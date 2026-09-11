import React from 'react';
import { VisionTrustProvider, useVisionTrust } from './context/VisionTrustContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { NotificationsDrawer } from './components/layout/NotificationsDrawer';
import { ToastContainer } from './components/common/Toast';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';

import { DashboardView } from './views/DashboardView';
import { ContributorsView } from './views/ContributorsView';
import { DatasetsView } from './views/DatasetsView';
import { ModelsView } from './views/ModelsView';
import { InferenceWorkspaceView } from './views/InferenceWorkspaceView';
import { VerificationCenterView } from './views/VerificationCenterView';
import { AuditLedgerView } from './views/AuditLedgerView';
import { AttackSimulatorView } from './views/AttackSimulatorView';
import { IntegrityReportsView } from './views/IntegrityReportsView';
import { SettingsView } from './views/SettingsView';

const MainAppContent: React.FC = () => {
  const { activeTab } = useVisionTrust();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'contributors':
        return <ContributorsView />;
      case 'datasets':
        return <DatasetsView />;
      case 'models':
        return <ModelsView />;
      case 'inference':
        return <InferenceWorkspaceView />;
      case 'verification':
        return <VerificationCenterView />;
      case 'audit':
        return <AuditLedgerView />;
      case 'attack-simulator':
        return <AttackSimulatorView />;
      case 'reports':
        return <IntegrityReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="app-container">
      {/* Persistent Left Sidebar */}
      <Sidebar />

      {/* Main Content Layout */}
      <div className="main-content-wrapper">
        <TopHeader />
        <main style={{ flex: 1 }}>{renderActiveView()}</main>
      </div>

      {/* Global Modals, Drawers & Toasts */}
      <GlobalSearchModal />
      <NotificationsDrawer />
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <VisionTrustProvider>
      <MainAppContent />
    </VisionTrustProvider>
  );
}

export default App;
