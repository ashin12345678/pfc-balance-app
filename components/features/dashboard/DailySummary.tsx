'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalorieGauge } from '@/components/features/charts/CalorieGauge'
import { PFCBadges } from '@/components/features/meals/NutritionBadge'
import { formatCalories } from '@/lib/utils/format'

interface DailySummaryProps {
  date: string
  calories: number
  targetCalories: number
  protein: number
  targetProtein: number
  fat: number
  targetFat: number
  carb: number
  targetCarb: number
  mealCount: number
}

export function DailySummary({
  date,
  calories,
  targetCalories,
  protein,
  targetProtein,
  fat,
  targetFat,
  carb,
  targetCarb,
  mealCount,
}: DailySummaryProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">今日の摂取状況</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* カロリーゲージ */}
          <div className="flex-shrink-0">
            <CalorieGauge
              current={calories}
              target={targetCalories}
              size="md"
            />
          </div>

          {/* 詳細情報 */}
          <div className="flex-1 space-y-4 text-center sm:text-left">
            {/* カロリー */}
            <div>
              <div className="text-2xl font-bold">
                {formatCalories(calories)}
              </div>
              <div className="text-sm text-muted-foreground">
                目標: {formatCalories(targetCalories)}
              </div>
            </div>

            {/* PFC */}
            <div>
              <PFCBadges protein={protein} fat={fat} carb={carb} />
              <div className="text-xs text-muted-foreground mt-1">
                目標: P {targetProtein.toFixed(0)}g / F {targetFat.toFixed(0)}g / C {targetCarb.toFixed(0)}g
              </div>
            </div>

            {/* 食事回数 */}
            <div className="text-sm text-muted-foreground">
              記録した食事: {mealCount}件
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
