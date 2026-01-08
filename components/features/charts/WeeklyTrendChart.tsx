'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PFC_COLORS } from '@/types/nutrition'

interface WeeklyTrendData {
  date: string
  label: string
  calories: number
  protein: number
  fat: number
  carb: number
  targetCalories?: number
}

interface WeeklyTrendChartProps {
  data: WeeklyTrendData[]
  showCalories?: boolean
}

export function WeeklyTrendChart({ data, showCalories = false }: WeeklyTrendChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">週間トレンド</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            データがありません
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">週間トレンド</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            {showCalories ? (
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(0)} kcal`]}
                />
                <Area
                  type="monotone"
                  dataKey="calories"
                  name="カロリー"
                  stroke={PFC_COLORS.calorie.main}
                  fill={PFC_COLORS.calorie.light}
                  strokeWidth={2}
                />
                {data[0]?.targetCalories && (
                  <Area
                    type="monotone"
                    dataKey="targetCalories"
                    name="目標"
                    stroke="#94a3b8"
                    fill="none"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                  />
                )}
              </AreaChart>
            ) : (
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [`${value.toFixed(1)}g`, name]}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="protein"
                  name="タンパク質"
                  stackId="1"
                  stroke={PFC_COLORS.protein.main}
                  fill={PFC_COLORS.protein.light}
                />
                <Area
                  type="monotone"
                  dataKey="fat"
                  name="脂質"
                  stackId="1"
                  stroke={PFC_COLORS.fat.main}
                  fill={PFC_COLORS.fat.light}
                />
                <Area
                  type="monotone"
                  dataKey="carb"
                  name="炭水化物"
                  stackId="1"
                  stroke={PFC_COLORS.carb.main}
                  fill={PFC_COLORS.carb.light}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
