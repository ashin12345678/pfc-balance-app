'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { BarcodeScanner } from '@/components/features/scanner/BarcodeScanner'
import { ScanResult } from '@/components/features/scanner/ScanResult'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Check, X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/useToast'
import { toDateString } from '@/lib/utils/date'
import type { MealType } from '@/types/meal'

interface Product {
  barcode: string
  name: string
  brands?: string
  calories?: number
  protein?: number
  fat?: number
  carb?: number
  servingSize?: string
  imageUrl?: string
}

export default function ScanPage() {
  const [isScanning, setIsScanning] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [mealType, setMealType] = useState<MealType>('lunch')
  const [isSaving, setIsSaving] = useState(false)

  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleScan = useCallback(async (barcode: string) => {
    setIsScanning(false)
    setIsLoading(true)

    try {
      const response = await fetch(`/api/barcode/${barcode}`)
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || '商品情報が見つかりませんでした')
      }

      setProduct(data.data)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'エラー',
        description: error instanceof Error ? error.message : '商品情報の取得に失敗しました',
      })
      setIsScanning(true)
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const handleSave = async () => {
    if (!product) return

    setIsSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('ログインが必要です')

      const { error } = await supabase.from('meal_logs').insert({
        user_id: user.id,
        meal_date: toDateString(),
        meal_type: mealType,
        input_type: 'barcode',
        barcode: product.barcode,
        food_name: product.name,
        calories: product.calories || 0,
        protein_g: product.protein || 0,
        fat_g: product.fat || 0,
        carb_g: product.carb || 0,
        serving_size: product.servingSize,
      } as any)

      if (error) throw error

      toast({
        title: '保存完了',
        description: `${product.name}を記録しました`,
      })

      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'エラー',
        description: error instanceof Error ? error.message : '保存に失敗しました',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleRetry = () => {
    setProduct(null)
    setIsScanning(true)
  }

  return (
    <div className="min-h-screen">
      <Header title="バーコードスキャン" showDate={false} />

      <div className="container max-w-lg mx-auto p-4 md:p-6 space-y-6">
        {/* 食事タイプ選択 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">食事タイプ</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={mealType}
              onValueChange={(value) => setMealType(value as MealType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">朝食</SelectItem>
                <SelectItem value="lunch">昼食</SelectItem>
                <SelectItem value="dinner">夕食</SelectItem>
                <SelectItem value="snack">間食</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* スキャナー */}
        {isScanning && (
          <BarcodeScanner
            onScan={handleScan}
            onClose={() => setIsScanning(false)}
          />
        )}

        {/* ローディング */}
        {isLoading && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-sm text-muted-foreground">
                商品情報を取得中...
              </p>
            </CardContent>
          </Card>
        )}

        {/* スキャン結果 */}
        {product && (
          <div className="space-y-4">
            <ScanResult
              barcode={product.barcode}
              product={{
                name: product.name,
                brand: product.brands,
                calories: product.calories || 0,
                protein: product.protein || 0,
                fat: product.fat || 0,
                carb: product.carb || 0,
                servingSize: product.servingSize,
                imageUrl: product.imageUrl,
              }}
            />

            {/* アクションボタン */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleRetry}
                disabled={isSaving}
              >
                <X className="mr-2 h-4 w-4" />
                やり直し
              </Button>
              <Button
                className="flex-1"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                保存する
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
