import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { ADVICE_PROMPT } from '@/lib/ai/prompts'
import { parseAdviceResponse } from '@/lib/ai/parsers'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ERROR_CODES, createErrorResponse, logError } from '@/lib/errors'

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
      logError('AI Advice', ERROR_CODES.AI_KEY_NOT_SET, 'GEMINI_API_KEY is not set')
      return NextResponse.json(
        createErrorResponse(ERROR_CODES.AI_KEY_NOT_SET),
        { status: 500 }
      )
    }

    const ai = new GoogleGenAI({ apiKey })

    const body = await request.json()
    const {
      currentCalories,
      currentProtein,
      currentFat,
      currentCarb,
      targetCalories,
      targetProtein,
      targetFat,
      targetCarb,
      goal,
      recentMeals,
    } = body

    const userMessage = `
現在の摂取状況:
- カロリー: ${currentCalories}/${targetCalories} kcal
- タンパク質: ${currentProtein}/${targetProtein} g
- 脂質: ${currentFat}/${targetFat} g
- 炭水化物: ${currentCarb}/${targetCarb} g

目標: ${goal === 'lose' ? '減量' : goal === 'gain' ? '増量' : '維持'}

最近の食事:
${recentMeals?.map((m: { name: string; calories: number }) => `- ${m.name}: ${m.calories}kcal`).join('\n') || 'なし'}
`

    const prompt = `${ADVICE_PROMPT}

${userMessage}

上記の情報を元にアドバイスをJSON形式で返してください。`

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    })

    const content = response.text
    if (!content) {
      return NextResponse.json(
        createErrorResponse(ERROR_CODES.AI_EMPTY_RESPONSE),
        { status: 500 }
      )
    }

    const parsedResult = parseAdviceResponse(content)

    return NextResponse.json({
      success: true,
      data: parsedResult,
    })
  } catch (error) {
    logError('AI Advice', ERROR_CODES.AI_ANALYSIS_FAILED, error)
    
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
