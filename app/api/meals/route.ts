import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// GET: 食事記録の取得
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = searchParams.get('limit')

    let query = supabase
      .from('meal_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (date) {
      query = query.eq('meal_date', date)
    } else if (startDate && endDate) {
      query = query.gte('meal_date', startDate).lte('meal_date', endDate)
    }

    if (limit) {
      query = query.limit(parseInt(limit, 10))
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('Meals GET error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '食事記録の取得に失敗しました',
      },
      { status: 500 }
    )
  }
}

// POST: 食事記録の作成
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      mealDate,
      mealType,
      inputType,
      inputText,
      barcode,
      foodName,
      calories,
      proteinG,
      fatG,
      carbG,
      servingSize,
      aiResponse,
      confidenceScore,
    } = body

    const { data, error } = await supabase
      .from('meal_logs')
      .insert({
        user_id: user.id,
        meal_date: mealDate,
        meal_type: mealType,
        input_type: inputType,
        input_text: inputText,
        barcode,
        food_name: foodName,
        calories,
        protein_g: proteinG,
        fat_g: fatG,
        carb_g: carbG,
        serving_size: servingSize,
        ai_response: aiResponse,
        confidence_score: confidenceScore,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('Meals POST error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '食事記録の作成に失敗しました',
      },
      { status: 500 }
    )
  }
}

// DELETE: 食事記録の削除
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'IDが指定されていません' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('meal_logs')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Meals DELETE error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '食事記録の削除に失敗しました',
      },
      { status: 500 }
    )
  }
}
