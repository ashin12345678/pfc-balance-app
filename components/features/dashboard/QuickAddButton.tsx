'use client'

import Link from 'next/link'
import { Plus, Camera, Keyboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface QuickAddButtonProps {
  className?: string
}

export function QuickAddButton({ className }: QuickAddButtonProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg" className={className}>
          <Plus className="mr-2 h-5 w-5" />
          食事を記録
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>食事を記録する</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* テキスト入力 */}
          <Link href="/meals/new" className="block">
            <Button variant="outline" className="w-full h-auto py-4 justify-start">
              <Keyboard className="mr-4 h-8 w-8 text-primary" />
              <div className="text-left">
                <div className="font-medium">テキストで入力</div>
                <div className="text-xs text-muted-foreground">
                  食べたものを自由に入力してAIが解析
                </div>
              </div>
            </Button>
          </Link>

          {/* バーコードスキャン */}
          <Link href="/scan" className="block">
            <Button variant="outline" className="w-full h-auto py-4 justify-start">
              <Camera className="mr-4 h-8 w-8 text-primary" />
              <div className="text-left">
                <div className="font-medium">バーコードスキャン</div>
                <div className="text-xs text-muted-foreground">
                  商品のバーコードをカメラで読み取り
                </div>
              </div>
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
}
