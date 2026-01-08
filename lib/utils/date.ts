import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isYesterday, subDays } from 'date-fns'
import { ja } from 'date-fns/locale'

/**
 * 日付をフォーマット
 * @param date 日付
 * @param formatString フォーマット文字列
 * @returns フォーマットされた日付文字列
 */
export function formatDate(date: Date | string, formatString: string = 'yyyy/MM/dd'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, formatString, { locale: ja })
}

/**
 * 相対的な日付表示
 * @param date 日付
 * @returns 相対的な日付文字列
 */
export function getRelativeDateLabel(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  
  if (isToday(d)) return '今日'
  if (isYesterday(d)) return '昨日'
  
  return formatDate(d, 'M月d日(E)')
}

/**
 * 今週の日付範囲を取得
 * @returns 週の開始日と終了日
 */
export function getWeekRange(date: Date = new Date()): { start: Date; end: Date } {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }),
    end: endOfWeek(date, { weekStartsOn: 1 }),
  }
}

/**
 * 指定期間の全日付を取得
 * @param start 開始日
 * @param end 終了日
 * @returns 日付の配列
 */
export function getDatesInRange(start: Date, end: Date): Date[] {
  return eachDayOfInterval({ start, end })
}

/**
 * 過去N日間の日付を取得
 * @param days 日数
 * @returns 日付の配列
 */
export function getPastDates(days: number): Date[] {
  const end = new Date()
  const start = subDays(end, days - 1)
  return getDatesInRange(start, end)
}

/**
 * 日付をISO形式の文字列に変換 (YYYY-MM-DD)
 * @param date 日付
 * @returns ISO形式の日付文字列
 */
export function toDateString(date: Date = new Date()): string {
  return format(date, 'yyyy-MM-dd')
}

/**
 * 曜日ラベルを取得
 * @param date 日付
 * @returns 曜日
 */
export function getDayOfWeek(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'E', { locale: ja })
}
