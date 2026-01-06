import React, { useMemo } from 'react';
import { HotelProject, Transaction, TransactionType, AppTheme, UserPermissions } from '../../types';
import { ICONS } from '../../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface Props {
  projects: HotelProject[];
  transactions: Transaction[];
  onBackup: () => void;
  userPermissions: UserPermissions;
  theme: AppTheme;
}

const formatCurrency = (amount: number) => {
  return `Rs. ${(amount || 0).toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
};

const Dashboard: React.FC<Props> = ({ projects = [], transactions = [], onBackup, userPermissions, theme }) => {
  const canViewTransactions = useMemo(() => !!userPermissions?.viewTransactions, [userPermissions]);

  const summary = useMemo(() => {
    const list = transactions || [];
    return list.reduce((acc, t) => {
      const amount = Number(t?.amount) || 0;
      if (t?.type === TransactionType.INCOME) acc.income += amount;
      else acc.expense += amount;
      return acc;
    }, { income: 0, expense: 0 });
  }, [transactions]);

  const projectStats = useMemo(() => {
    const pList = projects || [];
    const tList = transactions || [];
    return pList.map(p => {
      const pTrans = tList.filter(t => t?.projectId === p?.id);
      const pSummary = pTrans.reduce((acc, t) => {
        const amount = Number(t?.amount) || 0;
        if (t?.type === TransactionType.INCOME) acc.income += amount;
        else acc.expense += amount;
        return acc;
      }, { income: 0, expense: 0 });
      return {
        name: p?.name || 'Unnamed',
        balance: pSummary.income - pSummary.expense,
        income: pSummary.income,
        expense: pSummary.expense
      };
    });
  }, [projects, transactions]);

  const categoryStats = useMemo(() => {
    const tList = transactions || [];
    return tList.reduce((acc: any, t) => {
      const categoryName = t?.category || 'Uncategorized';
      const amount = Number(t?.amount) || 0;
      const existing = acc.find((item: any) => item.name === categoryName);
      if (existing) existing.value += amount;
      else acc.push({ name: categoryName, value: amount });
      return acc;
    }, []);
  }, [transactions]);

  const getThemeColors = () => {
    switch (theme) {
      case 'royal': return ['#2563eb', '#3b82f6'];
      case 'gold': return ['#d97706', '#f59e0b'];
      case 'midnight': return ['#e11d48', '#f43f5e'];
      default: return ['#10b981', '#34d399'];
    }
  };

  const [primaryColor, secondaryColor] = getThemeColors();
  const piePalette = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

  const themePrimaryTextClass = theme === 'royal' ? 'text-blue-600' :
                       theme === 'gold' ? 'text-amber-600' :
                       theme === 'midnight' ? 'text-rose-600' : 'text-emerald-600';

  return (
    <div className="space-y-10 animate-in fade-in duration-700 max-w-[1600px] mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">Executive Summary</h2>
          <p className="text-slate-500 font-medium">Consolidated financial overview of your hospitality assets.</p>
        </div>
        {canViewTransactions && (
          <button 
            onClick={onBackup}
            className="flex items-center gap-2 bg-white px-6 py-3 rounded-2xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95 no-print"
          >
            <ICONS.Download />
            Export Portfolio
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6 group hover:shadow-xl transition-all duration-300">
          <div className="bg-emerald-50 p-5 rounded-[2rem] group-hover:scale-110 transition-transform"><ICONS.Income /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Yield</p>
            <p className="text-3xl font-black text-slate-900">{formatCurrency(summary.income)}</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6 group hover:shadow-xl transition-all duration-300">
          <div className="bg-rose-50 p-5 rounded-[2rem] group-hover:scale-110 transition-transform"><ICONS.Expense /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Portfolio Cost</p>
            <p className="text-3xl font-black text-slate-900">{formatCurrency(summary.expense)}</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6 group hover:shadow-xl transition-all duration-300">
          <div className={`bg-slate-50 p-5 rounded-[2rem] group-hover:scale-110 transition-transform ${themePrimaryTextClass}`}>
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Net Position</p>
            <p className={`text-3xl font-black ${summary.income - summary.expense >= 0 ? themePrimaryTextClass : 'text-rose-600'}`}>
              {formatCurrency(summary.income - summary.expense)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
        <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 min-h-[500px] flex flex-col">
          <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
            <span className="w-1.5 h-8 rounded-full" style={{ backgroundColor: primaryColor }}></span>
            Performance Analytics
          </h3>
          <div className="flex-1 min-h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectStats} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" axisLine={false} tickLine={false} tick={{ dy: 10 }} />
                <YAxis fontSize={11} stroke="#94a3b8" axisLine={false} tickLine={false} tickFormatter={(val) => `Rs.${val/1000}k`} />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), '']}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px' }}
                />
                <Bar dataKey="income" fill={primaryColor} radius={[6, 6, 0, 0]} barSize={32} />
                <Bar dataKey="expense" fill={theme === 'emerald' ? '#f43f5e' : secondaryColor} radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 min-h-[500px] flex flex-col">
          <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
            <span className="w-1.5 h-8 rounded-full" style={{ backgroundColor: primaryColor }}></span>
            Resource Allocation
          </h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryStats.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={piePalette[index % piePalette.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 overflow-y-auto max-h-[100px] no-scrollbar">
             {categoryStats.map((item: any, index: number) => (
               <div key={item.name} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500">
                 <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: piePalette[index % piePalette.length] }}></div>
                 <span className="truncate">{item.name}</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;