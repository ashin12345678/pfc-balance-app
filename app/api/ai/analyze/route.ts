import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { MEAL_ANALYSIS_PROMPT } from '@/lib/ai/prompts'
import { parseMealAnalysisResponse } from '@/lib/ai/parsers'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ERROR_CODES, createErrorResponse, logError } from '@/lib/errors'

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
        createErrorResponse(ERROR_CODES.AUTH_REQUIRED),
        { status: 401 }
      )
    }

    const apiKey = process.env.GEMINI_API_KEY
    
    if (!apiKey) {
      logError('AI Analyze', ERROR_CODES.AI_KEY_NOT_SET, 'GEMINI_API_KEY is not set')
      return NextResponse.json(
        createErrorResponse(ERROR_CODES.AI_KEY_NOT_SET),
        { status: 500 }
      )
    }

    const ai = new GoogleGenAI({ apiKey })

    const body = await request.json()
    const { text, mealType } = body

    if (!text) {
      return NextResponse.json(
        createErrorResponse(ERROR_CODES.INPUT_REQUIRED),
        { status: 400 }
      )
    }

    // 入力のサニタイズ（プロンプトインジェクション対策）
    // 最大500文字に制限
    const sanitizedText = String(text)
      .slice(0, 500)
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
      return NextResponse.json(
        createErrorResponse(ERROR_CODES.AI_EMPTY_RESPONSE),
        { status: 500 }
      )
    }

    const parsedResult = parseMealAnalysisResponse(content)

    if (!parsedResult) {
      return NextResponse.json(
        createErrorResponse(ERROR_CODES.AI_PARSE_FAILED),
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: parsedResult,
    })
  } catch (error: unknown) {
    logError('AI Analyze', ERROR_CODES.AI_ANALYSIS_FAILED, error)
    
    // 503エラー（サーバー過負荷）の場合
    if (error instanceof Error) {
      const msg = error.message || ''
      if (msg.includes('503') || msg.includes('overloaded') || msg.includes('UNAVAILABLE')) {
        return NextResponse.json(
          createErrorResponse(ERROR_CODES.AI_SERVER_OVERLOADED, error),
          { status: 503 }
        )
      }
    }
    
    return NextResponse.json(
      createErrorResponse(ERROR_CODES.AI_ANALYSIS_FAILED, error),
      { status: 500 }
    )
  }
}
