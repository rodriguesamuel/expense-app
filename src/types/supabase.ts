export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      expenses: {
        Row: {
          id: string;
          user_id: string;
          description: string;
          amount: number;
          payment_type_id: string;
          category_id: string | null;
          date: string;
          payment_date: string;
          notes: string | null;
          installment_group_id: string | null;
          installment_number: number | null;
          installment_count: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string | undefined;
          user_id: string;
          description: string;
          amount: number;
          payment_type_id: string;
          category_id?: string | null | undefined;
          date?: string | undefined;
          payment_date?: string | undefined;
          notes?: string | null | undefined;
          installment_group_id?: string | null | undefined;
          installment_number?: number | null | undefined;
          installment_count?: number | null | undefined;
          created_at?: string | undefined;
          updated_at?: string | undefined;
        };
        Update: {
          id?: string | undefined;
          user_id?: string | undefined;
          description?: string | undefined;
          amount?: number | undefined;
          payment_type_id?: string | undefined;
          category_id?: string | null | undefined;
          date?: string | undefined;
          payment_date?: string | undefined;
          notes?: string | null | undefined;
          installment_group_id?: string | null | undefined;
          installment_number?: number | null | undefined;
          installment_count?: number | null | undefined;
          updated_at?: string | undefined;
        };
        Relationships: [
          {
            foreignKeyName: "expenses_payment_type_id_fkey";
            columns: ["payment_type_id"];
            isOneToOne: false;
            referencedRelation: "payment_types";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "expenses_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      payment_types: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: string;
          cutoff_day: number | null;
          due_day: number | null;
          is_system: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string | undefined;
          user_id: string;
          name: string;
          type?: string | undefined;
          cutoff_day?: number | null | undefined;
          due_day?: number | null | undefined;
          is_system?: boolean | undefined;
          created_at?: string | undefined;
          updated_at?: string | undefined;
        };
        Update: {
          id?: string | undefined;
          user_id?: string | undefined;
          name?: string | undefined;
          type?: string | undefined;
          cutoff_day?: number | null | undefined;
          due_day?: number | null | undefined;
          is_system?: boolean | undefined;
          updated_at?: string | undefined;
        };
        Relationships: [
          {
            foreignKeyName: "payment_types_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          month: string;
          amount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          month: string;
          amount: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string;
          month?: string;
          amount?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      expenses_with_payment_type: {
        Row: {
          id: string;
          user_id: string;
          description: string;
          amount: number;
          date: string;
          payment_date: string;
          notes: string | null;
          installment_group_id: string | null;
          installment_number: number | null;
          installment_count: number | null;
          created_at: string;
          updated_at: string;
          payment_type_id: string;
          category_id: string | null;
          payment_type_name: string;
          category_name: string | null;
          payment_type_kind: string;
          cutoff_day: number | null;
          due_day: number | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      create_expense_installments: {
        Args: {
          p_user_id: string;
          p_description: string;
          p_total_amount: number;
          p_payment_type_id: string;
          p_category_id: string | null;
          p_purchase_date: string;
          p_notes: string | null;
          p_payment_dates: string[];
          p_amounts: number[];
        };
        Returns: Database["public"]["Tables"]["expenses"]["Row"][];
      };
      replace_expense_installments: {
        Args: {
          p_user_id: string;
          p_group_id: string;
          p_description: string;
          p_payment_type_id: string;
          p_category_id: string | null;
          p_purchase_date: string;
          p_notes: string | null;
          p_payment_dates: string[];
          p_amounts: number[];
        };
        Returns: Database["public"]["Tables"]["expenses"]["Row"][];
      };
      delete_expense_series: {
        Args: { p_user_id: string; p_expense_id: string };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Expense = Tables<"expenses">;
export type PaymentType = Tables<"payment_types">;
export type Category = Tables<"categories">;
export type Budget = Tables<"budgets">;
export type ExpenseWithPaymentType =
  Database["public"]["Views"]["expenses_with_payment_type"]["Row"];
