import { Header } from '@/components/layout/Header'
import { DailySummary } from '@/components/features/dashboard/DailySummary'
import { QuickAddButton } from '@/components/features/dashboard/QuickAddButton'
import { AdviceCard } from '@/components/features/dashboard/AdviceCard'
import { DailyPFCChart } from '@/components/features/charts/DailyPFCChart'
import { GoalProgressChart } from '@/components/features/charts/GoalProgressChart'
import { MealList } from '@/components/features/meals/MealList'
import { createServerSupabaseClient, isDemoMode } from '@/lib/supabase/server'
import { toDateString } from '@/lib/utils/date'
import type { MealType } from '@/types/meal'

// デモ用のサンプルデータ
const demoMeals = [
  { id: '1', foodName: '鶏むね肉のグリル', mealType: 'lunch' as MealType, calories: 250, protein: 45, fat: 5, carb: 2, createdAt: new Date().toISOString() },
  { id: '2', foodName: 'サラダ', mealType: 'lunch' as MealType, calories: 80, protein: 3, fat: 4, carb: 8, createdAt: new Date().toISOString() },
  { id: '3', foodName: '玄米ごはん', mealType: 'lunch' as MealType, calories: 220, protein: 5, fat: 1, carb: 47, createdAt: new Date().toISOString() },
]

export default async function DashboardPage() {
  const today = toDateString()

  // デモモードの場合はサンプルデータを使用
  if (isDemoMode()) {
    const totalCalories = 550
    const totalProtein = 53
    const totalFat = 10
    const totalCarb = 57

    return (
      <div className="min-h-screen">
        <Header title="ダッシュボード" />
        <div className="container max-w-6xl mx-auto p-4 md:p-6 space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-yellow-800 text-sm">
              ⚠️ デモモードで動作中です。実際のデータを使用するには、Supabaseの環境変数を設定してください。
            </p>
          </div>
          <div className="md:hidden fixed bottom-20 right-4 z-40">
            <QuickAddButton />
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <DailySummary
                date={today}
                calories={totalCalories}
                targetCalories={1800}
                protein={totalProtein}
                targetProtein={135}
                fat={totalFat}
                targetFat={50}
                carb={totalCarb}
                targetCarb={202}
                mealCount={3}
              />
              <div className="hidden md:block">
                <QuickAddButton className="w-full" />
              </div>
              <div>
                <h2 className="font-semibold mb-4">今日の食事</h2>
                <MealList meals={demoMeals} />
              </div>
            </div>
            <div className="space-y-6">
              <DailyPFCChart
                protein={totalProtein}
                fat={totalFat}
                carb={totalCarb}
                targetProtein={135}
                targetFat={50}
                targetCarb={202}
              />
              <GoalProgressChart
                calories={totalCalories}
                targetCalories={1800}
                protein={totalProtein}
                targetProtein={135}
                fat={totalFat}
                targetFat={50}
                carb={totalCarb}
                targetCarb={202}
              />
              <AdviceCard advice={{ message: 'タンパク質を積極的に摂取しましょう！鶏むね肉やプロテインがおすすめです。', recommendations: ['プロテインシェイク', 'ゆで卵', '豆腐'] }} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const supabase = createServerSupabaseClient()

  // ユーザー情報取得
  const { data: { user } } = await supabase.auth.getUser()

  // プロフィール取得
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id || '')
    .single() as { data: any }

  // 今日の食事記録取得
  const { data: meals } = await supabase
    .from('meal_logs')
    .select('*')
    .eq('user_id', user?.id || '')
    .eq('meal_date', today)
    .order('created_at', { ascending: true }) as { data: any[] | null }

  // 今日のサマリー取得
  const { data: summary } = await supabase
    .from('daily_summaries')
    .select('*')
    .eq('user_id', user?.id || '')
    .eq('summary_date', today)
    .single() as { data: any }

  // デフォルト値
  const targetCalories = profile?.target_calories || 1800
  const targetProtein = profile?.target_protein_g || 135
  const targetFat = profile?.target_fat_g || 50
  const targetCarb = profile?.target_carb_g || 202

  const totalCalories = summary?.total_calories || 0
  const totalProtein = summary?.total_protein_g || 0
  const totalFat = summary?.total_fat_g || 0
  const totalCarb = summary?.total_carb_g || 0

  // 食事データを変換
  const mealItems = (meals || []).map((meal) => ({
    id: meal.id,
    foodName: meal.food_name,
    mealType: meal.meal_type as MealType,
    calories: meal.calories,
    protein: meal.protein_g,
    fat: meal.fat_g,
    carb: meal.carb_g,
    createdAt: meal.created_at,
  }))

  return (
    <div className="min-h-screen">
      <Header title="ダッシュボード" />

      <div className="container max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {/* クイック追加ボタン（モバイル用固定） */}
        <div className="md:hidden fixed bottom-20 right-4 z-40">
          <QuickAddButton />
        </div>

        {/* メイングリッド */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* 左側: サマリー + 食事リスト */}
          <div className="lg:col-span-2 space-y-6">
            {/* 日次サマリー */}
            <DailySummary
              date={today}
              calories={totalCalories}
              targetCalories={targetCalories}
              protein={totalProtein}
              targetProtein={targetProtein}
              fat={totalFat}
              targetFat={targetFat}
              carb={totalCarb}
              targetCarb={targetCarb}
              mealCount={meals?.length || 0}
            />

            {/* 食事追加ボタン（PC用） */}
            <div className="hidden md:block">
              <QuickAddButton className="w-full" />
            </div>

            {/* 今日の食事リスト */}
            <div>
              <h2 className="font-semibold mb-4">今日の食事</h2>
              <MealList meals={mealItems} />
            </div>
          </div>

          {/* 右側: チャート + アドバイス */}
          <div className="space-y-6">
            {/* PFCチャート */}
            <DailyPFCChart
              protein={totalProtein}
              fat={totalFat}
              carb={totalCarb}
              targetProtein={targetProtein}
              targetFat={targetFat}
              targetCarb={targetCarb}
            />

            {/* 目標達成度 */}
            <GoalProgressChart
              calories={totalCalories}
              targetCalories={targetCalories}
              protein={totalProtein}
              targetProtein={targetProtein}
              fat={totalFat}
              targetFat={targetFat}
              carb={totalCarb}
              targetCarb={targetCarb}
            />

            {/* AIアドバイス */}
            <AdviceCard advice={summary?.ai_advice as any} />
          </div>
        </div>
      </div>
    </div>
  )
}
