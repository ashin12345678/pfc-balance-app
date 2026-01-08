import type { OpenFoodFactsResponse, OpenFoodFactsProduct } from '@/types/api'

const OPEN_FOOD_FACTS_API = 'https://world.openfoodfacts.org/api/v2/product'

// バーコード形式の検証（8-14桁の数字）
const BARCODE_REGEX = /^[0-9]{8,14}$/

/**
 * Open Food Facts APIからバーコードで商品情報を取得
 */
export async function getProductByBarcode(barcode: string): Promise<OpenFoodFactsProduct | null> {
  try {
    // バーコード形式の検証（SSRF防止）
    if (!BARCODE_REGEX.test(barcode)) {
      console.error('Invalid barcode format:', barcode)
      return null
    }

    const response = await fetch(`${OPEN_FOOD_FACTS_API}/${barcode}.json`, {
      headers: {
        'User-Agent': 'PFCBalanceApp/1.0',
      },
    })

    if (!response.ok) {
      console.error('Open Food Facts API error:', response.status)
      return null
    }

    const data: OpenFoodFactsResponse = await response.json()

    if (data.status !== 1 || !data.product) {
      console.log('Product not found in Open Food Facts')
      return null
    }

    return data.product
  } catch (error) {
    console.error('Failed to fetch from Open Food Facts:', error)
    return null
  }
}

/**
 * Open Food Facts商品データを正規化
 */
export function normalizeProductData(product: OpenFoodFactsProduct) {
  const nutriments = product.nutriments || {}

  return {
    barcode: product.code,
    name: product.product_name || '不明な商品',
    brand: product.brands,
    caloriesPer100g: nutriments['energy-kcal_100g'] || 0,
    proteinPer100g: nutriments.proteins_100g || 0,
    fatPer100g: nutriments.fat_100g || 0,
    carbPer100g: nutriments.carbohydrates_100g || 0,
    fiberPer100g: nutriments.fiber_100g,
    sodiumPer100g: nutriments.sodium_100g,
    servingSize: product.serving_size,
    imageUrl: product.image_url,
    category: product.categories,
  }
}

/**
 * 1食分の栄養価を計算
 */
export function calculateServingNutrition(
  product: ReturnType<typeof normalizeProductData>,
  servingGrams: number = 100
) {
  const ratio = servingGrams / 100

  return {
    calories: Math.round(product.caloriesPer100g * ratio),
    protein: Math.round(product.proteinPer100g * ratio * 10) / 10,
    fat: Math.round(product.fatPer100g * ratio * 10) / 10,
    carb: Math.round(product.carbPer100g * ratio * 10) / 10,
  }
}

/**
 * バーコードから商品情報を取得（API用エイリアス）
 */
export async function fetchProductByBarcode(barcode: string) {
  const product = await getProductByBarcode(barcode)
  if (!product) return null
  
  const normalized = normalizeProductData(product)
  return {
    barcode: normalized.barcode,
    name: normalized.name,
    brands: normalized.brand,
    calories: normalized.caloriesPer100g,
    protein: normalized.proteinPer100g,
    fat: normalized.fatPer100g,
    carb: normalized.carbPer100g,
    servingSize: normalized.servingSize,
    imageUrl: normalized.imageUrl,
  }
}
