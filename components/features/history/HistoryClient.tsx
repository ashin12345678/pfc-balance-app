'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Edit, Trash2, X, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { MEAL_TYPE_LABELS, MEAL_TYPE_ICONS, type MealType } from '@/types/meal'
import { formatDate } from '@/lib/utils/date'
import { useToast } from '@/hooks/useToast'

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

interface DailySummary {
  id: string
  date: string
  totalCalories: number
  totalProtein: number
  totalFat: number
  totalCarb: number
  mealCount: number
  meals: MealItem[]
}

interface HistoryClientProps {
  summaries: DailySummary[]
  targetCalories: number
}

export function HistoryClient({ summaries: initialSummaries, targetCalories }: HistoryClientProps) {
  const [summaries, setSummaries] = useState<DailySummary[]>(initialSummaries)
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set())
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; date: string } | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{
    foodName: string
    calories: number
    protein: number
    fat: number
    carb: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  const toggleExpanded = (date: string) => {
    const newExpanded = new Set(expandedDates)
    if (newExpanded.has(date)) {
      newExpanded.delete(date)
    } else {
      newExpanded.add(date)
    }
    setExpandedDates(newExpanded)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/meals?id=${deleteTarget.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error)
      }

      // ローカルステートを更新
      setSummaries((prev) =>
        prev
          .map((summary) => {
            if (summary.date === deleteTarget.date) {
              const newMeals = summary.meals.filter((m) => m.id !== deleteTarget.id)
              if (newMeals.length === 0) {
                return null
              }
              return {
                ...summary,
                meals: newMeals,
                mealCount: newMeals.length,
                totalCalories: newMeals.reduce((sum, m) => sum + m.calories, 0),
                totalProtein: newMeals.reduce((sum, m) => sum + m.protein, 0),
                totalFat: newMeals.reduce((sum, m) => sum + m.fat, 0),
                totalCarb: newMeals.reduce((sum, m) => sum + m.carb, 0),
              }
            }
            return summary
          })
          .filter((s): s is DailySummary => s !== null)
      )

      toast({
        title: '削除完了',
        description: '食事記録を削除しました',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'エラー',
        description: error instanceof Error ? error.message : '削除に失敗しました',
      })
    } finally {
      setIsLoading(false)
      setDeleteTarget(null)
    }
  }

  const handleEditStart = (meal: MealItem) => {
    setEditingId(meal.id)
    setEditValues({
      foodName: meal.foodName,
      calories: meal.calories,
      protein: meal.protein,
      fat: meal.fat,
      carb: meal.carb,
    })
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditValues(null)
  }

  const handleEditSave = async (date: string) => {
    if (!editingId || !editValues) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/meals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId,
          foodName: editValues.foodName,
          calories: editValues.calories,
          proteinG: editValues.protein,
          fatG: editValues.fat,
          carbG: editValues.carb,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error)
      }

      // ローカルステートを更新
      setSummaries((prev) =>
        prev.map((summary) => {
          if (summary.date === date) {
            const newMeals = summary.meals.map((m) => {
              if (m.id === editingId) {
                return {
                  ...m,
                  ...editValues,
                }
              }
              return m
            })
            return {
              ...summary,
              meals: newMeals,
              totalCalories: newMeals.reduce((sum, m) => sum + m.calories, 0),
              totalProtein: newMeals.reduce((sum, m) => sum + m.protein, 0),
              totalFat: newMeals.reduce((sum, m) => sum + m.fat, 0),
              totalCarb: newMeals.reduce((sum, m) => sum + m.carb, 0),
            }
          }
          return summary
        })
      )

      toast({
        title: '更新完了',
        description: '食事記録を更新しました',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'エラー',
        description: error instanceof Error ? error.message : '更新に失敗しました',
      })
    } finally {
      setIsLoading(false)
      setEditingId(null)
      setEditValues(null)
    }
  }

  const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']

  if (summaries.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <p>まだ記録がありません</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {summaries.map((summary) => {
          const achievement = (summary.totalCalories / targetCalories) * 100
          const isExpanded = expandedDates.has(summary.date)

          return (
            <Collapsible
              key={summary.date}
              open={isExpanded}
              onOpenChange={() => toggleExpanded(summary.date)}
            >
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div>
                          <CardTitle className="text-base">
                            {formatDate(summary.date, 'yyyy年M月d日(E)')}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {summary.mealCount}件の記録
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {summary.totalCalories.toFixed(0)} kcal
                        </div>
                        <div className="flex gap-2 text-xs mt-1">
                          <span className="text-red-500">P: {summary.totalProtein.toFixed(1)}g</span>
                          <span className="text-amber-500">F: {summary.totalFat.toFixed(1)}g</span>
                          <span className="text-blue-500">C: {summary.totalCarb.toFixed(1)}g</span>
                        </div>
                        <div className="mt-1">
                          <span
                            className={`text-xs ${
                              achievement >= 90 && achievement <= 110
                                ? 'text-green-500'
                                : achievement < 70
                                ? 'text-red-500'
                                : 'text-amber-500'
                            }`}
                          >
                            達成率: {achievement.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {mealTypes.map((type) => {
                        const typeMeals = summary.meals.filter((m) => m.mealType === type)
                        if (typeMeals.length === 0) return null

                        return (
                          <div key={type} className="border-t pt-4">
                            <h4 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-2">
                              <span>{MEAL_TYPE_ICONS[type]}</span>
                              {MEAL_TYPE_LABELS[type]}
                            </h4>
                            <div className="space-y-2">
                              {typeMeals.map((meal) => (
                                <div
                                  key={meal.id}
                                  className="bg-muted/50 rounded-lg p-3"
                                >
                                  {editingId === meal.id && editValues ? (
                                    // 編集モード
                                    <div className="space-y-3">
                                      <Input
                                        value={editValues.foodName}
                                        onChange={(e) =>
                                          setEditValues({ ...editValues, foodName: e.target.value })
                                        }
                                        placeholder="食品名"
                                      />
                                      <div className="grid grid-cols-4 gap-2">
                                        <div>
                                          <label className="text-xs text-muted-foreground">kcal</label>
                                          <Input
                                            type="number"
                                            value={editValues.calories}
                                            onChange={(e) =>
                                              setEditValues({
                                                ...editValues,
                                                calories: parseFloat(e.target.value) || 0,
                                              })
                                            }
                                          />
                                        </div>
                                        <div>
                                          <label className="text-xs text-muted-foreground">P(g)</label>
                                          <Input
                                            type="number"
                                            value={editValues.protein}
                                            onChange={(e) =>
                                              setEditValues({
                                                ...editValues,
                                                protein: parseFloat(e.target.value) || 0,
                                              })
                                            }
                                          />
                                        </div>
                                        <div>
                                          <label className="text-xs text-muted-foreground">F(g)</label>
                                          <Input
                                            type="number"
                                            value={editValues.fat}
                                            onChange={(e) =>
                                              setEditValues({
                                                ...editValues,
                                                fat: parseFloat(e.target.value) || 0,
                                              })
                                            }
                                          />
                                        </div>
                                        <div>
                                          <label className="text-xs text-muted-foreground">C(g)</label>
                                          <Input
                                            type="number"
                                            value={editValues.carb}
                                            onChange={(e) =>
                                              setEditValues({
                                                ...editValues,
                                                carb: parseFloat(e.target.value) || 0,
                                              })
                                            }
                                          />
                                        </div>
                                      </div>
                                      <div className="flex gap-2 justify-end">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={handleEditCancel}
                                          disabled={isLoading}
                                        >
                                          <X className="h-4 w-4 mr-1" />
                                          キャンセル
                                        </Button>
                                        <Button
                                          size="sm"
                                          onClick={() => handleEditSave(summary.date)}
                                          disabled={isLoading}
                                        >
                                          <Check className="h-4 w-4 mr-1" />
                                          保存
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    // 表示モード
                                    <div className="flex items-center justify-between gap-3">
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium">{meal.foodName}</div>
                                        <div className="flex flex-wrap gap-2 mt-1 text-xs">
                                          <span className="bg-background px-2 py-0.5 rounded">
                                            {meal.calories.toFixed(0)} kcal
                                          </span>
                                          <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded">
                                            P: {meal.protein.toFixed(1)}g
                                          </span>
                                          <span className="text-amber-500 bg-amber-50 px-2 py-0.5 rounded">
                                            F: {meal.fat.toFixed(1)}g
                                          </span>
                                          <span className="text-blue-500 bg-blue-50 px-2 py-0.5 rounded">
                                            C: {meal.carb.toFixed(1)}g
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex gap-1">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={() => handleEditStart(meal)}
                                          aria-label={`${meal.foodName}を編集`}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-destructive hover:text-destructive"
                                          onClick={() =>
                                            setDeleteTarget({
                                              id: meal.id,
                                              name: meal.foodName,
                                              date: summary.date,
                                            })
                                          }
                                          aria-label={`${meal.foodName}を削除`}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )
        })}
      </div>

      {/* 削除確認ダイアログ */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>「{deleteTarget?.name}」を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。本当に削除しますか？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
