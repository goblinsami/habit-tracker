export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          icon: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          icon?: string
          color: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          icon?: string
          color?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'categories_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      habits: {
        Row: {
          id: string
          user_id: string
          category_id: string
          name: string
          created_at: string
          archived: boolean
          frequency_type: 'daily' | 'weekdays' | 'weekly' | 'yearly'
          frequency_days: number[]
          frequency_weekday: number | null
          yearly_month: number | null
          yearly_day: number | null
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          name: string
          created_at?: string
          archived?: boolean
          frequency_type?: 'daily' | 'weekdays' | 'weekly' | 'yearly'
          frequency_days?: number[]
          frequency_weekday?: number | null
          yearly_month?: number | null
          yearly_day?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          name?: string
          created_at?: string
          archived?: boolean
          frequency_type?: 'daily' | 'weekdays' | 'weekly' | 'yearly'
          frequency_days?: number[]
          frequency_weekday?: number | null
          yearly_month?: number | null
          yearly_day?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'habits_category_user_fk'
            columns: ['user_id', 'category_id']
            referencedRelation: 'categories'
            referencedColumns: ['user_id', 'id']
          },
          {
            foreignKeyName: 'habits_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      habit_entries: {
        Row: {
          id: string
          habit_id: string
          user_id: string
          date: string
          completed: boolean
          comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          habit_id: string
          user_id: string
          date: string
          completed?: boolean
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          habit_id?: string
          user_id?: string
          date?: string
          completed?: boolean
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'habit_entries_habit_user_fk'
            columns: ['user_id', 'habit_id']
            referencedRelation: 'habits'
            referencedColumns: ['user_id', 'id']
          },
          {
            foreignKeyName: 'habit_entries_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
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

export type Category = Database['public']['Tables']['categories']['Row']
export type Habit = Database['public']['Tables']['habits']['Row']
export type HabitEntry = Database['public']['Tables']['habit_entries']['Row']
