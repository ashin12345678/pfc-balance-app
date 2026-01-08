import type { AIAnalysisResult, AIAdvice } from '@/types/nutrition'

/**
 * AI解析結果をパース
 */
export function parseAIAnalysisResponse(response: string): AIAnalysisResult | null {
  try {
    // JSONブロックを抽出
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('JSON not found in response')
      return null
    }

    const parsed = JSON.parse(jsonMatch[0])

    // バリデーション
    if (!parsed.foods || !Array.isArray(parsed.foods)) {
      console.error('Invalid foods array')
      return null
    }

    return {
      foods: parsed.foods.map((food: Record<string, unknown>) => ({
        name: String(food.name || '不明'),
        calories: Number(food.calories) || 0,
        protein: Number(food.protein) || 0,
        fat: Number(food.fat) || 0,
        carb: Number(food.carb) || 0,
        servingSize: food.servingSize as string | undefined,
      })),
      totalCalories: Number(parsed.totalCalories) || 0,
      totalProtein: Number(parsed.totalProtein) || 0,
      totalFat: Number(parsed.totalFat) || 0,
      totalCarb: Number(parsed.totalCarb) || 0,
      confidence: Number(parsed.confidence) || 0.5,
    }
  } catch (error) {
    console.error('Failed to parse AI response:', error)
    return null
  }
}

/**
 * AIアドバイスをパース
 */
export function parseAIAdviceResponse(response: string): AIAdvice | null {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('JSON not found in advice response')
      return null
    }

    const parsed = JSON.parse(jsonMatch[0])

    return {
      summary: String(parsed.summary || ''),
      deficientNutrients: (parsed.deficientNutrients || []).map((item: Record<string, unknown>) => ({
        nutrient: String(item.nutrient),
        deficit: Number(item.deficit) || 0,
        recommendations: Array.isArray(item.recommendations) 
          ? item.recommendations.map(String) 
          : [],
      })),
      overconsumedNutrients: (parsed.overconsumedNutrients || []).map((item: Record<string, unknown>) => ({
        nutrient: String(item.nutrient),
        excess: Number(item.excess) || 0,
        suggestions: Array.isArray(item.suggestions) 
          ? item.suggestions.map(String) 
          : [],
      })),
      mealSuggestions: Array.isArray(parsed.mealSuggestions) 
        ? parsed.mealSuggestions.map(String) 
        : [],
    }
  } catch (error) {
    console.error('Failed to parse AI advice response:', error)
    return null
  }
}

// エイリアスエクスポート
export const parseMealAnalysisResponse = parseAIAnalysisResponse
export const parseAdviceResponse = parseAIAdviceResponse
