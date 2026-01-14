import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { fetchProductByBarcode } from '@/lib/api/openFoodFacts'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ERROR_CODES, createErrorResponse, logError } from '@/lib/errors'

// バーコードからAIで栄養情報を推定するためのプロンプト
const BARCODE_ESTIMATION_PROMPT = `あなたは栄養士AIです。商品名から栄養成分を推定してください。

## タスク
1. 商品名から一般的な栄養成分を推定する
2. 日本で販売されている商品の標準的な栄養価を参考にする
3. 構造化されたJSONで回答する

## 回答フォーマット
{
  "name": "商品名",
  "calories": カロリー数値(kcal),
  "protein": タンパク質量(g),
  "fat": 脂質量(g),
  "carb": 炭水化物量(g),
  "servingSize": "1個などの量",
  "confidence": 0.0〜1.0の信頼度,
  "isEstimated": true
}

## 注意事項
- 日本の一般的な商品の栄養価を参考にする
- 量が不明な場合は標準的な1個/1袋を想定
- 必ず有効なJSONのみを返す（説明文は不要）`

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    // 認証チェック
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        createErrorResponse(ERROR_CODES.AUTH_REQUIRED),
        { status: 401 }
      )
    }

    const { code } = await params

    if (!code) {
      return NextResponse.json(
        createErrorResponse(ERROR_CODES.BARCODE_NOT_PROVIDED),
        { status: 400 }
      )
    }

    // Open Food Facts APIから商品情報を取得
    const product = await fetchProductByBarcode(code)

    if (product) {
      return NextResponse.json({
        success: true,
        data: product,
      })
    }

    // 商品が見つからない場合、AIで推定を試みる
    const apiKey = process.env.GEMINI_API_KEY
    
    if (!apiKey) {
      // AIキーがない場合は商品未発見を返す
      return NextResponse.json(
        createErrorResponse(ERROR_CODES.BARCODE_PRODUCT_NOT_FOUND),
        { status: 404 }
      )
    }

    // AIによる推定を試みる（バーコードから商品名を推測）
    try {
      const ai = new GoogleGenAI({ apiKey })
      
      const prompt = `${BARCODE_ESTIMATION_PROMPT}

バーコード: ${code}
※バーコード番号から日本で販売されている可能性のある商品を推測し、栄養成分を推定してください。
推測が難しい場合は、一般的なスナック菓子の栄養価を参考にしてください。`

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      })

      const content = response.text
      if (content) {
        // JSONを抽出
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const estimatedProduct = JSON.parse(jsonMatch[0])
          return NextResponse.json({
            success: true,
            data: {
              ...estimatedProduct,
              barcode: code,
              source: 'ai_estimated',
            },
          })
        }
      }
    } catch (aiError) {
      logError('Barcode AI Estimation', ERROR_CODES.AI_ANALYSIS_FAILED, aiError)
      // AI推定に失敗した場合は商品未発見を返す
    }

    return NextResponse.json(
      createErrorResponse(ERROR_CODES.BARCODE_PRODUCT_NOT_FOUND),
      { status: 404 }
    )
  } catch (error) {
    logError('Barcode Fetch', ERROR_CODES.BARCODE_SCAN_FAILED, error)
    return NextResponse.json(
      createErrorResponse(ERROR_CODES.BARCODE_SCAN_FAILED, error),
      { status: 500 }
    )
  }
}
