import React, { useEffect, useCallback } from 'react';
import { VisionTrustProvider, useVisionTrust } from './context/VisionTrustContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { NotificationsDrawer } from './components/layout/NotificationsDrawer';
import { ToastContainer } from './components/common/Toast';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';

import { LoginView } from './views/LoginView';
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
import { Shield, Loader2 } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { activeTab, setActiveTab, setCurrentUserRole } = useVisionTrust();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Synchronize authenticated user role to context
  useEffect(() => {
    if (user?.role) {
      setCurrentUserRole(user.role);
    }
  }, [user, setCurrentUserRole]);

  // Ensure browser address bar reflects authentication state
  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.history.replaceState(null, '', '/login');
      }
    } else {
      if (typeof window !== 'undefined' && window.location.pathname === '/login') {
        window.history.replaceState(null, '', '/');
      }
    }
  }, [isAuthenticated, isLoading]);

  const handleLoginSuccess = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/');
    }
    setActiveTab('dashboard');
  }, [setActiveTab]);

  // Loading Splash Screen while checking stored sessions
  if (isLoading) {
    return (
      <div className="login-page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="login-brand-icon">
          <Shield size={32} />
          <div className="brand-pulse-ring" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#38BDF8', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em' }}>
          <Loader2 size={16} className="spin-animation" />
          <span>VERIFYING ZERO-TRUST CREDENTIAL SUBSYSTEM...</span>
        </div>
      </div>
    );
  }

  // Unauthenticated Route Guard: Only render /login
  if (!isAuthenticated) {
    return (
      <>
        <LoginView onLoginSuccess={handleLoginSuccess} />
        <ToastContainer />
      </>
    );
  }

  // Authenticated: Render protected application shell and active view
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
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </VisionTrustProvider>
  );
}

export default App;
