import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import ProjectList from './components/ProjectList';
import ProjectDetails from './components/ProjectDetails';
import Login from './components/Login';
import AllTransactions from './components/AllTransactions';
import UserManagement from './components/UserManagement';
import UserProfile from './components/UserProfile';
import { ICONS, INITIAL_PROJECTS, INITIAL_TRANSACTIONS } from './constants';
import { HotelProject, Transaction, User, UserRole, AppTheme, UserPermissions } from './types';

const FULL_PERMISSIONS: UserPermissions = {
  viewProjects: true, addProjects: true, editProjects: true, deleteProjects: true,
  viewTransactions: true, addTransactions: true, editTransactions: true, deleteTransactions: true,
  manageUsers: true
};

const getSafePermissions = (u: User | null): UserPermissions => {
  if (!u || !u.permissions) return {
    viewProjects: true, addProjects: false, editProjects: false, deleteProjects: false,
    viewTransactions: true, addTransactions: false, editTransactions: false, deleteTransactions: false,
    manageUsers: false
  };
  const p = u.permissions;
  return {
    viewProjects: !!p.viewProjects,
    addProjects: !!p.addProjects,
    editProjects: !!p.editProjects,
    deleteProjects: !!p.deleteProjects,
    viewTransactions: !!p.viewTransactions,
    addTransactions: !!p.addTransactions,
    editTransactions: !!p.editTransactions,
    deleteTransactions: !!p.deleteTransactions,
    manageUsers: !!p.manageUsers
  };
};

const Sidebar = ({ user, onLogout, theme, perms }: { user: User; onLogout: () => void; theme: AppTheme; perms: UserPermissions }) => {
  const location = useLocation();
  const themeColors = {
    emerald: 'bg-emerald-600 shadow-emerald-900/50',
    royal: 'bg-blue-600 shadow-blue-900/50',
    gold: 'bg-amber-600 shadow-amber-900/50',
    midnight: 'bg-rose-600 shadow-rose-900/50',
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: ICONS.Dashboard, show: true },
    { name: 'Projects', path: '/projects', icon: ICONS.Project, show: perms.viewProjects },
    { name: 'All Transactions', path: '/transactions', icon: ICONS.Transaction, show: perms.viewTransactions },
    { name: 'My Profile', path: '/profile', icon: () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ), show: true },
    { name: 'Users', path: '/users', icon: ICONS.Users, show: perms.manageUsers },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white h-screen flex flex-col fixed left-0 top-0 z-40 print:hidden">
      <div className="p-6">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span className={`${themeColors[theme]} p-1.5 rounded-lg shadow-lg`}>🏨</span>
          HotelFlow
        </h1>
      </div>
      <nav className="flex-1 mt-4 px-4 space-y-2 overflow-y-auto no-scrollbar">
        {navItems.filter(item => item.show).map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
              location.pathname === item.path ? themeColors[theme] : 'hover:bg-slate-800'
            }`}
          >
            <item.icon />
            <span className="font-medium text-sm">{item.name}</span>
          </Link>
        ))}
      </nav>
      <div className="p-6 border-t border-slate-800 space-y-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full ${themeColors[theme]} flex items-center justify-center text-xs font-bold uppercase`}>
            {user.username?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{user.fullName || user.username}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">{user.role}</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-rose-500/10 text-rose-400 text-sm font-medium transition-colors"
        >
          <ICONS.Logout />
          Logout
        </button>
      </div>
    </aside>
  );
};

