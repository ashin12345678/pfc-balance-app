import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { ADVICE_PROMPT } from '@/lib/ai/prompts'
import { parseAdviceResponse } from '@/lib/ai/parsers'

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

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

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

    const result = await model.generateContent(prompt)
    const response = await result.response
    const content = response.text()

    if (!content) {
      throw new Error('AI応答が空です')
    }

    const parsedResult = parseAdviceResponse(content)

    return NextResponse.json({
      success: true,
      data: parsedResult,
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
