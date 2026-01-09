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
      admin_programs: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_super_admin: boolean | null
          name: string | null
          role: Database["public"]["Enums"]["admin_role"] | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_super_admin?: boolean | null
          name?: string | null
          role?: Database["public"]["Enums"]["admin_role"] | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_super_admin?: boolean | null
          name?: string | null
          role?: Database["public"]["Enums"]["admin_role"] | null
        }
        Relationships: []
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
            foreignKeyName: "coach_user_assignments_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_user_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      library_document_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by_admin: string | null
          assignment_type: string | null
          document_id: string
          id: string
          tag_id: string | null
          user_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by_admin?: string | null
          assignment_type?: string | null
          document_id: string
          id?: string
          tag_id?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by_admin?: string | null
          assignment_type?: string | null
          document_id?: string
          id?: string
          tag_id?: string | null
          user_id?: string | null
        }
        Relationships: [
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
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_document_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      library_documents: {
        Row: {
          created_at: string | null
          created_by_admin: string | null
          description: string | null
          file_name: string | null
          file_size_bytes: number | null
          file_url: string | null
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by_admin?: string | null
          description?: string | null
          file_name?: string | null
          file_size_bytes?: number | null
          file_url?: string | null
          id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by_admin?: string | null
          description?: string | null
          file_name?: string | null
          file_size_bytes?: number | null
          file_url?: string | null
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      library_survey_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by_admin: string | null
          assignment_type: string | null
          id: string
          survey_id: string
          tag_id: string | null
          user_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by_admin?: string | null
          assignment_type?: string | null
          id?: string
          survey_id: string
          tag_id?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by_admin?: string | null
          assignment_type?: string | null
          id?: string
          survey_id?: string
          tag_id?: string | null
          user_id?: string | null
        }
        Relationships: [
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
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_survey_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      library_surveys: {
        Row: {
          created_at: string | null
          created_by_admin: string | null
          description: string | null
          id: string
          is_active: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by_admin?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by_admin?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      library_video_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by_admin: string | null
          assignment_type: string | null
          id: string
          tag_id: string | null
          user_id: string | null
          video_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by_admin?: string | null
          assignment_type?: string | null
          id?: string
          tag_id?: string | null
          user_id?: string | null
          video_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by_admin?: string | null
          assignment_type?: string | null
          id?: string
          tag_id?: string | null
          user_id?: string | null
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_video_assignments_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
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
          created_at: string | null
          created_by_admin: string | null
          description: string | null
          id: string
          title: string
          updated_at: string | null
          youtube_url: string | null
          youtube_video_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by_admin?: string | null
          description?: string | null
          id?: string
          title: string
          updated_at?: string | null
          youtube_url?: string | null
          youtube_video_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by_admin?: string | null
          description?: string | null
          id?: string
          title?: string
          updated_at?: string | null
          youtube_url?: string | null
          youtube_video_id?: string | null
        }
        Relationships: []
      }
      routines: {
        Row: {
          created_at: string | null
          description: string | null
          exercise_count: number | null
          estimated_duration_minutes: number | null
          id: number
          is_predefined: boolean | null
          name: string
          source_type: string | null
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          exercise_count?: number | null
          estimated_duration_minutes?: number | null
          id?: number
          is_predefined?: boolean | null
          name: string
          source_type?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          exercise_count?: number | null
          estimated_duration_minutes?: number | null
          id?: number
          is_predefined?: boolean | null
          name?: string
          source_type?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "routines_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          color: Database["public"]["Enums"]["tag_color"]
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          color?: Database["public"]["Enums"]["tag_color"]
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: Database["public"]["Enums"]["tag_color"]
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Enums: {
      admin_role: ["super_admin", "moderator", "content_manager", "coach"]
      difficulty_level: ["beginner", "intermediate", "advanced"]
      gender_type: ["male", "female", "other", "prefer_not_to_say"]
      goal_type: [
        "gain_muscle",
        "lose_weight",
        "maintain_weight",
        "gain_weight",
        "improve_health",
        "increase_strength",
      ]
      meal_type: ["breakfast", "lunch", "dinner", "snack1", "snack2"]
      tag_color: [
        "gray",
        "red",
        "yellow",
        "green",
        "blue",
        "indigo",
        "purple",
        "pink",
      ]
      unit_system: ["metric", "imperial"]
    }
  }
}
