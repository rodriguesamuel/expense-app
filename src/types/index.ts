export type { Expense, PaymentType, ExpenseWithPaymentType, Category, Budget } from "./supabase";

export interface ExpenseFilters {
  dateFrom?: string;
  dateTo?: string;
  paymentTypeId?: string;
  categoryId?: string;
}

export interface CategoryBudgetSummary {
  categoryId: string;
  categoryName: string;
  spent: number;
  budget: number;
  difference: number;
  percentage: number;
}

export interface DescriptionSummaryItem {
  description: string;
  total: number;
  count: number;
  percentage: number;
}

export interface ReportSummary {
  period: { from: string; to: string };
  total: number;
  count: number;
  dailyAverage: number;
  byPaymentType: {
    paymentTypeId: string;
    paymentTypeName: string;
    total: number;
    count: number;
    percentage: number;
  }[];
  byMonth: {
    month: string;
    total: number;
    count: number;
  }[];
  byDescription: DescriptionSummaryItem[];
}

export interface ActionResult<T = void> {
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}
