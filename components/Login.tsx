
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, AppTheme, UserRole } from '../types';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Local storage check to prevent re-login
  useEffect(() => {
    if (localStorage.getItem('hf_auth')) {
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      const savedUsers = localStorage.getItem('hf_users');
      const users: User[] = savedUsers ? JSON.parse(savedUsers) : [
        { id: '1', username: 'admin', password: 'password123', role: UserRole.ADMIN, createdAt: new Date().toISOString(), fullName: 'Master Admin' }
      ];

      const match = users.find(u => u.username.toLowerCase() === username.toLowerCase());
      if (match && (match.password === password || (!match.password && password === 'password123'))) {
        const authUser = { ...match, token: 'mock_jwt_token_' + Math.random().toString(36).substr(7) };
        localStorage.setItem('hf_auth', JSON.stringify(authUser));
        // Force reload or state sync via navigate
        window.location.href = '#/';
        window.location.reload();
      } else {
        setError('Unauthorized access. Please verify credentials.');
        setLoading(false);
      }
    }, 1200);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 relative overflow-hidden px-4">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-200 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 opacity-20"></div>
      <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[3rem] shadow-2xl w-full max-w-md border border-white relative z-10">
        <div className="text-center mb-10">
          <div className="inline-block bg-emerald-600 p-5 rounded-[2rem] mb-4 shadow-xl">
            <span className="text-4xl">🏨</span>
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">HotelFlow</h2>
          <p className="text-slate-500 font-bold text-sm tracking-wide">Enterprise Portfolio Management</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Account Username</label>
            <input required type="text" className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-bold text-sm" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Access Password</label>
            <input required type="password" className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-bold text-sm" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          
          {error && <p className="bg-rose-50 text-rose-500 p-4 rounded-2xl text-xs font-bold border border-rose-100 animate-bounce">{error}</p>}

          <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-[2rem] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2">
            {loading ? 'Validating...' : 'Sign In'}
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
