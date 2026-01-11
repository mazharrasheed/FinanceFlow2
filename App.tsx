
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import ProjectList from './components/ProjectList';
import ProjectDetails from './components/ProjectDetails';
import Login from './components/Login';
import AllTransactions from './components/AllTransactions';
import UserManagement from './components/UserManagement';
import UserProfile from './components/UserProfile';
import { ICONS } from './constants';
import { UserProvider, useAuth } from './contexts/UserContext';
import { DataProvider, useData } from './contexts/DataContext';

const Sidebar = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { user, logout, theme, perms } = useAuth();
  const location = useLocation();
  if (!user) return null;

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
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}
      
      <aside className={`w-64 bg-slate-900 text-white h-screen flex flex-col fixed left-0 top-0 z-50 print:hidden transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className={`${themeColors[theme]} p-1.5 rounded-lg shadow-lg`}>🏨</span>
            HotelFlow
          </h1>
          <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <nav className="flex-1 mt-4 px-4 space-y-2 overflow-y-auto no-scrollbar">
          {navItems.filter(item => item.show).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => { if (window.innerWidth < 1024) onClose(); }}
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
            onClick={logout}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-rose-500/10 text-rose-400 text-sm font-medium transition-colors"
          >
            <ICONS.Logout />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

const AppRoutes = () => {
  const { user, perms, login, users, addUser, deleteUser, theme, setTheme, updateUser } = useAuth();
  const { 
    projects, transactions, addProject, updateProject, deleteProject, 
    addTransaction, updateTransaction, deleteTransaction, backupToCSV 
  } = useData();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on navigation if on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const themeColors = {
    emerald: 'bg-emerald-600',
    royal: 'bg-blue-600',
    gold: 'bg-amber-600',
    midnight: 'bg-rose-600',
  };

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row`}>
      {user && (
        <header className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
             <span className={`${themeColors[theme]} p-1.5 rounded-lg text-white shadow-sm text-sm`}>🏨</span>
             <span className="font-black text-slate-800 tracking-tight">HotelFlow</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-600 bg-slate-50 rounded-lg border border-slate-100"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
        </header>
      )}

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className={`flex-1 transition-all duration-300 ${user ? 'lg:ml-64' : ''} print:ml-0 p-4 md:p-8 min-h-screen`}>
        <Routes>
          <Route path="/login" element={!user ? <Login onLogin={login} /> : <Navigate to="/" replace />} />
          <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" replace />} />
          <Route path="/projects" element={user && perms.viewProjects ? (
            <ProjectList 
              projects={projects} 
              transactions={transactions} 
              onAddProject={addProject} 
              onUpdateProject={updateProject} 
              onDeleteProject={deleteProject} 
              userPermissions={perms} 
              theme={theme} 
            />
          ) : <Navigate to="/login" replace />} />
          <Route path="/project/:id" element={user && perms.viewProjects ? (
            <ProjectDetails 
              projects={projects} 
              transactions={transactions} 
              onAddTransaction={addTransaction} 
              onUpdateTransaction={updateTransaction} 
              onDeleteTransaction={deleteTransaction} 
              userPermissions={perms} 
              theme={theme} 
            />
          ) : <Navigate to="/login" replace />} />
          <Route path="/transactions" element={user && perms.viewTransactions ? (
            <AllTransactions 
              projects={projects} 
              transactions={transactions} 
              onBackup={backupToCSV} 
              onUpdateTransaction={updateTransaction} 
              onDeleteTransaction={deleteTransaction} 
              userPermissions={perms} 
              theme={theme} 
            />
          ) : <Navigate to="/login" replace />} />
          <Route path="/users" element={user && perms.manageUsers ? (
            <UserManagement 
              users={users} 
              onAddUser={addUser} 
              onDeleteUser={deleteUser} 
              theme={theme} 
            />
          ) : <Navigate to="/login" replace />} />
          <Route path="/profile" element={user ? (
            <UserProfile 
              user={user} 
              onUpdate={updateUser} 
              theme={theme} 
              setTheme={setTheme} 
            />
          ) : <Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <UserProvider>
    <DataProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </DataProvider>
  </UserProvider>
);

export default App;
