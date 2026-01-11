
import React, { useState } from 'react';
import { User, AppTheme } from '../types';

interface Props {
  user: User;
  onUpdate: (user: User) => void;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
}

const UserProfile: React.FC<Props> = ({ user, onUpdate, theme, setTheme }) => {
  const [fullName, setFullName] = useState(user.fullName || '');
  const [email, setEmail] = useState(user.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });

  const themeOptions: { id: AppTheme; label: string; color: string }[] = [
    { id: 'emerald', label: 'Emerald Green', color: 'bg-emerald-500' },
    { id: 'royal', label: 'Royal Blue', color: 'bg-blue-600' },
    { id: 'gold', label: 'Slate Gold', color: 'bg-amber-500' },
    { id: 'midnight', label: 'Midnight Rose', color: 'bg-rose-600' },
  ];

  const handleUpdateInfo = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ ...user, fullName, email });
    setMsg({ type: 'success', text: 'Profile updated successfully!' });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    onUpdate({ ...user, password: newPassword });
    setMsg({ type: 'success', text: 'Password changed successfully!' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const activeColor = theme === 'emerald' ? 'text-emerald-600 border-emerald-600' :
                    theme === 'royal' ? 'text-blue-600 border-blue-600' :
                    theme === 'gold' ? 'text-amber-600 border-amber-600' : 'text-rose-600 border-rose-600';

  const btnColor = theme === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700' :
                   theme === 'royal' ? 'bg-blue-600 hover:bg-blue-700' :
                   theme === 'gold' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-rose-600 hover:bg-rose-700';

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Account Settings</h2>
        <p className="text-slate-500">Manage your profile, platform theme, and security.</p>
      </header>

      {msg.text && (
        <div className={`p-4 rounded-2xl flex items-center justify-between ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
          <span className="text-sm font-bold">{msg.text}</span>
          <button onClick={() => setMsg({ type: '', text: '' })} className="text-lg">&times;</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 text-center relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-24 ${btnColor} opacity-10`}></div>
            <div className={`w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-xl flex items-center justify-center text-2xl font-black text-white ${btnColor}`}>
              {user.username.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-xl font-bold text-slate-800">{user.username}</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{user.role}</p>
          </div>

          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Display Theme</h3>
            <div className="space-y-3">
              {themeOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setTheme(opt.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                    theme === opt.id ? `bg-slate-50 ${activeColor} border-current` : 'border-slate-100 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full ${opt.color}`}></div>
                  <span className="text-sm font-bold">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-8">
          <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">Personal Information</h3>
            <form onSubmit={handleUpdateInfo} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none text-sm" />
                </div>
              </div>
              <button type="submit" className={`mt-2 px-8 py-3 rounded-2xl text-white font-bold text-sm ${btnColor}`}>Save Changes</button>
            </form>
          </section>

          <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">Security</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Current Password</label>
                <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none text-sm" placeholder="••••••••" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">New Password</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none text-sm" placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Confirm New Password</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none text-sm" placeholder="••••••••" />
                </div>
              </div>
              <button type="submit" className={`mt-2 px-8 py-3 rounded-2xl text-white font-bold text-sm ${btnColor}`}>Update Password</button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
