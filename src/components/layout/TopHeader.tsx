import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, ShieldCheck, ShieldAlert, ChevronRight, User, LogOut, Settings } from 'lucide-react';
import { useVisionTrust } from '../../context/VisionTrustContext';
import { useAuth } from '../../context/AuthContext';
import { ConfirmModal } from '../common/ConfirmModal';

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
    addToast,
  } = useVisionTrust();

  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const isAnyTampered = Object.values(tamperState).some(Boolean);
  const currentTitle = TAB_TITLES[activeTab] || 'Dashboard';

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleConfirmLogout = () => {
    setIsProfileOpen(false);
    setIsLogoutModalOpen(false);
    logout();
    addToast('info', 'Session Terminated', 'Officer signed out. Cryptographic zero-trust keys cleared.');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/login');
    }
  };

  return (
    <>
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

        {/* Right: Search, Dynamic Status, Notifications, Role & Profile */}
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

          {/* User Profile Badge & Dropdown */}
          <div className="user-profile-wrapper" ref={profileMenuRef}>
            <div
              className={`user-profile-badge ${isProfileOpen ? 'active' : ''}`}
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              title="Click to view officer clearance & session options"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setIsProfileOpen(!isProfileOpen);
                }
              }}
            >
              <div className="user-avatar-indicator">
                {user ? user.name.charAt(0) : <User size={14} />}
              </div>
              <div className="user-meta-info">
                <span className="user-meta-name">
                  {user ? (user.name.length > 16 ? user.name.slice(0, 15) + '...' : user.name) : currentUserRole}
                </span>
                <span className="user-meta-status">
                  {currentUserRole}
                </span>
              </div>
            </div>

            {/* User Dropdown Menu */}
            {isProfileOpen && (
              <div className="user-dropdown-menu" role="menu">
                <div className="dropdown-header">
                  <div className="dropdown-user-name">{user?.name || 'Defense Officer'}</div>
                  <div className="dropdown-user-email">{user?.email || 'officer@visiontrust.mil'}</div>
                  <div className="dropdown-clearance-pill">
                    {user?.clearanceLevel || 'LEVEL 4 - OPERATIONAL ACCESS'}
                  </div>
                </div>

                <div className="dropdown-section">
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      setActiveTab('settings');
                      setIsProfileOpen(false);
                    }}
                  >
                    <Settings size={14} style={{ color: 'var(--accent-cyan)' }} />
                    <span>Security & System Settings</span>
                  </button>

                  <div className="dropdown-divider" />

                  <button
                    type="button"
                    className="dropdown-item logout"
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsLogoutModalOpen(true);
                    }}
                  >
                    <LogOut size={14} />
                    <span>Sign Out of Terminal</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        title="Confirm Terminal Sign Out"
        message="Are you sure you want to terminate your current zero-trust session? Your encrypted session keys will be cleared and you will be redirected to the secure login gateway."
        confirmLabel="Sign Out"
        cancelLabel="Stay Logged In"
        isDangerous={false}
        onConfirm={handleConfirmLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
      />
    </>
  );
};
