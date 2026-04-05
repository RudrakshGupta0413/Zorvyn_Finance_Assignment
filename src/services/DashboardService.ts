import prisma from '../lib/prisma.js';
import { 
  DashboardSummary, 
  CategoryBreakdown, 
  MonthlyTrendItem,
  WeeklyTrendItem 
} from '../types/index.js';

export class DashboardService {
  static async getSummary(userId: string): Promise<DashboardSummary> {
    const records = await prisma.financialRecord.findMany({
      where: { userId, deletedAt: null },
      select: { amount: true, type: true },
    });

    let totalIncome = 0;
    let totalExpenses = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    records.forEach((record) => {
      const amount = Number(record.amount);
      if (record.type === 'INCOME') {
        totalIncome += amount;
        incomeCount++;
      } else {
        totalExpenses += amount;
        expenseCount++;
      }
    });

    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      incomeCount,
      expenseCount,
    };
  }

  static async getCategoryBreakdown(userId: string): Promise<CategoryBreakdown> {
    const rawGroups = await prisma.financialRecord.groupBy({
      by: ['category', 'type'],
      where: { userId, deletedAt: null },
      _sum: { amount: true },
      _count: { id: true },
    });

    const incomeMap = new Map<string, { total: number; count: number }>();
    const expenseMap = new Map<string, { total: number; count: number }>();
    
    let totalIncome = 0;
    let totalExpenses = 0;

    rawGroups.forEach((group) => {
      const category = group.category.toLowerCase();
      const amount = Number(group._sum.amount);
      const count = group._count.id;

      if (group.type === 'INCOME') {
        const existing = incomeMap.get(category) || { total: 0, count: 0 };
        incomeMap.set(category, { 
          total: existing.total + amount, 
          count: existing.count + count 
        });
        totalIncome += amount;
      } else {
        const existing = expenseMap.get(category) || { total: 0, count: 0 };
        expenseMap.set(category, { 
          total: existing.total + amount, 
          count: existing.count + count 
        });
        totalExpenses += amount;
      }
    });

    const income = Array.from(incomeMap.entries()).map(([category, stats]) => ({
      category,
      total: stats.total,
      count: stats.count,
      percentage: totalIncome > 0 ? (stats.total / totalIncome) * 100 : 0,
    }));

    const expenses = Array.from(expenseMap.entries()).map(([category, stats]) => ({
      category,
      total: stats.total,
      count: stats.count,
      percentage: totalExpenses > 0 ? (stats.total / totalExpenses) * 100 : 0,
    }));

    return { income, expenses };
  }

  static async getMonthlyTrend(userId: string, months: number = 12): Promise<MonthlyTrendItem[]> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const records = await prisma.financialRecord.findMany({
      where: {
        userId,
        deletedAt: null,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });

    const monthlyData: Record<string, MonthlyTrendItem> = {};

    records.forEach((record) => {
      const date = new Date(record.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: date.toLocaleString('default', { month: 'long', year: 'numeric' }),
          iso: monthKey,
          income: 0,
          expenses: 0,
        };
      }

      const amount = Number(record.amount);
      if (record.type === 'INCOME') {
        monthlyData[monthKey].income += amount;
      } else {
        monthlyData[monthKey].expenses += amount;
      }
    });

    return Object.values(monthlyData);
  }

  static async getWeeklyTrend(userId: string, weeks: number = 12): Promise<WeeklyTrendItem[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (weeks * 7));

    const records = await prisma.financialRecord.findMany({
      where: {
        userId,
        deletedAt: null,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });

    const weeklyData: Record<string, WeeklyTrendItem> = {};

    records.forEach((record) => {
      const date = new Date(record.date);
      // Get the start of the week (Sunday)
      const day = date.getDay(); // 0 is Sunday
      const diff = date.getDate() - day;
      const weekStartDate = new Date(date.setDate(diff));
      const iso = weekStartDate.toISOString().split('T')[0];

      if (!weeklyData[iso]) {
        weeklyData[iso] = {
          week: `Week of ${iso}`,
          iso,
          income: 0,
          expenses: 0,
        };
      }

      const amount = Number(record.amount);
      if (record.type === 'INCOME') {
        weeklyData[iso].income += amount;
      } else {
        weeklyData[iso].expenses += amount;
      }
    });

    return Object.values(weeklyData);
  }

  static async getRecentActivity(userId: string, limit: number = 10) {
    return prisma.financialRecord.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
