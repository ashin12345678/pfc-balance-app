'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getRelativeDateLabel } from '@/lib/utils/date'

interface HeaderProps {
  title?: string
  showDate?: boolean
}

export function Header({ title, showDate = true }: HeaderProps) {
  const today = new Date()
  const dateLabel = getRelativeDateLabel(today)

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* 左側: タイトル & 日付 */}
        <div className="flex items-center gap-4">
          <div>
            {title && <h1 className="text-lg font-semibold">{title}</h1>}
            {showDate && (
              <p className="text-sm text-muted-foreground">{dateLabel}</p>
            )}
          </div>
        </div>

        {/* 右側: アバター */}
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
