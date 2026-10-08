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
          id?: string | undefined;
          user_id: string;
          description: string;
          amount: number;
          payment_type_id: string;
          date?: string | undefined;
          notes?: string | null | undefined;
          created_at?: string | undefined;
          updated_at?: string | undefined;
        };
        Update: {
          id?: string | undefined;
          user_id?: string | undefined;
          description?: string | undefined;
          amount?: number | undefined;
          payment_type_id?: string | undefined;
          date?: string | undefined;
          notes?: string | null | undefined;
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
          is_system: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string | undefined;
          user_id: string;
          name: string;
          is_system?: boolean | undefined;
          created_at?: string | undefined;
          updated_at?: string | undefined;
        };
        Update: {
          id?: string | undefined;
          user_id?: string | undefined;
          name?: string | undefined;
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
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Expense = Tables<"expenses">;
export type PaymentType = Tables<"payment_types">;
export type ExpenseWithPaymentType =
  Database["public"]["Views"]["expenses_with_payment_type"]["Row"];
