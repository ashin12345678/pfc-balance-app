'use client'

import { Lightbulb, TrendingUp, TrendingDown, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AIAdvice } from '@/types/nutrition'

interface SimpleAdvice {
  message?: string
  recommendations?: string[]
}

interface AdviceCardProps {
  advice: AIAdvice | SimpleAdvice | null
  isLoading?: boolean
}

function isFullAdvice(advice: AIAdvice | SimpleAdvice): advice is AIAdvice {
  return 'summary' in advice && 'deficientNutrients' in advice
}

export function AdviceCard({ advice, isLoading }: AdviceCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            AIアドバイス
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
            <span className="text-muted-foreground">アドバイスを生成中...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!advice) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            AIアドバイス
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            食事を記録するとAIがアドバイスを提供します
          </p>
        </CardContent>
      </Card>
    )
  }

  // シンプルなアドバイス形式の場合
  if (!isFullAdvice(advice)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            AIアドバイス
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {advice.message && <p className="text-sm">{advice.message}</p>}
          {advice.recommendations && advice.recommendations.length > 0 && (
            <div>
              <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                おすすめ
              </h4>
              <ul className="space-y-1">
                {advice.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    • {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          AIアドバイス
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* サマリー */}
        <p className="text-sm">{advice.summary}</p>

        {/* 不足栄養素 */}
        {advice.deficientNutrients && advice.deficientNutrients.length > 0 && (
          <div>
            <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-blue-500" />
              不足している栄養素
            </h4>
            <ul className="space-y-2">
              {advice.deficientNutrients.map((item, index) => (
                <li key={index} className="text-sm">
                  <span className="font-medium text-blue-600">{item.nutrient}</span>
                  <span className="text-muted-foreground"> が {item.deficit.toFixed(1)}g 不足</span>
                  {item.recommendations.length > 0 && (
                    <div className="mt-1 pl-4">
                      <span className="text-xs text-muted-foreground">おすすめ: </span>
                      <span className="text-xs">{item.recommendations.join(', ')}</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 過剰栄養素 */}
        {advice.overconsumedNutrients && advice.overconsumedNutrients.length > 0 && (
          <div>
            <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-amber-500" />
              摂りすぎ注意
            </h4>
            <ul className="space-y-2">
              {advice.overconsumedNutrients.map((item, index) => (
                <li key={index} className="text-sm">
                  <span className="font-medium text-amber-600">{item.nutrient}</span>
                  <span className="text-muted-foreground"> が {item.excess.toFixed(1)}g 超過</span>
                  {item.suggestions && item.suggestions.length > 0 && (
                    <div className="mt-1 pl-4 text-xs text-muted-foreground">
                      {item.suggestions.join(' ')}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 食事提案 */}
        {advice.mealSuggestions && advice.mealSuggestions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              次の食事へのおすすめ
            </h4>
            <ul className="space-y-1">
              {advice.mealSuggestions.map((suggestion, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  • {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
