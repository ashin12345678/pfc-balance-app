/**
 * エラーコード定義とユーザーフレンドリーメッセージのマッピング
 *
 * エラーコード形式: E-[カテゴリ]-[番号]
 * - AUTH: 認証関連
 * - MEAL: 食事記録関連
 * - AI: AI解析関連
 * - BARCODE: バーコードスキャン関連
 * - SUMMARY: サマリー関連
 * - INPUT: 入力バリデーション関連
 * - SERVER: サーバー内部エラー
 */

export const ERROR_CODES = {
  // 認証関連
  AUTH_REQUIRED: "E-AUTH-001",
  AUTH_SESSION_EXPIRED: "E-AUTH-002",

  // 食事記録関連
  MEAL_GET_FAILED: "E-MEAL-001",
  MEAL_CREATE_FAILED: "E-MEAL-002",
  MEAL_DELETE_FAILED: "E-MEAL-003",
  MEAL_UPDATE_FAILED: "E-MEAL-004",

  // AI関連
  AI_KEY_NOT_SET: "E-AI-001",
  AI_ANALYSIS_FAILED: "E-AI-002",
  AI_SERVER_OVERLOADED: "E-AI-003",
  AI_EMPTY_RESPONSE: "E-AI-004",
  AI_PARSE_FAILED: "E-AI-005",

  // バーコード関連
  BARCODE_PRODUCT_NOT_FOUND: "E-BARCODE-001",
  BARCODE_SCAN_FAILED: "E-BARCODE-002",
  BARCODE_NOT_PROVIDED: "E-BARCODE-003",

  // サマリー関連
  SUMMARY_GET_FAILED: "E-SUMMARY-001",
  SUMMARY_UPDATE_FAILED: "E-SUMMARY-002",

  // 入力バリデーション関連
  INPUT_REQUIRED: "E-INPUT-001",
  INPUT_INVALID: "E-INPUT-002",

  // サーバー内部エラー
  SERVER_ERROR: "E-SERVER-001",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/**
 * エラーコードに対応するユーザーフレンドリーなメッセージ
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  // 認証関連
  [ERROR_CODES.AUTH_REQUIRED]: "ログインが必要です。ログインページに移動してください。",
  [ERROR_CODES.AUTH_SESSION_EXPIRED]: "セッションが切れました。再度ログインしてください。",

  // 食事記録関連
  [ERROR_CODES.MEAL_GET_FAILED]:
    "食事記録の読み込みに失敗しました。時間をおいて再度お試しください。",
  [ERROR_CODES.MEAL_CREATE_FAILED]:
    "食事の登録に失敗しました。入力内容を確認して再度お試しください。",
  [ERROR_CODES.MEAL_DELETE_FAILED]: "食事の削除に失敗しました。時間をおいて再度お試しください。",
  [ERROR_CODES.MEAL_UPDATE_FAILED]:
    "食事の更新に失敗しました。入力内容を確認して再度お試しください。",

  // AI関連
  [ERROR_CODES.AI_KEY_NOT_SET]: "現在AI機能が利用できません。管理者にお問い合わせください。",
  [ERROR_CODES.AI_ANALYSIS_FAILED]: "食事の解析に失敗しました。もう一度お試しください。",
  [ERROR_CODES.AI_SERVER_OVERLOADED]:
    "サーバーが混雑しています。しばらくお待ちいただいてから再度お試しください。",
  [ERROR_CODES.AI_EMPTY_RESPONSE]: "AI解析結果が取得できませんでした。もう一度お試しください。",
  [ERROR_CODES.AI_PARSE_FAILED]: "AI解析結果の処理に失敗しました。もう一度お試しください。",

  // バーコード関連
  [ERROR_CODES.BARCODE_PRODUCT_NOT_FOUND]: "商品が見つかりませんでした。手動で入力してください。",
  [ERROR_CODES.BARCODE_SCAN_FAILED]:
    "バーコードの読み取りに失敗しました。再度スキャンしてください。",
  [ERROR_CODES.BARCODE_NOT_PROVIDED]: "バーコードが指定されていません。",

  // サマリー関連
  [ERROR_CODES.SUMMARY_GET_FAILED]:
    "データの読み込みに失敗しました。時間をおいて再度お試しください。",
  [ERROR_CODES.SUMMARY_UPDATE_FAILED]:
    "データの更新に失敗しました。時間をおいて再度お試しください。",

  // 入力バリデーション関連
  [ERROR_CODES.INPUT_REQUIRED]: "必要な情報が入力されていません。入力内容を確認してください。",
  [ERROR_CODES.INPUT_INVALID]: "入力内容に問題があります。入力内容を確認してください。",

  // サーバー内部エラー
  [ERROR_CODES.SERVER_ERROR]: "予期しないエラーが発生しました。時間をおいて再度お試しください。",
};

/**
 * APIエラーレスポンスの型定義
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  errorCode: ErrorCode;
  // 開発環境でのみ詳細を含める
  details?: string;
}

/**
 * APIエラーレスポンスを生成するヘルパー関数
 * @param errorCode - エラーコード
 * @param originalError - 元のエラー（開発環境でのみ詳細を含める）
 * @returns APIエラーレスポンスオブジェクト
 */
export function createErrorResponse(
  errorCode: ErrorCode,
  originalError?: unknown
): ApiErrorResponse {
  const response: ApiErrorResponse = {
    success: false,
    error: ERROR_MESSAGES[errorCode],
    errorCode,
  };

  // 開発環境でのみ詳細を含める
  if (process.env.NODE_ENV === "development" && originalError) {
    response.details =
      originalError instanceof Error ? originalError.message : String(originalError);
  }

  return response;
}

/**
 * コンソールにエラーログを出力するヘルパー関数
 * エラーコードと元のエラーを含めて出力
 */
export function logError(context: string, errorCode: ErrorCode, originalError?: unknown): void {
  console.error(`[${errorCode}] ${context}:`, originalError);
}
