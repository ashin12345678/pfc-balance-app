import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { MEAL_ANALYSIS_PROMPT } from '@/lib/ai/openai'
import { parseMealAnalysisResponse } from '@/lib/ai/parsers'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
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
  } catch (error) {
    console.error('AI analysis error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '解析に失敗しました',
      },
      { status: 500 }
    )
  }
}
