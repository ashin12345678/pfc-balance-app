import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { MEAL_ANALYSIS_PROMPT } from '@/lib/ai/prompts'
import { parseMealAnalysisResponse } from '@/lib/ai/parsers'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// リトライ設定
const MAX_RETRIES = 3
const INITIAL_DELAY_MS = 1000

// 指数バックオフでリトライする関数
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  initialDelay: number = INITIAL_DELAY_MS
): Promise<T> {
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      // 503エラー（オーバーロード）の場合のみリトライ
      const errorMessage = lastError.message || ''
      const isRetryable = errorMessage.includes('503') || 
                          errorMessage.includes('overloaded') ||
                          errorMessage.includes('UNAVAILABLE')
      
      if (!isRetryable || attempt === maxRetries - 1) {
        throw lastError
      }
      
      // 指数バックオフで待機
      const delay = initialDelay * Math.pow(2, attempt)
      console.log(`AI API retry attempt ${attempt + 1}/${maxRetries}, waiting ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}

export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    const apiKey = process.env.GEMINI_API_KEY
    
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set')
      return NextResponse.json(
        { success: false, error: 'Gemini APIキーが設定されていません' },
        { status: 500 }
      )
    }

    const ai = new GoogleGenAI({ apiKey })

    const body = await request.json()
    const { text, mealType } = body

    if (!text) {
      return NextResponse.json(
        { success: false, error: '食事の説明を入力してください' },
        { status: 400 }
      )
    }

    // 入力のサニタイズ（プロンプトインジェクション対策）
    const sanitizedText = String(text)
      .slice(0, 500)  // 最大2500文字
      .replace(/[{}\[\]]/g, '')  // JSON構造文字を除去
    const sanitizedMealType = ['breakfast', 'lunch', 'dinner', 'snack'].includes(mealType) 
      ? mealType 
      : '不明'

    const prompt = `${MEAL_ANALYSIS_PROMPT}

<user_input>
食事タイプ: ${sanitizedMealType}
食事内容: ${sanitizedText}
</user_input>

上記のuser_input内の食事内容のみを解析し、JSONのみを返してください。`

    // リトライロジック付きでAPI呼び出し
    const response = await retryWithBackoff(async () => {
      return await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      })
    })

    const content = response.text
    if (!content) {
      throw new Error('AI応答が空です')
    }

    const parsedResult = parseMealAnalysisResponse(content)

    if (!parsedResult) {
      return NextResponse.json(
        { success: false, error: 'AI応答の解析に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: parsedResult,
    })
  } catch (error: unknown) {
    console.error('AI analysis error:', error)
    
    let errorMessage = '解析に失敗しました'
    let statusCode = 500
    
    if (error instanceof Error) {
      const msg = error.message || ''
      
      // 503エラー（オーバーロード）の場合はユーザーフレンドリーなメッセージ
      if (msg.includes('503') || msg.includes('overloaded') || msg.includes('UNAVAILABLE')) {
        errorMessage = 'AIサーバーが混雑しています。しばらく待ってからもう一度お試しください。'
        statusCode = 503
      } else {
        errorMessage = msg
      }
    }
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: statusCode }
    )
  }
}
