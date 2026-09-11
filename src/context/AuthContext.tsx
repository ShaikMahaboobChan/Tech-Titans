import React, { createContext, useContext, useState, useCallback } from 'react';
import type { AuthUser, LoginCredentials, UserRole } from '../types';

export const DEMO_USERS: Record<string, { user: AuthUser; pass: string }> = {
  admin: {
    user: {
      id: 'usr-admin-01',
      name: 'Col. Arthur Sterling',
      username: 'admin',
      email: 'admin@visiontrust.mil',
      role: 'ADMIN',
      organization: 'MoD Cyber AI Command',
      clearanceLevel: 'LEVEL 5 - TOP SECRET / SCI',
      lastLogin: 'Today, 08:30 UTC',
    },
    pass: 'Admin@2026!',
  },
  auditor: {
    user: {
      id: 'usr-auditor-02',
      name: 'Dr. Elena Rostova',
      username: 'auditor',
      email: 'auditor@visiontrust.mil',
      role: 'DEFENCE AUDITOR',
      organization: 'Defence Intelligence Verification Agency',
      clearanceLevel: 'LEVEL 4 - RESTRICTED AUDIT',
      lastLogin: 'Yesterday, 17:42 UTC',
    },
    pass: 'Auditor@2026!',
  },
  secops: {
    user: {
      id: 'usr-secops-03',
      name: 'Maj. Marcus Vance',
      username: 'secops',
      email: 'secops@visiontrust.mil',
      role: 'ML SEC-OPS',
      organization: 'Joint Cyber Tactical Task Force',
      clearanceLevel: 'LEVEL 4 - OPERATIONAL SEC-OPS',
      lastLogin: 'Today, 06:15 UTC',
    },
    pass: 'SecOps@2026!',
  },
};

const STORAGE_KEY = 'vt_auth_session';
const REMEMBER_KEY = 'vt_remember_me';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  rememberMePreference: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  forgotPassword: (emailOrId: string) => Promise<{ success: boolean; message: string }>;
  updateUserRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const sessionData = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
      if (sessionData) {
        const parsed = JSON.parse(sessionData) as AuthUser;
        if (parsed && parsed.id && parsed.email) {
          return parsed;
        }
      }
    } catch {
      // Ignore corrupted session
    }
    return null;
  });
  const [isLoading] = useState<boolean>(false);
  const [rememberMePreference, setRememberMePreference] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      const stored = localStorage.getItem(REMEMBER_KEY);
      return stored !== null ? JSON.parse(stored) : true;
    } catch {
      return true;
    }
  });

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
      const id = credentials.identifier.trim().toLowerCase();
      const pass = credentials.password;
      const remember = credentials.rememberMe ?? true;

      // Basic client validation
      if (!id) {
        return { success: false, error: 'Identity clearance or email address is required.' };
      }
      if (!pass) {
        return { success: false, error: 'Access password is required.' };
      }
      if (pass.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters in length.' };
      }

      // Simulate network authentication handshake (350ms)
      await new Promise((resolve) => setTimeout(resolve, 350));

      let authenticatedUser: AuthUser | null = null;

      // Check predefined accounts
      const matchedDemo = Object.values(DEMO_USERS).find(
        (entry) =>
          entry.user.email.toLowerCase() === id ||
          entry.user.username.toLowerCase() === id
      );

      if (matchedDemo) {
        if (matchedDemo.pass === pass) {
          authenticatedUser = {
            ...matchedDemo.user,
            lastLogin: 'Just now (' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC)',
          };
        } else {
          return {
            success: false,
            error: 'Authentication failed: Invalid credentials for defense identity clearance.',
          };
        }
      } else {
        // Dynamic authorization for custom email/username
        const isEmail = id.includes('@');
        const displayName = isEmail
          ? id.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
          : id.toUpperCase();

        authenticatedUser = {
          id: `usr-${Date.now().toString().slice(-6)}`,
          name: `Officer ${displayName}`,
          username: isEmail ? id.split('@')[0] : id,
          email: isEmail ? id : `${id}@visiontrust.mil`,
          role: 'ADMIN',
          organization: 'MoD AI Integrity Task Force',
          clearanceLevel: 'LEVEL 4 - OPERATIONAL ACCESS',
          lastLogin: 'Just now',
        };
      }

      if (!authenticatedUser) {
        return { success: false, error: 'Authorization rejected: Access denied.' };
      }

      // Persist session
      try {
        if (remember) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(authenticatedUser));
          localStorage.setItem(REMEMBER_KEY, JSON.stringify(true));
          sessionStorage.removeItem(STORAGE_KEY);
        } else {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(authenticatedUser));
          localStorage.removeItem(STORAGE_KEY);
          localStorage.setItem(REMEMBER_KEY, JSON.stringify(false));
        }
        setRememberMePreference(remember);
      } catch {
        // Ignore quota
      }

      setUser(authenticatedUser);
      return { success: true };
    },
    []
  );

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore errors
    }
    setUser(null);
  }, []);

  const forgotPassword = useCallback(
    async (emailOrId: string): Promise<{ success: boolean; message: string }> => {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const target = emailOrId.trim();
      if (!target) {
        return { success: false, message: 'Please provide a valid defense email or operator identity.' };
      }
      return {
        success: true,
        message: `Cryptographic recovery dispatch issued for ${target}. Please inspect your secure MoD defense terminal inbox.`,
      };
    },
    []
  );

  const updateUserRole = useCallback((role: UserRole) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, role };
      try {
        if (localStorage.getItem(STORAGE_KEY)) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }
        if (sessionStorage.getItem(STORAGE_KEY)) {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }
      } catch {
        // Ignore
      }
      return updated;
    });
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    rememberMePreference,
    login,
    logout,
    forgotPassword,
    updateUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
