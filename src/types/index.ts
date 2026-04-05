import { z } from 'zod';
import { 
  loginSchema, 
  registerSchema, 
  updateUserSchema, 
  createRecordSchema, 
  updateRecordSchema, 
  getRecordsQuerySchema 
} from './validation.js';

// Re-export validation constants
export * from './validation.js';

// User Types
export type LoginRequest = z.infer<typeof loginSchema>;
export interface UserResponse {
  id: string;
  email: string;
  fullName: string;
  role: 'VIEWER' | 'ANALYST' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}
export interface LoginResponse {
  token: string;
  user: UserResponse;
}

// Record Types
export type CreateRecordInput = z.infer<typeof createRecordSchema>;
export type UpdateRecordInput = z.infer<typeof updateRecordSchema>;
export interface RecordResponse {
  id: string;
  userId: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  date: Date;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Pagination & Response Types
export interface PaginationParams {
  page: number;
  limit: number;
}
export interface PaginationResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export interface ApiResponse<T> {
  data: T;
  message?: string;
}
export interface ErrorResponse {
  error: string;
  status: number;
  timestamp: string;
  path: string;
}

// Dashboard Types
export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  incomeCount: number;
  expenseCount: number;
}
export interface CategoryBreakdownItem {
  category: string;
  total: number;
  count: number;
  percentage: number;
}
export interface CategoryBreakdown {
  income: CategoryBreakdownItem[];
  expenses: CategoryBreakdownItem[];
}
export interface MonthlyTrendItem {
  month: string;
  iso: string;
  income: number;
  expenses: number;
}

export interface WeeklyTrendItem {
  week: string; // e.g. "Week of 2024-03-24"
  iso: string;  // Start of week date
  income: number;
  expenses: number;
}
