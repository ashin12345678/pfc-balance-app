import { NextRequest, NextResponse } from 'next/server'
import { fetchProductByBarcode } from '@/lib/api/openFoodFacts'

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params

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
