import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { MEAL_ANALYSIS_PROMPT } from '@/lib/ai/openai'
import { parseMealAnalysisResponse } from '@/lib/ai/parsers'

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    
    if (!apiKey) {
      console.error('OPENAI_API_KEY is not set')
      return NextResponse.json(
        { success: false, error: 'OpenAI APIキーが設定されていません' },
        { status: 500 }
      )
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    })

    const body = await request.json()
    const { text, mealType } = body

    if (!text) {
      return NextResponse.json(
        { success: false, error: '食事の説明を入力してください' },
        { status: 400 }
      )
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: MEAL_ANALYSIS_PROMPT },
        {
          role: 'user',
          content: `食事タイプ: ${mealType || '不明'}\n食事内容: ${text}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 1000,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('AI応答が空です')
    }

    const result = parseMealAnalysisResponse(content)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error: unknown) {
    console.error('AI analysis error:', error)
    
    // OpenAI APIエラーの詳細を取得
    let errorMessage = '解析に失敗しました'
    if (error instanceof Error) {
      errorMessage = error.message
      // OpenAI SDK特有のエラーの場合
      if ('status' in error && (error as { status?: number }).status === 401) {
        errorMessage = 'OpenAI APIキーが無効です。正しいAPIキーを設定してください。'
      }
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
