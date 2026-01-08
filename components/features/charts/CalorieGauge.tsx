'use client'

import { cn } from '@/lib/utils'
import { formatCalories, formatPercentage } from '@/lib/utils/format'

interface CalorieGaugeProps {
  current: number
  target: number
  size?: 'sm' | 'md' | 'lg'
}

export function CalorieGauge({ current, target, size = 'md' }: CalorieGaugeProps) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0
  const remaining = Math.max(target - current, 0)
  const isOver = current > target

  const sizes = {
    sm: { container: 'w-24 h-24', text: 'text-lg', subtext: 'text-xs' },
    md: { container: 'w-36 h-36', text: 'text-2xl', subtext: 'text-sm' },
    lg: { container: 'w-48 h-48', text: 'text-3xl', subtext: 'text-base' },
  }

  const sizeConfig = sizes[size]

  // SVG円グラフの計算
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className={cn('relative', sizeConfig.container)}>
      {/* 背景円 */}
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        {/* 背景トラック */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted"
        />
        {/* 進捗 */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={isOver ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500 ease-out"
        />
      </svg>

      {/* 中央テキスト */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('font-bold', sizeConfig.text, isOver && 'text-destructive')}>
          {formatPercentage(percentage)}
        </span>
        <span className={cn('text-muted-foreground', sizeConfig.subtext)}>
          {isOver ? 'オーバー' : `残り ${remaining.toFixed(0)}`}
        </span>
        <span className={cn('text-muted-foreground', sizeConfig.subtext)}>
          kcal
        </span>
      </div>
    </div>
  )
}
