import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { MEAL_ANALYSIS_PROMPT } from '@/lib/ai/prompts'
import { parseMealAnalysisResponse } from '@/lib/ai/parsers'
import { createServerSupabaseClient } from '@/lib/supabase/server'

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

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
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
    if (error instanceof Error) {
      errorMessage = error.message
    }
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    )
  }
}
