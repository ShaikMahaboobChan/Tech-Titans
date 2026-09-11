import React from 'react';
import { Search, Bell, ShieldCheck, ShieldAlert, ChevronRight, User } from 'lucide-react';
import { useVisionTrust } from '../../context/VisionTrustContext';

const TAB_TITLES: Record<string, string> = {
  dashboard: 'Command Center & Dashboard',
  contributors: 'Authorized Contributors & PKI',
  datasets: 'Dataset Registry & Provenance',
  models: 'Enterprise Model Registry',
  inference: 'Tactical Inference Workspace',
  verification: 'Pipeline Integrity Verification',
  audit: 'Tamper-Evident Audit Ledger',
  'attack-simulator': 'Integrity Attack Simulator',
  reports: 'Official MoD Integrity Reports',
  settings: 'Security & System Settings',
};

export const TopHeader: React.FC = () => {
  const {
    activeTab,
    setIsSearchOpen,
    isNotificationsOpen,
    setIsNotificationsOpen,
    tamperState,
    currentUserRole,
    setActiveTab,
    securityEvents,
  } = useVisionTrust();

  const isAnyTampered = Object.values(tamperState).some(Boolean);
  const currentTitle = TAB_TITLES[activeTab] || 'Dashboard';

  return (
    <header className="top-header" role="banner">
      {/* Left: Breadcrumbs & View Title */}
      <div className="header-left">
        <nav className="breadcrumb-trail" aria-label="Breadcrumb">
          <span
            style={{ cursor: 'pointer' }}
            onClick={() => setActiveTab('dashboard')}
          >
            VisionTrust
          </span>
          <ChevronRight size={12} />
          <span className="breadcrumb-active">{currentTitle.split(' ')[0]}</span>
        </nav>
        <h1 className="header-page-title">{currentTitle}</h1>
      </div>

      {/* Right: Search, Dynamic Status, Notifications, Role */}
      <div className="header-right">
        {/* Global Search shortcut */}
        <button
          type="button"
          className="global-search-btn"
          onClick={() => setIsSearchOpen(true)}
          aria-label="Search platform artifacts"
        >
          <Search size={15} />
          <span>Quick Search...</span>
          <kbd className="search-kbd-shortcut">Ctrl+K</kbd>
        </button>

        {/* Dynamic System Status Indicator */}
        <div
          className={`system-status-indicator ${isAnyTampered ? 'compromised' : 'trusted'}`}
          title={
            isAnyTampered
              ? 'Active tampering detected in pipeline artifacts'
              : 'All registered cryptographic fingerprints are verified'
          }
        >
          {isAnyTampered ? (
            <>
              <ShieldAlert size={15} />
              <span>⚠ INTEGRITY COMPROMISED</span>
            </>
          ) : (
            <>
              <ShieldCheck size={15} />
              <span>● SYSTEM SECURE</span>
            </>
          )}
        </div>

        {/* Notifications Toggle */}
        <button
          type="button"
          className="header-icon-btn"
          onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          title="Security Event Notifications"
          aria-label="View security notifications"
        >
          <Bell size={17} />
          {securityEvents.length > 0 && <span className="header-badge-dot" />}
        </button>

        {/* User Role Badge */}
        <div
          className="user-profile-badge"
          title={`Logged in as ${currentUserRole}`}
        >
          <div className="user-avatar-indicator">
            <User size={14} />
          </div>
          <div className="user-meta-info">
            <span className="user-meta-name">{currentUserRole}</span>
            <span className="user-meta-status">
              {isAnyTampered ? 'Alert Active' : 'Zero-Trust OK'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
