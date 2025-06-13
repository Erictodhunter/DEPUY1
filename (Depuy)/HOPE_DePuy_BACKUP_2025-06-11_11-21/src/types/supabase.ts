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
      acm_sync_logs: {
        Row: {
          id: number
          sync_type: string
          sync_direction: Database["public"]["Enums"]["sync_direction"]
          status: Database["public"]["Enums"]["sync_status_enum"]
          started_at: string
          completed_at: string | null
          records_processed: number
          records_success: number
          records_failed: number
          error_details: Json | null
          sync_data: Json | null
          created_at: string
          updated_at: string
          created_by: number | null
          updated_by: number | null
        }
        Insert: {
          sync_type: string
          sync_direction: Database["public"]["Enums"]["sync_direction"]
          status?: Database["public"]["Enums"]["sync_status_enum"]
          started_at?: string
          completed_at?: string | null
          records_processed?: number
          records_success?: number
          records_failed?: number
          error_details?: Json | null
          sync_data?: Json | null
          created_by?: number | null
          updated_by?: number | null
        }
        Update: {
          sync_type?: string
          sync_direction?: Database["public"]["Enums"]["sync_direction"]
          status?: Database["public"]["Enums"]["sync_status_enum"]
          started_at?: string
          completed_at?: string | null
          records_processed?: number
          records_success?: number
          records_failed?: number
          error_details?: Json | null
          sync_data?: Json | null
          created_by?: number | null
          updated_by?: number | null
        }
      }
      ai_insights: {
        Row: {
          id: number
          insight_type: string
          title: string
          description: string | null
          confidence_score: number | null
          hospital_id: number | null
          surgeon_id: number | null
          procedure_id: number | null
          data_points: Json
          recommendations: Json
          is_actionable: boolean
          is_viewed: boolean
          viewed_by: number | null
          viewed_at: string | null
          expires_at: string | null
          created_at: string
          updated_at: string
          created_by: number | null
          updated_by: number | null
        }
        Insert: {
          insight_type: string
          title: string
          description?: string | null
          confidence_score?: number | null
          hospital_id?: number | null
          surgeon_id?: number | null
          procedure_id?: number | null
          data_points?: Json
          recommendations?: Json
          is_actionable?: boolean
          is_viewed?: boolean
          viewed_by?: number | null
          viewed_at?: string | null
          expires_at?: string | null
          created_by?: number | null
          updated_by?: number | null
        }
        Update: {
          insight_type?: string
          title?: string
          description?: string | null
          confidence_score?: number | null
          hospital_id?: number | null
          surgeon_id?: number | null
          procedure_id?: number | null
          data_points?: Json
          recommendations?: Json
          is_actionable?: boolean
          is_viewed?: boolean
          viewed_by?: number | null
          viewed_at?: string | null
          expires_at?: string | null
          created_by?: number | null
          updated_by?: number | null
        }
      }
      ai_kit_recommendations: {
        Row: {
          id: number
          surgery_case_id: number
          recommended_kit_id: number | null
          recommended_products: Json
          confidence_score: number | null
          reasoning: string | null
          cost_savings_estimate: number | null
          efficiency_improvement_estimate: number | null
          is_accepted: boolean | null
          accepted_by: number | null
          accepted_at: string | null
          feedback: string | null
          created_at: string
          updated_at: string
          created_by: number | null
          updated_by: number | null
        }
        Insert: {
          surgery_case_id: number
          recommended_kit_id?: number | null
          recommended_products?: Json
          confidence_score?: number | null
          reasoning?: string | null
          cost_savings_estimate?: number | null
          efficiency_improvement_estimate?: number | null
          is_accepted?: boolean | null
          accepted_by?: number | null
          accepted_at?: string | null
          feedback?: string | null
          created_by?: number | null
          updated_by?: number | null
        }
        Update: {
          surgery_case_id?: number
          recommended_kit_id?: number | null
          recommended_products?: Json
          confidence_score?: number | null
          reasoning?: string | null
          cost_savings_estimate?: number | null
          efficiency_improvement_estimate?: number | null
          is_accepted?: boolean | null
          accepted_by?: number | null
          accepted_at?: string | null
          feedback?: string | null
          created_by?: number | null
          updated_by?: number | null
        }
      }
      analytics_events: {
        Row: {
          id: number
          event_name: string
          user_id: number | null
          session_id: string | null
          properties: Json
          page_url: string | null
          referrer: string | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          event_name: string
          user_id?: number | null
          session_id?: string | null
          properties?: Json
          page_url?: string | null
          referrer?: string | null
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          event_name?: string
          user_id?: number | null
          session_id?: string | null
          properties?: Json
          page_url?: string | null
          referrer?: string | null
          ip_address?: string | null
          user_agent?: string | null
        }
      }
      audit_logs: {
        Row: {
          id: number
          user_id: number | null
          action: string
          table_name: string
          record_id: number | null
          old_values: Json | null
          new_values: Json | null
          ip_address: string | null
          user_agent: string | null
          session_id: string | null
          created_at: string
        }
        Insert: {
          user_id?: number | null
          action: string
          table_name: string
          record_id?: number | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          session_id?: string | null
        }
        Update: {
          user_id?: number | null
          action?: string
          table_name?: string
          record_id?: number | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          session_id?: string | null
        }
      }
      backorder_reports: {
        Row: {
          id: number
          report_date: string
          product_id: number
          hospital_id: number
          quantity_backordered: number
          estimated_arrival_date: string | null
          priority_level: string | null
          affected_cases_count: number
          resolved_at: string | null
          created_at: string
          updated_at: string
          created_by: number | null
          updated_by: number | null
        }
        Insert: {
          report_date: string
          product_id: number
          hospital_id: number
          quantity_backordered: number
          estimated_arrival_date?: string | null
          priority_level?: string | null
          affected_cases_count?: number
          resolved_at?: string | null
          created_by?: number | null
          updated_by?: number | null
        }
        Update: {
          report_date?: string
          product_id?: number
          hospital_id?: number
          quantity_backordered?: number
          estimated_arrival_date?: string | null
          priority_level?: string | null
          affected_cases_count?: number
          resolved_at?: string | null
          created_by?: number | null
          updated_by?: number | null
        }
      }
      case_assets: {
        Row: {
          id: number
          surgery_case_id: number
          product_id: number
          inventory_id: number | null
          quantity_planned: number
          quantity_used: number
          unit_cost: number | null
          total_cost: number | null
          is_returned: boolean
          returned_quantity: number
          notes: string | null
          created_at: string
          updated_at: string
          created_by: number | null
          updated_by: number | null
        }
        Insert: {
          surgery_case_id: number
          product_id: number
          inventory_id?: number | null
          quantity_planned?: number
          quantity_used?: number
          unit_cost?: number | null
          total_cost?: number | null
          is_returned?: boolean
          returned_quantity?: number
          notes?: string | null
          created_by?: number | null
          updated_by?: number | null
        }
        Update: {
          surgery_case_id?: number
          product_id?: number
          inventory_id?: number | null
          quantity_planned?: number
          quantity_used?: number
          unit_cost?: number | null
          total_cost?: number | null
          is_returned?: boolean
          returned_quantity?: number
          notes?: string | null
          created_by?: number | null
          updated_by?: number | null
        }
      }
      case_flags: {
        Row: {
          id: number
          surgery_case_id: number
          flag_id: number
          created_at: string
          created_by: number | null
        }
        Insert: {
          surgery_case_id: number
          flag_id: number
          created_by?: number | null
        }
        Update: {
          surgery_case_id?: number
          flag_id?: number
          created_by?: number | null
        }
      }
      daily_sales: {
        Row: {
          id: number
          sale_date: string
          hospital_id: number
          manufacturer_id: number
          region_id: number
          sales_rep_id: number | null
          total_revenue: number
          total_cost: number
          gross_profit: number
          units_sold: number
          cases_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          sale_date: string
          hospital_id: number
          manufacturer_id: number
          region_id: number
          sales_rep_id?: number | null
          total_revenue?: number
          total_cost?: number
          gross_profit?: number
          units_sold?: number
          cases_count?: number
        }
        Update: {
          sale_date?: string
          hospital_id?: number
          manufacturer_id?: number
          region_id?: number
          sales_rep_id?: number | null
          total_revenue?: number
          total_cost?: number
          gross_profit?: number
          units_sold?: number
          cases_count?: number
        }
      }
      expiring_reports: {
        Row: {
          id: number
          report_date: string
          inventory_id: number
          days_until_expiration: number
          quantity: number
          estimated_value: number | null
          action_taken: string | null
          action_date: string | null
          created_at: string
          updated_at: string
          created_by: number | null
          updated_by: number | null
        }
        Insert: {
          report_date: string
          inventory_id: number
          days_until_expiration: number
          quantity: number
          estimated_value?: number | null
          action_taken?: string | null
          action_date?: string | null
          created_by?: number | null
          updated_by?: number | null
        }
        Update: {
          report_date?: string
          inventory_id?: number
          days_until_expiration?: number
          quantity?: number
          estimated_value?: number | null
          action_taken?: string | null
          action_date?: string | null
          created_by?: number | null
          updated_by?: number | null
        }
      }
      flags: {
        Row: {
          id: number
          title: string
          description: string | null
          flag_type: string
          priority: Database["public"]["Enums"]["flag_priority_enum"]
          status: Database["public"]["Enums"]["flag_status_enum"]
          hospital_id: number | null
          assigned_to: number | null
          due_date: string | null
          resolved_at: string | null
          resolved_by: number | null
          created_at: string
          updated_at: string
          created_by: number | null
          updated_by: number | null
        }
        Insert: {
          title: string
          description?: string | null
          flag_type: string
          priority?: Database["public"]["Enums"]["flag_priority_enum"]
          status?: Database["public"]["Enums"]["flag_status_enum"]
          hospital_id?: number | null
          assigned_to?: number | null
          due_date?: string | null
          resolved_at?: string | null
          resolved_by?: number | null
          created_by?: number | null
          updated_by?: number | null
        }
        Update: {
          title?: string
          description?: string | null
          flag_type?: string
          priority?: Database["public"]["Enums"]["flag_priority_enum"]
          status?: Database["public"]["Enums"]["flag_status_enum"]
          hospital_id?: number | null
          assigned_to?: number | null
          due_date?: string | null
          resolved_at?: string | null
          resolved_by?: number | null
          created_by?: number | null
          updated_by?: number | null
        }
      }
      general_ledger_entries: {
        Row: {
          id: number
          entry_date: string
          account_code: string
          account_name: string
          description: string | null
          debit_amount: number
          credit_amount: number
          reference_type: string | null
          reference_id: number | null
          hospital_id: number | null
          created_at: string
          updated_at: string
          created_by: number | null
          updated_by: number | null
        }
        Insert: {
          entry_date: string
          account_code: string
          account_name: string
          description?: string | null
          debit_amount?: number
          credit_amount?: number
          reference_type?: string | null
          reference_id?: number | null
          hospital_id?: number | null
          created_by?: number | null
          updated_by?: number | null
        }
        Update: {
          entry_date?: string
          account_code?: string
          account_name?: string
          description?: string | null
          debit_amount?: number
          credit_amount?: number
          reference_type?: string | null
          reference_id?: number | null
          hospital_id?: number | null
          created_by?: number | null
          updated_by?: number | null
        }
      }
      hospital_systems: {
        Row: {
          id: number
          name: string
          headquarters_address: Json
          contact_info: Json
          region_id: number
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: number | null
          updated_by: number | null
        }
        Insert: {
          name: string
          headquarters_address?: Json
          contact_info?: Json
          region_id: number
          is_active?: boolean
          created_by?: number | null
          updated_by?: number | null
        }
        Update: {
          name?: string
          headquarters_address?: Json
          contact_info?: Json
          region_id?: number
          is_active?: boolean
          created_by?: number | null
          updated_by?: number | null
        }
      }
      hospitals: {
        Row: {
          id: number
          name: string
          hospital_system_id: number | null
          address: Json
          contact_info: Json
          region_id: number
          bed_count: number | null
          trauma_level: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: number | null
          updated_by: number | null
        }
        Insert: {
          name: string
          hospital_system_id?: number | null
          address?: Json
          contact_info?: Json
          region_id: number
          bed_count?: number | null
          trauma_level?: string | null
          is_active?: boolean
          created_by?: number | null
          updated_by?: number | null
        }
        Update: {
          name?: string
          hospital_system_id?: number | null
          address?: Json
          contact_info?: Json
          region_id?: number
          bed_count?: number | null
          trauma_level?: string | null
          is_active?: boolean
          created_by?: number | null
          updated_by?: number | null
        }
      }
      inventory: {
        Row: {
          id: number
          product_id: number
          hospital_id: number
          lot_number: string | null
          serial_number: string | null
          expiration_date: string | null
          quantity: number
          reserved_quantity: number
          status: Database["public"]["Enums"]["inventory_status_enum"]
          location_code: string | null
          last_counted_at: string | null
          created_at: string
          updated_at: string
          created_by: number | null
          updated_by: number | null
        }
        Insert: {
          product_id: number
          hospital_id: number
          lot_number?: string | null
          serial_number?: string | null
          expiration_date?: string | null
          quantity?: number
          reserved_quantity?: number
          status?: Database["public"]["Enums"]["inventory_status_enum"]
          location_code?: string | null
          last_counted_at?: string | null
          created_by?: number | null
          updated_by?: number | null
        }
        Update: {
          product_id?: number
          hospital_id?: number
          lot_number?: string | null
          serial_number?: string | null
          expiration_date?: string | null
          quantity?: number
          reserved_quantity?: number
          status?: Database["public"]["Enums"]["inventory_status_enum"]
          location_code?: string | null
          last_counted_at?: string | null
          created_by?: number | null
          updated_by?: number | null
        }
      }
      invoices: {
        Row: {
          id: number
          invoice_number: string
          purchase_order_id: number | null
          sales_order_id: number | null
          hospital_id: number
          invoice_date: string
          due_date: string
          subtotal: number
          tax_amount: number
          discount_amount: number
          total_amount: number
          paid_amount: number
          balance_due: number
          status: Database["public"]["Enums"]["payment_status_enum"]
          notes: string | null
          created_at: string
          updated_at: string
          created_by: number | null
          updated_by: number | null
        }
        Insert: {
          invoice_number: string
          purchase_order_id?: number | null
          sales_order_id?: number | null
          hospital_id: number
          invoice_date: string
          due_date: string
          subtotal: number
          tax_amount?: number
          discount_amount?: number
          total_amount: number
          paid_amount?: number
          balance_due: number
          status?: Database["public"]["Enums"]["payment_status_enum"]
          notes?: string | null
          created_by?: number | null
          updated_by?: number | null
        }
        Update: {
          invoice_number?: string
          purchase_order_id?: number | null
          sales_order_id?: number | null
          hospital_id?: number
          invoice_date?: string
          due_date?: string
          subtotal?: number
          tax_amount?: number
          discount_amount?: number
          total_amount?: number
          paid_amount?: number
          balance_due?: number
          status?: Database["public"]["Enums"]["payment_status_enum"]
          notes?: string | null
          created_by?: number | null
          updated_by?: number | null
        }
      }
      kit_items: {
        Row: {
          id: number
          kit_id: number
          product_id: number
          quantity: number
          is_required: boolean
          sequence_order: number | null
          created_at: string
          updated_at: string
          created_by: number | null
          updated_by: number | null
        }
        Insert: {
          kit_id: number
          product_id: number
          quantity?: number
          is_required?: boolean
          sequence_order?: number | null
          created_by?: number | null
          updated_by?: number | null
        }
        Update: {
          kit_id?: number
          product_id?: number
          quantity?: number
          is_required?: boolean
          sequence_order?: number | null
          created_by?: number | null
          updated_by?: number | null
        }
      }
      kits: {
        Row: {
          id: number
          name: string
          kit_code: string
          procedure_id: number | null
          description: string | null
          is_standard: boolean
          total_cost: number
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: number | null
          updated_by: number | null
        }
        Insert: {
          name: string
          kit_code: string
          procedure_id?: number | null
          description?: string | null
          is_standard?: boolean
          total_cost?: number
          is_active?: boolean
          created_by?: number | null
          updated_by?: number | null
        }
        Update: {
          name?: string
          kit_code?: string
          procedure_id?: number | null
          description?: string | null
          is_standard?: boolean
          total_cost?: number
          is_active?: boolean
          created_by?: number | null
          updated_by?: number | null
        }
      }
      manufacturers: {
        Row: {
          id: number
          name: string
          code: string
          contact_info: Json
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: number | null
          updated_by: number | null
        }
        Insert: {
          name: string
          code: string
          contact_info?: Json
          is_active?: boolean
          created_by?: number | null
          updated_by?: number | null
        }
        Update: {
          name?: string
          code?: string
          contact_info?: Json
          is_active?: boolean
          created_by?: number | null
          updated_by?: number | null
        }
      }
      opportunities: {
        Row: {
          id: number
          title: string
          description: string | null
          hospital_id: number
          surgeon_id: number | null
          sales_rep_id: number | null
          estimated_value: number | null
          probability_percentage: number | null
          expected_close_date: string | null
          stage: string | null
          status: string
          last_contact_date: string | null
          next_action: string | null
          notes: string | null
          created_at: string
          updated_at: string
          created_by: number | null
          updated_by: number | null
        }
        Insert: {
          title: string
          description?: string | null
          hospital_id: number
          surgeon_id?: number | null
          sales_rep_id?: number | null
          estimated_value?: number | null
          probability_percentage?: number | null
          expected_close_date?: string | null
          stage?: string | null
          status?: string
          last_contact_date?: string | null
          next_action?: string | null
          notes?: string | null
          created_by?: number | null
          updated_by?: number | null
        }
        Update: {
          title?: string
          description?: string | null
          hospital_id?: number
          surgeon_id?: number | null
          sales_rep_id?: number | null
          estimated_value?: number | null
          probability_percentage?: number | null
          expected_close_date?: string | null
          stage?: string | null
          status?: string
          last_contact_date?: string | null
          next_action?: string | null
          notes?: string | null
          created_by?: number | null
          updated_by?: number | null
        }
      }
      order_lines: {
        Row: {
          id: number
          purchase_order_id: number | null
          sales_order_id: number | null
          product_id: number
          quantity: number
          unit_price: number
          line_total: number
          discount_amount: number
          notes: string | null
          created_at: string
          updated_at: string
          created_by: number | null
          updated_by: number | null
        }
        Insert: {
          purchase_order_id?: number | null
          sales_order_id?: number | null
          product_id: number
          quantity: number
          unit_price: number
          line_total: number
          discount_amount?: number
          notes?: string | null
          created_by?: number | null
          updated_by?: number | null
        }
        Update: {
          purchase_order_id?: number | null
          sales_order_id?: number | null
          product_id?: number
          quantity?: number
          unit_price?: number
          line_total?: number
          discount_amount?: number
          notes?: string | null
          created_by?: number | null
          updated_by?: number | null
        }
      }
      payments: {
        Row: {
          id: number
          payment_number: string
          invoice_id: number
          payment_date: string
          amount: number
          payment_method: Database["public"]["Enums"]["payment_method_enum"]
          reference_number: string | null
          status: Database["public"]["Enums"]["payment_status_enum"]
          notes: string | null
          created_at: string
          updated_at: string
          created_by: number | null
          updated_by: number | null
        }
        Insert: {
          payment_number: string
          invoice_id: number
          payment_date: string
          amount: number
          payment_method: Database["public"]["Enums"]["payment_method_enum"]
          reference_number?: string | null
          status?: Database["public"]["Enums"]["payment_status_enum"]
          notes?: string | null
          created_by?: number | null
          updated_by?: number | null
        }
        Update: {
          payment_number?: string
          invoice_id?: number
          payment_date?: string
          amount?: number
          payment_method?: Database["public"]["Enums"]["payment_method_enum"]
          reference_number?: string | null
          status?: Database["public"]["Enums"]["payment_status_enum"]
          notes?: string | null
          created_by?: number | null
          updated_by?: number | null
        }
      }
      procedures: {
        Row: {
          id: number
          name: string
          code: string | null
          procedure_type: Database["public"]["Enums"]["procedure_type_enum"]
          description: string | null
          estimated_duration_minutes: number | null
          complexity_score: number | null
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: number | null
          updated_by: number | null
        }
        Insert: {
          name: string
          code?: string | null
          procedure_type: Database["public"]["Enums"]["procedure_type_enum"]
          description?: string | null
          estimated_duration_minutes?: number | null
          complexity_score?: number | null
          is_active?: boolean
          created_by?: number | null
          updated_by?: number | null
        }
        Update: {
          name?: string
          code?: string | null
          procedure_type?: Database["public"]["Enums"]["procedure_type_enum"]
          description?: string | null
          estimated_duration_minutes?: number | null
          complexity_score?: number | null
          is_active?: boolean
          created_by?: number | null
          updated_by?: number | null
        }
      }
      products: {
        Row: {
          id: number
          sku: string
          name: string
          description: string | null
          manufacturer_id: number
          category: string | null
          subcategory: string | null
          unit_cost: number | null
          list_price: number | null
          is_kit: boolean
          is_consignment: boolean
          shelf_life_days: number | null
          storage_requirements: Json
          regulatory_info: Json
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: number | null
          updated_by: number | null
        }
        Insert: {
          sku: string
          name: string
          description?: string | null
          manufacturer_id: number
          category?: string | null
          subcategory?: string | null
          unit_cost?: number | null
          list_price?: number | null
          is_kit?: boolean
          is_consignment?: boolean
          shelf_life_days?: number | null
          storage_requirements?: Json
          regulatory_info?: Json
          is_active?: boolean
          created_by?: number | null
          updated_by?: number | null
        }
        Update: {
          sku?: string
          name?: string
          description?: string | null
          manufacturer_id?: number
          category?: string | null
          subcategory?: string | null
          unit_cost?: number | null
          list_price?: number | null
          is_kit?: boolean
          is_consignment?: boolean
          shelf_life_days?: number | null
          storage_requirements?: Json
          regulatory_info?: Json
          is_active?: boolean
          created_by?: number | null
          updated_by?: number | null
        }
      }
      purchase_orders: {
        Row: {
          id: number
          po_number: string
          hospital_id: number
          manufacturer_id: number
          status: Database["public"]["Enums"]["order_status_enum"]
          order_date: string
          expected_delivery_date: string | null
          actual_delivery_date: string | null
          total_amount: number
          notes: string | null
          created_at: string
          updated_at: string
          created_by: number | null
          updated_by: number | null
        }
        Insert: {
          po_number: string
          hospital_id: number
          manufacturer_id: number
          status?: Database["public"]["Enums"]["order_status_enum"]
          order_date: string
          expected_delivery_date?: string | null
          actual_delivery_date?: string | null
          total_amount?: number
          notes?: string | null
          created_by?: number | null
          updated_by?: number | null
        }
        Update: {
          po_number?: string
          hospital_id?: number
          manufacturer_id?: number
          status?: Database["public"]["Enums"]["order_status_enum"]
          order_date?: string
          expected_delivery_date?: string | null
          actual_delivery_date?: string | null
          total_amount?: number
          notes?: string | null
          created_by?: number | null
          updated_by?: number | null
        }
      }
      reconciliations: {
        Row: {
          id: number
          surgery_case_id: number
          reconciled_by: number | null
          reconciled_at: string
          planned_total: number
          actual_total: number
          variance_amount: number
          variance_percentage: number | null
          is_approved: boolean
          approved_by: number | null
          approved_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
          created_by: number | null
          updated_by: number | null
        }
        Insert: {
          surgery_case_id: number
          reconciled_by?: number | null
          reconciled_at?: string
          planned_total: number
          actual_total: number
          variance_amount: number
          variance_percentage?: number | null
          is_approved?: boolean
          approved_by?: number | null
          approved_at?: string | null
          notes?: string | null
          created_by?: number | null
          updated_by?: number | null
        }
        Update: {
          surgery_case_id?: number
          reconciled_by?: number | null
          reconciled_at?: string
          planned_total?: number
          actual_total?: number
          variance_amount?: number
          variance_percentage?: number | null
          is_approved?: boolean
          approved_by?: number | null
          approved_at?: string | null
          notes?: string | null
          created_by?: number | null
          updated_by?: number | null
        }
      }
      regions: {
        Row: {
          id: number
          name: string
          code: string
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: number | null
          updated_by: number | null
        }
        Insert: {
          name: string
          code: string
          description?: string | null
          is_active?: boolean
          created_by?: number | null
          updated_by?: number | null
        }
        Update: {
          name?: string
          code?: string
          description?: string | null
          is_active?: boolean
          created_by?: number | null
          updated_by?: number | null
        }
      }
      rep_teams: {
        Row: {
          id: number
          name: string
          region_id: number
          team_lead_id: number | null
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: number | null
          updated_by: number | null
        }
        Insert: {
          name: string
          region_id: number
          team_lead_id?: number | null
          description?: string | null
          is_active?: boolean
          created_by?: number | null
          updated_by?: number | null
        }
        Update: {
          name?: string
          region_id?: number
          team_lead_id?: number | null
          description?: string | null
          is_active?: boolean
          created_by?: number | null
          updated_by?: number | null
        }
      }
      roles: {
        Row: {
          id: number
          name: string
          role_type: Database["public"]["Enums"]["user_role_enum"]
          description: string | null
          permissions: Json
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: number | null
          updated_by: number | null
        }
        Insert: {
          name: string
          role_type: Database["public"]["Enums"]["user_role_enum"]
          description?: string | null
          permissions?: Json
          is_active?: boolean
          created_by?: number | null
          updated_by?: number | null
        }
        Update: {
          name?: string
          role_type?: Database["public"]["Enums"]["user_role_enum"]
          description?: string | null
          permissions?: Json
          is_active?: boolean
          created_by?: number | null
          updated_by?: number | null
        }
      }
      sales_orders: {
        Row: {
          id: number
          so_number: string
          hospital_id: number
          surgeon_id: number | null
          sales_rep_id: number | null
          status: Database["public"]["Enums"]["order_status_enum"]
          order_date: string
          requested_delivery_date: string | null
          actual_delivery_date: string | null
          total_amount: number
          discount_amount: number
          tax_amount: number
          notes: string | null
          created_at: string
          updated_at: string
          created_by: number | null
          updated_by: number | null
        }
        Insert: {
          so_number: string
          hospital_id: number
          surgeon_id?: number | null
          sales_rep_id?: number | null
          status?: Database["public"]["Enums"]["order_status_enum"]
          order_date: string
          requested_delivery_date?: string | null
          actual_delivery_date?: string | null
          total_amount?: number
          discount_amount?: number
          tax_amount?: number
          notes?: string | null
          created_by?: number | null
          updated_by?: number | null
        }
        Update: {
          so_number?: string
          hospital_id?: number
          surgeon_id?: number | null
          sales_rep_id?: number | null
          status?: Database["public"]["Enums"]["order_status_enum"]
          order_date?: string
          requested_delivery_date?: string | null
          actual_delivery_date?: string | null
          total_amount?: number
          discount_amount?: number
          tax_amount?: number
          notes?: string | null
          created_by?: number | null
          updated_by?: number | null
        }
      }
      saved_views: {
        Row: {
          id: number
          name: string
          description: string | null
          view_type: string
          user_id: number
          filters: Json
          columns: Json
          sort_config: Json
          is_shared: boolean
          shared_with: number[] | null
          created_at: string
          updated_at: string
          created_by: number | null
          updated_by: number | null
        }
        Insert: {
          name: string
          description?: string | null
          view_type: string
          user_id: number
          filters?: Json
          columns?: Json
          sort_config?: Json
          is_shared?: boolean
          shared_with?: number[] | null
          created_by?: number | null
          updated_by?: number | null
        }
        Update: {
          name?: string
          description?: string | null
          view_type?: string
          user_id?: number
          filters?: Json
          columns?: Json
          sort_config?: Json
          is_shared?: boolean
          shared_with?: number[] | null
          created_by?: number | null
          updated_by?: number | null
        }
      }
      scan_logs: {
        Row: {
          id: number
          surgery_case_id: number | null
          product_id: number
          inventory_id: number | null
          scanned_by: number | null
          scanned_at: string
          scan_type: string
          quantity: number
          lot_number: string | null
          serial_number: string | null
          expiration_date: string | null
          location: string | null
          notes: string | null
          created_at: string
          updated_at: string
          created_by: number | null
          updated_by: number | null
        }
        Insert: {
          surgery_case_id?: number | null
          product_id: number
          inventory_id?: number | null
          scanned_by?: number | null
          scanned_at?: string
          scan_type: string
          quantity?: number
          lot_number?: string | null
          serial_number?: string | null
          expiration_date?: string | null
          location?: string | null
          notes?: string | null
          created_by?: number | null
          updated_by?: number | null
        }
        Update: {
          surgery_case_id?: number | null
          product_id?: number
          inventory_id?: number | null
          scanned_by?: number | null
          scanned_at?: string
          scan_type?: string
          quantity?: number
          lot_number?: string | null
          serial_number?: string | null
          expiration_date?: string | null
          location?: string | null
          notes?: string | null
          created_by?: number | null
          updated_by?: number | null
        }
      }
      surgeons: {
        Row: {
          id: number
          first_name: string
          last_name: string
          npi: string | null
          specialties: string[] | null
          hospital_id: number
          contact_info: Json
          preferences: Json
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: number | null
          updated_by: number | null
        }
        Insert: {
          first_name: string
          last_name: string
          npi?: string | null
          specialties?: string[] | null
          hospital_id: number
          contact_info?: Json
          preferences?: Json
          is_active?: boolean
          created_by?: number | null
          updated_by?: number | null
        }
        Update: {
          first_name?: string
          last_name?: string
          npi?: string | null
          specialties?: string[] | null
          hospital_id?: number
          contact_info?: Json
          preferences?: Json
          is_active?: boolean
          created_by?: number | null
          updated_by?: number | null
        }
      }
      surgery_cases: {
        Row: {
          id: number
          case_number: string
          surgeon_id: number
          hospital_id: number
          procedure_id: number
          patient_identifier: string | null
          scheduled_at: string
          actual_start_time: string | null
          actual_end_time: string | null
          status: Database["public"]["Enums"]["surgery_case_status_enum"]
          operating_room: string | null
          estimated_cost: number | null
          actual_cost: number | null
          notes: string | null
          region_id: number | null
          created_at: string
          updated_at: string
          created_by: number | null
          updated_by: number | null
        }
        Insert: {
          case_number: string
          surgeon_id: number
          hospital_id: number
          procedure_id: number
          patient_identifier?: string | null
          scheduled_at: string
          actual_start_time?: string | null
          actual_end_time?: string | null
          status?: Database["public"]["Enums"]["surgery_case_status_enum"]
          operating_room?: string | null
          estimated_cost?: number | null
          actual_cost?: number | null
          notes?: string | null
          region_id?: number | null
          created_by?: number | null
          updated_by?: number | null
        }
        Update: {
          case_number?: string
          surgeon_id?: number
          hospital_id?: number
          procedure_id?: number
          patient_identifier?: string | null
          scheduled_at?: string
          actual_start_time?: string | null
          actual_end_time?: string | null
          status?: Database["public"]["Enums"]["surgery_case_status_enum"]
          operating_room?: string | null
          estimated_cost?: number | null
          actual_cost?: number | null
          notes?: string | null
          region_id?: number | null
          created_by?: number | null
          updated_by?: number | null
        }
      }
      users: {
        Row: {
          id: number
          email: string
          password_hash: string
          first_name: string
          last_name: string
          phone: string | null
          role_id: number
          rep_team_id: number | null
          region_id: number | null
          is_active: boolean
          last_login_at: string | null
          created_at: string
          updated_at: string
          created_by: number | null
          updated_by: number | null
        }
        Insert: {
          email: string
          password_hash: string
          first_name: string
          last_name: string
          phone?: string | null
          role_id: number
          rep_team_id?: number | null
          region_id?: number | null
          is_active?: boolean
          last_login_at?: string | null
          created_by?: number | null
          updated_by?: number | null
        }
        Update: {
          email?: string
          password_hash?: string
          first_name?: string
          last_name?: string
          phone?: string | null
          role_id?: number
          rep_team_id?: number | null
          region_id?: number | null
          is_active?: boolean
          last_login_at?: string | null
          created_by?: number | null
          updated_by?: number | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_region_id: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_user_rep_team_id: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      flag_priority_enum: "low" | "medium" | "high" | "critical"
      flag_status_enum: "open" | "in_progress" | "resolved" | "closed"
      inventory_status_enum: "available" | "reserved" | "allocated" | "shipped" | "expired" | "damaged" | "recalled" | "quarantined"
      order_status_enum: "draft" | "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "completed" | "cancelled" | "returned"
      payment_method_enum: "credit_card" | "bank_transfer" | "check" | "cash" | "net_terms"
      payment_status_enum: "pending" | "processing" | "completed" | "failed" | "refunded" | "cancelled"
      procedure_type_enum: "knee" | "hip" | "shoulder" | "spine" | "trauma" | "sports_medicine" | "other"
      surgery_case_status_enum: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "postponed" | "no_show"
      sync_direction: "inbound" | "outbound" | "bidirectional"
      sync_status_enum: "pending" | "in_progress" | "completed" | "failed" | "cancelled"
      user_role_enum: "super_admin" | "admin" | "manager" | "sales_rep" | "inventory_clerk" | "surgeon" | "hospital_admin" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
