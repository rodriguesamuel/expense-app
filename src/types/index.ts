export type { Expense, PaymentType, ExpenseWithPaymentType } from "./supabase";

export interface ExpenseFilters {
  dateFrom?: string;
  dateTo?: string;
  paymentTypeId?: string;
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
}

export interface ActionResult<T = void> {
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}
