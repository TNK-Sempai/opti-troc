// Généré depuis le schéma PostgREST du projet Supabase.
// Régénérer avec la CLI Supabase :
//   npx supabase gen types typescript --project-id <ref> > types/database.types.ts

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
      brands: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          archive_expiry: string | null
          archived_at: string | null
          archived_by: string | null
          company: string | null
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          status: string | null
          subject: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          archive_expiry?: string | null
          archived_at?: string | null
          archived_by?: string | null
          company?: string | null
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          status?: string | null
          subject: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          archive_expiry?: string | null
          archived_at?: string | null
          archived_by?: string | null
          company?: string | null
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string | null
          subject?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'contact_messages_updated_by_fkey'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          is_archived: boolean | null
          joined_at: string | null
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          is_archived?: boolean | null
          joined_at?: string | null
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          is_archived?: boolean | null
          joined_at?: string | null
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'conversation_participants_conversation_id_fkey'
            columns: ['conversation_id']
            isOneToOne: false
            referencedRelation: 'conversations'
            referencedColumns: ['id']
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          last_message_at: string | null
          listing_id: string | null
          subject: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          listing_id?: string | null
          subject?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          listing_id?: string | null
          subject?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'conversations_listing_id_fkey'
            columns: ['listing_id']
            isOneToOne: false
            referencedRelation: 'listings'
            referencedColumns: ['id']
          },
        ]
      }
      listing_photos: {
        Row: {
          cloudinary_public_id: string
          display_order: number | null
          id: string
          is_primary: boolean | null
          listing_id: string
          photo_url: string
          uploaded_at: string | null
        }
        Insert: {
          cloudinary_public_id: string
          display_order?: number | null
          id?: string
          is_primary?: boolean | null
          listing_id: string
          photo_url: string
          uploaded_at?: string | null
        }
        Update: {
          cloudinary_public_id?: string
          display_order?: number | null
          id?: string
          is_primary?: boolean | null
          listing_id?: string
          photo_url?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'listing_photos_listing_id_fkey'
            columns: ['listing_id']
            isOneToOne: false
            referencedRelation: 'listings'
            referencedColumns: ['id']
          },
        ]
      }
      listings: {
        Row: {
          ban_reason: string | null
          banned_at: string | null
          banned_by: string | null
          boost_expires_at: string | null
          contacts_count: number | null
          created_at: string | null
          favorites_count: number | null
          id: string
          is_boosted: boolean | null
          is_pinned: boolean | null
          listing_type: string
          sold_at: string | null
          status: string
          suspended_at: string | null
          suspended_by: string | null
          updated_at: string | null
          user_id: string
          views_count: number | null
        }
        Insert: {
          ban_reason?: string | null
          banned_at?: string | null
          banned_by?: string | null
          boost_expires_at?: string | null
          contacts_count?: number | null
          created_at?: string | null
          favorites_count?: number | null
          id?: string
          is_boosted?: boolean | null
          is_pinned?: boolean | null
          listing_type: string
          sold_at?: string | null
          status?: string
          suspended_at?: string | null
          suspended_by?: string | null
          updated_at?: string | null
          user_id: string
          views_count?: number | null
        }
        Update: {
          ban_reason?: string | null
          banned_at?: string | null
          banned_by?: string | null
          boost_expires_at?: string | null
          contacts_count?: number | null
          created_at?: string | null
          favorites_count?: number | null
          id?: string
          is_boosted?: boolean | null
          is_pinned?: boolean | null
          listing_type?: string
          sold_at?: string | null
          status?: string
          suspended_at?: string | null
          suspended_by?: string | null
          updated_at?: string | null
          user_id?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'listings_banned_by_fkey'
            columns: ['banned_by']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'listings_suspended_by_fkey'
            columns: ['suspended_by']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'listings_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
        ]
      }
      lot_items: {
        Row: {
          brand: string
          created_at: string | null
          display_order: number | null
          id: string
          lot_id: string
          model: string
          quantity: number
          reference: string | null
          state: string
        }
        Insert: {
          brand: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          lot_id: string
          model: string
          quantity: number
          reference?: string | null
          state: string
        }
        Update: {
          brand?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          lot_id?: string
          model?: string
          quantity?: number
          reference?: string | null
          state?: string
        }
        Relationships: [
          {
            foreignKeyName: 'lot_items_lot_id_fkey'
            columns: ['lot_id']
            isOneToOne: false
            referencedRelation: 'lot_listings'
            referencedColumns: ['listing_id']
          },
        ]
      }
      lot_listings: {
        Row: {
          allow_partial_sale: boolean | null
          created_at: string | null
          description: string
          listing_id: string
          total_price: number
          updated_at: string | null
        }
        Insert: {
          allow_partial_sale?: boolean | null
          created_at?: string | null
          description: string
          listing_id: string
          total_price: number
          updated_at?: string | null
        }
        Update: {
          allow_partial_sale?: boolean | null
          created_at?: string | null
          description?: string
          listing_id?: string
          total_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'lot_listings_listing_id_fkey'
            columns: ['listing_id']
            isOneToOne: false
            referencedRelation: 'listings'
            referencedColumns: ['id']
          },
        ]
      }
      messages: {
        Row: {
          attachments: Json | null
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          read_at: string | null
          sender_id: string
        }
        Insert: {
          attachments?: Json | null
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          sender_id: string
        }
        Update: {
          attachments?: Json | null
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'messages_conversation_id_fkey'
            columns: ['conversation_id']
            isOneToOne: false
            referencedRelation: 'conversations'
            referencedColumns: ['id']
          },
        ]
      }
      models: {
        Row: {
          brand_id: string
          created_at: string | null
          gender: string
          id: string
          is_active: boolean | null
          name: string
          type: string
        }
        Insert: {
          brand_id: string
          created_at?: string | null
          gender: string
          id?: string
          is_active?: boolean | null
          name: string
          type: string
        }
        Update: {
          brand_id?: string
          created_at?: string | null
          gender?: string
          id?: string
          is_active?: boolean | null
          name?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: 'models_brand_id_fkey'
            columns: ['brand_id']
            isOneToOne: false
            referencedRelation: 'brands'
            referencedColumns: ['id']
          },
        ]
      }
      product_references: {
        Row: {
          color_frame: string | null
          color_lens: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          material_frame: string | null
          material_lens: string | null
          model_id: string
          reference: string
          reference_photo_url: string | null
          size_bridge: string | null
          size_height: string | null
          size_lens: string | null
          size_temple: string | null
        }
        Insert: {
          color_frame?: string | null
          color_lens?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          material_frame?: string | null
          material_lens?: string | null
          model_id: string
          reference: string
          reference_photo_url?: string | null
          size_bridge?: string | null
          size_height?: string | null
          size_lens?: string | null
          size_temple?: string | null
        }
        Update: {
          color_frame?: string | null
          color_lens?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          material_frame?: string | null
          material_lens?: string | null
          model_id?: string
          reference?: string
          reference_photo_url?: string | null
          size_bridge?: string | null
          size_height?: string | null
          size_lens?: string | null
          size_temple?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'product_references_model_id_fkey'
            columns: ['model_id']
            isOneToOne: false
            referencedRelation: 'models'
            referencedColumns: ['id']
          },
        ]
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
      unit_listings: {
        Row: {
          allow_hand_delivery: boolean | null
          brand: string
          category: string
          color_frame: string | null
          color_lens: string | null
          created_at: string | null
          description: string
          gender: string
          listing_id: string
          material: string | null
          model: string
          price: number
          reference: string | null
          size_bridge: string | null
          size_lens: string | null
          size_temple: string | null
          state: string
          updated_at: string | null
        }
        Insert: {
          allow_hand_delivery?: boolean | null
          brand: string
          category: string
          color_frame?: string | null
          color_lens?: string | null
          created_at?: string | null
          description: string
          gender: string
          listing_id: string
          material?: string | null
          model: string
          price: number
          reference?: string | null
          size_bridge?: string | null
          size_lens?: string | null
          size_temple?: string | null
          state: string
          updated_at?: string | null
        }
        Update: {
          allow_hand_delivery?: boolean | null
          brand?: string
          category?: string
          color_frame?: string | null
          color_lens?: string | null
          created_at?: string | null
          description?: string
          gender?: string
          listing_id?: string
          material?: string | null
          model?: string
          price?: number
          reference?: string | null
          size_bridge?: string | null
          size_lens?: string | null
          size_temple?: string | null
          state?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'unit_listings_listing_id_fkey'
            columns: ['listing_id']
            isOneToOne: false
            referencedRelation: 'listings'
            referencedColumns: ['id']
          },
        ]
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
          archive_expiry: string | null
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
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
          archive_expiry?: string | null
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
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
          archive_expiry?: string | null
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
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
      wanted_item_notifications: {
        Row: {
          id: string
          is_read: boolean | null
          listing_id: string
          notified_at: string | null
          user_id: string
          wanted_item_id: string
        }
        Insert: {
          id?: string
          is_read?: boolean | null
          listing_id: string
          notified_at?: string | null
          user_id: string
          wanted_item_id: string
        }
        Update: {
          id?: string
          is_read?: boolean | null
          listing_id?: string
          notified_at?: string | null
          user_id?: string
          wanted_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'wanted_item_notifications_listing_id_fkey'
            columns: ['listing_id']
            isOneToOne: false
            referencedRelation: 'listings'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'wanted_item_notifications_wanted_item_id_fkey'
            columns: ['wanted_item_id']
            isOneToOne: false
            referencedRelation: 'wanted_items'
            referencedColumns: ['id']
          },
        ]
      }
      wanted_items: {
        Row: {
          brand: string
          created_at: string | null
          description: string | null
          fulfilled_at: string | null
          fulfilled_by_listing_id: string | null
          id: string
          max_price: number | null
          model: string | null
          reference: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          brand: string
          created_at?: string | null
          description?: string | null
          fulfilled_at?: string | null
          fulfilled_by_listing_id?: string | null
          id?: string
          max_price?: number | null
          model?: string | null
          reference?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          brand?: string
          created_at?: string | null
          description?: string | null
          fulfilled_at?: string | null
          fulfilled_by_listing_id?: string | null
          id?: string
          max_price?: number | null
          model?: string | null
          reference?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'wanted_items_fulfilled_by_listing_id_fkey'
            columns: ['fulfilled_by_listing_id']
            isOneToOne: false
            referencedRelation: 'listings'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'wanted_items_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
