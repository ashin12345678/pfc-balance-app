'use client'

import { Package, Check, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCalories, formatGrams } from '@/lib/utils/format'

interface ScanResultProps {
  barcode: string
  product: {
    name: string
    brand?: string
    calories: number
    protein: number
    fat: number
    carb: number
    servingSize?: string
    imageUrl?: string
  } | null
  isLoading?: boolean
  onConfirm?: () => void
  onRetry?: () => void
  onManualEntry?: () => void
}

export function ScanResult({
  barcode,
  product,
  isLoading,
  onConfirm,
  onRetry,
  onManualEntry,
}: ScanResultProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
            <p className="text-muted-foreground">商品情報を検索中...</p>
            <p className="text-xs text-muted-foreground mt-1">JANコード: {barcode}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!product) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex flex-col items-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
            <h3 className="font-semibold mb-2">商品が見つかりませんでした</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              JANコード: {barcode}
              <br />
              データベースに登録されていない商品です
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onRetry}>
                再スキャン
              </Button>
              <Button onClick={onManualEntry}>
                手動で入力
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-4">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
          ) : (
            <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1">
            <CardTitle className="text-lg">{product.name}</CardTitle>
            {product.brand && (
              <p className="text-sm text-muted-foreground">{product.brand}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              JANコード: {barcode}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* 栄養成分表 */}
        <div className="bg-muted rounded-lg p-4 mb-4">
          <h4 className="text-sm font-medium mb-3">
            栄養成分 {product.servingSize && `(${product.servingSize})`}
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">カロリー</span>
              <span className="font-medium">{formatCalories(product.calories)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">タンパク質</span>
              <span className="font-medium text-red-500">{formatGrams(product.protein)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">脂質</span>
              <span className="font-medium text-amber-500">{formatGrams(product.fat)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">炭水化物</span>
              <span className="font-medium text-blue-500">{formatGrams(product.carb)}</span>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onRetry}>
            再スキャン
          </Button>
          <Button className="flex-1" onClick={onConfirm}>
            <Check className="mr-2 h-4 w-4" />
            記録する
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
