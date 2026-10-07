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
          date: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          description: string;
          amount: number;
          payment_type_id: string;
          date?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          description?: string;
          amount?: number;
          payment_type_id?: string;
          date?: string;
          notes?: string | null;
          updated_at?: string;
        };
      };
      payment_types: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          is_system: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          is_system?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          is_system?: boolean;
          updated_at?: string;
        };
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
          notes: string | null;
          created_at: string;
          updated_at: string;
          payment_type_id: string;
          payment_type_name: string;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Expense = Tables<"expenses">;
export type PaymentType = Tables<"payment_types">;
export type ExpenseWithPaymentType =
  Database["public"]["Views"]["expenses_with_payment_type"]["Row"];
