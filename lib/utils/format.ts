/**
 * 数値をフォーマット
 * @param value 数値
 * @param decimals 小数点以下の桁数
 * @returns フォーマットされた文字列
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('ja-JP', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * カロリーをフォーマット
 * @param calories カロリー
 * @returns フォーマットされた文字列
 */
export function formatCalories(calories: number): string {
  return `${formatNumber(Math.round(calories))} kcal`
}

/**
 * グラム数をフォーマット
 * @param grams グラム数
 * @param decimals 小数点以下の桁数
 * @returns フォーマットされた文字列
 */
export function formatGrams(grams: number, decimals: number = 1): string {
  return `${formatNumber(grams, decimals)} g`
}

/**
 * パーセンテージをフォーマット
 * @param percentage パーセンテージ
 * @param decimals 小数点以下の桁数
 * @returns フォーマットされた文字列
 */
export function formatPercentage(percentage: number, decimals: number = 0): string {
  return `${formatNumber(percentage, decimals)}%`
}

/**
 * PFC値を短縮フォーマット
 * @param protein タンパク質
 * @param fat 脂質
 * @param carb 炭水化物
 * @returns フォーマットされた文字列
 */
export function formatPFC(protein: number, fat: number, carb: number): string {
  return `P:${formatNumber(protein, 1)}g F:${formatNumber(fat, 1)}g C:${formatNumber(carb, 1)}g`
}

/**
 * 身体情報をフォーマット
 * @param height 身長 (cm)
 * @param weight 体重 (kg)
 * @returns フォーマットされた文字列
 */
export function formatBodyInfo(height: number, weight: number): string {
  return `${formatNumber(height, 1)}cm / ${formatNumber(weight, 1)}kg`
}

/**
 * BMIを計算
 * @param height 身長 (cm)
 * @param weight 体重 (kg)
 * @returns BMI値
 */
export function calculateBMI(height: number, weight: number): number {
  const heightM = height / 100
  return weight / (heightM * heightM)
}

/**
 * BMIの評価
 * @param bmi BMI値
 * @returns 評価文字列
 */
export function evaluateBMI(bmi: number): string {
  if (bmi < 18.5) return '低体重'
  if (bmi < 25) return '普通体重'
  if (bmi < 30) return '肥満(1度)'
  if (bmi < 35) return '肥満(2度)'
  if (bmi < 40) return '肥満(3度)'
  return '肥満(4度)'
}
