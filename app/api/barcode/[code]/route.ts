import { NextRequest, NextResponse } from 'next/server'
import { fetchProductByBarcode } from '@/lib/api/openFoodFacts'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
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

    const { code } = await params

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'バーコードが指定されていません' },
        { status: 400 }
      )
    }

    const product = await fetchProductByBarcode(code)

    if (!product) {
      return NextResponse.json(
        { success: false, error: '商品情報が見つかりませんでした' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error('Barcode fetch error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '商品情報の取得に失敗しました',
      },
      { status: 500 }
    )
  }
}
