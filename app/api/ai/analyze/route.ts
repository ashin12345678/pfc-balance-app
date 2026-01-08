import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { MEAL_ANALYSIS_PROMPT } from '@/lib/ai/prompts'
import { parseMealAnalysisResponse } from '@/lib/ai/parsers'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const supabase = createServerSupabaseClient()
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

    const prompt = `${MEAL_ANALYSIS_PROMPT}

食事タイプ: ${mealType || '不明'}
食事内容: ${text}

上記の食事内容を解析し、JSONのみを返してください。`

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
