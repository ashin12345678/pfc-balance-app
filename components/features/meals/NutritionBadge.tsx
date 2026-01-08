import { cn } from '@/lib/utils'
import { formatGrams } from '@/lib/utils/format'
import { PFC_COLORS } from '@/types/nutrition'

interface NutritionBadgeProps {
  type: 'protein' | 'fat' | 'carb'
  value: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

const TYPE_LABELS = {
  protein: 'P',
  fat: 'F',
  carb: 'C',
}

const TYPE_FULL_LABELS = {
  protein: 'タンパク質',
  fat: '脂質',
  carb: '炭水化物',
}

export function NutritionBadge({
  type,
  value,
  size = 'md',
  showLabel = true,
}: NutritionBadgeProps) {
  const colors = PFC_COLORS[type]

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded font-medium',
        sizeClasses[size]
      )}
      style={{
        backgroundColor: colors.light,
        color: colors.main,
      }}
    >
      {showLabel && <span>{TYPE_LABELS[type]}:</span>}
      <span>{formatGrams(value)}</span>
    </span>
  )
}

interface PFCBadgesProps {
  protein: number
  fat: number
  carb: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function PFCBadges({
  protein,
  fat,
  carb,
  size = 'md',
  showLabel = true,
}: PFCBadgesProps) {
  return (
    <div className="flex flex-wrap gap-1">
      <NutritionBadge type="protein" value={protein} size={size} showLabel={showLabel} />
      <NutritionBadge type="fat" value={fat} size={size} showLabel={showLabel} />
      <NutritionBadge type="carb" value={carb} size={size} showLabel={showLabel} />
    </div>
  )
}
