/**
 * Supabase public 스키마 타입.
 * Supabase public 스키마의 컬럼 정의입니다(수동 작성).
 */
type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          category: string | null;
          sort_order: number | null;
        };
        Insert: {
          id: string;
          category?: string | null;
          sort_order?: number | null;
        };
        Update: {
          id?: string;
          category?: string | null;
          sort_order?: number | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          email: string | null;
          created_at: string | null;
          updated_at: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          email?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          email?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          deleted_at?: string | null;
        };
      };
      products: {
        Row: {
          id: string;
          gid: string | null;
          name: string | null;
          product_type: string | null;
          farm_name: string | null;
          crop_name: string | null;
          source_unit: string | null;
          portion_amount: number | null;
          portion_unit: string | null;
          portion_label: string | null;
          portion_price: number | null;
          storage_type: string | null;
          is_fresh: boolean | null;
          details: Json | null;
          is_active: boolean | null;
          sort_order: number | null;
          created_at: string | null;
          updated_at: string | null;
          category_id: string | null;
        };
        Insert: {
          id: string;
          gid?: string | null;
          name?: string | null;
          product_type?: string | null;
          farm_name?: string | null;
          crop_name?: string | null;
          source_unit?: string | null;
          portion_amount?: number | null;
          portion_unit?: string | null;
          portion_label?: string | null;
          portion_price?: number | null;
          storage_type?: string | null;
          is_fresh?: boolean | null;
          details?: Json | null;
          is_active?: boolean | null;
          sort_order?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
          category_id?: string | null;
        };
        Update: {
          id?: string;
          gid?: string | null;
          name?: string | null;
          product_type?: string | null;
          farm_name?: string | null;
          crop_name?: string | null;
          source_unit?: string | null;
          portion_amount?: number | null;
          portion_unit?: string | null;
          portion_label?: string | null;
          portion_price?: number | null;
          storage_type?: string | null;
          is_fresh?: boolean | null;
          details?: Json | null;
          is_active?: boolean | null;
          sort_order?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
          category_id?: string | null;
        };
      };
      product_tags: {
        Row: {
          product_id: string;
          name: string;
        };
        Insert: {
          product_id: string;
          name: string;
        };
        Update: {
          product_id?: string;
          name?: string;
        };
      };
      tags: {
        Row: {
          name: string;
          code: string | null;
        };
        Insert: {
          name: string;
          code?: string | null;
        };
        Update: {
          name?: string;
          code?: string | null;
        };
      };
      kit_components: {
        Row: {
          kit_product_id: string;
          component_product_id: string;
          amount: number | null;
          unit: string | null;
          sort_order: number | null;
        };
        Insert: {
          kit_product_id: string;
          component_product_id: string;
          amount?: number | null;
          unit?: string | null;
          sort_order?: number | null;
        };
        Update: {
          kit_product_id?: string;
          component_product_id?: string;
          amount?: number | null;
          unit?: string | null;
          sort_order?: number | null;
        };
      };
      uploads: {
        Row: {
          id: string;
          gid: string | null;
          original_name: string | null;
          extension: string | null;
          byte_size: number | null;
          location: string | null;
          head_img: boolean | null;
          sort_order: number | null;
          page: string | null;
          external_url: string | null;
        };
        Insert: {
          id: string;
          gid?: string | null;
          original_name?: string | null;
          extension?: string | null;
          byte_size?: number | null;
          location?: string | null;
          head_img?: boolean | null;
          sort_order?: number | null;
          page?: string | null;
          external_url?: string | null;
        };
        Update: {
          id?: string;
          gid?: string | null;
          original_name?: string | null;
          extension?: string | null;
          byte_size?: number | null;
          location?: string | null;
          head_img?: boolean | null;
          sort_order?: number | null;
          page?: string | null;
          external_url?: string | null;
        };
      };
      pods: {
        Row: {
          id: string;
          pod_no: number | null;
          capacity: number | null;
          recruit_deadline_date: string | null;
          recruit_deadline: string | null;
          portion_label: string | null;
          member_count: number | null;
          status: string | null;
          matched_at: string | null;
          payment_due_at: string | null;
          confirmed_at: string | null;
          cancelled_at: string | null;
          cancel_reason: string | null;
          created_at: string | null;
          product_id: string | null;
        };
        Insert: {
          id: string;
          pod_no?: number | null;
          capacity?: number | null;
          recruit_deadline_date?: string | null;
          recruit_deadline?: string | null;
          portion_label?: string | null;
          member_count?: number | null;
          status?: string | null;
          matched_at?: string | null;
          payment_due_at?: string | null;
          confirmed_at?: string | null;
          cancelled_at?: string | null;
          cancel_reason?: string | null;
          created_at?: string | null;
          product_id?: string | null;
        };
        Update: {
          id?: string;
          pod_no?: number | null;
          capacity?: number | null;
          recruit_deadline_date?: string | null;
          recruit_deadline?: string | null;
          portion_label?: string | null;
          member_count?: number | null;
          status?: string | null;
          matched_at?: string | null;
          payment_due_at?: string | null;
          confirmed_at?: string | null;
          cancelled_at?: string | null;
          cancel_reason?: string | null;
          created_at?: string | null;
          product_id?: string | null;
        };
      };
      pod_applications: {
        Row: {
          id: number;
          request_type: boolean | null;
          status: string | null;
          reject_reason: string | null;
          idempotency_key: string | null;
          requested_at: string | null;
          processed_at: string | null;
          product_id: string | null;
          requested_pod_id: string | null;
          profile_id: string | null;
        };
        Insert: {
          id?: number;
          request_type?: boolean | null;
          status?: string | null;
          reject_reason?: string | null;
          idempotency_key?: string | null;
          requested_at?: string | null;
          processed_at?: string | null;
          product_id?: string | null;
          requested_pod_id?: string | null;
          profile_id?: string | null;
        };
        Update: {
          id?: number;
          request_type?: boolean | null;
          status?: string | null;
          reject_reason?: string | null;
          idempotency_key?: string | null;
          requested_at?: string | null;
          processed_at?: string | null;
          product_id?: string | null;
          requested_pod_id?: string | null;
          profile_id?: string | null;
        };
      };
      pod_participants: {
        Row: {
          id: number;
          status: string | null;
          is_active: boolean | null;
          refund_required: boolean | null;
          applied_at: string | null;
          payment_ready_at: string | null;
          paid_at: string | null;
          cancelled_at: string | null;
          ended_at: string | null;
          product_id: string | null;
          pod_id: string | null;
          application_id: number | null;
          paid_order_id: string | null;
          profile_id: string | null;
        };
        Insert: {
          id?: number;
          status?: string | null;
          is_active?: boolean | null;
          refund_required?: boolean | null;
          applied_at?: string | null;
          payment_ready_at?: string | null;
          paid_at?: string | null;
          cancelled_at?: string | null;
          ended_at?: string | null;
          product_id?: string | null;
          pod_id?: string | null;
          application_id?: number | null;
          paid_order_id?: string | null;
          profile_id?: string | null;
        };
        Update: {
          id?: number;
          status?: string | null;
          is_active?: boolean | null;
          refund_required?: boolean | null;
          applied_at?: string | null;
          payment_ready_at?: string | null;
          paid_at?: string | null;
          cancelled_at?: string | null;
          ended_at?: string | null;
          product_id?: string | null;
          pod_id?: string | null;
          application_id?: number | null;
          paid_order_id?: string | null;
          profile_id?: string | null;
        };
      };
      orders: {
        Row: {
          id: string;
          status: string | null;
          payment_mode: string | null;
          subtotal: number | null;
          base_shipping_fee: number | null;
          fresh_packaging_fee: number | null;
          shipping_fee: number | null;
          discount: number | null;
          total: number | null;
          recipient_name: string | null;
          recipient_phone: string | null;
          postal_code: string | null;
          recipient_address: string | null;
          recipient_address_detail: string | null;
          entrance_instructions: string | null;
          payment_method: string | null;
          privacy_consented_at: string | null;
          privacy_version: boolean | null;
          idempotency_key: string | null;
          created_at: string | null;
          paid_at: string | null;
          profile_id: string | null;
        };
        Insert: {
          id: string;
          status?: string | null;
          payment_mode?: string | null;
          subtotal?: number | null;
          base_shipping_fee?: number | null;
          fresh_packaging_fee?: number | null;
          shipping_fee?: number | null;
          discount?: number | null;
          total?: number | null;
          recipient_name?: string | null;
          recipient_phone?: string | null;
          postal_code?: string | null;
          recipient_address?: string | null;
          recipient_address_detail?: string | null;
          entrance_instructions?: string | null;
          payment_method?: string | null;
          privacy_consented_at?: string | null;
          privacy_version?: boolean | null;
          idempotency_key?: string | null;
          created_at?: string | null;
          paid_at?: string | null;
          profile_id?: string | null;
        };
        Update: {
          id?: string;
          status?: string | null;
          payment_mode?: string | null;
          subtotal?: number | null;
          base_shipping_fee?: number | null;
          fresh_packaging_fee?: number | null;
          shipping_fee?: number | null;
          discount?: number | null;
          total?: number | null;
          recipient_name?: string | null;
          recipient_phone?: string | null;
          postal_code?: string | null;
          recipient_address?: string | null;
          recipient_address_detail?: string | null;
          entrance_instructions?: string | null;
          payment_method?: string | null;
          privacy_consented_at?: string | null;
          privacy_version?: boolean | null;
          idempotency_key?: string | null;
          created_at?: string | null;
          paid_at?: string | null;
          profile_id?: string | null;
        };
      };
      order_items: {
        Row: {
          id: string;
          product_name: string | null;
          portion_label: string | null;
          unit_price: number | null;
          image_url: string | null;
          product_id: string | null;
          pod_id: string | null;
          participant_id: number | null;
          order_id: string | null;
        };
        Insert: {
          id: string;
          product_name?: string | null;
          portion_label?: string | null;
          unit_price?: number | null;
          image_url?: string | null;
          product_id?: string | null;
          pod_id?: string | null;
          participant_id?: number | null;
          order_id?: string | null;
        };
        Update: {
          id?: string;
          product_name?: string | null;
          portion_label?: string | null;
          unit_price?: number | null;
          image_url?: string | null;
          product_id?: string | null;
          pod_id?: string | null;
          participant_id?: number | null;
          order_id?: string | null;
        };
      };
      taste_profiles: {
        Row: {
          id: string;
          nickname: string | null;
          birth_date: string | null;
          gender: string | null;
          sunday_scene: string | null;
          fridge_state: string | null;
          element: string | null;
          recommended_product_ids: string | null;
          created_at: string | null;
          profile_id: string | null;
          survey_response_id: string | null;
          code: string | null;
        };
        Insert: {
          id: string;
          nickname?: string | null;
          birth_date?: string | null;
          gender?: string | null;
          sunday_scene?: string | null;
          fridge_state?: string | null;
          element?: string | null;
          recommended_product_ids?: string | null;
          created_at?: string | null;
          profile_id?: string | null;
          survey_response_id?: string | null;
          code?: string | null;
        };
        Update: {
          id?: string;
          nickname?: string | null;
          birth_date?: string | null;
          gender?: string | null;
          sunday_scene?: string | null;
          fridge_state?: string | null;
          element?: string | null;
          recommended_product_ids?: string | null;
          created_at?: string | null;
          profile_id?: string | null;
          survey_response_id?: string | null;
          code?: string | null;
        };
      };
      five_element: {
        Row: {
          code: string;
          hanja: string;
          year_digits: number[];
          color: string;
          tint: string;
          title: string;
          copy: string;
        };
        Insert: {
          code: string;
          hanja: string;
          year_digits: number[];
          color: string;
          tint: string;
          title: string;
          copy: string;
        };
        Update: {
          code?: string;
          hanja?: string;
          year_digits?: number[];
          color?: string;
          tint?: string;
          title?: string;
          copy?: string;
        };
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
  };
};

/** Database 테이블 Row 타입 헬퍼 — 예: RowOf<'products'> */
export type RowOf<Table extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][Table]['Row'];
export type InsertOf<Table extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][Table]['Insert'];
export type UpdateOf<Table extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][Table]['Update'];
