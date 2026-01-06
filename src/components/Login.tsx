import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole, UserPermissions } from '../types';

const FULL_PERMISSIONS: UserPermissions = {
  viewProjects: true, addProjects: true, editProjects: true, deleteProjects: true,
  viewTransactions: true, addTransactions: true, editTransactions: true, deleteTransactions: true,
  manageUsers: true
};

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check for existing session but don't redirect here to avoid race conditions with App.tsx
  useEffect(() => {
    const saved = localStorage.getItem('hf_auth');
    if (saved && saved !== 'undefined') {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.username) {
          // If we find valid data, inform parent and let parent handle routing
          onLogin(parsed);
          navigate('/', { replace: true });
        }
      } catch (e) {
        localStorage.removeItem('hf_auth');
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate authenticating against local DB or mock server
    setTimeout(() => {
      const savedUsers = localStorage.getItem('hf_users');
      let users: User[] = savedUsers ? JSON.parse(savedUsers) : [
        { 
          id: '1', 
          username: 'admin', 
          password: 'password123', 
          role: UserRole.ADMIN, 
          permissions: FULL_PERMISSIONS,
          createdAt: new Date().toISOString(), 
          fullName: 'Master Admin' 
        }
      ];

      const match = users.find(u => u.username.toLowerCase() === username.toLowerCase());
      
      // Allow 'password123' as default if no password set
      if (match && (match.password === password || (!match.password && password === 'password123'))) {
        const authUser = { 
          ...match, 
          token: 'mock_jwt_token_' + Math.random().toString(36).substr(7) 
        };
        
        // Critical: Update parent state FIRST, then navigate
        onLogin(authUser);
        navigate('/', { replace: true });
      } else {
        setError('Unauthorized access. Please verify credentials.');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 relative overflow-hidden px-4">
      {/* Background patterns */}
      <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden flex flex-wrap items-center justify-center gap-x-32 gap-y-24 p-10 opacity-[0.03]">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="text-8xl font-black rotate-[-25deg] tracking-tighter whitespace-nowrap">
            HOTELFLOW
          </div>
        ))}
      </div>

      <div className="bg-white/80 backdrop-blur-2xl p-10 rounded-[3rem] shadow-2xl w-full max-w-md border border-white relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="inline-block bg-emerald-600 p-5 rounded-[2rem] mb-4 shadow-xl">
            <span className="text-4xl">🏨</span>
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">HotelFlow</h2>
          <p className="text-slate-500 font-bold text-sm tracking-wide">Enterprise Portfolio Management</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Account Username</label>
            <input 
              required 
              type="text" 
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-bold text-sm bg-white/50" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              placeholder="admin" 
            />
          </div>
          <div className="relative">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Access Password</label>
            <input 
              required 
              type="password" 
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-bold text-sm bg-white/50" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••" 
            />
          </div>
          
          {error && (
            <div className="bg-rose-50 text-rose-500 p-4 rounded-2xl text-xs font-bold border border-rose-100 animate-bounce">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-[2rem] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="mt-10 p-5 bg-slate-50 rounded-3xl border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Default Credentials</p>
          <div className="flex justify-between items-center text-xs font-bold text-slate-600">
            <span>User: <span className="text-slate-900">admin</span></span>
            <span>Pass: <span className="text-slate-900">password123</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;