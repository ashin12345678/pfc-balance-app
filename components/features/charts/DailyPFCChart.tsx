'use client'

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PFC_COLORS } from '@/types/nutrition'

interface DailyPFCChartProps {
  protein: number
  fat: number
  carb: number
  targetProtein?: number
  targetFat?: number
  targetCarb?: number
}

export function DailyPFCChart({
  protein,
  fat,
  carb,
  targetProtein,
  targetFat,
  targetCarb,
}: DailyPFCChartProps) {
  const data = [
    {
      name: 'タンパク質',
      value: protein,
      target: targetProtein,
      color: PFC_COLORS.protein.main,
    },
    {
      name: '脂質',
      value: fat,
      target: targetFat,
      color: PFC_COLORS.fat.main,
    },
    {
      name: '炭水化物',
      value: carb,
      target: targetCarb,
      color: PFC_COLORS.carb.main,
    },
  ]

  const total = protein + fat + carb

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">PFCバランス</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            まだ食事が記録されていません
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">PFCバランス</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value.toFixed(1)}g`,
                  name,
                ]}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value, entry) => {
                  const item = data.find((d) => d.name === value)
                  if (!item) return value
                  const percentage = ((item.value / total) * 100).toFixed(0)
                  return `${value} ${percentage}%`
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 詳細数値 */}
        <div className="grid grid-cols-3 gap-2 mt-4 text-center text-sm">
          {data.map((item) => (
            <div key={item.name}>
              <div className="font-medium" style={{ color: item.color }}>
                {item.value.toFixed(1)}g
              </div>
              {item.target && (
                <div className="text-xs text-muted-foreground">
                  / {item.target.toFixed(0)}g
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
