import { create } from 'zustand'
import type { MealType, AIAnalysisResult } from '@/types/meal'

interface MealState {
  // 入力状態
  mealType: MealType
  inputText: string
  isAnalyzing: boolean

  // 解析結果
  analysisResult: AIAnalysisResult | null

  // アクション
  setMealType: (type: MealType) => void
  setInputText: (text: string) => void
  setIsAnalyzing: (value: boolean) => void
  setAnalysisResult: (result: AIAnalysisResult | null) => void
  reset: () => void
}

export const useMealStore = create<MealState>((set) => ({
  mealType: 'lunch',
  inputText: '',
  isAnalyzing: false,
  analysisResult: null,

  setMealType: (type) => set({ mealType: type }),
  setInputText: (text) => set({ inputText: text }),
  setIsAnalyzing: (value) => set({ isAnalyzing: value }),
  setAnalysisResult: (result) => set({ analysisResult: result }),
  reset: () =>
    set({
      inputText: '',
      isAnalyzing: false,
      analysisResult: null,
    }),
}))
