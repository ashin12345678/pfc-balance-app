// 栄養計算ユーティリティ

/**
 * BMR（基礎代謝量）をMifflin-St Jeor式で計算
 * @param weight 体重 (kg)
 * @param height 身長 (cm)
 * @param age 年齢
 * @param gender 性別
 * @returns BMR (kcal/day)
 */
export function calculateBMR(
  weight: number,
  height: number,
  age: number,
  gender: 'male' | 'female'
): number {
  const genderModifier = gender === 'male' ? 5 : -161
  return 10 * weight + 6.25 * height - 5 * age + genderModifier
}

/**
 * TDEE（総消費カロリー）を計算
 * @param bmr 基礎代謝量
 * @param activityLevel 活動係数
 * @returns TDEE (kcal/day)
 */
export function calculateTDEE(bmr: number, activityLevel: number): number {
  return bmr * activityLevel
}

/**
 * 目標PFC値を計算
 * @param targetCalories 目標カロリー
 * @param proteinRatio タンパク質比率 (%)
 * @param fatRatio 脂質比率 (%)
 * @param carbRatio 炭水化物比率 (%)
 * @returns 目標PFC値 (g)
 */
export function calculateTargetPFC(
  targetCalories: number,
  proteinRatio: number,
  fatRatio: number,
  carbRatio: number
): { protein: number; fat: number; carb: number } {
  // タンパク質: 1g = 4kcal
  // 脂質: 1g = 9kcal
  // 炭水化物: 1g = 4kcal
  return {
    protein: (targetCalories * proteinRatio / 100) / 4,
    fat: (targetCalories * fatRatio / 100) / 9,
    carb: (targetCalories * carbRatio / 100) / 4,
  }
}

/**
 * 達成率を計算
 * @param current 現在の値
 * @param target 目標値
 * @returns 達成率 (%)
 */
export function calculateAchievement(current: number, target: number): number {
  if (target === 0) return 0
  return Math.round((current / target) * 100 * 10) / 10
}

/**
 * PFCバランスの評価
 * @param achievement 達成率
 * @returns 評価ステータス
 */
export function evaluatePFCStatus(achievement: number): 'under' | 'good' | 'over' {
  if (achievement < 80) return 'under'
  if (achievement > 120) return 'over'
  return 'good'
}

/**
 * カロリーからマクロ栄養素を推定
 * @param calories カロリー
 * @param protein タンパク質 (g)
 * @param fat 脂質 (g)
 * @param carb 炭水化物 (g)
 * @returns 推定カロリー
 */
export function estimateCaloriesFromMacros(
  protein: number,
  fat: number,
  carb: number
): number {
  return protein * 4 + fat * 9 + carb * 4
}

/**
 * PFC比率を計算
 * @param protein タンパク質 (g)
 * @param fat 脂質 (g)
 * @param carb 炭水化物 (g)
 * @returns PFC比率 (%)
 */
export function calculatePFCRatio(
  protein: number,
  fat: number,
  carb: number
): { protein: number; fat: number; carb: number } {
  const totalCalories = estimateCaloriesFromMacros(protein, fat, carb)
  if (totalCalories === 0) {
    return { protein: 0, fat: 0, carb: 0 }
  }

  return {
    protein: Math.round((protein * 4 / totalCalories) * 100),
    fat: Math.round((fat * 9 / totalCalories) * 100),
    carb: Math.round((carb * 4 / totalCalories) * 100),
  }
}
