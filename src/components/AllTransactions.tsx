import React, { useState } from 'react';
import { Transaction, HotelProject, TransactionType, AppTheme, IncomeCategory, ExpenseCategory, UserPermissions } from '../../types';
import { ICONS } from '../../constants';

interface Props {
  projects: HotelProject[];
  transactions: Transaction[];
  onBackup: () => void;
  onUpdateTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  userPermissions: UserPermissions;
  theme: AppTheme;
}

const formatCurrency = (amount: number) => {
  return `Rs. ${amount.toLocaleString('en-PK')}`;
};

const AllTransactions: React.FC<Props> = ({ projects, transactions, onBackup, onUpdateTransaction, onDeleteTransaction, userPermissions, theme }) => {
  const [filter, setFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Transaction>>({});

  const enrichedTransactions = transactions.map(t => ({
    ...t,
    projectName: projects.find(p => p.id === t.projectId)?.name || 'Unknown'
  })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filtered = enrichedTransactions.filter(t => 
    t.description.toLowerCase().includes(filter.toLowerCase()) ||
    t.projectName.toLowerCase().includes(filter.toLowerCase()) ||
    t.category.toLowerCase().includes(filter.toLowerCase())
  );

  const handleEdit = (t: Transaction) => {
    setFormData(t);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTransaction(formData as Transaction);
    closeModal();
  };

  const handlePrint = () => {
    window.print();
  };

  const btnColor = theme === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' :
                   theme === 'royal' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' :
                   theme === 'gold' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-200';

  const ringColor = theme === 'emerald' ? 'focus:ring-emerald-500' :
                    theme === 'royal' ? 'focus:ring-blue-500' :
                    theme === 'gold' ? 'focus:ring-amber-500' : 'focus:ring-rose-500';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Global Transaction History</h2>
          <p className="text-slate-500">A consolidated ledger of all financial movements across Pakistani assets.</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-xl text-slate-700 border border-slate-200 font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            <ICONS.Print />
            Print Report
          </button>
          {/* Fix: Access flat property viewTransactions instead of nested transactions.view */}
          {userPermissions.viewTransactions && (
            <button 
              onClick={onBackup}
              className={`flex items-center gap-2 ${btnColor} px-5 py-2.5 rounded-xl text-white font-bold transition-all shadow-lg active:scale-95`}
            >
              <ICONS.Download />
              Download Backup
            </button>
          )}
        </div>
      </header>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 bg-slate-50/50 border-b border-slate-100 print:hidden">
           <div className="relative max-w-sm">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
             </div>
             <input 
               type="text"
               placeholder="Search by hotel, category, or note..."
               className={`w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 ${ringColor} outline-none transition-all`}
               value={filter}
               onChange={e => setFilter(e.target.value)}
             />
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-bold tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Hotel Project</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? filtered.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 text-sm text-slate-500 font-medium">{t.date}</td>
                  <td className="px-6 py-4 text-sm text-slate-800 font-bold">{t.projectName}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      t.type === TransactionType.INCOME ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {t.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">{t.description}</td>
                  <td className={`px-6 py-4 text-sm font-bold text-right ${t.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === TransactionType.INCOME ? '+' : '-'}{formatCurrency(t.amount)}
                  </td>
                  <td className="px-6 py-4 print:hidden">
                    <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Fix: Access flat property editTransactions instead of nested transactions.edit */}
                      {userPermissions.editTransactions && (
                        <button onClick={() => handleEdit(t)} className="p-1.5 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-lg transition-colors"><ICONS.Edit /></button>
                      )}
                      {/* Fix: Access flat property deleteTransactions instead of nested transactions.delete */}
                      {userPermissions.deleteTransactions && (
                        <button onClick={() => onDeleteTransaction(t.id)} className="p-1.5 bg-slate-100 text-slate-500 hover:bg-rose-100 hover:text-rose-600 rounded-lg transition-colors"><ICONS.Delete /></button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">No transactions found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-in zoom-in duration-200 overflow-hidden">
            <div className={`p-8 ${btnColor} text-white`}>
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black">Edit Record</h3>
                <button onClick={closeModal} className="bg-white/20 p-1.5 rounded-xl hover:bg-white/30">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Flow Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as TransactionType, category: e.target.value === TransactionType.INCOME ? IncomeCategory.ROOM_REVENUE : ExpenseCategory.PAYROLL})} className="w-full border border-slate-200 rounded-2xl px-5 py-3 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-bold text-sm bg-white">
                    <option value={TransactionType.INCOME}>Revenue (+)</option>
                    <option value={TransactionType.EXPENSE}>Expense (-)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Posting Date</label>
                  <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full border border-slate-200 rounded-2xl px-5 py-3 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-bold text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Ledger Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})} className="w-full border border-slate-200 rounded-2xl px-5 py-3 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-bold text-sm bg-white">
                  {formData.type === TransactionType.INCOME 
                    ? Object.values(IncomeCategory).map(c => <option key={c} value={c}>{c}</option>)
                    : Object.values(ExpenseCategory).map(c => <option key={c} value={c}>{c}</option>)
                  }
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Monetary Value (PKR)</label>
                <input required type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} className="w-full border border-slate-200 rounded-2xl px-5 py-3 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-bold text-sm" placeholder="0" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Internal Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-slate-200 rounded-2xl px-5 py-3 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium text-sm h-24" placeholder="Add specific details about this flow..."></textarea>
              </div>
              <button type="submit" className={`w-full ${btnColor} text-white font-black py-4 rounded-[1.5rem] transition-all shadow-xl active:scale-95 mt-4`}>
                Update Transaction
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllTransactions;