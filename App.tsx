
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import ProjectList from './components/ProjectList';
import ProjectDetails from './components/ProjectDetails';
import Login from './components/Login';
import AllTransactions from './components/AllTransactions';
import UserManagement from './components/UserManagement';
import UserProfile from './components/UserProfile';
import { ICONS, INITIAL_PROJECTS, INITIAL_TRANSACTIONS } from './constants';
import { HotelProject, Transaction, User, UserRole, AppTheme } from './types';

const Sidebar = ({ user, onLogout, theme }: { user: User | null; onLogout: () => void; theme: AppTheme }) => {
  const location = useLocation();
  
  const themeColors = {
    emerald: 'bg-emerald-600 shadow-emerald-900/50',
    royal: 'bg-blue-600 shadow-blue-900/50',
    gold: 'bg-amber-600 shadow-amber-900/50',
    midnight: 'bg-rose-600 shadow-rose-900/50',
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: ICONS.Dashboard },
    { name: 'Projects', path: '/projects', icon: ICONS.Project },
    { name: 'All Transactions', path: '/transactions', icon: ICONS.Transaction },
    { name: 'My Profile', path: '/profile', icon: () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )},
  ];

  if (user?.role === UserRole.ADMIN) {
    navItems.push({ name: 'Users', path: '/users', icon: ICONS.Users });
  }

  if (!user) return null;

  return (
    <aside className="w-64 bg-slate-900 text-white h-screen flex flex-col fixed left-0 top-0 z-40 print:hidden">
      <div className="p-6">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span className={`${themeColors[theme]} p-1.5 rounded-lg shadow-lg`}>🏨</span>
          HotelFlow
        </h1>
      </div>
      <nav className="flex-1 mt-4 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
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
          <div className={`w-8 h-8 rounded-full ${theme === 'emerald' ? 'bg-emerald-500' : theme === 'royal' ? 'bg-blue-500' : theme === 'gold' ? 'bg-amber-500' : 'bg-rose-500'} flex items-center justify-center text-xs font-bold uppercase`}>
            {user.username.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold truncate w-32">{user.fullName || user.username}</p>
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
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('hf_users');
    return saved ? JSON.parse(saved) : [
      { id: '1', username: 'admin', password: 'password123', role: UserRole.ADMIN, createdAt: new Date().toISOString(), fullName: 'Master Admin' }
    ];
  });

  const [projects, setProjects] = useState<HotelProject[]>(() => {
    const saved = localStorage.getItem('hf_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('hf_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  useEffect(() => {
    localStorage.setItem('hf_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('hf_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('hf_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('hf_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('hf_auth', JSON.stringify(user));
    } else {
      localStorage.removeItem('hf_auth');
    }
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };

  const backupToCSV = () => {
    const headers = ['ID', 'Project', 'Date', 'Type', 'Category', 'Amount', 'Description'];
    const rows = transactions.map(t => {
      const p = projects.find(proj => proj.id === t.projectId);
      return [t.id, p?.name || 'Unknown', t.date, t.type, t.category, t.amount, `"${t.description.replace(/"/g, '""')}"`];
    });
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `hotelflow_backup_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (!user && window.location.hash !== '#/login') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className={`min-h-screen bg-[#f8fafc] text-slate-900 flex theme-${theme}`}>
      {user && <Sidebar user={user} onLogout={handleLogout} theme={theme} />}
      
      <main className={`flex-1 transition-all duration-300 ${user ? 'ml-64' : ''} print:ml-0 p-8 min-h-screen`}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={user ? <Dashboard projects={projects} transactions={transactions} onBackup={backupToCSV} theme={theme} /> : <Navigate to="/login" />} />
          <Route path="/projects" element={user ? <ProjectList projects={projects} transactions={transactions} onAddProject={p => setProjects([p, ...projects])} onUpdateProject={p => setProjects(projects.map(old => old.id === p.id ? p : old))} onDeleteProject={id => { if(confirm('Delete?')){ setProjects(projects.filter(p => p.id !== id)); setTransactions(transactions.filter(t => t.projectId !== id)); } }} userRole={user.role} theme={theme} /> : <Navigate to="/login" />} />
          <Route path="/project/:id" element={user ? <ProjectDetails projects={projects} transactions={transactions} onAddTransaction={t => setTransactions([t, ...transactions])} onUpdateTransaction={t => setTransactions(transactions.map(old => old.id === t.id ? t : old))} onDeleteTransaction={id => { if(confirm('Delete?')) setTransactions(transactions.filter(t => t.id !== id)); }} userRole={user.role} theme={theme} /> : <Navigate to="/login" />} />
          <Route path="/transactions" element={user ? <AllTransactions projects={projects} transactions={transactions} onBackup={backupToCSV} theme={theme} /> : <Navigate to="/login" />} />
          <Route path="/users" element={user?.role === UserRole.ADMIN ? <UserManagement users={users} onAddUser={u => setUsers([...users, u])} onDeleteUser={id => setUsers(users.filter(u => u.id !== id))} theme={theme} /> : <Navigate to="/" />} />
          <Route path="/profile" element={user ? <UserProfile user={user} onUpdate={updated => { setUser(updated); setUsers(users.map(u => u.id === updated.id ? updated : u)); }} theme={theme} setTheme={setTheme} /> : <Navigate to="/login" />} />
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
