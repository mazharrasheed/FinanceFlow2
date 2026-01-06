
import React, { useState } from 'react';
import { User, UserRole, AppTheme, UserPermissions } from '../types';
import { ICONS } from '../constants';

interface Props {
  users: User[];
  onAddUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
  theme: AppTheme;
}

const PRESETS: Record<string, UserPermissions> = {
  'Administrator': {
    viewProjects: true, addProjects: true, editProjects: true, deleteProjects: true,
    viewTransactions: true, addTransactions: true, editTransactions: true, deleteTransactions: true,
    manageUsers: true
  },
  'Manager': {
    viewProjects: true, addProjects: true, editProjects: true, deleteProjects: false,
    viewTransactions: true, addTransactions: true, editTransactions: true, deleteTransactions: false,
    manageUsers: false
  },
  'Staff': {
    viewProjects: true, addProjects: false, editProjects: false, deleteProjects: false,
    viewTransactions: true, addTransactions: true, editTransactions: false, deleteTransactions: false,
    manageUsers: false
  },
  'Auditor': {
    viewProjects: true, addProjects: false, editProjects: false, deleteProjects: false,
    viewTransactions: true, addTransactions: false, editTransactions: false, deleteTransactions: false,
    manageUsers: false
  }
};

const UserManagement: React.FC<Props> = ({ users, onDeleteUser, onAddUser, theme }) => {
  const [showModal, setShowModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('Staff');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;

    const perms = PRESETS[selectedPreset];
    onAddUser({
      id: Math.random().toString(36).substr(2, 9),
      username: newUsername,
      role: perms.manageUsers ? UserRole.ADMIN : UserRole.STAFF,
      permissions: perms,
      createdAt: new Date().toISOString()
    });
    setNewUsername('');
    setSelectedPreset('Staff');
    setShowModal(false);
  };

  const btnColor = theme === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' :
                   theme === 'royal' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' :
                   theme === 'gold' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-200';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Staff & Access Control</h2>
          <p className="text-slate-500">Manage granular permissions for platform access levels.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className={`${btnColor} text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-lg transition-all active:scale-95`}
        >
          <ICONS.Add />
          Create Account
        </button>
      </header>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-bold tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Access Level</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${btnColor} flex items-center justify-center font-bold text-white uppercase`}>{u.username[0]}</div>
                    <span className="font-semibold text-slate-800">{u.username}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${u.permissions?.manageUsers ? 'bg-purple-50 text-purple-700' : 'bg-slate-50 text-slate-700'}`}>
                    {u.permissions?.manageUsers ? 'Superuser' : 'Standard User'}
                  </span>
                </td>
                <td className="px-6 py-4">
                   <div className="flex flex-wrap gap-1">
                      {Object.entries(u.permissions || {}).filter(([k,v]) => v === true && k !== 'manageUsers').slice(0, 3).map(([k]) => (
                        <span key={k} className="text-[9px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded uppercase">
                          {k.replace('view', '').replace('Projects', 'Proj').replace('Transactions', 'Txn')}
                        </span>
                      ))}
                      {Object.values(u.permissions || {}).filter(v => v === true).length > 3 && <span className="text-[9px] font-bold text-slate-400">...</span>}
                   </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => onDeleteUser(u.id)}
                    className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                  >
                    <ICONS.Delete />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-in zoom-in duration-200 overflow-hidden">
            <div className={`p-6 border-b border-slate-100 ${btnColor} text-white flex justify-between items-center`}>
              <h3 className="text-xl font-bold">New Staff Account</h3>
              <button onClick={() => setShowModal(false)} className="bg-white/20 p-1 rounded-lg">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Account Username</label>
                <input required type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-slate-900 outline-none text-sm font-medium" placeholder="e.g. j.doe" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Access Level Preset</label>
                <select 
                  value={selectedPreset} 
                  onChange={e => setSelectedPreset(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-slate-900 outline-none text-sm font-bold bg-white"
                >
                  {Object.keys(PRESETS).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <p className="mt-2 text-[10px] text-slate-400 italic">Presets automatically configure granular access flags.</p>
              </div>
              <button type="submit" className={`w-full ${btnColor} text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-95`}>
                Deploy Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
