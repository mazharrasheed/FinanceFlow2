
import React, { createContext, useContext, useState, useEffect } from 'react';
// Correct: Import interfaces from types.ts
import { HotelProject, Transaction } from '../types';
import { INITIAL_PROJECTS, INITIAL_TRANSACTIONS } from '../constants';

interface DataContextType {
  projects: HotelProject[];
  transactions: Transaction[];
  addProject: (p: HotelProject) => void;
  updateProject: (p: HotelProject) => void;
  deleteProject: (id: string) => void;
  addTransaction: (t: Transaction) => void;
  updateTransaction: (t: Transaction) => void;
  deleteTransaction: (id: string) => void;
  backupToCSV: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<HotelProject[]>(() => {
    const saved = localStorage.getItem('hf_projects');
    try { return saved ? JSON.parse(saved) : INITIAL_PROJECTS; } catch { return INITIAL_PROJECTS; }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('hf_transactions');
    try { return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS; } catch { return INITIAL_TRANSACTIONS; }
  });

  useEffect(() => {
    localStorage.setItem('hf_projects', JSON.stringify(projects));
    localStorage.setItem('hf_transactions', JSON.stringify(transactions));
  }, [projects, transactions]);

  const addProject = (p: HotelProject) => setProjects([p, ...projects]);
  const updateProject = (p: HotelProject) => setProjects(projects.map(old => old.id === p.id ? p : old));
  const deleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
    setTransactions(transactions.filter(t => t.projectId !== id));
  };

  const addTransaction = (t: Transaction) => setTransactions([t, ...transactions]);
  const updateTransaction = (t: Transaction) => setTransactions(transactions.map(old => old.id === t.id ? t : old));
  const deleteTransaction = (id: string) => setTransactions(transactions.filter(t => t.id !== id));

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
    <DataContext.Provider value={{ 
      projects, transactions, addProject, updateProject, deleteProject, 
      addTransaction, updateTransaction, deleteTransaction, backupToCSV 
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
