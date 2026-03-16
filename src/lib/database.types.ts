export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      access_credentials: {
        Row: {
          created_at: string
          credential_type: Database["public"]["Enums"]["credential_type"]
          credential_value: string
          id: string
          is_active: boolean
          member_id: string
        }
        Insert: {
          created_at?: string
          credential_type: Database["public"]["Enums"]["credential_type"]
          credential_value: string
          id?: string
          is_active?: boolean
          member_id: string
        }
        Update: {
          created_at?: string
          credential_type?: Database["public"]["Enums"]["credential_type"]
          credential_value?: string
          id?: string
          is_active?: boolean
          member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_credentials_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      access_events: {
        Row: {
          credential_id: string | null
          door_id: string
          gym_id: string
          id: string
          member_id: string
          result: Database["public"]["Enums"]["access_result"]
          scanned_at: string
        }
        Insert: {
          credential_id?: string | null
          door_id?: string
          gym_id: string
          id?: string
          member_id: string
          result: Database["public"]["Enums"]["access_result"]
          scanned_at?: string
        }
        Update: {
          credential_id?: string | null
          door_id?: string
          gym_id?: string
          id?: string
          member_id?: string
          result?: Database["public"]["Enums"]["access_result"]
          scanned_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_events_credential_id_fkey"
            columns: ["credential_id"]
            isOneToOne: false
            referencedRelation: "access_credentials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_events_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_events_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      gyms: {
        Row: {
          address: string | null
          created_at: string
          grace_period_days: number
          id: string
          name: string
          scanner_api_key: string | null
          stripe_account_id: string | null
          timezone: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          grace_period_days?: number
          id?: string
          name: string
          scanner_api_key?: string | null
          stripe_account_id?: string | null
          timezone?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          grace_period_days?: number
          id?: string
          name?: string
          scanner_api_key?: string | null
          stripe_account_id?: string | null
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      members: {
        Row: {
          avatar_url: string | null
          barcode: string | null
          billing_status: string | null
          created_at: string
          email: string | null
          emergency_contact: string | null
          full_name: string
          gym_id: string
          id: string
          joined_at: string
          last_visit_at: string | null
          next_payment: string | null
          notes: string | null
          payment_method: string | null
          phone: string | null
          revenue: number
          status: Database["public"]["Enums"]["member_status"]
          stripe_customer_id: string | null
          total_visits: number
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          barcode?: string | null
          billing_status?: string | null
          created_at?: string
          email?: string | null
          emergency_contact?: string | null
          full_name: string
          gym_id: string
          id?: string
          joined_at?: string
          last_visit_at?: string | null
          next_payment?: string | null
          notes?: string | null
          payment_method?: string | null
          phone?: string | null
          revenue?: number
          status?: Database["public"]["Enums"]["member_status"]
          stripe_customer_id?: string | null
          total_visits?: number
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          barcode?: string | null
          billing_status?: string | null
          created_at?: string
          email?: string | null
          emergency_contact?: string | null
          full_name?: string
          gym_id?: string
          id?: string
          joined_at?: string
          last_visit_at?: string | null
          next_payment?: string | null
          notes?: string | null
          payment_method?: string | null
          phone?: string | null
          revenue?: number
          status?: Database["public"]["Enums"]["member_status"]
          stripe_customer_id?: string | null
          total_visits?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "members_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_plans: {
        Row: {
          created_at: string
          gym_id: string
          id: string
          interval: Database["public"]["Enums"]["plan_interval"]
          is_active: boolean
          name: string
          price_cents: number
          stripe_price_id: string | null
          stripe_product_id: string | null
        }
        Insert: {
          created_at?: string
          gym_id: string
          id?: string
          interval: Database["public"]["Enums"]["plan_interval"]
          is_active?: boolean
          name: string
          price_cents: number
          stripe_price_id?: string | null
          stripe_product_id?: string | null
        }
        Update: {
          created_at?: string
          gym_id?: string
          id?: string
          interval?: Database["public"]["Enums"]["plan_interval"]
          is_active?: boolean
          name?: string
          price_cents?: number
          stripe_price_id?: string | null
          stripe_product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "membership_plans_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      migration_tracking: {
        Row: {
          abc_member_id: string | null
          created_at: string
          id: string
          member_id: string
          payment_collected_at: string | null
          payment_link_sent_at: string | null
          payment_link_url: string | null
          status: Database["public"]["Enums"]["migration_status"]
        }
        Insert: {
          abc_member_id?: string | null
          created_at?: string
          id?: string
          member_id: string
          payment_collected_at?: string | null
          payment_link_sent_at?: string | null
          payment_link_url?: string | null
          status?: Database["public"]["Enums"]["migration_status"]
        }
        Update: {
          abc_member_id?: string | null
          created_at?: string
          id?: string
          member_id?: string
          payment_collected_at?: string | null
          payment_link_sent_at?: string | null
          payment_link_url?: string | null
          status?: Database["public"]["Enums"]["migration_status"]
        }
        Relationships: [
          {
            foreignKeyName: "migration_tracking_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_events: {
        Row: {
          amount_cents: number
          created_at: string
          event_type: string
          gym_id: string
          id: string
          member_id: string
          metadata: Json | null
          status: Database["public"]["Enums"]["payment_status"]
          stripe_event_id: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string
          event_type: string
          gym_id: string
          id?: string
          member_id: string
          metadata?: Json | null
          status: Database["public"]["Enums"]["payment_status"]
          stripe_event_id?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string
          event_type?: string
          gym_id?: string
          id?: string
          member_id?: string
          metadata?: Json | null
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_event_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_events_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_events_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          gym_id: string
          id: string
          role: Database["public"]["Enums"]["staff_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          gym_id: string
          id: string
          role?: Database["public"]["Enums"]["staff_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          gym_id?: string
          id?: string
          role?: Database["public"]["Enums"]["staff_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancelled_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          gym_id: string
          id: string
          member_id: string
          plan_id: string
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_subscription_id: string | null
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          gym_id: string
          id?: string
          member_id: string
          plan_id: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_subscription_id?: string | null
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          gym_id?: string
          id?: string
          member_id?: string
          plan_id?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "membership_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_events: {
        Row: {
          created_at: string
          error_message: string | null
          event_type: string
          id: string
          payload: Json
          processed_at: string | null
          status: Database["public"]["Enums"]["webhook_status"]
          stripe_event_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_type: string
          id?: string
          payload: Json
          processed_at?: string | null
          status?: Database["public"]["Enums"]["webhook_status"]
          stripe_event_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_type?: string
          id?: string
          payload?: Json
          processed_at?: string | null
          status?: Database["public"]["Enums"]["webhook_status"]
          stripe_event_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auth_gym_id: { Args: never; Returns: string }
      generate_member_id: { Args: never; Returns: string }
    }
    Enums: {
      access_result:
        | "granted"
        | "denied_payment"
        | "denied_frozen"
        | "denied_cancelled"
        | "denied_unknown"
      credential_type: "barcode" | "qr" | "nfc"
      member_status: "active" | "frozen" | "cancelled" | "past_due"
      migration_status:
        | "pending"
        | "link_sent"
        | "payment_collected"
        | "completed"
        | "failed"
      payment_status: "succeeded" | "failed" | "refunded" | "pending"
      plan_interval: "month" | "year" | "day" | "class_pack"
      staff_role: "owner" | "manager" | "staff"
      subscription_status: "active" | "past_due" | "cancelled" | "trialing"
      webhook_status: "pending" | "processed" | "failed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      access_result: [
        "granted",
        "denied_payment",
        "denied_frozen",
        "denied_cancelled",
        "denied_unknown",
      ],
      credential_type: ["barcode", "qr", "nfc"],
      member_status: ["active", "frozen", "cancelled", "past_due"],
      migration_status: [
        "pending",
        "link_sent",
        "payment_collected",
        "completed",
        "failed",
      ],
      payment_status: ["succeeded", "failed", "refunded", "pending"],
      plan_interval: ["month", "year", "day", "class_pack"],
      staff_role: ["owner", "manager", "staff"],
      subscription_status: ["active", "past_due", "cancelled", "trialing"],
      webhook_status: ["pending", "processed", "failed"],
    },
  },
} as const
