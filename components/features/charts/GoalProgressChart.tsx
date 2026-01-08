'use client'

import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { PFC_COLORS } from '@/types/nutrition'
import { formatCalories, formatGrams, formatPercentage } from '@/lib/utils/format'

interface GoalProgressChartProps {
  calories: number
  targetCalories: number
  protein: number
  targetProtein: number
  fat: number
  targetFat: number
  carb: number
  targetCarb: number
}

export function GoalProgressChart({
  calories,
  targetCalories,
  protein,
  targetProtein,
  fat,
  targetFat,
  carb,
  targetCarb,
}: GoalProgressChartProps) {
  const items = [
    {
      label: 'カロリー',
      current: calories,
      target: targetCalories,
      unit: 'kcal',
      color: PFC_COLORS.calorie.main,
      format: (v: number) => formatCalories(v),
    },
    {
      label: 'タンパク質',
      current: protein,
      target: targetProtein,
      unit: 'g',
      color: PFC_COLORS.protein.main,
      format: (v: number) => formatGrams(v),
    },
    {
      label: '脂質',
      current: fat,
      target: targetFat,
      unit: 'g',
      color: PFC_COLORS.fat.main,
      format: (v: number) => formatGrams(v),
    },
    {
      label: '炭水化物',
      current: carb,
      target: targetCarb,
      unit: 'g',
      color: PFC_COLORS.carb.main,
      format: (v: number) => formatGrams(v),
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">目標達成度</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => {
          const percentage = item.target > 0 
            ? Math.min((item.current / item.target) * 100, 150)
            : 0
          const isOver = percentage > 100

          return (
            <div key={item.label} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{item.label}</span>
                <span className={cn(
                  isOver && item.label !== 'タンパク質' && 'text-destructive'
                )}>
                  {item.format(item.current)} / {item.format(item.target)}
                </span>
              </div>
              <div className="relative">
                <Progress
                  value={Math.min(percentage, 100)}
                  className="h-2"
                  indicatorClassName={cn(
                    isOver && item.label !== 'タンパク質' && 'bg-destructive'
                  )}
                  style={{
                    ['--progress-color' as string]: item.color,
                  }}
                />
                {/* 目標ライン */}
                <div
                  className="absolute top-0 h-full w-0.5 bg-foreground/30"
                  style={{ left: '100%', transform: 'translateX(-100%)' }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatPercentage(percentage)}</span>
                <span>
                  {item.current < item.target
                    ? `残り ${item.format(item.target - item.current)}`
                    : item.current > item.target
                    ? `${item.format(item.current - item.target)} オーバー`
                    : '達成！'}
                </span>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
