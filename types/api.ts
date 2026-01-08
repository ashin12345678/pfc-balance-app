// API関連の型定義

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface OpenFoodFactsProduct {
  code: string
  product_name: string
  brands?: string
  nutriments: {
    'energy-kcal_100g'?: number
    proteins_100g?: number
    fat_100g?: number
    carbohydrates_100g?: number
    fiber_100g?: number
    sodium_100g?: number
  }
  serving_size?: string
  image_url?: string
  categories?: string
}

export interface OpenFoodFactsResponse {
  status: number
  status_verbose: string
  product?: OpenFoodFactsProduct
}

export interface AIAnalyzeRequest {
  text: string
  mealType?: string
}

export interface AIAnalyzeResponse {
  success: boolean
  data?: {
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
  error?: string
}

export interface AIAdviceRequest {
  userId: string
  date: string
  currentIntake: {
    calories: number
    protein: number
    fat: number
    carb: number
  }
  targets: {
    calories: number
    protein: number
    fat: number
    carb: number
  }
}

export interface AIAdviceResponse {
  success: boolean
  data?: {
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
  error?: string
}
