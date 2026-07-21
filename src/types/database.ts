export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: "12"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          parent_id: string | null
          sort_order: number
          is_active: boolean
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          parent_id?: string | null
          sort_order?: number
          is_active?: boolean
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          parent_id?: string | null
          sort_order?: number
          is_active?: boolean
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          category_id: string | null
          price: number
          sale_price: number | null
          is_on_sale: boolean
          is_active: boolean
          is_featured: boolean
          inventory_count: number
          craft_type: string | null
          cover_url: string | null
          catalog_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          category_id?: string | null
          price: number
          sale_price?: number | null
          is_on_sale?: boolean
          is_active?: boolean
          is_featured?: boolean
          inventory_count?: number
          craft_type?: string | null
          cover_url?: string | null
          catalog_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          category_id?: string | null
          price?: number
          sale_price?: number | null
          is_on_sale?: boolean
          is_active?: boolean
          is_featured?: boolean
          inventory_count?: number
          craft_type?: string | null
          cover_url?: string | null
          catalog_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          image_url: string
          sort_order: number
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          image_url: string
          sort_order?: number
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          image_url?: string
          sort_order?: number
          is_primary?: boolean
          created_at?: string
        }
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          size: string
          color: string
          color_hex: string | null
          sku: string | null
          inventory_count: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          size: string
          color: string
          color_hex?: string | null
          sku?: string | null
          inventory_count?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          size?: string
          color?: string
          color_hex?: string | null
          sku?: string | null
          inventory_count?: number
          is_active?: boolean
          created_at?: string
        }
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          label: string
          full_name: string
          phone: string
          address_line1: string
          address_line2: string | null
          city: string
          province: string
          postal_code: string | null
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          label?: string
          full_name: string
          phone: string
          address_line1: string
          address_line2?: string | null
          city: string
          province: string
          postal_code?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          label?: string
          full_name?: string
          phone?: string
          address_line1?: string
          address_line2?: string | null
          city?: string
          province?: string
          postal_code?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      carts: {
        Row: {
          id: string
          user_id: string | null
          session_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          cart_id: string
          product_id: string
          variant_id: string | null
          quantity: number
          price_snapshot: number
          created_at: string
        }
        Insert: {
          id?: string
          cart_id: string
          product_id: string
          variant_id?: string | null
          quantity?: number
          price_snapshot: number
          created_at?: string
        }
        Update: {
          id?: string
          cart_id?: string
          product_id?: string
          variant_id?: string | null
          quantity?: number
          price_snapshot?: number
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          user_id: string | null
          guest_email: string | null
          guest_access_token: string | null
          customer_name: string
          customer_last_name: string
          phone: string
          address: string
          city: string
          province: string
          postal_code: string | null
          items: Json
          subtotal: number
          shipping: number
          total: number
          payment_method: string
          payment_status: string
          status: string
          notes: string | null
          idempotency_key: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          user_id?: string | null
          guest_email?: string | null
          guest_access_token?: string | null
          customer_name: string
          customer_last_name: string
          phone: string
          address: string
          city: string
          province: string
          postal_code?: string | null
          items: Json
          subtotal: number
          shipping: number
          total: number
          payment_method: string
          payment_status?: string
          status?: string
          notes?: string | null
          idempotency_key?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          user_id?: string | null
          guest_email?: string | null
          guest_access_token?: string | null
          customer_name?: string
          customer_last_name?: string
          phone?: string
          address?: string
          city?: string
          province?: string
          postal_code?: string | null
          items?: Json
          subtotal?: number
          shipping?: number
          total?: number
          payment_method?: string
          payment_status?: string
          status?: string
          notes?: string | null
          idempotency_key?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          product_slug: string | null
          product_name: string
          product_image: string | null
          variant_id: string | null
          size: string | null
          color: string | null
          quantity: number
          unit_price: number
          total_price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          product_slug?: string | null
          product_name: string
          product_image?: string | null
          variant_id?: string | null
          size?: string | null
          color?: string | null
          quantity: number
          unit_price: number
          total_price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          product_slug?: string | null
          product_name?: string
          product_image?: string | null
          variant_id?: string | null
          size?: string | null
          color?: string | null
          quantity?: number
          unit_price?: number
          total_price?: number
          created_at?: string
        }
      }
      order_timeline: {
        Row: {
          id: string
          order_id: string
          status: string
          note: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          status: string
          note?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          status?: string
          note?: string | null
          created_by?: string | null
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          order_id: string
          method: string
          reference: string | null
          amount: number
          status: string
          proof_url: string | null
          proof_filename: string | null
          verified_by: string | null
          verified_at: string | null
          rejection_reason: string | null
          gateway_payload: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          method: string
          reference?: string | null
          amount: number
          status?: string
          proof_url?: string | null
          proof_filename?: string | null
          verified_by?: string | null
          verified_at?: string | null
          rejection_reason?: string | null
          gateway_payload?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          method?: string
          reference?: string | null
          amount?: number
          status?: string
          proof_url?: string | null
          proof_filename?: string | null
          verified_by?: string | null
          verified_at?: string | null
          rejection_reason?: string | null
          gateway_payload?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      wishlists: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string | null
          name: string
          rating: number
          title: string | null
          body: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id?: string | null
          name: string
          rating: number
          title?: string | null
          body: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string | null
          name?: string
          rating?: number
          title?: string | null
          body?: string
          status?: string
          created_at?: string
        }
      }
      inquiries: {
        Row: {
          id: string
          name: string
          contact: string
          message: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          contact: string
          message: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          contact?: string
          message?: string
          status?: string
          created_at?: string
        }
      }
      site_settings: {
        Row: {
          key: string
          value: string
          updated_at: string
        }
        Insert: {
          key: string
          value: string
          updated_at?: string
        }
        Update: {
          key?: string
          value?: string
          updated_at?: string
        }
      }
      page_content: {
        Row: {
          id: string
          page_slug: string
          section_key: string
          content_key: string
          content_value: string | null
          content_type: string
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          page_slug: string
          section_key: string
          content_key: string
          content_value?: string | null
          content_type?: string
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          page_slug?: string
          section_key?: string
          content_key?: string
          content_value?: string | null
          content_type?: string
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      email_logs: {
        Row: {
          id: string
          to_email: string
          subject: string
          status: string
          message_id: string | null
          error: string | null
          dedup_key: string | null
          created_at: string
        }
        Insert: {
          id?: string
          to_email: string
          subject: string
          status?: string
          message_id?: string | null
          error?: string | null
          dedup_key?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          to_email?: string
          subject?: string
          status?: string
          message_id?: string | null
          error?: string | null
          dedup_key?: string | null
          created_at?: string
        }
      }
      admin_notifications: {
        Row: {
          id: string
          type: string
          title: string
          message: string
          is_read: boolean
          link: string | null
          created_at: string
        }
        Insert: {
          id?: string
          type: string
          title: string
          message: string
          is_read?: boolean
          link?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          type?: string
          title?: string
          message?: string
          is_read?: boolean
          link?: string | null
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
