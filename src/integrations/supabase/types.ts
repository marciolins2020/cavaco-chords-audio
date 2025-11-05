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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      daily_challenges: {
        Row: {
          challenge_type: string
          completed: boolean
          created_at: string
          current_progress: number
          date: string
          description: string
          icon: string
          id: string
          target_value: number
          title: string
          updated_at: string
          user_id: string
          xp_reward: number
        }
        Insert: {
          challenge_type: string
          completed?: boolean
          created_at?: string
          current_progress?: number
          date: string
          description: string
          icon: string
          id?: string
          target_value: number
          title: string
          updated_at?: string
          user_id: string
          xp_reward: number
        }
        Update: {
          challenge_type?: string
          completed?: boolean
          created_at?: string
          current_progress?: number
          date?: string
          description?: string
          icon?: string
          id?: string
          target_value?: number
          title?: string
          updated_at?: string
          user_id?: string
          xp_reward?: number
        }
        Relationships: []
      }
      daily_practice_log: {
        Row: {
          chords_practiced: string[] | null
          created_at: string
          id: string
          practice_date: string
          sessions_count: number
          total_attempts: number
          user_id: string
        }
        Insert: {
          chords_practiced?: string[] | null
          created_at?: string
          id?: string
          practice_date: string
          sessions_count?: number
          total_attempts?: number
          user_id: string
        }
        Update: {
          chords_practiced?: string[] | null
          created_at?: string
          id?: string
          practice_date?: string
          sessions_count?: number
          total_attempts?: number
          user_id?: string
        }
        Relationships: []
      }
      leaderboard_entries: {
        Row: {
          chords_mastered: number
          created_at: string
          current_streak: number
          id: string
          last_updated: string
          monthly_xp: number
          total_practice_days: number
          total_xp: number
          user_id: string
          username: string
          weekly_xp: number
        }
        Insert: {
          chords_mastered?: number
          created_at?: string
          current_streak?: number
          id?: string
          last_updated?: string
          monthly_xp?: number
          total_practice_days?: number
          total_xp?: number
          user_id: string
          username: string
          weekly_xp?: number
        }
        Update: {
          chords_mastered?: number
          created_at?: string
          current_streak?: number
          id?: string
          last_updated?: string
          monthly_xp?: number
          total_practice_days?: number
          total_xp?: number
          user_id?: string
          username?: string
          weekly_xp?: number
        }
        Relationships: []
      }
      practice_goals: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          current_value: number | null
          end_date: string | null
          goal_type: string
          id: string
          is_active: boolean | null
          start_date: string
          target_value: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          current_value?: number | null
          end_date?: string | null
          goal_type: string
          id?: string
          is_active?: boolean | null
          start_date?: string
          target_value: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          current_value?: number | null
          end_date?: string | null
          goal_type?: string
          id?: string
          is_active?: boolean | null
          start_date?: string
          target_value?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      practice_sessions: {
        Row: {
          attempts: number | null
          best_time: number | null
          chord_id: string
          created_at: string | null
          id: string
          last_practiced: string | null
          mastered: boolean | null
          successes: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attempts?: number | null
          best_time?: number | null
          chord_id: string
          created_at?: string | null
          id?: string
          last_practiced?: string | null
          mastered?: boolean | null
          successes?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attempts?: number | null
          best_time?: number | null
          chord_id?: string
          created_at?: string | null
          id?: string
          last_practiced?: string | null
          mastered?: boolean | null
          successes?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      practice_stats: {
        Row: {
          achievements: string[] | null
          chords_learned: string[] | null
          chords_mastered: string[] | null
          consecutive_days: number | null
          created_at: string | null
          fastest_transition: number | null
          id: string
          last_practice_date: string | null
          total_attempts: number | null
          total_successes: number | null
          total_xp: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          achievements?: string[] | null
          chords_learned?: string[] | null
          chords_mastered?: string[] | null
          consecutive_days?: number | null
          created_at?: string | null
          fastest_transition?: number | null
          id?: string
          last_practice_date?: string | null
          total_attempts?: number | null
          total_successes?: number | null
          total_xp?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          achievements?: string[] | null
          chords_learned?: string[] | null
          chords_mastered?: string[] | null
          consecutive_days?: number | null
          created_at?: string | null
          fastest_transition?: number | null
          id?: string
          last_practice_date?: string | null
          total_attempts?: number | null
          total_successes?: number | null
          total_xp?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      practice_streaks: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_practice_date: string | null
          longest_streak: number
          streak_freeze_count: number
          total_practice_days: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_practice_date?: string | null
          longest_streak?: number
          streak_freeze_count?: number
          total_practice_days?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_practice_date?: string | null
          longest_streak?: number
          streak_freeze_count?: number
          total_practice_days?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          chord_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          chord_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          chord_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_history: {
        Row: {
          chord_id: string
          context: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          chord_id: string
          context: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          chord_id?: string
          context?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_leaderboard_entry: {
        Args: {
          p_chords_mastered: number
          p_current_streak: number
          p_monthly_xp: number
          p_total_practice_days: number
          p_total_xp: number
          p_user_id: string
          p_username: string
          p_weekly_xp: number
        }
        Returns: undefined
      }
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
