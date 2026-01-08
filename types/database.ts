export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          display_name: string | null
          birth_date: string | null
          height_cm: number
          weight_kg: number
          target_weight_kg: number | null
          age: number
          gender: 'male' | 'female'
          activity_level: number | string
          goal: 'lose' | 'maintain' | 'gain' | null
          goal_type: 'diet' | 'maintain' | 'bulk'
          calorie_adjustment: number
          target_protein_ratio: number
          target_fat_ratio: number
          target_carb_ratio: number
          bmr: number | null
          tdee: number | null
          target_calories: number | null
          target_protein_g: number | null
          target_fat_g: number | null
          target_carb_g: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          display_name?: string | null
          birth_date?: string | null
          height_cm?: number
          weight_kg?: number
          target_weight_kg?: number | null
          age?: number
          gender?: 'male' | 'female'
          activity_level?: number | string
          goal?: 'lose' | 'maintain' | 'gain' | null
          goal_type?: 'diet' | 'maintain' | 'bulk'
          calorie_adjustment?: number
          target_protein_ratio?: number
          target_fat_ratio?: number
          target_carb_ratio?: number
          bmr?: number | null
          tdee?: number | null
          target_calories?: number | null
          target_protein_g?: number | null
          target_fat_g?: number | null
          target_carb_g?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          display_name?: string | null
          birth_date?: string | null
          height_cm?: number
          weight_kg?: number
          target_weight_kg?: number | null
          age?: number
          gender?: 'male' | 'female'
          activity_level?: number | string
          goal?: 'lose' | 'maintain' | 'gain' | null
          goal_type?: 'diet' | 'maintain' | 'bulk'
          calorie_adjustment?: number
          target_protein_ratio?: number
          target_fat_ratio?: number
          target_carb_ratio?: number
          bmr?: number | null
          tdee?: number | null
          target_calories?: number | null
          target_protein_g?: number | null
          target_fat_g?: number | null
          target_carb_g?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      meal_logs: {
        Row: {
          id: string
          user_id: string
          meal_date: string
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          input_type: 'text' | 'barcode' | 'manual' | 'ocr'
          input_text: string | null
          barcode: string | null
          food_name: string
          calories: number
          protein_g: number
          fat_g: number
          carb_g: number
          fiber_g: number | null
          sodium_mg: number | null
          serving_size: string | null
          ai_response: Json | null
          confidence_score: number | null
          notes: string | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          meal_date?: string
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          input_type: 'text' | 'barcode' | 'manual' | 'ocr'
          input_text?: string | null
          barcode?: string | null
          food_name: string
          calories?: number
          protein_g?: number
          fat_g?: number
          carb_g?: number
          fiber_g?: number | null
          sodium_mg?: number | null
          serving_size?: string | null
          ai_response?: Json | null
          confidence_score?: number | null
          notes?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          meal_date?: string
          meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          input_type?: 'text' | 'barcode' | 'manual' | 'ocr'
          input_text?: string | null
          barcode?: string | null
          food_name?: string
          calories?: number
          protein_g?: number
          fat_g?: number
          carb_g?: number
          fiber_g?: number | null
          sodium_mg?: number | null
          serving_size?: string | null
          ai_response?: Json | null
          confidence_score?: number | null
          notes?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      daily_summaries: {
        Row: {
          id: string
          user_id: string
          summary_date: string
          total_calories: number
          total_protein_g: number
          total_fat_g: number
          total_carb_g: number
          calorie_achievement: number | null
          protein_achievement: number | null
          fat_achievement: number | null
          carb_achievement: number | null
          target_calories: number | null
          target_protein_g: number | null
          target_fat_g: number | null
          target_carb_g: number | null
          ai_advice: Json | null
          meal_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          summary_date: string
          total_calories?: number
          total_protein_g?: number
          total_fat_g?: number
          total_carb_g?: number
          calorie_achievement?: number | null
          protein_achievement?: number | null
          fat_achievement?: number | null
          carb_achievement?: number | null
          target_calories?: number | null
          target_protein_g?: number | null
          target_fat_g?: number | null
          target_carb_g?: number | null
          ai_advice?: Json | null
          meal_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          summary_date?: string
          total_calories?: number
          total_protein_g?: number
          total_fat_g?: number
          total_carb_g?: number
          calorie_achievement?: number | null
          protein_achievement?: number | null
          fat_achievement?: number | null
          carb_achievement?: number | null
          target_calories?: number | null
          target_protein_g?: number | null
          target_fat_g?: number | null
          target_carb_g?: number | null
          ai_advice?: Json | null
          meal_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      food_database: {
        Row: {
          id: string
          barcode: string | null
          food_name: string
          brand: string | null
          category: string | null
          calories_per_100g: number | null
          protein_per_100g: number | null
          fat_per_100g: number | null
          carb_per_100g: number | null
          default_serving_g: number | null
          source: 'open_food_facts' | 'ai_estimated' | 'user_input' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          barcode?: string | null
          food_name: string
          brand?: string | null
          category?: string | null
          calories_per_100g?: number | null
          protein_per_100g?: number | null
          fat_per_100g?: number | null
          carb_per_100g?: number | null
          default_serving_g?: number | null
          source?: 'open_food_facts' | 'ai_estimated' | 'user_input' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          barcode?: string | null
          food_name?: string
          brand?: string | null
          category?: string | null
          calories_per_100g?: number | null
          protein_per_100g?: number | null
          fat_per_100g?: number | null
          carb_per_100g?: number | null
          default_serving_g?: number | null
          source?: 'open_food_facts' | 'ai_estimated' | 'user_input' | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// 型エイリアスのエクスポート
export type Profile = Database['public']['Tables']['profiles']['Row']
export type MealLog = Database['public']['Tables']['meal_logs']['Row']
export type DailySummary = Database['public']['Tables']['daily_summaries']['Row']
export type FoodDatabase = Database['public']['Tables']['food_database']['Row']
