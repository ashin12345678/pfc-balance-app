import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ERROR_CODES, createErrorResponse, logError } from '@/lib/errors'

// GET: 日次サマリーの取得
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        createErrorResponse(ERROR_CODES.AUTH_REQUIRED),
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let query = supabase
      .from('daily_summaries')
      .select('*')
      .eq('user_id', user.id)
      .order('summary_date', { ascending: false })

    if (date) {
      query = query.eq('summary_date', date)
    } else if (startDate && endDate) {
      query = query.gte('summary_date', startDate).lte('summary_date', endDate)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    logError('Summaries GET', ERROR_CODES.SUMMARY_GET_FAILED, error)
    return NextResponse.json(
      createErrorResponse(ERROR_CODES.SUMMARY_GET_FAILED, error),
      { status: 500 }
    )
  }
}

// POST: AIアドバイスを更新
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        createErrorResponse(ERROR_CODES.AUTH_REQUIRED),
        { status: 401 }
      )
    }

    const body = await request.json()
    const { date, aiAdvice } = body

    if (!date) {
      return NextResponse.json(
        createErrorResponse(ERROR_CODES.INPUT_REQUIRED),
        { status: 400 }
      )
    }

    // 既存のサマリーを更新
    const { data, error } = await supabase
      .from('daily_summaries')
      .upsert({
        user_id: user.id,
        summary_date: date,
        ai_advice: aiAdvice,
        total_calories: 0,
        total_protein_g: 0,
        total_fat_g: 0,
        total_carb_g: 0,
      } as any, {
        onConflict: 'user_id,summary_date',
        ignoreDuplicates: false,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    logError('Summaries POST', ERROR_CODES.SUMMARY_UPDATE_FAILED, error)
    return NextResponse.json(
      createErrorResponse(ERROR_CODES.SUMMARY_UPDATE_FAILED, error),
      { status: 500 }
    )
  }
}
