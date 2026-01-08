import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WeeklyTrendChart } from '@/components/features/charts/WeeklyTrendChart'
import { CalorieGauge } from '@/components/features/charts/CalorieGauge'
import { HistoryClient } from '@/components/features/history/HistoryClient'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { toDateString, formatDate, getPastDates } from '@/lib/utils/date'
import type { MealType } from '@/types/meal'

export default async function HistoryPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const today = toDateString()

  // プロフィール取得
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id || '')
    .single() as { data: any }

  // 過去30日間のサマリー取得（より多くの日数を表示）
  const pastDates = getPastDates(30)
  const startDate = formatDate(pastDates[0], 'yyyy-MM-dd')

  const { data: summaries } = await supabase
    .from('daily_summaries')
    .select('*')
    .eq('user_id', user?.id || '')
    .gte('summary_date', startDate)
    .lte('summary_date', today)
    .order('summary_date', { ascending: false }) as { data: any[] | null }

  // 過去30日間の食事記録も取得
  const { data: meals } = await supabase
    .from('meal_logs')
    .select('*')
    .eq('user_id', user?.id || '')
    .gte('meal_date', startDate)
    .lte('meal_date', today)
    .order('meal_date', { ascending: false })
    .order('created_at', { ascending: true }) as { data: any[] | null }

  const targetCalories = profile?.target_calories || 1800
  const targetProtein = profile?.target_protein_g || 135
  const targetFat = profile?.target_fat_g || 50
  const targetCarb = profile?.target_carb_g || 202

  // 過去7日間の平均（降順で取得しているのでslice(0, 7)）
  const last7Days = (summaries || []).slice(0, 7)
  const avgCalories = last7Days.length > 0
    ? last7Days.reduce((sum: number, s: any) => sum + s.total_calories, 0) / last7Days.length
    : 0
  const avgProtein = last7Days.length > 0
    ? last7Days.reduce((sum: number, s: any) => sum + s.total_protein_g, 0) / last7Days.length
    : 0
  const avgFat = last7Days.length > 0
    ? last7Days.reduce((sum: number, s: any) => sum + s.total_fat_g, 0) / last7Days.length
    : 0
  const avgCarb = last7Days.length > 0
    ? last7Days.reduce((sum: number, s: any) => sum + s.total_carb_g, 0) / last7Days.length
    : 0

  // チャート用データ（昇順に変換）
  const trendData = (summaries || []).slice(0, 7).reverse().map((s: any) => ({
    label: s.summary_date,
    date: s.summary_date,
    calories: s.total_calories,
    protein: s.total_protein_g,
    fat: s.total_fat_g,
    carb: s.total_carb_g,
  }))

  // 日付別に食事をグループ化してサマリーデータを作成
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
    })
    return acc
  }, {} as Record<string, any[]>)

  // HistoryClient用のデータ形式に変換
  const historySummaries = Object.entries(mealsByDate)
    .map(([date, dateMeals]) => ({
      id: date,
      date,
      totalCalories: (dateMeals as any[]).reduce((sum, m) => sum + m.calories, 0),
      totalProtein: (dateMeals as any[]).reduce((sum, m) => sum + m.protein, 0),
      totalFat: (dateMeals as any[]).reduce((sum, m) => sum + m.fat, 0),
      totalCarb: (dateMeals as any[]).reduce((sum, m) => sum + m.carb, 0),
      mealCount: (dateMeals as any[]).length,
      meals: dateMeals as any[],
    }))
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="min-h-screen">
      <Header title="履歴・分析" />

      <div className="container max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {/* 週間平均 */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                7日間平均カロリー
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgCalories.toFixed(0)}</div>
              <p className="text-xs text-muted-foreground">
                目標: {targetCalories} kcal
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                平均タンパク質
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {avgProtein.toFixed(1)}g
              </div>
              <p className="text-xs text-muted-foreground">
                目標: {targetProtein}g
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                平均脂質
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">
                {avgFat.toFixed(1)}g
              </div>
              <p className="text-xs text-muted-foreground">
                目標: {targetFat}g
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                平均炭水化物
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">
                {avgCarb.toFixed(1)}g
              </div>
              <p className="text-xs text-muted-foreground">
                目標: {targetCarb}g
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* 週間トレンド */}
          <WeeklyTrendChart data={trendData} />

          {/* カロリーゲージ */}
          <CalorieGauge
            current={avgCalories}
            target={targetCalories}
          />
        </div>

        {/* 日別詳細（編集・削除可能） */}
        <div>
          <h2 className="text-lg font-semibold mb-4">日別記録（クリックで展開・編集）</h2>
          <HistoryClient summaries={historySummaries} targetCalories={targetCalories} />
        </div>
      </div>
    </div>
  )
}
