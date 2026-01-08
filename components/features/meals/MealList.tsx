'use client'

import { MealCard } from './MealCard'
import { MEAL_TYPE_LABELS, type MealType } from '@/types/meal'
import { Separator } from '@/components/ui/separator'

interface MealItem {
  id: string
  foodName: string
  mealType: MealType
  calories: number
  protein: number
  fat: number
  carb: number
  createdAt: string
}

interface MealListProps {
  meals: MealItem[]
  groupByType?: boolean
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function MealList({
  meals,
  groupByType = true,
  onEdit,
  onDelete,
}: MealListProps) {
  if (meals.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        まだ食事が記録されていません
      </div>
    )
  }

  if (!groupByType) {
    return (
      <div className="space-y-3">
        {meals.map((meal) => (
          <MealCard
            key={meal.id}
            id={meal.id}
            foodName={meal.foodName}
            mealType={meal.mealType}
            calories={meal.calories}
            protein={meal.protein}
            fat={meal.fat}
            carb={meal.carb}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    )
  }

  // 食事タイプ別にグループ化
  const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']
  const groupedMeals = mealTypes.reduce((acc, type) => {
    acc[type] = meals.filter((m) => m.mealType === type)
    return acc
  }, {} as Record<MealType, MealItem[]>)

  return (
    <div className="space-y-6">
      {mealTypes.map((type) => {
        const typeMeals = groupedMeals[type]
        if (typeMeals.length === 0) return null

        const totalCalories = typeMeals.reduce((sum, m) => sum + m.calories, 0)

        return (
          <div key={type}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">{MEAL_TYPE_LABELS[type]}</h3>
              <span className="text-sm text-muted-foreground">
                {totalCalories.toFixed(0)} kcal
              </span>
            </div>
            <div className="space-y-2">
              {typeMeals.map((meal) => (
                <MealCard
                  key={meal.id}
                  id={meal.id}
                  foodName={meal.foodName}
                  mealType={meal.mealType}
                  calories={meal.calories}
                  protein={meal.protein}
                  fat={meal.fat}
                  carb={meal.carb}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  compact
                />
              ))}
            </div>
            <Separator className="mt-4" />
          </div>
        )
      })}
    </div>
  )
}
