export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      listings: {
        Row: {
          brand: string | null
          category: string
          condition: string | null
          created_at: string | null
          description: string | null
          expires_at: string | null
          id: string
          listing_type: string
          location_city: string | null
          location_country: string | null
          model: string | null
          photos: string[] | null
          price: number | null
          quantity: number | null
          reference: string | null
          status: string | null
          title: string
          unit: string | null
          updated_at: string | null
          user_id: string
          views: number | null
        }
        Insert: {
          brand?: string | null
          category: string
          condition?: string | null
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          listing_type: string
          location_city?: string | null
          location_country?: string | null
          model?: string | null
          photos?: string[] | null
          price?: number | null
          quantity?: number | null
          reference?: string | null
          status?: string | null
          title: string
          unit?: string | null
          updated_at?: string | null
          user_id: string
          views?: number | null
        }
        Update: {
          brand?: string | null
          category?: string
          condition?: string | null
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          listing_type?: string
          location_city?: string | null
          location_country?: string | null
          model?: string | null
          photos?: string[] | null
          price?: number | null
          quantity?: number | null
          reference?: string | null
          status?: string | null
          title?: string
          unit?: string | null
          updated_at?: string | null
          user_id?: string
          views?: number | null
        }
        Relationships: []
      }
      promo_counter: {
        Row: {
          early_adopters_count: number | null
          id: number
          max_early_adopters: number | null
          updated_at: string | null
        }
        Insert: {
          early_adopters_count?: number | null
          id?: number
          max_early_adopters?: number | null
          updated_at?: string | null
        }
        Update: {
          early_adopters_count?: number | null
          id?: number
          max_early_adopters?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_documents: {
        Row: {
          created_at: string | null
          document_type: string
          document_url: string
          id: string
          rejection_reason: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          created_at?: string | null
          document_type: string
          document_url: string
          id?: string
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          created_at?: string | null
          document_type?: string
          document_url?: string
          id?: string
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          account_type: string
          average_rating: number | null
          badges: Json | null
          city: string | null
          civility: string | null
          company_name: string | null
          company_number: string | null
          contact_name: string | null
          country: string | null
          created_at: string | null
          first_name: string | null
          id: string
          is_early_adopter: boolean | null
          last_name: string | null
          opening_hours: Json | null
          phone: string | null
          postal_code: string | null
          profile_photo_url: string | null
          promo_end_date: string | null
          role: string | null
          shop_address: string | null
          shop_photos: Json | null
          status: string
          stripe_customer_id: string | null
          subscription_id: string | null
          subscription_status: string | null
          total_purchases: number | null
          total_sales: number | null
          updated_at: string | null
          validated_by: string | null
          validation_date: string | null
          vat_number: string | null
        }
        Insert: {
          account_type: string
          average_rating?: number | null
          badges?: Json | null
          city?: string | null
          civility?: string | null
          company_name?: string | null
          company_number?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string | null
          first_name?: string | null
          id: string
          is_early_adopter?: boolean | null
          last_name?: string | null
          opening_hours?: Json | null
          phone?: string | null
          postal_code?: string | null
          profile_photo_url?: string | null
          promo_end_date?: string | null
          role?: string | null
          shop_address?: string | null
          shop_photos?: Json | null
          status?: string
          stripe_customer_id?: string | null
          subscription_id?: string | null
          subscription_status?: string | null
          total_purchases?: number | null
          total_sales?: number | null
          updated_at?: string | null
          validated_by?: string | null
          validation_date?: string | null
          vat_number?: string | null
        }
        Update: {
          account_type?: string
          average_rating?: number | null
          badges?: Json | null
          city?: string | null
          civility?: string | null
          company_name?: string | null
          company_number?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          is_early_adopter?: boolean | null
          last_name?: string | null
          opening_hours?: Json | null
          phone?: string | null
          postal_code?: string | null
          profile_photo_url?: string | null
          promo_end_date?: string | null
          role?: string | null
          shop_address?: string | null
          shop_photos?: Json | null
          status?: string
          stripe_customer_id?: string | null
          subscription_id?: string | null
          subscription_status?: string | null
          total_purchases?: number | null
          total_sales?: number | null
          updated_at?: string | null
          validated_by?: string | null
          validation_date?: string | null
          vat_number?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_early_adopters: { Args: never; Returns: number }
    }
    Enums: {
      [_ in never]: never
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
  public: {
    Enums: {},
  },
} as const
