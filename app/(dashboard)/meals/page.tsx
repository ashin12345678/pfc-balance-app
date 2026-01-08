import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { MealList } from '@/components/features/meals/MealList'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { toDateString, formatDate, getPastDates } from '@/lib/utils/date'
import type { MealType } from '@/types/meal'

export default async function MealsPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const today = toDateString()

  // 過去7日間の食事記録取得
  const pastDates = getPastDates(7)
  const startDate = formatDate(pastDates[0], 'yyyy-MM-dd')

  const { data: meals } = await supabase
    .from('meal_logs')
    .select('*')
    .eq('user_id', user?.id || '')
    .gte('meal_date', startDate)
    .lte('meal_date', today)
    .order('meal_date', { ascending: false })
    .order('created_at', { ascending: true })

  // 日付別にグループ化
  const mealsByDate = (meals || []).reduce((acc, meal) => {
    const date = meal.meal_date
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push({
      id: meal.id,
      foodName: meal.food_name,
      mealType: meal.meal_type as MealType,
      calories: meal.calories,
      protein: meal.protein_g,
      fat: meal.fat_g,
      carb: meal.carb_g,
      createdAt: meal.created_at,
    })
    return acc
  }, {} as Record<string, any[]>)

  const dates = Object.keys(mealsByDate).sort((a, b) => b.localeCompare(a))

  return (
    <div className="min-h-screen">
      <Header title="食事記録" />

      <div className="container max-w-4xl mx-auto p-4 md:p-6">
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
                  <MealList meals={dayMeals} groupByType />
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
      </div>
    </div>
  )
}
