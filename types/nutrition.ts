// 栄養関連の型定義

export interface NutritionValues {
  calories: number
  protein: number
  fat: number
  carb: number
}

export interface DailySummary {
  id: string
  userId: string
  summaryDate: string
  totalCalories: number
  totalProteinG: number
  totalFatG: number
  totalCarbG: number
  calorieAchievement: number | null
  proteinAchievement: number | null
  fatAchievement: number | null
  carbAchievement: number | null
  targetCalories: number | null
  targetProteinG: number | null
  targetFatG: number | null
  targetCarbG: number | null
  aiAdvice: AIAdvice | null
  mealCount: number
}

export interface AIAdvice {
  summary: string
  deficientNutrients: {
    nutrient: string
    deficit: number
    recommendations: string[]
  }[]
  overconsumedNutrients: {
    nutrient: string
    excess: number
    suggestions: string[]
  }[]
  mealSuggestions: string[]
}

export interface UserProfile {
  id: string
  email: string | null
  displayName: string | null
  heightCm: number
  weightKg: number
  age: number
  gender: 'male' | 'female'
  activityLevel: number
  goalType: 'diet' | 'maintain' | 'bulk'
  calorieAdjustment: number
  targetProteinRatio: number
  targetFatRatio: number
  targetCarbRatio: number
  bmr: number | null
  tdee: number | null
  targetCalories: number | null
  targetProteinG: number | null
  targetFatG: number | null
  targetCarbG: number | null
}

export const ACTIVITY_LEVELS = [
  { value: 1.2, label: '座りがち (デスクワーク中心)', description: 'ほとんど運動しない' },
  { value: 1.375, label: '軽い運動 (週1-3回)', description: '軽い運動やスポーツ' },
  { value: 1.55, label: '中程度 (週3-5回)', description: '適度な運動やスポーツ' },
  { value: 1.725, label: '活発 (週6-7回)', description: 'ハードな運動やスポーツ' },
  { value: 1.9, label: '非常に活発', description: '肉体労働や1日2回以上の運動' },
]

export const GOAL_TYPES = [
  { value: 'diet', label: 'ダイエット (減量)', adjustment: -500 },
  { value: 'maintain', label: '維持', adjustment: 0 },
  { value: 'bulk', label: '増量', adjustment: 300 },
]

// PFCカラー定義
export const PFC_COLORS = {
  protein: {
    main: '#ef4444',  // red-500
    light: '#fecaca', // red-200
  },
  fat: {
    main: '#f59e0b',  // amber-500
    light: '#fde68a', // amber-200
  },
  carb: {
    main: '#3b82f6',  // blue-500
    light: '#bfdbfe', // blue-200
  },
  calorie: {
    main: '#10b981',  // emerald-500
    light: '#a7f3d0', // emerald-200
  },
}
