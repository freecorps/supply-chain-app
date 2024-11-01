export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      locations: {
        Row: {
          address: string
          coordinates: unknown | null
          created_at: string | null
          id: string
          metadata: Json | null
          name: string
          type: string
        }
        Insert: {
          address: string
          coordinates?: unknown | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          name: string
          type: string
        }
        Update: {
          address?: string
          coordinates?: unknown | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          type?: string
        }
        Relationships: []
      }
      logistics_details: {
        Row: {
          additional_data: Json | null
          humidity: number | null
          id: string
          quality_checks: Json | null
          storage_conditions: string | null
          temperature: number | null
          transaction_id: string
          transport_duration: unknown | null
          transport_vehicle: string | null
        }
        Insert: {
          additional_data?: Json | null
          humidity?: number | null
          id?: string
          quality_checks?: Json | null
          storage_conditions?: string | null
          temperature?: number | null
          transaction_id: string
          transport_duration?: unknown | null
          transport_vehicle?: string | null
        }
        Update: {
          additional_data?: Json | null
          humidity?: number | null
          id?: string
          quality_checks?: Json | null
          storage_conditions?: string | null
          temperature?: number | null
          transaction_id?: string
          transport_duration?: unknown | null
          transport_vehicle?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "logistics_details_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "supply_chain_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          status: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          status: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          status?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          metadata: Json | null
          name: string
          sku: string
          status: string
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          metadata?: Json | null
          name: string
          sku: string
          status?: string
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          sku?: string
          status?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_name: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          company_name?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          company_name?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string | null
          created_by: string
          frequency: string
          id: string
          last_run: string | null
          metadata: Json | null
          name: string
          next_run: string | null
          status: string
          type: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          frequency: string
          id?: string
          last_run?: string | null
          metadata?: Json | null
          name: string
          next_run?: string | null
          status?: string
          type: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          frequency?: string
          id?: string
          last_run?: string | null
          metadata?: Json | null
          name?: string
          next_run?: string | null
          status?: string
          type?: string
        }
        Relationships: []
      }
      supply_chain_transactions: {
        Row: {
          blockchain_hash: string
          created_at: string | null
          created_by: string
          from_location_id: string | null
          id: string
          metadata: Json | null
          previous_transaction_id: string | null
          product_id: string
          status: string
          to_location_id: string | null
          transaction_type: string
        }
        Insert: {
          blockchain_hash: string
          created_at?: string | null
          created_by: string
          from_location_id?: string | null
          id?: string
          metadata?: Json | null
          previous_transaction_id?: string | null
          product_id: string
          status: string
          to_location_id?: string | null
          transaction_type: string
        }
        Update: {
          blockchain_hash?: string
          created_at?: string | null
          created_by?: string
          from_location_id?: string | null
          id?: string
          metadata?: Json | null
          previous_transaction_id?: string | null
          product_id?: string
          status?: string
          to_location_id?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "supply_chain_transactions_from_location_id_fkey"
            columns: ["from_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supply_chain_transactions_previous_transaction_id_fkey"
            columns: ["previous_transaction_id"]
            isOneToOne: false
            referencedRelation: "supply_chain_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supply_chain_transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supply_chain_transactions_to_location_id_fkey"
            columns: ["to_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
