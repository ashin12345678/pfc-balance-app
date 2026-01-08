import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WeeklyTrendChart } from '@/components/features/charts/WeeklyTrendChart'
import { CalorieGauge } from '@/components/features/charts/CalorieGauge'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { toDateString, formatDate, getPastDates } from '@/lib/utils/date'

export default async function HistoryPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const today = toDateString()

  // プロフィール取得
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id || '')
    .single() as { data: any }

  // 過去14日間のサマリー取得
  const pastDates = getPastDates(14)
  const startDate = formatDate(pastDates[0], 'yyyy-MM-dd')

  const { data: summaries } = await supabase
    .from('daily_summaries')
    .select('*')
    .eq('user_id', user?.id || '')
    .gte('summary_date', startDate)
    .lte('summary_date', today)
    .order('summary_date', { ascending: true }) as { data: any[] | null }

  const targetCalories = profile?.target_calories || 1800
  const targetProtein = profile?.target_protein_g || 135
  const targetFat = profile?.target_fat_g || 50
  const targetCarb = profile?.target_carb_g || 202

  // 過去7日間の平均
  const last7Days = (summaries || []).slice(-7)
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

  // チャート用データ
  const trendData = (summaries || []).slice(-7).map((s: any) => ({
    label: s.summary_date,
    date: s.summary_date,
    calories: s.total_calories,
    protein: s.total_protein_g,
    fat: s.total_fat_g,
    carb: s.total_carb_g,
  }))

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

        {/* 日別詳細 */}
        <Card>
          <CardHeader>
            <CardTitle>日別記録</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">日付</th>
                    <th className="text-right py-2 px-3">カロリー</th>
                    <th className="text-right py-2 px-3">P</th>
                    <th className="text-right py-2 px-3">F</th>
                    <th className="text-right py-2 px-3">C</th>
                    <th className="text-right py-2 px-3">達成率</th>
                  </tr>
                </thead>
                <tbody>
                  {(summaries || []).slice().reverse().map((summary) => {
                    const achievement = (summary.total_calories / targetCalories) * 100
                    return (
                      <tr key={summary.id} className="border-b">
                        <td className="py-2 px-3">
                          {formatDate(summary.summary_date, 'M/d(E)')}
                        </td>
                        <td className="text-right py-2 px-3">
                          {summary.total_calories.toFixed(0)} kcal
                        </td>
                        <td className="text-right py-2 px-3 text-red-500">
                          {summary.total_protein_g.toFixed(1)}g
                        </td>
                        <td className="text-right py-2 px-3 text-amber-500">
                          {summary.total_fat_g.toFixed(1)}g
                        </td>
                        <td className="text-right py-2 px-3 text-blue-500">
                          {summary.total_carb_g.toFixed(1)}g
                        </td>
                        <td className="text-right py-2 px-3">
                          <span
                            className={
                              achievement >= 90 && achievement <= 110
                                ? 'text-green-500'
                                : achievement < 70
                                ? 'text-red-500'
                                : 'text-amber-500'
                            }
                          >
                            {achievement.toFixed(0)}%
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
