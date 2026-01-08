'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { MealInputForm } from '@/components/features/meals/MealInputForm'
import { MealCard } from '@/components/features/meals/MealCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/useToast'
import { toDateString } from '@/lib/utils/date'
import type { MealType, AIAnalysisResult } from '@/types/meal'

export default function NewMealPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null)
  const [mealType, setMealType] = useState<MealType>('lunch')
  const [inputText, setInputText] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleAnalyze = async (text: string, type: MealType) => {
    setIsLoading(true)
    setInputText(text)
    setMealType(type)

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, mealType: type }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || '解析に失敗しました')
      }

      setAnalysisResult(data.data)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'エラー',
        description: error instanceof Error ? error.message : '解析に失敗しました',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!analysisResult) return

    setIsSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('ログインが必要です')

      // 複数の食品を個別に保存
      for (const food of analysisResult.foods) {
        const { error } = await supabase.from('meal_logs').insert({
          user_id: user.id,
          meal_date: toDateString(),
          meal_type: mealType,
          input_type: 'text',
          input_text: inputText,
          food_name: food.name,
          calories: food.calories,
          protein_g: food.protein,
          fat_g: food.fat,
          carb_g: food.carb,
          serving_size: food.servingSize,
          ai_response: analysisResult,
          confidence_score: analysisResult.confidence,
        })

        if (error) throw error
      }

      toast({
        title: '保存完了',
        description: `${analysisResult.foods.length}件の食事を記録しました`,
      })

      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'エラー',
        description: error instanceof Error ? error.message : '保存に失敗しました',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setAnalysisResult(null)
    setInputText('')
  }

  return (
    <div className="min-h-screen">
      <Header title="食事を記録" showDate={false} />

      <div className="container max-w-2xl mx-auto p-4 md:p-6 space-y-6">
        {/* 入力フォーム */}
        {!analysisResult && (
          <MealInputForm onSubmit={handleAnalyze} isLoading={isLoading} />
        )}

        {/* 解析結果 */}
        {analysisResult && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">解析結果</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  入力: {inputText}
                </p>
                <div className="text-sm text-muted-foreground mb-4">
                  信頼度: {(analysisResult.confidence * 100).toFixed(0)}%
                </div>
              </CardContent>
            </Card>

            {/* 食品リスト */}
            <div className="space-y-3">
              {analysisResult.foods.map((food, index) => (
                <MealCard
                  key={index}
                  id={String(index)}
                  foodName={food.name}
                  mealType={mealType}
                  calories={food.calories}
                  protein={food.protein}
                  fat={food.fat}
                  carb={food.carb}
                />
              ))}
            </div>

            {/* 合計 */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold">
                      {analysisResult.totalCalories.toFixed(0)}
                    </div>
                    <div className="text-xs text-muted-foreground">kcal</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-red-500">
                      {analysisResult.totalProtein.toFixed(1)}g
                    </div>
                    <div className="text-xs text-muted-foreground">タンパク質</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-amber-500">
                      {analysisResult.totalFat.toFixed(1)}g
                    </div>
                    <div className="text-xs text-muted-foreground">脂質</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-500">
                      {analysisResult.totalCarb.toFixed(1)}g
                    </div>
                    <div className="text-xs text-muted-foreground">炭水化物</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* アクションボタン */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X className="mr-2 h-4 w-4" />
                やり直し
              </Button>
              <Button
                className="flex-1"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                保存する
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
