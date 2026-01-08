'use client'

import { Bell, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            {title && <h1 className="text-lg font-semibold">{title}</h1>}
            {showDate && (
              <p className="text-sm text-muted-foreground">{dateLabel}</p>
            )}
          </div>
        </div>

        {/* 右側: 通知 & アバター */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarFallback>塚</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
