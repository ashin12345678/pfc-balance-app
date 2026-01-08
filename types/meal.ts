// 食事関連の型定義

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export type InputType = 'text' | 'barcode' | 'manual' | 'ocr'

export interface MealLog {
  id: string
  userId: string
  mealDate: string
  mealType: MealType
  inputType: InputType
  inputText?: string
  barcode?: string
  foodName: string
  calories: number
  proteinG: number
  fatG: number
  carbG: number
  fiberG?: number
  sodiumMg?: number
  servingSize?: string
  aiResponse?: Record<string, unknown>
  confidenceScore?: number
  notes?: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

export interface MealInput {
  mealType: MealType
  inputType: InputType
  inputText?: string
  barcode?: string
  foodName?: string
  calories?: number
  proteinG?: number
  fatG?: number
  carbG?: number
  notes?: string
}

export interface AIAnalysisResult {
  foods: {
    name: string
    calories: number
    protein: number
    fat: number
    carb: number
    servingSize?: string
  }[]
  totalCalories: number
  totalProtein: number
  totalFat: number
  totalCarb: number
  confidence: number
}

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: '朝食',
  lunch: '昼食',
  dinner: '夕食',
  snack: '間食',
}

export const MEAL_TYPE_ICONS: Record<MealType, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍪',
}
