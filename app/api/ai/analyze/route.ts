import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { MEAL_ANALYSIS_PROMPT } from '@/lib/ai/prompts'
import { parseMealAnalysisResponse } from '@/lib/ai/parsers'

export async function POST(request: NextRequest) {
  try {
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
