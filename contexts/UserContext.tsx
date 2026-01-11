
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { User, AppTheme, UserPermissions, UserRole } from '../types';

interface UserContextType {
  user: User | null;
  users: User[];
  theme: AppTheme;
  perms: UserPermissions;
  login: (user: User) => void;
  logout: () => void;
  setTheme: (theme: AppTheme) => void;
  addUser: (user: User) => void;
  deleteUser: (id: string) => void;
  updateUser: (user: User) => void;
}

const FULL_PERMISSIONS: UserPermissions = {
  viewProjects: true, addProjects: true, editProjects: true, deleteProjects: true,
  viewTransactions: true, addTransactions: true, editTransactions: true, deleteTransactions: true,
  manageUsers: true
};

const DEFAULT_PERMS: UserPermissions = {
  viewProjects: true, addProjects: false, editProjects: false, deleteProjects: false,
  viewTransactions: true, addTransactions: false, editTransactions: false, deleteTransactions: false,
  manageUsers: false
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('hf_auth');
    if (!saved || saved === 'undefined') return null;
    try {
      const parsed = JSON.parse(saved);
      return (parsed && parsed.username) ? parsed : null;
    } catch { return null; }
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('hf_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    // Initial default admin
    return [{ 
      id: '1', 
      username: 'admin', 
      password: 'password123', 
      role: UserRole.ADMIN, 
      permissions: FULL_PERMISSIONS,
      createdAt: new Date().toISOString(), 
      fullName: 'Master Admin' 
    }];
  });

  const [theme, setThemeState] = useState<AppTheme>(() => 
    (localStorage.getItem('hf_theme') as AppTheme) || 'emerald'
  );

  const perms = useMemo(() => {
    if (!user || !user.permissions) return DEFAULT_PERMS;
    return user.permissions;
  }, [user]);

  useEffect(() => {
    localStorage.setItem('hf_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('hf_auth', JSON.stringify(user));
    } else {
      localStorage.removeItem('hf_auth');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('hf_users', JSON.stringify(users));
  }, [users]);

  const login = (u: User) => setUser(u);
  const logout = () => {
    setUser(null);
    localStorage.removeItem('hf_auth');
  };
  const setTheme = (t: AppTheme) => setThemeState(t);

  const addUser = (u: User) => setUsers(prev => [...prev, u]);
  const deleteUser = (id: string) => setUsers(prev => prev.filter(u => u.id !== id));
  const updateUser = (u: User) => {
    setUsers(prev => prev.map(old => old.id === u.id ? u : old));
    if (user && user.id === u.id) {
      setUser(u);
    }
  };

  return (
    <UserContext.Provider value={{ 
      user, users, theme, perms, login, logout, setTheme, addUser, deleteUser, updateUser 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useAuth must be used within UserProvider');
  return context;
};
