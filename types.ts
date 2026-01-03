
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export enum IncomeCategory {
  ROOM_REVENUE = 'Room Revenue',
  FOOD_BEVERAGE = 'F&B Sales',
  EVENTS = 'Event Bookings',
  SPA_WELLNESS = 'Spa & Wellness',
  LAUNDRY = 'Laundry Services',
  MISC_INCOME = 'Miscellaneous Income'
}

export enum ExpenseCategory {
  PAYROLL = 'Payroll & Salaries',
  UTILITIES = 'Utilities (Energy/Water)',
  MAINTENANCE = 'Property Maintenance',
  INVENTORY = 'Supplies & Inventory',
  MARKETING = 'Marketing & Ads',
  TAX_INSURANCE = 'Taxes & Insurance',
  OTHER_EXPENSE = 'Other Expenses'
}

export interface Transaction {
  id: string;
  projectId: string;
  projectName?: string;
  date: string;
  type: TransactionType;
  category: IncomeCategory | ExpenseCategory;
  amount: number;
  description: string;
}

export interface HotelProject {
  id: string;
  name: string;
  location: string;
  startDate: string;
  status: 'Planning' | 'Construction' | 'Operational' | 'Renovating';
  budget: number;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  VIEWER = 'VIEWER'
}

export interface UserPermissions {
  // Flat structure is more stable for storage/retrieval
  viewProjects: boolean;
  addProjects: boolean;
  editProjects: boolean;
  deleteProjects: boolean;
  viewTransactions: boolean;
  addTransactions: boolean;
  editTransactions: boolean;
  deleteTransactions: boolean;
  manageUsers: boolean;
}

export interface User {
  id: string;
  username: string;
  password?: string;
  role: UserRole; 
  permissions: UserPermissions;
  token?: string;
  createdAt: string;
  email?: string;
  fullName?: string;
}

export type AppTheme = 'emerald' | 'royal' | 'gold' | 'midnight';

export interface FinanceSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}
