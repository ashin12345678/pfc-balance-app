'use client'

import { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MEAL_TYPE_LABELS, type MealType } from '@/types/meal'

interface MealInputFormProps {
  onSubmit: (text: string, mealType: MealType) => Promise<void>
  isLoading?: boolean
}

export function MealInputForm({ onSubmit, isLoading }: MealInputFormProps) {
  const [text, setText] = useState('')
  const [mealType, setMealType] = useState<MealType>('lunch')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || isLoading) return
    await onSubmit(text, mealType)
    setText('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">食事を入力</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 食事タイプ選択 */}
          <div>
            <Select value={mealType} onValueChange={(v) => setMealType(v as MealType)}>
              <SelectTrigger>
                <SelectValue placeholder="食事タイプを選択" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MEAL_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* テキスト入力 */}
          <div>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="例: サラダチキンと玄米おにぎり、野菜サラダ"
              className="min-h-[100px] resize-none"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              食べたものを自由に入力してください。AIが栄養成分を解析します。
            </p>
          </div>

          {/* 送信ボタン */}
          <Button
            type="submit"
            className="w-full"
            disabled={!text.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                解析中...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                AIで解析する
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
