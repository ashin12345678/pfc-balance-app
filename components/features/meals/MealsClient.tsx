'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Edit, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
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
import { MEAL_TYPE_LABELS, MEAL_TYPE_ICONS, type MealType } from '@/types/meal'
import { formatCalories, formatGrams } from '@/lib/utils/format'
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
  servingSize?: string
}

interface MealsByDate {
  [date: string]: MealItem[]
}

interface MealsClientProps {
  initialMealsByDate: MealsByDate
  initialDates: string[]
}

export function MealsClient({ initialMealsByDate, initialDates }: MealsClientProps) {
  const [mealsByDate, setMealsByDate] = useState<MealsByDate>(initialMealsByDate)
  const [dates, setDates] = useState<string[]>(initialDates)
  const [deleteId, setDeleteId] = useState<string | null>(null)
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

  const handleDelete = async () => {
    if (!deleteId) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/meals?id=${deleteId}`, {
        method: 'DELETE',
      })
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      // ローカルステートを更新
      const newMealsByDate = { ...mealsByDate }
      for (const date in newMealsByDate) {
        newMealsByDate[date] = newMealsByDate[date].filter(m => m.id !== deleteId)
        if (newMealsByDate[date].length === 0) {
          delete newMealsByDate[date]
        }
      }
      setMealsByDate(newMealsByDate)
      setDates(Object.keys(newMealsByDate).sort((a, b) => b.localeCompare(a)))
      
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
      setDeleteId(null)
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

  const handleEditSave = async () => {
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
      const newMealsByDate = { ...mealsByDate }
      for (const date in newMealsByDate) {
        newMealsByDate[date] = newMealsByDate[date].map(m => {
          if (m.id === editingId) {
            return {
              ...m,
              foodName: editValues.foodName,
              calories: editValues.calories,
              protein: editValues.protein,
              fat: editValues.fat,
              carb: editValues.carb,
            }
          }
          return m
        })
      }
      setMealsByDate(newMealsByDate)
      
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

  return (
    <>
      {/* 追加ボタン */}
      <div className="flex justify-end mb-6">
        <Link href="/meals/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            食事を追加
          </Button>
        </Link>
      </div>

      {/* 日付タブ */}
      {dates.length > 0 ? (
        <Tabs defaultValue={dates[0]} className="space-y-4">
          <TabsList className="w-full flex overflow-x-auto">
            {dates.slice(0, 7).map((date) => (
              <TabsTrigger key={date} value={date} className="flex-1 min-w-[80px]">
                {formatDate(date, 'M/d')}
              </TabsTrigger>
            ))}
          </TabsList>

          {dates.map((date) => {
            const dayMeals = mealsByDate[date] || []
            const totalCalories = dayMeals.reduce((sum, m) => sum + m.calories, 0)

            return (
              <TabsContent key={date} value={date} className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="font-semibold">{formatDate(date, 'yyyy年M月d日(E)')}</h2>
                  <span className="text-sm text-muted-foreground">
                    合計: {totalCalories.toFixed(0)} kcal
                  </span>
                </div>

                {/* 食事タイプ別表示 */}
                <div className="space-y-6">
                  {mealTypes.map((type) => {
                    const typeMeals = dayMeals.filter((m) => m.mealType === type)
                    if (typeMeals.length === 0) return null

                    const typeCalories = typeMeals.reduce((sum, m) => sum + m.calories, 0)

                    return (
                      <div key={type}>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium">{MEAL_TYPE_LABELS[type]}</h3>
                          <span className="text-sm text-muted-foreground">
                            {typeCalories.toFixed(0)} kcal
                          </span>
                        </div>
                        <div className="space-y-2">
                          {typeMeals.map((meal) => (
                            <Card key={meal.id} className="shadow-sm">
                              <CardContent className="p-3">
                                {editingId === meal.id && editValues ? (
                                  // 編集モード
                                  <div className="space-y-3">
                                    <Input
                                      value={editValues.foodName}
                                      onChange={(e) => setEditValues({ ...editValues, foodName: e.target.value })}
                                      placeholder="食品名"
                                    />
                                    <div className="grid grid-cols-4 gap-2">
                                      <div>
                                        <label className="text-xs text-muted-foreground">カロリー</label>
                                        <Input
                                          type="number"
                                          value={editValues.calories}
                                          onChange={(e) => setEditValues({ ...editValues, calories: parseFloat(e.target.value) || 0 })}
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs text-muted-foreground">P(g)</label>
                                        <Input
                                          type="number"
                                          value={editValues.protein}
                                          onChange={(e) => setEditValues({ ...editValues, protein: parseFloat(e.target.value) || 0 })}
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs text-muted-foreground">F(g)</label>
                                        <Input
                                          type="number"
                                          value={editValues.fat}
                                          onChange={(e) => setEditValues({ ...editValues, fat: parseFloat(e.target.value) || 0 })}
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs text-muted-foreground">C(g)</label>
                                        <Input
                                          type="number"
                                          value={editValues.carb}
                                          onChange={(e) => setEditValues({ ...editValues, carb: parseFloat(e.target.value) || 0 })}
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
                                        onClick={handleEditSave}
                                        disabled={isLoading}
                                      >
                                        <Check className="h-4 w-4 mr-1" />
                                        保存
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  // 表示モード
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex gap-3 flex-1 min-w-0">
                                      <div className="text-2xl">{MEAL_TYPE_ICONS[meal.mealType]}</div>
                                      <div className="flex-1 min-w-0">
                                        <h3 className="font-medium">{meal.foodName}</h3>
                                        <div className="flex flex-wrap gap-2 mt-2 text-xs">
                                          <span className="bg-muted px-2 py-0.5 rounded">
                                            {formatCalories(meal.calories)}
                                          </span>
                                          <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded">
                                            P: {formatGrams(meal.protein)}
                                          </span>
                                          <span className="text-amber-500 bg-amber-50 px-2 py-0.5 rounded">
                                            F: {formatGrams(meal.fat)}
                                          </span>
                                          <span className="text-blue-500 bg-blue-50 px-2 py-0.5 rounded">
                                            C: {formatGrams(meal.carb)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex gap-1">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleEditStart(meal)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                        onClick={() => setDeleteId(meal.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                        <Separator className="mt-4" />
                      </div>
                    )
                  })}
                </div>
              </TabsContent>
            )
          })}
        </Tabs>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>まだ食事が記録されていません</p>
          <Link href="/meals/new">
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              最初の食事を記録
            </Button>
          </Link>
        </div>
      )}

      {/* 削除確認ダイアログ */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>食事記録を削除しますか？</AlertDialogTitle>
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
