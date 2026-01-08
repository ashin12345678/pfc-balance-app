import { Header } from '@/components/layout/Header'
import { MealsClient } from '@/components/features/meals/MealsClient'
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
    .order('created_at', { ascending: true }) as { data: any[] | null }

  // 日付別にグループ化
  const mealsByDate = (meals || []).reduce((acc: Record<string, any[]>, meal: any) => {
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
      servingSize: meal.serving_size,
    })
    return acc
  }, {} as Record<string, any[]>)

  const dates = Object.keys(mealsByDate).sort((a, b) => b.localeCompare(a))

  return (
    <div className="min-h-screen">
      <Header title="食事記録" />

      <div className="container max-w-4xl mx-auto p-4 md:p-6">
        <MealsClient initialMealsByDate={mealsByDate} initialDates={dates} />
      </div>
    </div>
  )
}
