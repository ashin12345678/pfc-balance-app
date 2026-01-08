import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { ADVICE_PROMPT } from '@/lib/ai/openai'
import { parseAdviceResponse } from '@/lib/ai/parsers'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
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
${recentMeals?.map((m: any) => `- ${m.name}: ${m.calories}kcal`).join('\n') || 'なし'}
`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: ADVICE_PROMPT },
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 800,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('AI応答が空です')
    }

    const result = parseAdviceResponse(content)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('AI advice error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'アドバイスの生成に失敗しました',
      },
      { status: 500 }
    )
  }
}
