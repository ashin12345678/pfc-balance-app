'use client'

import { Trash2, Edit } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MEAL_TYPE_LABELS, MEAL_TYPE_ICONS, type MealType } from '@/types/meal'
import { formatCalories, formatGrams } from '@/lib/utils/format'
import { cn } from '@/lib/utils'

interface MealCardProps {
  id: string
  foodName: string
  mealType: MealType
  calories: number
  protein: number
  fat: number
  carb: number
  time?: string
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  compact?: boolean
}

export function MealCard({
  id,
  foodName,
  mealType,
  calories,
  protein,
  fat,
  carb,
  time,
  onEdit,
  onDelete,
  compact = false,
}: MealCardProps) {
  return (
    <Card className={cn('transition-shadow hover:shadow-md', compact && 'shadow-sm')}>
      <CardContent className={cn('p-4', compact && 'p-3')}>
        <div className="flex items-start justify-between gap-3">
          {/* 左側: 食事アイコン & 内容 */}
          <div className="flex gap-3 flex-1 min-w-0">
            <div className="text-2xl">{MEAL_TYPE_ICONS[mealType]}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-muted-foreground">
                  {MEAL_TYPE_LABELS[mealType]}
                </span>
                {time && (
                  <span className="text-xs text-muted-foreground">{time}</span>
                )}
              </div>
              <h3 className="font-medium truncate">{foodName}</h3>
              
              {/* 栄養成分 */}
              <div className="flex flex-wrap gap-2 mt-2 text-xs">
                <span className="bg-muted px-2 py-0.5 rounded">
                  {formatCalories(calories)}
                </span>
                <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded">
                  P: {formatGrams(protein)}
                </span>
                <span className="text-amber-500 bg-amber-50 px-2 py-0.5 rounded">
                  F: {formatGrams(fat)}
                </span>
                <span className="text-blue-500 bg-blue-50 px-2 py-0.5 rounded">
                  C: {formatGrams(carb)}
                </span>
              </div>
            </div>
          </div>

          {/* 右側: アクションボタン */}
          {!compact && (onEdit || onDelete) && (
            <div className="flex gap-1">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onEdit(id)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => onDelete(id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
