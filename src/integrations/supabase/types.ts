Need to install the following packages:
supabase@2.76.17
Ok to proceed? (y) 
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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      achievement_types: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      admin_permissions: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          permission_key: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          permission_key: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          permission_key?: string
        }
        Relationships: []
      }
      admin_program_documents: {
        Row: {
          created_at: string | null
          day_of_week: number
          id: string
          library_document_id: string
          notes: string | null
          order_in_day: number | null
          program_id: string
          week_number: number
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          id?: string
          library_document_id: string
          notes?: string | null
          order_in_day?: number | null
          program_id: string
          week_number: number
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          id?: string
          library_document_id?: string
          notes?: string | null
          order_in_day?: number | null
          program_id?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "admin_program_documents_library_document_id_fkey"
            columns: ["library_document_id"]
            isOneToOne: false
            referencedRelation: "library_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_program_documents_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "admin_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_program_evolutions: {
        Row: {
          created_at: string | null
          day_of_week: number
          id: string
          notes: string | null
          order_in_day: number | null
          program_id: string
          week_number: number
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          id?: string
          notes?: string | null
          order_in_day?: number | null
          program_id: string
          week_number: number
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          id?: string
          notes?: string | null
          order_in_day?: number | null
          program_id?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "admin_program_evolutions_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "admin_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_program_exercises: {
        Row: {
          created_at: string
          day_of_week: number
          exercise_id: number
          id: string
          notes: string | null
          order_in_day: number
          program_id: string
          reps_max: number | null
          reps_min: number | null
          rest_seconds: number | null
          sets: number | null
          week_number: number
        }
        Insert: {
          created_at?: string
          day_of_week: number
          exercise_id: number
          id?: string
          notes?: string | null
          order_in_day?: number
          program_id: string
          reps_max?: number | null
          reps_min?: number | null
          rest_seconds?: number | null
          sets?: number | null
          week_number: number
        }
        Update: {
          created_at?: string
          day_of_week?: number
          exercise_id?: number
          id?: string
          notes?: string | null
          order_in_day?: number
          program_id?: string
          reps_max?: number | null
          reps_min?: number | null
          rest_seconds?: number | null
          sets?: number | null
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "admin_program_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_program_exercises_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "admin_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_program_nutrition_plans: {
        Row: {
          created_at: string
          day_of_week: number
          id: string
          notes: string | null
          nutrition_plan_id: string
          order_in_day: number
          program_id: string
          week_number: number
        }
        Insert: {
          created_at?: string
          day_of_week: number
          id?: string
          notes?: string | null
          nutrition_plan_id: string
          order_in_day?: number
          program_id: string
          week_number: number
        }
        Update: {
          created_at?: string
          day_of_week?: number
          id?: string
          notes?: string | null
          nutrition_plan_id?: string
          order_in_day?: number
          program_id?: string
          week_number?: number
        }
        Relationships: []
      }
      admin_program_routine_exercises: {
        Row: {
          block_name: string | null
          created_at: string | null
          duration_seconds: number | null
          exercise_id: number
          exercise_order: number
          id: number
          notes: string | null
          partial_reps: number | null
          reps_max: number | null
          reps_min: number | null
          reps_range: string | null
          rest_between_sets_seconds: number | null
          rir: number | null
          routine_id: number
          sets: number | null
        }
        Insert: {
          block_name?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          exercise_id: number
          exercise_order?: number
          id?: number
          notes?: string | null
          partial_reps?: number | null
          reps_max?: number | null
          reps_min?: number | null
          reps_range?: string | null
          rest_between_sets_seconds?: number | null
          rir?: number | null
          routine_id: number
          sets?: number | null
        }
        Update: {
          block_name?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          exercise_id?: number
          exercise_order?: number
          id?: number
          notes?: string | null
          partial_reps?: number | null
          reps_max?: number | null
          reps_min?: number | null
          reps_range?: string | null
          rest_between_sets_seconds?: number | null
          rir?: number | null
          routine_id?: number
          sets?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_program_routine_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_program_routine_exercises_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "admin_program_routines_specific"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_program_routines: {
        Row: {
          created_at: string
          day_of_week: number
          id: string
          notes: string | null
          order_in_day: number
          program_id: string
          routine_id: number
          week_number: number
        }
        Insert: {
          created_at?: string
          day_of_week: number
          id?: string
          notes?: string | null
          order_in_day?: number
          program_id: string
          routine_id: number
          week_number: number
        }
        Update: {
          created_at?: string
          day_of_week?: number
          id?: string
          notes?: string | null
          order_in_day?: number
          program_id?: string
          routine_id?: number
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "admin_program_routines_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "admin_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_program_routines_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_program_routines_specific: {
        Row: {
          created_at: string | null
          created_by_admin: string | null
          description: string | null
          estimated_duration_minutes: number | null
          id: number
          is_active: boolean | null
          name: string
          original_routine_id: number | null
          program_id: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by_admin?: string | null
          description?: string | null
          estimated_duration_minutes?: number | null
          id?: number
          is_active?: boolean | null
          name: string
          original_routine_id?: number | null
          program_id: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by_admin?: string | null
          description?: string | null
          estimated_duration_minutes?: number | null
          id?: number
          is_active?: boolean | null
          name?: string
          original_routine_id?: number | null
          program_id?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_program_routines_specific_created_by_admin_fkey"
            columns: ["created_by_admin"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_program_routines_specific_created_by_admin_fkey"
            columns: ["created_by_admin"]
            isOneToOne: false
            referencedRelation: "coach_branding_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_program_routines_specific_original_routine_id_fkey"
            columns: ["original_routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_program_routines_specific_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "admin_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_program_surveys: {
        Row: {
          created_at: string | null
          day_of_week: number
          id: string
          library_survey_id: string
          notes: string | null
          order_in_day: number | null
          program_id: string
          week_number: number
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          id?: string
          library_survey_id: string
          notes?: string | null
          order_in_day?: number | null
          program_id: string
          week_number: number
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          id?: string
          library_survey_id?: string
          notes?: string | null
          order_in_day?: number | null
          program_id?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "admin_program_surveys_library_survey_id_fkey"
            columns: ["library_survey_id"]
            isOneToOne: false
            referencedRelation: "library_surveys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_program_surveys_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "admin_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_program_videos: {
        Row: {
          created_at: string | null
          day_of_week: number
          id: string
          library_video_id: string
          notes: string | null
          order_in_day: number | null
          program_id: string
          week_number: number
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          id?: string
          library_video_id: string
          notes?: string | null
          order_in_day?: number | null
          program_id: string
          week_number: number
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          id?: string
          library_video_id?: string
          notes?: string | null
          order_in_day?: number | null
          program_id?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "admin_program_videos_library_video_id_fkey"
            columns: ["library_video_id"]
            isOneToOne: false
            referencedRelation: "library_videos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_program_videos_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "admin_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_program_weeks: {
        Row: {
          created_at: string
          focus_areas: string[] | null
          id: string
          program_id: string
          week_description: string | null
          week_name: string | null
          week_number: number
        }
        Insert: {
          created_at?: string
          focus_areas?: string[] | null
          id?: string
          program_id: string
          week_description?: string | null
          week_name?: string | null
          week_number: number
        }
        Update: {
          created_at?: string
          focus_areas?: string[] | null
          id?: string
          program_id?: string
          week_description?: string | null
          week_name?: string | null
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "admin_program_weeks_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "admin_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_programs: {
        Row: {
          created_at: string
          created_by_admin: string | null
          description: string | null
          difficulty_level: string
          duration_weeks: number
          estimated_sessions_per_week: number | null
          id: string
          is_active: boolean
          is_personal_plan: boolean | null
          is_starter_program: boolean | null
          name: string
          program_type: string
          target_audience: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by_admin?: string | null
          description?: string | null
          difficulty_level: string
          duration_weeks?: number
          estimated_sessions_per_week?: number | null
          id?: string
          is_active?: boolean
          is_personal_plan?: boolean | null
          is_starter_program?: boolean | null
          name: string
          program_type?: string
          target_audience?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by_admin?: string | null
          description?: string | null
          difficulty_level?: string
          duration_weeks?: number
          estimated_sessions_per_week?: number | null
          id?: string
          is_active?: boolean
          is_personal_plan?: boolean | null
          is_starter_program?: boolean | null
          name?: string
          program_type?: string
          target_audience?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      admin_role_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission_key: string
          role: Database["public"]["Enums"]["admin_role"]
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission_key: string
          role: Database["public"]["Enums"]["admin_role"]
        }
        Update: {
          created_at?: string | null
          id?: string
          permission_key?: string
          role?: Database["public"]["Enums"]["admin_role"]
        }
        Relationships: [
          {
            foreignKeyName: "admin_role_permissions_permission_key_fkey"
            columns: ["permission_key"]
            isOneToOne: false
            referencedRelation: "admin_permissions"
            referencedColumns: ["permission_key"]
          },
        ]
      }
      admin_users: {
        Row: {
          avatar_url: string | null
          banner_image_url: string | null
          company_name: string | null
          created_at: string
          created_by: string | null
          custom_ranks: Json | null
          email: string
          full_name: string
          id: string
          is_active: boolean
          last_login_at: string | null
          logo_image_url: string | null
          onboarding_completed: boolean | null
          primary_button_color: string | null
          primary_button_fill_color: string | null
          ranking_image_url: string | null
          role: Database["public"]["Enums"]["admin_role"]
          tutorial_completed: boolean | null
          tutorial_pages_visited: Json | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          banner_image_url?: string | null
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          custom_ranks?: Json | null
          email: string
          full_name: string
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          logo_image_url?: string | null
          onboarding_completed?: boolean | null
          primary_button_color?: string | null
          primary_button_fill_color?: string | null
          ranking_image_url?: string | null
          role?: Database["public"]["Enums"]["admin_role"]
          tutorial_completed?: boolean | null
          tutorial_pages_visited?: Json | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          banner_image_url?: string | null
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          custom_ranks?: Json | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          logo_image_url?: string | null
          onboarding_completed?: boolean | null
          primary_button_color?: string | null
          primary_button_fill_color?: string | null
          ranking_image_url?: string | null
          role?: Database["public"]["Enums"]["admin_role"]
          tutorial_completed?: boolean | null
          tutorial_pages_visited?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_users_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_users_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "coach_branding_public"
            referencedColumns: ["id"]
          },
        ]
      }
      advanced_program_week_routines: {
        Row: {
          created_at: string
          day_of_week: number
          id: string
          order_in_day: number
          program_id: string
          routine_id: number
          week_number: number
        }
        Insert: {
          created_at?: string
          day_of_week: number
          id?: string
          order_in_day?: number
          program_id: string
          routine_id: number
          week_number: number
        }
        Update: {
          created_at?: string
          day_of_week?: number
          id?: string
          order_in_day?: number
          program_id?: string
          routine_id?: number
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "advanced_program_week_routines_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "weekly_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advanced_program_week_routines_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
        ]
      }
      advanced_program_weeks: {
        Row: {
          created_at: string
          id: string
          program_id: string
          week_description: string | null
          week_name: string | null
          week_number: number
        }
        Insert: {
          created_at?: string
          id?: string
          program_id: string
          week_description?: string | null
          week_name?: string | null
          week_number: number
        }
        Update: {
          created_at?: string
          id?: string
          program_id?: string
          week_description?: string | null
          week_name?: string | null
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "advanced_program_weeks_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "weekly_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      agente_app: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      ai_chat_memory: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      ai_workout_memory: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          admin_id: string | null
          created_at: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          admin_id?: string | null
          created_at?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          admin_id?: string | null
          created_at?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_settings_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_settings_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "coach_branding_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "coach_branding_public"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_rate_limits: {
        Row: {
          attempt_count: number | null
          blocked_until: string | null
          created_at: string | null
          first_attempt_at: string | null
          id: string
          identifier: string
          last_attempt_at: string | null
        }
        Insert: {
          attempt_count?: number | null
          blocked_until?: string | null
          created_at?: string | null
          first_attempt_at?: string | null
          id?: string
          identifier: string
          last_attempt_at?: string | null
        }
        Update: {
          attempt_count?: number | null
          blocked_until?: string | null
          created_at?: string | null
          first_attempt_at?: string | null
          id?: string
          identifier?: string
          last_attempt_at?: string | null
        }
        Relationships: []
      }
      body_measurements: {
        Row: {
          abdomen_circumference_cm: number | null
          arm_circumference_cm: number | null
          body_fat_percentage: number | null
          chest_circumference_cm: number | null
          created_at: string | null
          height_cm: number | null
          id: number
          leg_circumference_cm: number | null
          measurement_date: string | null
          notes: string | null
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          abdomen_circumference_cm?: number | null
          arm_circumference_cm?: number | null
          body_fat_percentage?: number | null
          chest_circumference_cm?: number | null
          created_at?: string | null
          height_cm?: number | null
          id?: number
          leg_circumference_cm?: number | null
          measurement_date?: string | null
          notes?: string | null
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          abdomen_circumference_cm?: number | null
          arm_circumference_cm?: number | null
          body_fat_percentage?: number | null
          chest_circumference_cm?: number | null
          created_at?: string | null
          height_cm?: number | null
          id?: number
          leg_circumference_cm?: number | null
          measurement_date?: string | null
          notes?: string | null
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "body_measurements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "body_measurements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_rankings"
            referencedColumns: ["user_id"]
          },
        ]
      }
      body_measurements_history: {
        Row: {
          abdomen_circumference_cm: number | null
          arm_circumference_cm: number | null
          body_fat_percentage: number | null
          chest_circumference_cm: number | null
          created_at: string
          height_cm: number | null
          id: string
          leg_circumference_cm: number | null
          measured_at: string
          notes: string | null
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          abdomen_circumference_cm?: number | null
          arm_circumference_cm?: number | null
          body_fat_percentage?: number | null
          chest_circumference_cm?: number | null
          created_at?: string
          height_cm?: number | null
          id?: string
          leg_circumference_cm?: number | null
          measured_at?: string
          notes?: string | null
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          abdomen_circumference_cm?: number | null
          arm_circumference_cm?: number | null
          body_fat_percentage?: number | null
          chest_circumference_cm?: number | null
          created_at?: string
          height_cm?: number | null
          id?: string
          leg_circumference_cm?: number | null
          measured_at?: string
          notes?: string | null
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          attachment_url: string | null
          content: string | null
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          message_type: string
          sender_id: string
        }
        Insert: {
          attachment_url?: string | null
          content?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          message_type?: string
          sender_id: string
        }
        Update: {
          attachment_url?: string | null
          content?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message_type?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          country_id: number
          id: number
          name: string
        }
        Insert: {
          country_id: number
          id?: never
          name: string
        }
        Update: {
          country_id?: number
          id?: never
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "cities_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      client_product_subscriptions: {
        Row: {
          client_id: string
          coach_id: string
          created_at: string
          end_date: string | null
          id: string
          next_payment_date: string | null
          notes: string | null
          payment_reminder_enabled: boolean | null
          payment_status: string
          product_id: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          client_id: string
          coach_id: string
          created_at?: string
          end_date?: string | null
          id?: string
          next_payment_date?: string | null
          notes?: string | null
          payment_reminder_enabled?: boolean | null
          payment_status?: string
          product_id: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          coach_id?: string
          created_at?: string
          end_date?: string | null
          id?: string
          next_payment_date?: string | null
          notes?: string | null
          payment_reminder_enabled?: boolean | null
          payment_status?: string
          product_id?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_product_subscriptions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_product_subscriptions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "user_rankings"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "client_product_subscriptions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "coach_products"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_products: {
        Row: {
          billing_cycle: string
          billing_interval_count: number
          coach_id: string
          created_at: string
          currency: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          billing_cycle?: string
          billing_interval_count?: number
          coach_id: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          price?: number
          updated_at?: string
        }
        Update: {
          billing_cycle?: string
          billing_interval_count?: number
          coach_id?: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      coach_proration_payments: {
        Row: {
          amount_usd: number
          captured_at: string | null
          coach_id: string
          created_at: string | null
          days_remaining: number
          from_plan_id: string | null
          id: string
          order_id: string
          status: string | null
          to_plan_id: string | null
        }
        Insert: {
          amount_usd: number
          captured_at?: string | null
          coach_id: string
          created_at?: string | null
          days_remaining: number
          from_plan_id?: string | null
          id?: string
          order_id: string
          status?: string | null
          to_plan_id?: string | null
        }
        Update: {
          amount_usd?: number
          captured_at?: string | null
          coach_id?: string
          created_at?: string | null
          days_remaining?: number
          from_plan_id?: string | null
          id?: string
          order_id?: string
          status?: string | null
          to_plan_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_proration_payments_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_proration_payments_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_branding_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_proration_payments_from_plan_id_fkey"
            columns: ["from_plan_id"]
            isOneToOne: false
            referencedRelation: "coach_subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_proration_payments_to_plan_id_fkey"
            columns: ["to_plan_id"]
            isOneToOne: false
            referencedRelation: "coach_subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_subscription_plans: {
        Row: {
          created_at: string | null
          duration_days: number
          id: string
          is_active: boolean | null
          max_clients: number
          name: string
          paypal_plan_id: string | null
          paypal_plan_id_no_trial: string | null
          plan_type: string
          price_usd: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          duration_days: number
          id?: string
          is_active?: boolean | null
          max_clients: number
          name: string
          paypal_plan_id?: string | null
          paypal_plan_id_no_trial?: string | null
          plan_type: string
          price_usd: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          duration_days?: number
          id?: string
          is_active?: boolean | null
          max_clients?: number
          name?: string
          paypal_plan_id?: string | null
          paypal_plan_id_no_trial?: string | null
          plan_type?: string
          price_usd?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      coach_subscriptions: {
        Row: {
          auto_renewal: boolean | null
          coach_id: string
          created_at: string | null
          expires_at: string | null
          has_paid_before: boolean | null
          id: string
          max_clients: number
          next_plan_id: string | null
          next_plan_starts_at: string | null
          payment_failed_at: string | null
          paypal_payer_id: string | null
          paypal_subscription_id: string | null
          pending_order_id: string | null
          plan_id: string | null
          started_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          auto_renewal?: boolean | null
          coach_id: string
          created_at?: string | null
          expires_at?: string | null
          has_paid_before?: boolean | null
          id?: string
          max_clients?: number
          next_plan_id?: string | null
          next_plan_starts_at?: string | null
          payment_failed_at?: string | null
          paypal_payer_id?: string | null
          paypal_subscription_id?: string | null
          pending_order_id?: string | null
          plan_id?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          auto_renewal?: boolean | null
          coach_id?: string
          created_at?: string | null
          expires_at?: string | null
          has_paid_before?: boolean | null
          id?: string
          max_clients?: number
          next_plan_id?: string | null
          next_plan_starts_at?: string | null
          payment_failed_at?: string | null
          paypal_payer_id?: string | null
          paypal_subscription_id?: string | null
          pending_order_id?: string | null
          plan_id?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_subscriptions_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: true
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_subscriptions_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: true
            referencedRelation: "coach_branding_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_subscriptions_next_plan_id_fkey"
            columns: ["next_plan_id"]
            isOneToOne: false
            referencedRelation: "coach_subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "coach_subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_user_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          coach_id: string
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          coach_id: string
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          coach_id?: string
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_user_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_user_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "coach_branding_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_user_assignments_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_user_assignments_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_branding_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_user_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_user_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_rankings"
            referencedColumns: ["user_id"]
          },
        ]
      }
      conversations: {
        Row: {
          coach_id: string
          created_at: string
          id: string
          last_message_at: string | null
          last_message_preview: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      countries: {
        Row: {
          code: string
          id: number
          name: string
        }
        Insert: {
          code: string
          id?: never
          name: string
        }
        Update: {
          code?: string
          id?: never
          name?: string
        }
        Relationships: []
      }
      daily_food_log_entries: {
        Row: {
          calories_consumed: number
          carbs_g_consumed: number
          custom_food_name: string | null
          fat_g_consumed: number
          food_item_id: number | null
          health_score: number | null
          id: number
          ingredients: Json | null
          log_date: string
          logged_at: string
          meal_type: Database["public"]["Enums"]["meal_type"]
          notes: string | null
          photo_url: string | null
          protein_g_consumed: number
          quantity_consumed: number
          unit_consumed: string | null
          user_id: string
        }
        Insert: {
          calories_consumed: number
          carbs_g_consumed: number
          custom_food_name?: string | null
          fat_g_consumed: number
          food_item_id?: number | null
          health_score?: number | null
          id?: number
          ingredients?: Json | null
          log_date?: string
          logged_at?: string
          meal_type: Database["public"]["Enums"]["meal_type"]
          notes?: string | null
          photo_url?: string | null
          protein_g_consumed: number
          quantity_consumed: number
          unit_consumed?: string | null
          user_id: string
        }
        Update: {
          calories_consumed?: number
          carbs_g_consumed?: number
          custom_food_name?: string | null
          fat_g_consumed?: number
          food_item_id?: number | null
          health_score?: number | null
          id?: number
          ingredients?: Json | null
          log_date?: string
          logged_at?: string
          meal_type?: Database["public"]["Enums"]["meal_type"]
          notes?: string | null
          photo_url?: string | null
          protein_g_consumed?: number
          quantity_consumed?: number
          unit_consumed?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_food_log_entries_food_item_id_fkey"
            columns: ["food_item_id"]
            isOneToOne: false
            referencedRelation: "food_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_food_log_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_food_log_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_rankings"
            referencedColumns: ["user_id"]
          },
        ]
      }
      daily_water_intake: {
        Row: {
          created_at: string | null
          date: string
          id: string
          unit_preference: string | null
          updated_at: string | null
          user_id: string
          volume_ml: number
        }
        Insert: {
          created_at?: string | null
          date?: string
          id?: string
          unit_preference?: string | null
          updated_at?: string | null
          user_id: string
          volume_ml?: number
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          unit_preference?: string | null
          updated_at?: string | null
          user_id?: string
          volume_ml?: number
        }
        Relationships: []
      }
      diet_types: {
        Row: {
          description: string | null
          icon_name: string | null
          id: number
          name: string
        }
        Insert: {
          description?: string | null
          icon_name?: string | null
          id?: number
          name: string
        }
        Update: {
          description?: string | null
          icon_name?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      discount_codes: {
        Row: {
          applicable_plans: string[] | null
          application_type: string | null
          code: string
          created_at: string | null
          current_uses: number | null
          discount_type: string
          discount_value: number
          duration_months: number | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          paypal_discount_fixed: number | null
          paypal_discount_percentage: number | null
          updated_at: string | null
          usage_type: string | null
          valid_from: string | null
          valid_to: string | null
        }
        Insert: {
          applicable_plans?: string[] | null
          application_type?: string | null
          code: string
          created_at?: string | null
          current_uses?: number | null
          discount_type: string
          discount_value: number
          duration_months?: number | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          paypal_discount_fixed?: number | null
          paypal_discount_percentage?: number | null
          updated_at?: string | null
          usage_type?: string | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Update: {
          applicable_plans?: string[] | null
          application_type?: string | null
          code?: string
          created_at?: string | null
          current_uses?: number | null
          discount_type?: string
          discount_value?: number
          duration_months?: number | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          paypal_discount_fixed?: number | null
          paypal_discount_percentage?: number | null
          updated_at?: string | null
          usage_type?: string | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Relationships: []
      }
      exercises: {
        Row: {
          created_by_user_id: string | null
          description: string | null
          difficulty_level:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          equipment_required: string | null
          id: number
          image_url: string | null
          is_public: boolean
          muscle_group_main: string | null
          name: string
          thumbnail_url: string | null
          video_url: string | null
        }
        Insert: {
          created_by_user_id?: string | null
          description?: string | null
          difficulty_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          equipment_required?: string | null
          id?: number
          image_url?: string | null
          is_public?: boolean
          muscle_group_main?: string | null
          name: string
          thumbnail_url?: string | null
          video_url?: string | null
        }
        Update: {
          created_by_user_id?: string | null
          description?: string | null
          difficulty_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          equipment_required?: string | null
          id?: number
          image_url?: string | null
          is_public?: boolean
          muscle_group_main?: string | null
          name?: string
          thumbnail_url?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercises_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercises_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_rankings"
            referencedColumns: ["user_id"]
          },
        ]
      }
      food_categories: {
        Row: {
          color_class: string | null
          created_at: string | null
          icon_name: string | null
          id: number
          name: string
        }
        Insert: {
          color_class?: string | null
          created_at?: string | null
          icon_name?: string | null
          id?: number
          name: string
        }
        Update: {
          color_class?: string | null
          created_at?: string | null
          icon_name?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      food_items: {
        Row: {
          calories_per_serving: number
          carbs_g_per_serving: number
          fat_g_per_serving: number
          fiber_g_per_serving: number | null
          food_category: string | null
          id: number
          is_verified_by_admin: boolean
          name: string
          protein_g_per_serving: number
          serving_size_grams: number | null
          user_contributed_id: string | null
        }
        Insert: {
          calories_per_serving: number
          carbs_g_per_serving: number
          fat_g_per_serving: number
          fiber_g_per_serving?: number | null
          food_category?: string | null
          id?: number
          is_verified_by_admin?: boolean
          name: string
          protein_g_per_serving: number
          serving_size_grams?: number | null
          user_contributed_id?: string | null
        }
        Update: {
          calories_per_serving?: number
          carbs_g_per_serving?: number
          fat_g_per_serving?: number
          fiber_g_per_serving?: number | null
          food_category?: string | null
          id?: number
          is_verified_by_admin?: boolean
          name?: string
          protein_g_per_serving?: number
          serving_size_grams?: number | null
          user_contributed_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "food_items_user_contributed_id_fkey"
            columns: ["user_contributed_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_items_user_contributed_id_fkey"
            columns: ["user_contributed_id"]
            isOneToOne: false
            referencedRelation: "user_rankings"
            referencedColumns: ["user_id"]
          },
        ]
      }
      food_search_synonyms: {
        Row: {
          category_id: number | null
          created_at: string | null
          id: number
          search_term: string
          target_foods: string[]
        }
        Insert: {
          category_id?: number | null
          created_at?: string | null
          id?: number
          search_term: string
          target_foods: string[]
        }
        Update: {
          category_id?: number | null
          created_at?: string | null
          id?: number
          search_term?: string
          target_foods?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "food_search_synonyms_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "food_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      gatofit_program_documents: {
        Row: {
          created_at: string | null
          day_of_week: number
          id: string
          library_document_id: string
          notes: string | null
          order_in_day: number | null
          program_id: string
          week_number: number
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          id?: string
          library_document_id: string
          notes?: string | null
          order_in_day?: number | null
          program_id: string
          week_number: number
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          id?: string
          library_document_id?: string
          notes?: string | null
          order_in_day?: number | null
          program_id?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "gatofit_program_documents_library_document_id_fkey"
            columns: ["library_document_id"]
            isOneToOne: false
            referencedRelation: "library_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gatofit_program_documents_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "gatofit_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      gatofit_program_evolutions: {
        Row: {
          created_at: string | null
          day_of_week: number
          id: string
          notes: string | null
          order_in_day: number | null
          program_id: string
          week_number: number
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          id?: string
          notes?: string | null
          order_in_day?: number | null
          program_id: string
          week_number: number
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          id?: string
          notes?: string | null
          order_in_day?: number | null
          program_id?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "gatofit_program_evolutions_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "gatofit_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      gatofit_program_exercises: {
        Row: {
          created_at: string
          day_of_week: number
          exercise_id: number
          id: string
          notes: string | null
          order_in_day: number
          program_id: string
          reps_max: number | null
          reps_min: number | null
          rest_seconds: number | null
          sets: number | null
          week_number: number
        }
        Insert: {
          created_at?: string
          day_of_week: number
          exercise_id: number
          id?: string
          notes?: string | null
          order_in_day?: number
          program_id: string
          reps_max?: number | null
          reps_min?: number | null
          rest_seconds?: number | null
          sets?: number | null
          week_number: number
        }
        Update: {
          created_at?: string
          day_of_week?: number
          exercise_id?: number
          id?: string
          notes?: string | null
          order_in_day?: number
          program_id?: string
          reps_max?: number | null
          reps_min?: number | null
          rest_seconds?: number | null
          sets?: number | null
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "gatofit_program_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gatofit_program_exercises_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "gatofit_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      gatofit_program_routines: {
        Row: {
          created_at: string
          day_of_week: number
          id: string
          notes: string | null
          order_in_day: number
          program_id: string
          routine_id: number
          week_number: number
        }
        Insert: {
          created_at?: string
          day_of_week: number
          id?: string
          notes?: string | null
          order_in_day?: number
          program_id: string
          routine_id: number
          week_number: number
        }
        Update: {
          created_at?: string
          day_of_week?: number
          id?: string
          notes?: string | null
          order_in_day?: number
          program_id?: string
          routine_id?: number
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "gatofit_program_routines_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "gatofit_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gatofit_program_routines_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
        ]
      }
      gatofit_program_surveys: {
        Row: {
          created_at: string | null
          day_of_week: number
          id: string
          library_survey_id: string
          notes: string | null
          order_in_day: number | null
          program_id: string
          week_number: number
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          id?: string
          library_survey_id: string
          notes?: string | null
          order_in_day?: number | null
          program_id: string
          week_number: number
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          id?: string
          library_survey_id?: string
          notes?: string | null
          order_in_day?: number | null
          program_id?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "gatofit_program_surveys_library_survey_id_fkey"
            columns: ["library_survey_id"]
            isOneToOne: false
            referencedRelation: "library_surveys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gatofit_program_surveys_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "gatofit_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      gatofit_program_videos: {
        Row: {
          created_at: string | null
          day_of_week: number
          id: string
          library_video_id: string
          notes: string | null
          order_in_day: number | null
          program_id: string
          week_number: number
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          id?: string
          library_video_id: string
          notes?: string | null
          order_in_day?: number | null
          program_id: string
          week_number: number
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          id?: string
          library_video_id?: string
          notes?: string | null
          order_in_day?: number | null
          program_id?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "gatofit_program_videos_library_video_id_fkey"
            columns: ["library_video_id"]
            isOneToOne: false
            referencedRelation: "library_videos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gatofit_program_videos_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "gatofit_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      gatofit_program_weeks: {
        Row: {
          created_at: string
          focus_areas: string[] | null
          id: string
          program_id: string
          week_description: string | null
          week_name: string | null
          week_number: number
        }
        Insert: {
          created_at?: string
          focus_areas?: string[] | null
          id?: string
          program_id: string
          week_description?: string | null
          week_name?: string | null
          week_number: number
        }
        Update: {
          created_at?: string
          focus_areas?: string[] | null
          id?: string
          program_id?: string
          week_description?: string | null
          week_name?: string | null
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "gatofit_program_weeks_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "gatofit_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      gatofit_programs: {
        Row: {
          cover_image_url: string | null
          created_at: string
          created_by_admin: string | null
          description: string | null
          difficulty_level: string
          duration_weeks: number
          estimated_sessions_per_week: number | null
          id: string
          is_active: boolean
          name: string
          program_type: string
          target_audience: string | null
          updated_at: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          created_by_admin?: string | null
          description?: string | null
          difficulty_level: string
          duration_weeks?: number
          estimated_sessions_per_week?: number | null
          id?: string
          is_active?: boolean
          name: string
          program_type?: string
          target_audience?: string | null
          updated_at?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          created_by_admin?: string | null
          description?: string | null
          difficulty_level?: string
          duration_weeks?: number
          estimated_sessions_per_week?: number | null
          id?: string
          is_active?: boolean
          name?: string
          program_type?: string
          target_audience?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      library_document_assignments: {
        Row: {
          assigned_at: string
          assigned_by_admin: string | null
          assignment_type: string
          document_id: string
          id: string
          tag_id: string | null
          user_id: string | null
        }
        Insert: {
          assigned_at?: string
          assigned_by_admin?: string | null
          assignment_type: string
          document_id: string
          id?: string
          tag_id?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_at?: string
          assigned_by_admin?: string | null
          assignment_type?: string
          document_id?: string
          id?: string
          tag_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "library_document_assignments_assigned_by_admin_fkey"
            columns: ["assigned_by_admin"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_document_assignments_assigned_by_admin_fkey"
            columns: ["assigned_by_admin"]
            isOneToOne: false
            referencedRelation: "coach_branding_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_document_assignments_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "library_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_document_assignments_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "user_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_document_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_document_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_rankings"
            referencedColumns: ["user_id"]
          },
        ]
      }
      library_documents: {
        Row: {
          created_at: string
          created_by_admin: string | null
          description: string | null
          file_name: string
          file_size_bytes: number | null
          file_url: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by_admin?: string | null
          description?: string | null
          file_name: string
          file_size_bytes?: number | null
          file_url: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by_admin?: string | null
          description?: string | null
          file_name?: string
          file_size_bytes?: number | null
          file_url?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_documents_created_by_admin_fkey"
            columns: ["created_by_admin"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_documents_created_by_admin_fkey"
            columns: ["created_by_admin"]
            isOneToOne: false
            referencedRelation: "coach_branding_public"
            referencedColumns: ["id"]
          },
        ]
      }
      library_survey_assignments: {
        Row: {
          assigned_at: string
          assigned_by_admin: string | null
          assignment_type: string
          id: string
          survey_id: string
          tag_id: string | null
          user_id: string | null
        }
        Insert: {
          assigned_at?: string
          assigned_by_admin?: string | null
          assignment_type: string
          id?: string
          survey_id: string
          tag_id?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_at?: string
          assigned_by_admin?: string | null
          assignment_type?: string
          id?: string
          survey_id?: string
          tag_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "library_survey_assignments_assigned_by_admin_fkey"
            columns: ["assigned_by_admin"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_survey_assignments_assigned_by_admin_fkey"
            columns: ["assigned_by_admin"]
            isOneToOne: false
            referencedRelation: "coach_branding_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_survey_assignments_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "library_surveys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_survey_assignments_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "user_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_survey_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_survey_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_rankings"
            referencedColumns: ["user_id"]
          },
        ]
      }
      library_survey_questions: {
        Row: {
          created_at: string
          id: string
          is_required: boolean
          options: Json | null
          order_index: number
          question_text: string
          question_type: Database["public"]["Enums"]["survey_question_type"]
          survey_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_required?: boolean
          options?: Json | null
          order_index?: number
          question_text: string
          question_type: Database["public"]["Enums"]["survey_question_type"]
          survey_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_required?: boolean
          options?: Json | null
          order_index?: number
          question_text?: string
          question_type?: Database["public"]["Enums"]["survey_question_type"]
          survey_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_survey_questions_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "library_surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      library_survey_responses: {
        Row: {
          completed_at: string
          id: string
          responses: Json
          survey_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          responses?: Json
          survey_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          responses?: Json
          survey_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_survey_responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "library_surveys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_survey_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_survey_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_rankings"
            referencedColumns: ["user_id"]
          },
        ]
      }
      library_surveys: {
        Row: {
          created_at: string
          created_by_admin: string | null
          description: string | null
          id: string
          is_active: boolean
          is_user_task_copy: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by_admin?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_user_task_copy?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by_admin?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_user_task_copy?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_surveys_created_by_admin_fkey"
            columns: ["created_by_admin"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_surveys_created_by_admin_fkey"
            columns: ["created_by_admin"]
            isOneToOne: false
            referencedRelation: "coach_branding_public"
            referencedColumns: ["id"]
          },
        ]
      }
      library_video_assignments: {
        Row: {
          assigned_at: string
          assigned_by_admin: string | null
          assignment_type: string
          id: string
          tag_id: string | null
          user_id: string | null
          video_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by_admin?: string | null
          assignment_type: string
          id?: string
          tag_id?: string | null
          user_id?: string | null
          video_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by_admin?: string | null
          assignment_type?: string
          id?: string
          tag_id?: string | null
          user_id?: string | null
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_video_assignments_assigned_by_admin_fkey"
            columns: ["assigned_by_admin"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_video_assignments_assigned_by_admin_fkey"
            columns: ["assigned_by_admin"]
            isOneToOne: false
            referencedRelation: "coach_branding_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_video_assignments_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "user_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_video_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_video_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_rankings"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "library_video_assignments_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "library_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      library_videos: {
        Row: {
          created_at: string
          created_by_admin: string | null
          description: string | null
          id: string
          title: string
          updated_at: string
          youtube_url: string
          youtube_video_id: string
        }
        Insert: {
          created_at?: string
          created_by_admin?: string | null
          description?: string | null
          id?: string
          title: string
          updated_at?: string
          youtube_url: string
          youtube_video_id: string
        }
        Update: {
          created_at?: string
          created_by_admin?: string | null
          description?: string | null
          id?: string
          title?: string
          updated_at?: string
          youtube_url?: string
          youtube_video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_videos_created_by_admin_fkey"
            columns: ["created_by_admin"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_videos_created_by_admin_fkey"
            columns: ["created_by_admin"]
            isOneToOne: false
            referencedRelation: "coach_branding_public"
            referencedColumns: ["id"]
          },
        ]
      }
      n8n_chat_whatsapp: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      n8n_chat_whatsapp_admin_app: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      nutrition_plan_meal_ingredients: {
        Row: {
          calories_per_serving: number
          carbs_g_per_serving: number
          created_at: string
          custom_food_name: string | null
          fats_g_per_serving: number
          fiber_g_per_serving: number
          food_item_id: number | null
          id: string
          ingredient_order: number
          meal_option_id: string
          protein_g_per_serving: number
          quantity_grams: number
          recipe_description: string | null
          recipe_id: string | null
          recipe_image_url: string | null
          recipe_instructions: string | null
          recipe_name: string | null
          recipe_preparation_time: number | null
          recipe_servings: number | null
        }
        Insert: {
          calories_per_serving?: number
          carbs_g_per_serving?: number
          created_at?: string
          custom_food_name?: string | null
          fats_g_per_serving?: number
          fiber_g_per_serving?: number
          food_item_id?: number | null
          id?: string
          ingredient_order?: number
          meal_option_id: string
          protein_g_per_serving?: number
          quantity_grams: number
          recipe_description?: string | null
          recipe_id?: string | null
          recipe_image_url?: string | null
          recipe_instructions?: string | null
          recipe_name?: string | null
          recipe_preparation_time?: number | null
          recipe_servings?: number | null
        }
        Update: {
          calories_per_serving?: number
          carbs_g_per_serving?: number
          created_at?: string
          custom_food_name?: string | null
          fats_g_per_serving?: number
          fiber_g_per_serving?: number
          food_item_id?: number | null
          id?: string
          ingredient_order?: number
          meal_option_id?: string
          protein_g_per_serving?: number
          quantity_grams?: number
          recipe_description?: string | null
          recipe_id?: string | null
          recipe_image_url?: string | null
          recipe_instructions?: string | null
          recipe_name?: string | null
          recipe_preparation_time?: number | null
          recipe_servings?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_plan_meal_ingredients_food_item_id_fkey"
            columns: ["food_item_id"]
            isOneToOne: false
            referencedRelation: "food_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_plan_meal_ingredients_meal_option_id_fkey"
            columns: ["meal_option_id"]
            isOneToOne: false
            referencedRelation: "nutrition_plan_meal_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_plan_meal_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_plan_meal_options: {
        Row: {
          created_at: string
          description: string | null
          id: string
          meal_id: string
          option_name: string
          option_order: number
          total_calories: number
          total_carbs_g: number
          total_fats_g: number
          total_fiber_g: number
          total_protein_g: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          meal_id: string
          option_name: string
          option_order?: number
          total_calories?: number
          total_carbs_g?: number
          total_fats_g?: number
          total_fiber_g?: number
          total_protein_g?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          meal_id?: string
          option_name?: string
          option_order?: number
          total_calories?: number
          total_carbs_g?: number
          total_fats_g?: number
          total_fiber_g?: number
          total_protein_g?: number
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_plan_meal_options_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "nutrition_plan_meals"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_plan_meals: {
        Row: {
          created_at: string
          id: string
          meal_name: string
          meal_order: number
          meal_type: string
          plan_id: string
          target_calories: number | null
          target_carbs_g: number | null
          target_fats_g: number | null
          target_protein_g: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          meal_name: string
          meal_order?: number
          meal_type: string
          plan_id: string
          target_calories?: number | null
          target_carbs_g?: number | null
          target_fats_g?: number | null
          target_protein_g?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          meal_name?: string
          meal_order?: number
          meal_type?: string
          plan_id?: string
          target_calories?: number | null
          target_carbs_g?: number | null
          target_fats_g?: number | null
          target_protein_g?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_plan_meals_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "nutrition_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_plans: {
        Row: {
          created_at: string
          created_by_admin: string | null
          description: string | null
          difficulty_level: string | null
          duration_days: number | null
          id: string
          is_active: boolean
          is_program_specific: boolean | null
          is_user_task_copy: boolean | null
          name: string
          original_plan_id: string | null
          program_id: string | null
          program_specific_id: string | null
          target_calories: number
          target_carbs_g: number
          target_fats_g: number
          target_protein_g: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by_admin?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_days?: number | null
          id?: string
          is_active?: boolean
          is_program_specific?: boolean | null
          is_user_task_copy?: boolean | null
          name: string
          original_plan_id?: string | null
          program_id?: string | null
          program_specific_id?: string | null
          target_calories: number
          target_carbs_g: number
          target_fats_g: number
          target_protein_g: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by_admin?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_days?: number | null
          id?: string
          is_active?: boolean
          is_program_specific?: boolean | null
          is_user_task_copy?: boolean | null
          name?: string
          original_plan_id?: string | null
          program_id?: string | null
          program_specific_id?: string | null
          target_calories?: number
          target_carbs_g?: number
          target_fats_g?: number
          target_protein_g?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_plans_original_plan_id_fkey"
            columns: ["original_plan_id"]
            isOneToOne: false
            referencedRelation: "nutrition_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_plans_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "gatofit_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_plans_program_specific_id_fkey"
            columns: ["program_specific_id"]
            isOneToOne: false
            referencedRelation: "admin_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      obstacle_types: {
        Row: {
          description: string | null
          id: number
          name: string
        }
        Insert: {
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      password_reset_codes: {
        Row: {
          code: string
          created_at: string | null
          email: string
          expires_at: string
          id: string
          used: boolean | null
        }
        Insert: {
          code: string
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          used?: boolean | null
        }
        Update: {
          code?: string
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          used?: boolean | null
        }
        Relationships: []
      }
      paypal_webhook_events: {
        Row: {
          created_at: string
          event_id: string
          event_type: string
          id: string
          payload: Json
          processed_at: string
          resource_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          event_type: string
          id?: string
          payload: Json
          processed_at?: string
          resource_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          event_type?: string
          id?: string
          payload?: Json
          processed_at?: string
          resource_id?: string
        }
        Relationships: []
      }
      pending_user_invitations: {
        Row: {
          coach_id: string
          created_at: string | null
          display_name: string | null
          email: string
          id: string
          invitation_token: string | null
          invited_at: string | null
          notes: string | null
          status: string | null
        }
        Insert: {
          coach_id: string
          created_at?: string | null
          display_name?: string | null
          email: string
          id?: string
          invitation_token?: string | null
          invited_at?: string | null
          notes?: string | null
          status?: string | null
        }
        Update: {
          coach_id?: string
          created_at?: string | null
          display_name?: string | null
          email?: string
          id?: string
          invitation_token?: string | null
          invited_at?: string | null
          notes?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pending_user_invitations_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_user_invitations_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_branding_public"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          abdomen_circumference_cm: number | null
          arm_circumference_cm: number | null
          avatar_url: string | null
          bio: string | null
          body_fat_percentage: number | null
          business_description: string | null
          business_name: string | null
          chest_circumference_cm: number | null
          created_at: string
          current_weight_kg: number | null
          date_of_birth: string | null
          diet_id: number | null
          first_name: string | null
          full_name: string | null
          gender: Database["public"]["Enums"]["gender_type"] | null
          height_cm: number | null
          id: string
          initial_recommended_calories: number | null
          initial_recommended_carbs_g: number | null
          initial_recommended_fats_g: number | null
          initial_recommended_protein_g: number | null
          initial_weight_kg: number | null
          is_profile_public: boolean | null
          last_name: string | null
          leg_circumference_cm: number | null
          main_goal: Database["public"]["Enums"]["goal_type"] | null
          phone_number: string | null
          previous_app_experience: boolean | null
          service_type: string | null
          target_kg_per_week: number | null
          target_pace: Database["public"]["Enums"]["pace_type"] | null
          target_weight_kg: number | null
          timezone_auto_adjust: boolean | null
          timezone_name: string | null
          timezone_offset: number | null
          total_workouts: number | null
          trainings_per_week: number | null
          unit_system_preference:
            | Database["public"]["Enums"]["unit_system"]
            | null
          updated_at: string
          username: string | null
        }
        Insert: {
          abdomen_circumference_cm?: number | null
          arm_circumference_cm?: number | null
          avatar_url?: string | null
          bio?: string | null
          body_fat_percentage?: number | null
          business_description?: string | null
          business_name?: string | null
          chest_circumference_cm?: number | null
          created_at?: string
          current_weight_kg?: number | null
          date_of_birth?: string | null
          diet_id?: number | null
          first_name?: string | null
          full_name?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          height_cm?: number | null
          id: string
          initial_recommended_calories?: number | null
          initial_recommended_carbs_g?: number | null
          initial_recommended_fats_g?: number | null
          initial_recommended_protein_g?: number | null
          initial_weight_kg?: number | null
          is_profile_public?: boolean | null
          last_name?: string | null
          leg_circumference_cm?: number | null
          main_goal?: Database["public"]["Enums"]["goal_type"] | null
          phone_number?: string | null
          previous_app_experience?: boolean | null
          service_type?: string | null
          target_kg_per_week?: number | null
          target_pace?: Database["public"]["Enums"]["pace_type"] | null
          target_weight_kg?: number | null
          timezone_auto_adjust?: boolean | null
          timezone_name?: string | null
          timezone_offset?: number | null
          total_workouts?: number | null
          trainings_per_week?: number | null
          unit_system_preference?:
            | Database["public"]["Enums"]["unit_system"]
            | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          abdomen_circumference_cm?: number | null
          arm_circumference_cm?: number | null
          avatar_url?: string | null
          bio?: string | null
          body_fat_percentage?: number | null
          business_description?: string | null
          business_name?: string | null
          chest_circumference_cm?: number | null
          created_at?: string
          current_weight_kg?: number | null
          date_of_birth?: string | null
          diet_id?: number | null
          first_name?: string | null
          full_name?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          height_cm?: number | null
          id?: string
          initial_recommended_calories?: number | null
          initial_recommended_carbs_g?: number | null
          initial_recommended_fats_g?: number | null
          initial_recommended_protein_g?: number | null
          initial_weight_kg?: number | null
          is_profile_public?: boolean | null
          last_name?: string | null
          leg_circumference_cm?: number | null
          main_goal?: Database["public"]["Enums"]["goal_type"] | null
          phone_number?: string | null
          previous_app_experience?: boolean | null
          service_type?: string | null
          target_kg_per_week?: number | null
          target_pace?: Database["public"]["Enums"]["pace_type"] | null
          target_weight_kg?: number | null
          timezone_auto_adjust?: boolean | null
          timezone_name?: string | null
          timezone_offset?: number | null
          total_workouts?: number | null
          trainings_per_week?: number | null
          unit_system_preference?:
            | Database["public"]["Enums"]["unit_system"]
            | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      recipe_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          order_index: number
          recipe_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          order_index?: number
          recipe_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          order_index?: number
          recipe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_recipe_images_recipe"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_ingredients: {
        Row: {
          created_at: string
          custom_name: string | null
          food_item_id: number | null
          id: string
          quantity_grams: number
          recipe_id: string
        }
        Insert: {
          created_at?: string
          custom_name?: string | null
          food_item_id?: number | null
          id?: string
          quantity_grams: number
          recipe_id: string
        }
        Update: {
          created_at?: string
          custom_name?: string | null
          food_item_id?: number | null
          id?: string
          quantity_grams?: number
          recipe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_recipe_ingredients_food_item"
            columns: ["food_item_id"]
            isOneToOne: false
            referencedRelation: "food_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_recipe_ingredients_recipe"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          instructions: string | null
          name: string
          prep_time_minutes: number | null
          servings: number
          total_calories: number
          total_carbs_g: number
          total_fat_g: number
          total_fiber_g: number
          total_protein_g: number
          updated_at: string
          user_id: string | null
          youtube_url: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          instructions?: string | null
          name: string
          prep_time_minutes?: number | null
          servings?: number
          total_calories?: number
          total_carbs_g?: number
          total_fat_g?: number
          total_fiber_g?: number
          total_protein_g?: number
          updated_at?: string
          user_id?: string | null
          youtube_url?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          instructions?: string | null
          name?: string
          prep_time_minutes?: number | null
          servings?: number
          total_calories?: number
          total_carbs_g?: number
          total_fat_g?: number
          total_fiber_g?: number
          total_protein_g?: number
          updated_at?: string
          user_id?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      revenuecat_webhook_events: {
        Row: {
          app_user_id: string | null
          created_at: string | null
          environment: string | null
          event_id: string
          event_type: string
          id: string
          payload: Json
          processed_at: string | null
          product_id: string | null
          store: string | null
        }
        Insert: {
          app_user_id?: string | null
          created_at?: string | null
          environment?: string | null
          event_id: string
          event_type: string
          id?: string
          payload: Json
          processed_at?: string | null
          product_id?: string | null
          store?: string | null
        }
        Update: {
          app_user_id?: string | null
          created_at?: string | null
          environment?: string | null
          event_id?: string
          event_type?: string
          id?: string
          payload?: Json
          processed_at?: string | null
          product_id?: string | null
          store?: string | null
        }
        Relationships: []
      }
      routine_exercises: {
        Row: {
          block_name: string | null
          duration_seconds: number | null
          exercise_id: number
          exercise_order: number
          id: number
          notes: string | null
          partial_reps: number | null
          reps_max: number | null
          reps_min: number | null
          reps_range: string | null
          rest_between_sets_seconds: number | null
          rir: number | null
          routine_id: number
          sets: number | null
        }
        Insert: {
          block_name?: string | null
          duration_seconds?: number | null
          exercise_id: number
          exercise_order: number
          id?: number
          notes?: string | null
          partial_reps?: number | null
          reps_max?: number | null
          reps_min?: number | null
          reps_range?: string | null
          rest_between_sets_seconds?: number | null
          rir?: number | null
          routine_id: number
          sets?: number | null
        }
        Update: {
          block_name?: string | null
          duration_seconds?: number | null
          exercise_id?: number
          exercise_order?: number
          id?: number
          notes?: string | null
          partial_reps?: number | null
          reps_max?: number | null
          reps_min?: number | null
          reps_range?: string | null
          rest_between_sets_seconds?: number | null
          rir?: number | null
          routine_id?: number
          sets?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "routine_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routine_exercises_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
        ]
      }
      routines: {
        Row: {
          created_at: string
          description: string | null
          estimated_duration_minutes: number | null
          gatofit_program_id: string | null
          id: number
          is_predefined: boolean
          is_program_duplicate: boolean | null
          is_user_task_copy: boolean | null
          name: string
          program_id: string | null
          type: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          estimated_duration_minutes?: number | null
          gatofit_program_id?: string | null
          id?: number
          is_predefined?: boolean
          is_program_duplicate?: boolean | null
          is_user_task_copy?: boolean | null
          name: string
          program_id?: string | null
          type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          estimated_duration_minutes?: number | null
          gatofit_program_id?: string | null
          id?: number
          is_predefined?: boolean
          is_program_duplicate?: boolean | null
          is_user_task_copy?: boolean | null
          name?: string
          program_id?: string | null
          type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "routines_gatofit_program_id_fkey"
            columns: ["gatofit_program_id"]
            isOneToOne: false
            referencedRelation: "gatofit_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routines_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "admin_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routines_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routines_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_rankings"
            referencedColumns: ["user_id"]
          },
        ]
      }
      shared_routines: {
        Row: {
          downloads_count: number | null
          id: number
          is_public: boolean | null
          routine_id: number
          shared_at: string | null
          user_id: string
        }
        Insert: {
          downloads_count?: number | null
          id?: number
          is_public?: boolean | null
          routine_id: number
          shared_at?: string | null
          user_id: string
        }
        Update: {
          downloads_count?: number | null
          id?: number
          is_public?: boolean | null
          routine_id?: number
          shared_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_routines_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: true
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_routines_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_routines_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_rankings"
            referencedColumns: ["user_id"]
          },
        ]
      }
      subscription_payment_failures: {
        Row: {
          created_at: string | null
          failed_at: string
          failure_reason: string | null
          grace_period_ends_at: string
          id: string
          last_retry_at: string | null
          resolved_at: string | null
          retry_count: number | null
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          failed_at?: string
          failure_reason?: string | null
          grace_period_ends_at: string
          id?: string
          last_retry_at?: string | null
          resolved_at?: string | null
          retry_count?: number | null
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          failed_at?: string
          failure_reason?: string | null
          grace_period_ends_at?: string
          id?: string
          last_retry_at?: string | null
          resolved_at?: string | null
          retry_count?: number | null
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_payment_failures_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          duration_days: number
          features: Json | null
          id: string
          intro_price_usd: number | null
          intro_price_with_promo_usd: number | null
          is_active: boolean | null
          name: string
          plan_type: Database["public"]["Enums"]["subscription_plan_type"]
          price_usd: number
          trial_days: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          duration_days: number
          features?: Json | null
          id?: string
          intro_price_usd?: number | null
          intro_price_with_promo_usd?: number | null
          is_active?: boolean | null
          name: string
          plan_type: Database["public"]["Enums"]["subscription_plan_type"]
          price_usd: number
          trial_days?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          duration_days?: number
          features?: Json | null
          id?: string
          intro_price_usd?: number | null
          intro_price_with_promo_usd?: number | null
          is_active?: boolean | null
          name?: string
          plan_type?: Database["public"]["Enums"]["subscription_plan_type"]
          price_usd?: number
          trial_days?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          attachment_url: string | null
          content: string | null
          created_at: string
          id: string
          is_read: boolean
          message_type: string
          sender_id: string
          ticket_id: string
        }
        Insert: {
          attachment_url?: string | null
          content?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message_type?: string
          sender_id: string
          ticket_id: string
        }
        Update: {
          attachment_url?: string | null
          content?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message_type?: string
          sender_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_ticket_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          ticket_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          ticket_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_attachments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_at: string | null
          assigned_to: string | null
          category: string
          category_path: string[] | null
          closed_at: string | null
          closed_by: string | null
          created_at: string
          id: string
          is_closed: boolean
          message: string
          priority: string
          resolved_at: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_to?: string | null
          category: string
          category_path?: string[] | null
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string
          id?: string
          is_closed?: boolean
          message: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_to?: string | null
          category?: string
          category_path?: string[] | null
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string
          id?: string
          is_closed?: boolean
          message?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "coach_branding_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_closed_by_fkey"
            columns: ["closed_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_closed_by_fkey"
            columns: ["closed_by"]
            isOneToOne: false
            referencedRelation: "coach_branding_public"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_limits: {
        Row: {
          ai_chat_messages_used: number | null
          created_at: string | null
          id: string
          nutrition_photos_used: number | null
          routines_created: number | null
          updated_at: string | null
          user_id: string
          week_start_date: string
        }
        Insert: {
          ai_chat_messages_used?: number | null
          created_at?: string | null
          id?: string
          nutrition_photos_used?: number | null
          routines_created?: number | null
          updated_at?: string | null
          user_id: string
          week_start_date: string
        }
        Update: {
          ai_chat_messages_used?: number | null
          created_at?: string | null
          id?: string
          nutrition_photos_used?: number | null
          routines_created?: number | null
          updated_at?: string | null
          user_id?: string
          week_start_date?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_type_id: number
          created_at: string
          user_id: string
        }
        Insert: {
          achievement_type_id: number
          created_at?: string
          user_id: string
        }
        Update: {
          achievement_type_id?: number
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_type_id_fkey"
            columns: ["achievement_type_id"]
            isOneToOne: false
            referencedRelation: "achievement_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_rankings"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_assigned_programs: {
        Row: {
          assigned_at: string
          assigned_by_admin: string | null
          completed_at: string | null
          completion_percentage: number | null
          created_at: string
          current_day: number
          current_week: number
          id: string
          is_active: boolean
          last_activity_date: string | null
          notes: string | null
          program_id: string
          started_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by_admin?: string | null
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string
          current_day?: number
          current_week?: number
          id?: string
          is_active?: boolean
          last_activity_date?: string | null
          notes?: string | null
          program_id: string
          started_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by_admin?: string | null
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string
          current_day?: number
          current_week?: number
          id?: string
          is_active?: boolean
          last_activity_date?: string | null
          notes?: string | null
          program_id?: string
          started_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_assigned_programs_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "admin_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_daily_macro_targets: {
        Row: {
          calories_target: number
          carbs_g_target: number
          fat_g_target: number
          id: number
          protein_g_target: number
          target_date_start: string
          user_id: string
        }
        Insert: {
          calories_target: number
          carbs_g_target: number
          fat_g_target: number
          id?: number
          protein_g_target: number
          target_date_start?: string
          user_id: string
        }
        Update: {
          calories_target?: number
          carbs_g_target?: number
          fat_g_target?: number
          id?: number
          protein_g_target?: number
          target_date_start?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_daily_macro_targets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_daily_macro_targets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_rankings"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_discount_codes: {
        Row: {
          discount_code_id: string
          id: string
          subscription_id: string | null
          used_at: string | null
          user_id: string
        }
        Insert: {
          discount_code_id: string
          id?: string
          subscription_id?: string | null
          used_at?: string | null
          user_id: string
        }
        Update: {
          discount_code_id?: string
          id?: string
          subscription_id?: string | null
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_discount_codes_discount_code_id_fkey"
            columns: ["discount_code_id"]
            isOneToOne: false
            referencedRelation: "discount_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_discount_codes_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: number
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: number
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "user_rankings"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "user_rankings"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_gatofit_program_progress: {
        Row: {
          completed_at: string | null
          completion_percentage: number | null
          created_at: string
          current_day: number
          current_week: number
          id: string
          is_active: boolean
          last_workout_date: string | null
          program_id: string
          started_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string
          current_day?: number
          current_week?: number
          id?: string
          is_active?: boolean
          last_workout_date?: string | null
          program_id: string
          started_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string
          current_day?: number
          current_week?: number
          id?: string
          is_active?: boolean
          last_workout_date?: string | null
          program_id?: string
          started_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_gatofit_program_progress_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "gatofit_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_obstacles: {
        Row: {
          created_at: string
          obstacle_type_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          obstacle_type_id: number
          user_id: string
        }
        Update: {
          created_at?: string
          obstacle_type_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_obstacles_obstacle_type_id_fkey"
            columns: ["obstacle_type_id"]
            isOneToOne: false
            referencedRelation: "obstacle_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_obstacles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_obstacles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_rankings"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_promo_codes: {
        Row: {
          applied_at: string | null
          created_at: string | null
          discount_value: number
          id: string
          is_active: boolean | null
          promo_code: string
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          created_at?: string | null
          discount_value: number
          id?: string
          is_active?: boolean | null
          promo_code: string
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          applied_at?: string | null
          created_at?: string | null
          discount_value?: number
          id?: string
          is_active?: boolean | null
          promo_code?: string
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_promo_codes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_promo_codes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_rankings"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_push_tokens: {
        Row: {
          platform: string
          token: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          platform: string
          token: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          platform?: string
          token?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_scheduled_tasks: {
        Row: {
          completed_at: string | null
          created_at: string | null
          created_by_admin: string | null
          description: string | null
          duration_minutes: number | null
          evolution_body_fat: number | null
          evolution_notes: string | null
          evolution_weight_kg: number | null
          exercise_id: number | null
          id: string
          is_completed: boolean | null
          is_recurring: boolean | null
          library_document_id: string | null
          library_survey_id: string | null
          library_video_id: string | null
          nutrition_plan_id: string | null
          parent_task_id: string | null
          program_id: string | null
          recurrence_end_date: string | null
          recurrence_pattern: string | null
          routine_id: number | null
          scheduled_date: string
          session_notes: string | null
          session_time: string | null
          session_type: string | null
          task_type: string
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          created_by_admin?: string | null
          description?: string | null
          duration_minutes?: number | null
          evolution_body_fat?: number | null
          evolution_notes?: string | null
          evolution_weight_kg?: number | null
          exercise_id?: number | null
          id?: string
          is_completed?: boolean | null
          is_recurring?: boolean | null
          library_document_id?: string | null
          library_survey_id?: string | null
          library_video_id?: string | null
          nutrition_plan_id?: string | null
          parent_task_id?: string | null
          program_id?: string | null
          recurrence_end_date?: string | null
          recurrence_pattern?: string | null
          routine_id?: number | null
          scheduled_date: string
          session_notes?: string | null
          session_time?: string | null
          session_type?: string | null
          task_type: string
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          created_by_admin?: string | null
          description?: string | null
          duration_minutes?: number | null
          evolution_body_fat?: number | null
          evolution_notes?: string | null
          evolution_weight_kg?: number | null
          exercise_id?: number | null
          id?: string
          is_completed?: boolean | null
          is_recurring?: boolean | null
          library_document_id?: string | null
          library_survey_id?: string | null
          library_video_id?: string | null
          nutrition_plan_id?: string | null
          parent_task_id?: string | null
          program_id?: string | null
          recurrence_end_date?: string | null
          recurrence_pattern?: string | null
          routine_id?: number | null
          scheduled_date?: string
          session_notes?: string | null
          session_time?: string | null
          session_type?: string | null
          task_type?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_scheduled_tasks_created_by_admin_fkey"
            columns: ["created_by_admin"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_scheduled_tasks_created_by_admin_fkey"
            columns: ["created_by_admin"]
            isOneToOne: false
            referencedRelation: "coach_branding_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_scheduled_tasks_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_scheduled_tasks_library_document_id_fkey"
            columns: ["library_document_id"]
            isOneToOne: false
            referencedRelation: "library_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_scheduled_tasks_library_survey_id_fkey"
            columns: ["library_survey_id"]
            isOneToOne: false
            referencedRelation: "library_surveys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_scheduled_tasks_library_video_id_fkey"
            columns: ["library_video_id"]
            isOneToOne: false
            referencedRelation: "library_videos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_scheduled_tasks_nutrition_plan_id_fkey"
            columns: ["nutrition_plan_id"]
            isOneToOne: false
            referencedRelation: "nutrition_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_scheduled_tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "user_scheduled_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_scheduled_tasks_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "admin_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_scheduled_tasks_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_scheduled_tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_scheduled_tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_rankings"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_streaks: {
        Row: {
          created_at: string
          current_level: number
          current_streak: number
          experience_today: number
          foods_today: number
          id: number
          last_activity_date: string | null
          last_freeze_date: string | null
          last_xp_date: string | null
          max_freezes_capacity: number | null
          streak_freezes: number | null
          total_experience: number
          total_points: number
          updated_at: string
          user_id: string
          workouts_today: number
        }
        Insert: {
          created_at?: string
          current_level?: number
          current_streak?: number
          experience_today?: number
          foods_today?: number
          id?: number
          last_activity_date?: string | null
          last_freeze_date?: string | null
          last_xp_date?: string | null
          max_freezes_capacity?: number | null
          streak_freezes?: number | null
          total_experience?: number
          total_points?: number
          updated_at?: string
          user_id: string
          workouts_today?: number
        }
        Update: {
          created_at?: string
          current_level?: number
          current_streak?: number
          experience_today?: number
          foods_today?: number
          id?: number
          last_activity_date?: string | null
          last_freeze_date?: string | null
          last_xp_date?: string | null
          max_freezes_capacity?: number | null
          streak_freezes?: number | null
          total_experience?: number
          total_points?: number
          updated_at?: string
          user_id?: string
          workouts_today?: number
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          auto_renewal: boolean | null
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string | null
          discount_code_id: string | null
          expires_at: string | null
          google_play_order_id: string | null
          google_play_purchase_token: string | null
          id: string
          next_plan_starts_at: string | null
          next_plan_type:
            | Database["public"]["Enums"]["subscription_plan_type"]
            | null
          payment_failed_at: string | null
          payment_method: string | null
          paypal_payer_id: string | null
          paypal_subscription_id: string | null
          plan_type: Database["public"]["Enums"]["subscription_plan_type"]
          promo_code_used: string | null
          receipt_data: string | null
          revenuecat_customer_id: string | null
          revenuecat_original_transaction_id: string | null
          scheduled_change_created_at: string | null
          started_at: string
          status: Database["public"]["Enums"]["subscription_status"]
          store_platform: string | null
          store_transaction_id: string | null
          suspended_at: string | null
          trial_cancelled: boolean | null
          trial_ends_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_renewal?: boolean | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          discount_code_id?: string | null
          expires_at?: string | null
          google_play_order_id?: string | null
          google_play_purchase_token?: string | null
          id?: string
          next_plan_starts_at?: string | null
          next_plan_type?:
            | Database["public"]["Enums"]["subscription_plan_type"]
            | null
          payment_failed_at?: string | null
          payment_method?: string | null
          paypal_payer_id?: string | null
          paypal_subscription_id?: string | null
          plan_type?: Database["public"]["Enums"]["subscription_plan_type"]
          promo_code_used?: string | null
          receipt_data?: string | null
          revenuecat_customer_id?: string | null
          revenuecat_original_transaction_id?: string | null
          scheduled_change_created_at?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          store_platform?: string | null
          store_transaction_id?: string | null
          suspended_at?: string | null
          trial_cancelled?: boolean | null
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_renewal?: boolean | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          discount_code_id?: string | null
          expires_at?: string | null
          google_play_order_id?: string | null
          google_play_purchase_token?: string | null
          id?: string
          next_plan_starts_at?: string | null
          next_plan_type?:
            | Database["public"]["Enums"]["subscription_plan_type"]
            | null
          payment_failed_at?: string | null
          payment_method?: string | null
          paypal_payer_id?: string | null
          paypal_subscription_id?: string | null
          plan_type?: Database["public"]["Enums"]["subscription_plan_type"]
          promo_code_used?: string | null
          receipt_data?: string | null
          revenuecat_customer_id?: string | null
          revenuecat_original_transaction_id?: string | null
          scheduled_change_created_at?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          store_platform?: string | null
          store_transaction_id?: string | null
          suspended_at?: string | null
          trial_cancelled?: boolean | null
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_discount_code_id_fkey"
            columns: ["discount_code_id"]
            isOneToOne: false
            referencedRelation: "discount_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_tag_assignments: {
        Row: {
          assigned_at: string
          assigned_by_admin: string | null
          id: string
          tag_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by_admin?: string | null
          id?: string
          tag_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by_admin?: string | null
          id?: string
          tag_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_tag_assignments_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "user_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      user_tags: {
        Row: {
          color: Database["public"]["Enums"]["tag_color"]
          created_at: string
          created_by_admin: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          color?: Database["public"]["Enums"]["tag_color"]
          created_at?: string
          created_by_admin?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          color?: Database["public"]["Enums"]["tag_color"]
          created_at?: string
          created_by_admin?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      valid_promo_codes: {
        Row: {
          code: string
          created_at: string | null
          current_uses: number | null
          discount_value: number
          id: string
          is_active: boolean | null
          max_uses: number | null
          updated_at: string | null
          valid_from: string | null
          valid_to: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          current_uses?: number | null
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          updated_at?: string | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          current_uses?: number | null
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          updated_at?: string | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          created_at: string | null
          event_id: string
          event_type: string
          id: string
          payload: Json
          processed_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_id: string
          event_type: string
          id?: string
          payload: Json
          processed_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string
          event_type?: string
          id?: string
          payload?: Json
          processed_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      weekly_program_routines: {
        Row: {
          created_at: string
          day_of_week: number
          id: string
          order_in_day: number
          program_id: string
          routine_id: number
        }
        Insert: {
          created_at?: string
          day_of_week: number
          id?: string
          order_in_day?: number
          program_id: string
          routine_id: number
        }
        Update: {
          created_at?: string
          day_of_week?: number
          id?: string
          order_in_day?: number
          program_id?: string
          routine_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "weekly_program_routines_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "weekly_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_program_routines_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_programs: {
        Row: {
          created_at: string
          current_week: number | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          program_type: string | null
          start_date: string | null
          total_weeks: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_week?: number | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          program_type?: string | null
          start_date?: string | null
          total_weeks?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_week?: number | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          program_type?: string | null
          start_date?: string | null
          total_weeks?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workout_log_exercise_details: {
        Row: {
          duration_seconds_completed: number | null
          exercise_id: number
          exercise_name_snapshot: string
          id: number
          notes: string | null
          partial_reps: number | null
          reps_completed: number | null
          rir: number | null
          set_number: number
          weight_kg_used: number | null
          workout_log_id: number
        }
        Insert: {
          duration_seconds_completed?: number | null
          exercise_id: number
          exercise_name_snapshot: string
          id?: number
          notes?: string | null
          partial_reps?: number | null
          reps_completed?: number | null
          rir?: number | null
          set_number: number
          weight_kg_used?: number | null
          workout_log_id: number
        }
        Update: {
          duration_seconds_completed?: number | null
          exercise_id?: number
          exercise_name_snapshot?: string
          id?: number
          notes?: string | null
          partial_reps?: number | null
          reps_completed?: number | null
          rir?: number | null
          set_number?: number
          weight_kg_used?: number | null
          workout_log_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "workout_log_exercise_details_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_log_exercise_details_workout_log_id_fkey"
            columns: ["workout_log_id"]
            isOneToOne: false
            referencedRelation: "workout_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_logs: {
        Row: {
          calories_burned_estimated: number | null
          duration_completed_minutes: number | null
          id: number
          notes: string | null
          routine_id: number | null
          routine_name_snapshot: string | null
          user_id: string
          workout_date: string
        }
        Insert: {
          calories_burned_estimated?: number | null
          duration_completed_minutes?: number | null
          id?: number
          notes?: string | null
          routine_id?: number | null
          routine_name_snapshot?: string | null
          user_id: string
          workout_date?: string
        }
        Update: {
          calories_burned_estimated?: number | null
          duration_completed_minutes?: number | null
          id?: number
          notes?: string | null
          routine_id?: number | null
          routine_name_snapshot?: string | null
          user_id?: string
          workout_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_logs_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_rankings"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      ai_workout_exercise_details_view: {
        Row: {
          exercise_name_snapshot: string | null
          id: number | null
          notes: string | null
          reps_completed: number | null
          set_number: number | null
          user_id: string | null
          weight_kg_used: number | null
          workout_date: string | null
          workout_log_id: number | null
          workout_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_log_exercise_details_workout_log_id_fkey"
            columns: ["workout_log_id"]
            isOneToOne: false
            referencedRelation: "workout_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_rankings"
            referencedColumns: ["user_id"]
          },
        ]
      }
      coach_branding_public: {
        Row: {
          banner_image_url: string | null
          company_name: string | null
          id: string | null
          logo_image_url: string | null
          primary_button_color: string | null
          primary_button_fill_color: string | null
          ranking_image_url: string | null
        }
        Insert: {
          banner_image_url?: string | null
          company_name?: string | null
          id?: string | null
          logo_image_url?: string | null
          primary_button_color?: string | null
          primary_button_fill_color?: string | null
          ranking_image_url?: string | null
        }
        Update: {
          banner_image_url?: string | null
          company_name?: string | null
          id?: string | null
          logo_image_url?: string | null
          primary_button_color?: string | null
          primary_button_fill_color?: string | null
          ranking_image_url?: string | null
        }
        Relationships: []
      }
      user_rankings: {
        Row: {
          avatar_url: string | null
          current_level: number | null
          current_streak: number | null
          followers_count: number | null
          following_count: number | null
          rank_name: string | null
          total_experience: number | null
          total_workouts: number | null
          user_id: string | null
          username: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_admin_user: {
        Args: {
          p_email: string
          p_full_name: string
          p_role?: Database["public"]["Enums"]["admin_role"]
        }
        Returns: Json
      }
      add_client_by_email:
        | {
            Args: { p_display_name?: string; p_email: string; p_notes?: string }
            Returns: Json
          }
        | { Args: { p_email: string; p_notes?: string }; Returns: Json }
      apply_discount_code: {
        Args: { p_code: string; p_user_id: string }
        Returns: Json
      }
      apply_promo_code_to_user: {
        Args: { p_code: string; p_user_id: string }
        Returns: Json
      }
      assign_users_to_coach: {
        Args: { p_coach_id: string; p_user_ids: string[] }
        Returns: Json
      }
      calculate_macro_recommendations: {
        Args: {
          user_age: number
          user_gender: string
          user_goal: string
          user_height_cm: number
          user_target_pace: string
          user_trainings_per_week: number
          user_weight_kg: number
        }
        Returns: Json
      }
      can_coach_add_client: { Args: { p_coach_id: string }; Returns: boolean }
      can_coach_view_user: { Args: { p_user_id: string }; Returns: boolean }
      can_view_exercise: {
        Args: { exercise_creator_id: string; exercise_is_public: boolean }
        Returns: boolean
      }
      cancel_scheduled_plan_change: {
        Args: { p_user_id: string }
        Returns: Json
      }
      check_auth_rate_limit: {
        Args: {
          p_identifier: string
          p_max_attempts?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      check_page_tutorial_completed: {
        Args: { p_page_key: string }
        Returns: boolean
      }
      check_user_is_admin: { Args: { user_uuid?: string }; Returns: boolean }
      clean_old_food_entries: { Args: never; Returns: undefined }
      clear_chat_memory: { Args: { p_user_id: string }; Returns: undefined }
      clone_admin_program: {
        Args: { is_starter?: boolean; source_program_id: string }
        Returns: string
      }
      clone_nutrition_plan_for_program: {
        Args: {
          new_plan_name?: string
          source_plan_id: string
          target_program_id: string
        }
        Returns: string
      }
      clone_nutrition_plan_for_user: {
        Args: {
          new_plan_name?: string
          source_plan_id: string
          target_user_id: string
        }
        Returns: string
      }
      clone_nutrition_plan_for_user_task: {
        Args: { new_plan_name: string; source_plan_id: string }
        Returns: string
      }
      clone_routine_for_gatofit_program: {
        Args: {
          new_routine_name?: string
          source_routine_id: number
          target_program_id: string
        }
        Returns: number
      }
      clone_routine_for_program: {
        Args: {
          new_routine_name?: string
          source_routine_id: number
          target_program_id: string
        }
        Returns: number
      }
      clone_routine_for_user: {
        Args: {
          new_routine_name?: string
          source_routine_id: number
          target_user_id: string
        }
        Returns: number
      }
      clone_routine_for_user_task: {
        Args: {
          new_routine_name: string
          source_routine_id: number
          target_user_id: string
        }
        Returns: number
      }
      clone_survey_for_program: {
        Args: {
          new_survey_title: string
          source_survey_id: string
          target_program_id: string
        }
        Returns: string
      }
      clone_survey_for_user_task: {
        Args: { new_survey_title: string; source_survey_id: string }
        Returns: string
      }
      complete_my_coach_onboarding: { Args: never; Returns: boolean }
      complete_my_coach_tutorial: { Args: never; Returns: boolean }
      complete_page_tutorial: { Args: { p_page_key: string }; Returns: boolean }
      copy_routine: {
        Args: { source_routine_id: number; target_user_id: string }
        Returns: Json
      }
      create_user_profile: { Args: { user_id: string }; Returns: Json }
      downgrade_inactive_coach_clients: {
        Args: never
        Returns: {
          affected_coaches_count: number
          downgraded_count: number
        }[]
      }
      duplicate_nutrition_plan: {
        Args: { source_plan_id: string }
        Returns: string
      }
      ensure_user_subscription: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      get_admin_branding: { Args: never; Returns: Json }
      get_admin_dashboard_stats: { Args: never; Returns: Json }
      get_admin_role: {
        Args: { user_id?: string }
        Returns: Database["public"]["Enums"]["admin_role"]
      }
      get_app_settings: { Args: never; Returns: Json }
      get_asesorados_users: {
        Args: { search_term?: string }
        Returns: {
          avatar_url: string
          email: string
          full_name: string
          id: string
          username: string
        }[]
      }
      get_coach_branding: { Args: { p_coach_id: string }; Returns: Json }
      get_coach_client_count: { Args: { p_coach_id: string }; Returns: number }
      get_coach_client_limit_info: {
        Args: { p_coach_id: string }
        Returns: Json
      }
      get_coach_clients_program_end_dates: {
        Args: never
        Returns: {
          avatar_url: string
          days_remaining: number
          full_name: string
          program_end_date: string
          program_name: string
          total_weeks: number
          user_id: string
          username: string
          weeks_completed: number
        }[]
      }
      get_coach_notifications: { Args: { p_coach_id: string }; Returns: Json }
      get_current_user_coach_id: { Args: never; Returns: string }
      get_default_colors: { Args: never; Returns: Json }
      get_my_admin_permissions: {
        Args: never
        Returns: {
          category: string
          description: string
          permission_key: string
        }[]
      }
      get_my_coach_onboarding_completed: { Args: never; Returns: boolean }
      get_my_coach_tutorial_completed: { Args: never; Returns: boolean }
      get_public_routines: {
        Args: { target_user_id: string }
        Returns: {
          created_at: string
          estimated_duration_minutes: number
          exercise_count: number
          routine_description: string
          routine_id: number
          routine_name: string
          routine_type: string
        }[]
      }
      get_routine_details: {
        Args: { routine_ids: number[] }
        Returns: {
          description: string
          estimated_duration_minutes: number
          id: number
          name: string
          type: string
        }[]
      }
      get_safe_public_profile: {
        Args: { target_user_id: string }
        Returns: {
          avatar_url: string
          bio: string
          id: string
          is_profile_public: boolean
          total_workouts: number
          username: string
        }[]
      }
      get_safe_public_profiles: {
        Args: never
        Returns: {
          avatar_url: string
          id: string
          is_profile_public: boolean
          username: string
        }[]
      }
      get_user_activity_calendar: {
        Args: { p_month?: number; p_user_id: string; p_year?: number }
        Returns: Json
      }
      get_user_details: { Args: { p_user_id: string }; Returns: Json }
      get_user_growth_by_month: {
        Args: never
        Returns: {
          month: string
          new_users: number
          total_users: number
        }[]
      }
      get_user_nutrition_details: {
        Args: { p_date: string; p_user_id: string }
        Returns: Json
      }
      get_user_stats: {
        Args: { target_user_id: string }
        Returns: {
          followers_count: number
          following_count: number
          total_workout_hours: number
          total_workouts: number
        }[]
      }
      get_user_subscription_status: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_weekly_usage: {
        Args: { user_id: string }
        Returns: {
          ai_chat_messages_used: number
          nutrition_photos_used: number
          routines_created: number
          week_start_date: string
        }[]
      }
      get_user_weight_evolution: {
        Args: { p_days_back?: number; p_user_id: string }
        Returns: Json
      }
      get_users_by_tags: {
        Args: { search_term?: string; tag_ids: string[] }
        Returns: {
          avatar_url: string
          email: string
          full_name: string
          id: string
          username: string
        }[]
      }
      get_users_with_filters: {
        Args: {
          p_activity_level?: string
          p_limit?: number
          p_offset?: number
          p_order_by?: string
          p_order_direction?: string
          p_search?: string
          p_subscription_type?: string
        }
        Returns: {
          avatar_url: string
          created_at: string
          current_streak: number
          full_name: string
          id: string
          is_active: boolean
          last_activity: string
          subscription_status: string
          subscription_type: string
          total_workouts: number
          username: string
        }[]
      }
      get_users_with_role_restrictions: {
        Args: {
          p_activity_level?: string
          p_limit?: number
          p_offset?: number
          p_order_by?: string
          p_order_direction?: string
          p_search?: string
          p_subscription_type?: string
        }
        Returns: {
          avatar_url: string
          created_at: string
          current_streak: number
          full_name: string
          id: string
          is_active: boolean
          last_activity: string
          subscription_status: string
          subscription_type: string
          total_workouts: number
          username: string
        }[]
      }
      get_users_with_tags_and_filters:
        | {
            Args: {
              p_limit?: number
              p_offset?: number
              p_order_by?: string
              p_order_direction?: string
              p_search?: string
              p_subscription_type?: string
              p_tag_id?: string
            }
            Returns: {
              avatar_url: string
              coach_avatar_url: string
              coach_id: string
              coach_name: string
              created_at: string
              current_streak: number
              email: string
              full_name: string
              id: string
              is_active: boolean
              is_invited: boolean
              last_activity: string
              subscription_status: string
              subscription_type: string
              tags: Json
              total_workouts: number
              username: string
            }[]
          }
        | {
            Args: {
              p_limit?: number
              p_offset?: number
              p_search?: string
              p_subscription_type?: string
              p_tag_ids?: string[]
            }
            Returns: {
              avatar_url: string
              created_at: string
              current_streak: number
              email: string
              full_name: string
              id: string
              is_active: boolean
              last_activity: string
              subscription_status: string
              subscription_type: string
              tags: Json
              total_workouts: number
              username: string
            }[]
          }
      get_week_start: { Args: { input_date?: string }; Returns: string }
      get_weekly_streak_activity: {
        Args: { p_user_id: string }
        Returns: number[]
      }
      get_workout_session_details: {
        Args: { p_workout_log_id: number }
        Returns: Json
      }
      handle_expired_subscriptions: { Args: never; Returns: undefined }
      has_admin_permission: {
        Args: { p_permission_key: string }
        Returns: boolean
      }
      increment_usage_counter: {
        Args: { counter_type: string; increment_by?: number; p_user_id: string }
        Returns: boolean
      }
      is_admin: { Args: { user_id?: string }; Returns: boolean }
      is_current_user_admin: { Args: never; Returns: boolean }
      is_current_user_admin_safe: { Args: never; Returns: boolean }
      is_current_user_super_admin: { Args: never; Returns: boolean }
      is_user_premium: { Args: { user_id: string }; Returns: boolean }
      mark_support_messages_as_read: {
        Args: { p_ticket_id: string }
        Returns: undefined
      }
      process_scheduled_plan_changes: { Args: never; Returns: undefined }
      register_coach: {
        Args: { p_email: string; p_full_name: string; p_user_id: string }
        Returns: boolean
      }
      restore_inactive_coach_clients: {
        Args: { p_coach_id: string }
        Returns: number
      }
      schedule_plan_change: {
        Args: {
          p_new_plan_type: Database["public"]["Enums"]["subscription_plan_type"]
          p_user_id: string
        }
        Returns: Json
      }
      unassign_client_from_coach:
        | { Args: { p_coach_id: string; p_user_id: string }; Returns: Json }
        | { Args: { p_user_id: string }; Returns: Json }
      update_admin_branding: {
        Args: { p_setting_key: string; p_setting_value: Json }
        Returns: undefined
      }
      update_app_setting: {
        Args: { p_setting_key: string; p_setting_value: Json }
        Returns: undefined
      }
      update_expired_subscriptions: { Args: never; Returns: undefined }
      update_user_streak: {
        Args: { p_client_date?: string; p_user_id: string }
        Returns: undefined
      }
      update_user_streak_v2: {
        Args: { p_client_date?: string; p_user_id: string }
        Returns: undefined
      }
      update_user_subscription_plan: {
        Args: {
          p_admin_user_id?: string
          p_new_plan_type: Database["public"]["Enums"]["subscription_plan_type"]
          p_user_id: string
        }
        Returns: Json
      }
      validate_and_apply_promo_code: {
        Args: { p_code: string; p_user_id: string }
        Returns: Json
      }
      validate_discount_code: {
        Args: { p_code: string; p_plan_type?: string; p_user_id: string }
        Returns: Json
      }
      validate_promo_code: {
        Args: { p_code: string; p_user_id: string }
        Returns: Json
      }
      verify_admin_status: { Args: never; Returns: Json }
    }
    Enums: {
      admin_role: "super_admin" | "moderator" | "content_manager" | "coach"
      difficulty_level: "beginner" | "intermediate" | "advanced"
      gender_type: "male" | "female" | "other" | "prefer_not_to_say"
      goal_type:
        | "gain_muscle"
        | "lose_weight"
        | "maintain_weight"
        | "gain_weight"
        | "improve_health"
        | "increase_strength"
      meal_type: "breakfast" | "lunch" | "dinner" | "snack1" | "snack2"
      pace_type: "sloth" | "rabbit" | "leopard"
      subscription_plan_type:
        | "free"
        | "monthly"
        | "yearly"
        | "asesorados"
        | "test_daily"
      subscription_status:
        | "active"
        | "expired"
        | "cancelled"
        | "pending"
        | "trial"
        | "suspended"
        | "payment_failed"
      survey_question_type:
        | "single_choice"
        | "multiple_choice"
        | "short_text"
        | "long_text"
        | "rating"
        | "yes_no"
      tag_color:
        | "gray"
        | "red"
        | "yellow"
        | "green"
        | "blue"
        | "indigo"
        | "purple"
        | "pink"
      unit_system: "metric" | "imperial"
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
    Enums: {
      admin_role: ["super_admin", "moderator", "content_manager", "coach"],
      difficulty_level: ["beginner", "intermediate", "advanced"],
      gender_type: ["male", "female", "other", "prefer_not_to_say"],
      goal_type: [
        "gain_muscle",
        "lose_weight",
        "maintain_weight",
        "gain_weight",
        "improve_health",
        "increase_strength",
      ],
      meal_type: ["breakfast", "lunch", "dinner", "snack1", "snack2"],
      pace_type: ["sloth", "rabbit", "leopard"],
      subscription_plan_type: [
        "free",
        "monthly",
        "yearly",
        "asesorados",
        "test_daily",
      ],
      subscription_status: [
        "active",
        "expired",
        "cancelled",
        "pending",
        "trial",
        "suspended",
        "payment_failed",
      ],
      survey_question_type: [
        "single_choice",
        "multiple_choice",
        "short_text",
        "long_text",
        "rating",
        "yes_no",
      ],
      tag_color: [
        "gray",
        "red",
        "yellow",
        "green",
        "blue",
        "indigo",
        "purple",
        "pink",
      ],
      unit_system: ["metric", "imperial"],
    },
  },
} as const
