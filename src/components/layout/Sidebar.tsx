import React from 'react';
import {
  LayoutDashboard,
  Users,
  Database,
  BrainCircuit,
  ScanSearch,
  ShieldCheck,
  FileCheck,
  ShieldAlert,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  Radio,
  LogOut,
} from 'lucide-react';
import { useVisionTrust } from '../../context/VisionTrustContext';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';

interface NavItemConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string;
  isDangerous?: boolean;
}

const NAV_ITEMS: NavItemConfig[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'contributors', label: 'Contributors', icon: Users },
  { id: 'datasets', label: 'Datasets', icon: Database },
  { id: 'models', label: 'Model Registry', icon: BrainCircuit },
  { id: 'inference', label: 'Inference', icon: ScanSearch },
  { id: 'verification', label: 'Verification', icon: ShieldCheck },
  { id: 'audit', label: 'Audit Ledger', icon: FileCheck },
  { id: 'attack-simulator', label: 'Attack Simulator', icon: ShieldAlert, isDangerous: true },
  { id: 'reports', label: 'Integrity Reports', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isSidebarCollapsed,
    toggleSidebar,
    currentUserRole,
    setCurrentUserRole,
    tamperState,
    setActiveDatasetId,
    setActiveModelId,
    addToast,
  } = useVisionTrust();

  const { logout, updateUserRole } = useAuth();

  const isAnyTampered = Object.values(tamperState).some(Boolean);

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'datasets') setActiveDatasetId(null);
    if (tabId === 'models') setActiveModelId(null);
  };

  const handleLogout = () => {
    logout();
    addToast('info', 'Session Terminated', 'Signed out from VisionTrust terminal.');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/login');
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setCurrentUserRole(role);
    updateUserRole(role);
  };

  return (
    <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`} aria-label="Main Navigation">
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div
          className="brand-wrapper"
          onClick={() => handleNavClick('dashboard')}
          title="VisionTrust Platform"
        >
          <div className="brand-logo-icon">
            <Shield size={19} />
          </div>
          {!isSidebarCollapsed && (
            <div className="brand-text-container">
              <span className="brand-title">VISIONTRUST</span>
              <span className="brand-subtitle">TRUSTED AI INTEGRITY</span>
            </div>
          )}
        </div>

        <button
          type="button"
          className="sidebar-collapse-btn"
          onClick={toggleSidebar}
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label="Toggle navigation drawer"
        >
          {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation items */}
      <nav className="sidebar-nav">
        {!isSidebarCollapsed && (
          <div className="nav-section-label">Command & Ops</div>
        )}

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const showAttackAlert = item.id === 'attack-simulator' && isAnyTampered;

          return (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
              title={isSidebarCollapsed ? item.label : undefined}
            >
              <Icon className="nav-item-icon" size={18} />
              {!isSidebarCollapsed && (
                <>
                  <span>{item.label}</span>
                  {showAttackAlert && (
                    <span className="nav-item-badge">ACTIVE</span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer User Info & Role Switcher */}
      <div className="sidebar-footer">
        {!isSidebarCollapsed ? (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px',
              }}
            >
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                OPERATIONAL ROLE
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--status-verified)' }}>
                <Radio size={10} className="pulse-dot" /> Online
              </span>
            </div>

            <select
              className="form-select"
              value={currentUserRole}
              onChange={(e) => handleRoleChange(e.target.value as UserRole)}
              style={{
                fontSize: '12px',
                padding: '6px 8px',
                fontWeight: 700,
                color: '#38BDF8',
                backgroundColor: '#0B1726',
                borderColor: '#1E3A5F',
              }}
              title="Switch user role"
            >
              <option value="ADMIN">ADMINISTRATOR</option>
              <option value="DEFENCE AUDITOR">DEFENCE AUDITOR</option>
              <option value="ML SEC-OPS">ML SEC-OPS</option>
            </select>

            <button
              type="button"
              className="sidebar-logout-btn"
              onClick={handleLogout}
              title="Sign out of VisionTrust"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
            <div
              className="user-avatar-indicator"
              title={`Active Role: ${currentUserRole}`}
              style={{ margin: '0 auto' }}
            >
              {currentUserRole.charAt(0)}
            </div>
            <button
              type="button"
              className="sidebar-logout-btn-collapsed"
              onClick={handleLogout}
              title="Sign out of VisionTrust"
              aria-label="Sign Out"
            >
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