const AppRoutes = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<AppTheme>(() => (localStorage.getItem('hf_theme') as AppTheme) || 'emerald');

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('hf_auth');
    if (!saved || saved === 'undefined') return null;
    try {
      const parsed = JSON.parse(saved);
      return (parsed && parsed.username && parsed.permissions) ? parsed : null;
    } catch {
      return null;
    }
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('hf_users');
    if (!saved || saved === 'undefined') return [{ id: '1', username: 'admin', password: 'password123', role: UserRole.ADMIN, permissions: FULL_PERMISSIONS, createdAt: new Date().toISOString(), fullName: 'Master Admin' }];
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  });

  const [projects, setProjects] = useState<HotelProject[]>(() => {
    const saved = localStorage.getItem('hf_projects');
    if (!saved || saved === 'undefined') return INITIAL_PROJECTS;
    try {
      return JSON.parse(saved);
    } catch {
      return INITIAL_PROJECTS;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('hf_transactions');
    if (!saved || saved === 'undefined') return INITIAL_TRANSACTIONS;
    try {
      return JSON.parse(saved);
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const perms = useMemo(() => getSafePermissions(user), [user]);

  useEffect(() => {
    localStorage.setItem('hf_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('hf_projects', JSON.stringify(projects));
    localStorage.setItem('hf_transactions', JSON.stringify(transactions));
    localStorage.setItem('hf_users', JSON.stringify(users));
    if (user) {
      localStorage.setItem('hf_auth', JSON.stringify(user));
    } else {
      localStorage.removeItem('hf_auth');
    }
  }, [projects, transactions, users, user]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('hf_auth');
    navigate('/login');
  };

  const backupToCSV = () => {
    const headers = ['ID', 'Project', 'Date', 'Type', 'Category', 'Amount', 'Description'];
    const rows = transactions.map(t => {
      const p = projects.find(proj => proj.id === t.projectId);
      return [t.id, p?.name || 'Unknown', t.date, t.type, t.category, t.amount, `"${(t.description || '').replace(/"/g, '""')}"`];
    });
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `hotelflow_backup_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 flex`}>
      {user && <Sidebar user={user} onLogout={handleLogout} theme={theme} perms={perms} />}
      
      <main className={`flex-1 transition-all duration-300 ${user ? 'ml-64' : ''} print:ml-0 p-8 min-h-screen`}>
        <Routes>
          <Route path="/login" element={!user ? <Login onLogin={setUser} /> : <Navigate to="/" replace />} />
          
          <Route path="/" element={user ? <Dashboard projects={projects} transactions={transactions} onBackup={backupToCSV} userPermissions={perms} theme={theme} /> : <Navigate to="/login" replace />} />
          
          <Route path="/projects" element={user && perms.viewProjects ? <ProjectList projects={projects} transactions={transactions} onAddProject={p => setProjects([p, ...projects])} onUpdateProject={p => setProjects(projects.map(old => old.id === p.id ? p : old))} onDeleteProject={id => { if(confirm('Delete project and all its records?')){ setProjects(projects.filter(p => p.id !== id)); setTransactions(transactions.filter(t => t.projectId !== id)); } }} userPermissions={perms} theme={theme} /> : <Navigate to="/login" replace />} />
          
          <Route path="/project/:id" element={user && perms.viewProjects ? <ProjectDetails projects={projects} transactions={transactions} onAddTransaction={t => setTransactions([t, ...transactions])} onUpdateTransaction={t => setTransactions(transactions.map(old => old.id === t.id ? t : old))} onDeleteTransaction={id => { if(confirm('Delete record?')) setTransactions(transactions.filter(t => t.id !== id)); }} userPermissions={perms} theme={theme} /> : <Navigate to="/login" replace />} />
          
          <Route path="/transactions" element={user && perms.viewTransactions ? <AllTransactions projects={projects} transactions={transactions} onBackup={backupToCSV} onUpdateTransaction={t => setTransactions(transactions.map(old => old.id === t.id ? t : old))} onDeleteTransaction={id => { if(confirm('Delete record permanently?')) setTransactions(transactions.filter(t => t.id !== id)); }} userPermissions={perms} theme={theme} /> : <Navigate to="/login" replace />} />
          
          <Route path="/users" element={user && perms.manageUsers ? <UserManagement users={users} onAddUser={u => setUsers([...users, u])} onDeleteUser={id => setUsers(users.filter(u => u.id !== id))} theme={theme} /> : <Navigate to="/login" replace />} />
          
          <Route path="/profile" element={user ? <UserProfile user={user} onUpdate={updated => { setUser(updated); setUsers(users.map(u => u.id === updated.id ? updated : u)); }} theme={theme} setTheme={setTheme} /> : <Navigate to="/login" replace />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <HashRouter>
    <AppRoutes />
  </HashRouter>
);

export default App;